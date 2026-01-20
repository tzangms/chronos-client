#!/usr/bin/env node

/**
 * Chronos Hook Script
 *
 * This script is called by Claude Code hooks to track usage.
 * It receives JSON input via stdin with event information.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const readline = require('readline');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const OFFLINE_FILE = path.join(CONFIG_DIR, 'offline_heartbeats.json');
const SUBMITTED_FILE = path.join(CONFIG_DIR, 'submitted_ids.json');

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// ============================================================================
// Machine ID
// ============================================================================

let cachedMachineId = null;

function getMachineId() {
  if (cachedMachineId) return cachedMachineId;

  // Generate from system info
  const info = [
    os.hostname(),
    os.platform(),
    os.arch(),
    (os.cpus()[0] || {}).model || 'unknown',
  ].join('|');

  cachedMachineId = crypto.createHash('sha256').update(info).digest('hex').substring(0, 32);
  return cachedMachineId;
}

// ============================================================================
// Offline Storage
// ============================================================================

function loadSubmittedIds() {
  try {
    if (fs.existsSync(SUBMITTED_FILE)) {
      return new Set(JSON.parse(fs.readFileSync(SUBMITTED_FILE, 'utf-8')));
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

function saveSubmittedIds(ids) {
  ensureConfigDir();
  const arr = Array.from(ids).slice(-10000);
  fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(arr));
}

function markAsSubmitted(id) {
  const ids = loadSubmittedIds();
  ids.add(id);
  saveSubmittedIds(ids);
}

function loadOfflineHeartbeats() {
  try {
    if (fs.existsSync(OFFLINE_FILE)) {
      const data = JSON.parse(fs.readFileSync(OFFLINE_FILE, 'utf-8'));
      return data.heartbeats || [];
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveOfflineHeartbeats(heartbeats) {
  ensureConfigDir();
  fs.writeFileSync(OFFLINE_FILE, JSON.stringify({ heartbeats }, null, 2));
}

function appendOfflineHeartbeat(heartbeat) {
  const heartbeats = loadOfflineHeartbeats();
  heartbeats.push(heartbeat);
  saveOfflineHeartbeats(heartbeats);
}

function clearOfflineHeartbeats() {
  if (fs.existsSync(OFFLINE_FILE)) {
    fs.unlinkSync(OFFLINE_FILE);
  }
}

// ============================================================================
// API Client
// ============================================================================

function sendHeartbeats(config, heartbeats) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/v1/heartbeats/bulk', config.api_url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify({ heartbeats });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${config.api_key}`,
        'User-Agent': 'chronos-plugin/0.1.0',
      },
      timeout: 30000,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function sendHeartbeat(config, heartbeat) {
  try {
    const response = await sendHeartbeats(config, [heartbeat]);
    return response.success && response.accepted > 0;
  } catch (e) {
    appendOfflineHeartbeat(heartbeat);
    return false;
  }
}

async function syncOfflineHeartbeats(config) {
  const heartbeats = loadOfflineHeartbeats();
  if (heartbeats.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  // Send in batches of 25
  for (let i = 0; i < heartbeats.length; i += 25) {
    const batch = heartbeats.slice(i, i + 25);
    try {
      const response = await sendHeartbeats(config, batch);
      synced += response.accepted || 0;
      failed += response.rejected || 0;
    } catch (e) {
      failed += batch.length;
    }
  }

  if (synced > 0) {
    clearOfflineHeartbeats();
  }

  return { synced, failed };
}

// ============================================================================
// Transcript Parser
// ============================================================================

async function parseTranscript(transcriptPath) {
  const stats = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    entries: [],
  };

  if (!fs.existsSync(transcriptPath)) {
    return stats;
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      stats.entries.push(entry);

      if (entry.usage) {
        stats.input_tokens += entry.usage.input_tokens || 0;
        stats.output_tokens += entry.usage.output_tokens || 0;
        stats.cache_read_tokens += entry.usage.cache_read_input_tokens || 0;
        stats.cache_write_tokens += entry.usage.cache_creation_input_tokens || 0;
      }
    } catch (e) {
      // skip invalid lines
    }
  }

  return stats;
}

// ============================================================================
// Hook Handlers
// ============================================================================

function getProjectName(cwd) {
  return path.basename(cwd);
}

function createHeartbeat(config, input, eventType, extra = {}) {
  return {
    user_id: config.user_id || 'anonymous',
    api_key: config.api_key,
    timestamp: Math.floor(Date.now() / 1000),
    project: getProjectName(input.cwd),
    project_path: input.cwd,
    event_type: eventType,
    session_id: input.session_id,
    machine_id: getMachineId(),
    os: os.platform(),
    ...extra,
  };
}

async function handleSessionStart(config, input) {
  const heartbeat = createHeartbeat(config, input, 'session_start');
  await sendHeartbeat(config, heartbeat);

  // Try to sync offline heartbeats
  await syncOfflineHeartbeats(config);
}

async function handleStop(config, input) {
  // Parse transcript to get token usage
  const stats = await parseTranscript(input.transcript_path);

  // Check for new entries
  const submittedIds = loadSubmittedIds();
  const newEntries = stats.entries.filter(e => e.uuid && !submittedIds.has(e.uuid));

  if (newEntries.length === 0) return;

  // Calculate tokens from new entries
  let input_tokens = 0;
  let output_tokens = 0;
  let cache_read_tokens = 0;
  let cache_write_tokens = 0;

  for (const entry of newEntries) {
    if (entry.usage) {
      input_tokens += entry.usage.input_tokens || 0;
      output_tokens += entry.usage.output_tokens || 0;
      cache_read_tokens += entry.usage.cache_read_input_tokens || 0;
      cache_write_tokens += entry.usage.cache_creation_input_tokens || 0;
    }
  }

  const heartbeat = createHeartbeat(config, input, 'stop', {
    input_tokens,
    output_tokens,
    cache_read_tokens,
    cache_write_tokens,
  });

  const success = await sendHeartbeat(config, heartbeat);

  if (success) {
    for (const entry of newEntries) {
      if (entry.uuid) {
        markAsSubmitted(entry.uuid);
      }
    }
  }
}

async function handleSessionEnd(config, input) {
  const heartbeat = createHeartbeat(config, input, 'session_end');
  await sendHeartbeat(config, heartbeat);
}

// ============================================================================
// Main
// ============================================================================

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  try {
    const config = loadConfig();
    if (!config || !config.api_key) {
      // Not configured, exit silently
      process.exit(0);
    }

    const stdinData = await readStdin();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const input = JSON.parse(stdinData);
    const eventName = input.hook_event_name;

    switch (eventName) {
      case 'SessionStart':
        await handleSessionStart(config, input);
        break;
      case 'Stop':
        await handleStop(config, input);
        break;
      case 'SessionEnd':
        await handleSessionEnd(config, input);
        break;
      default:
        // Unknown event, ignore
        break;
    }

    process.exit(0);
  } catch (e) {
    if (process.env.CHRONOS_DEBUG) {
      console.error('chronos hook error:', e);
    }
    process.exit(0); // Don't block Claude Code
  }
}

main();
