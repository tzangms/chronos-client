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
const SESSIONS_DIR = path.join(CONFIG_DIR, 'sessions');
const SESSION_FILE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function ensureSessionsDir() {
  ensureConfigDir();
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function loadConfig() {
  if (process.env.CHRONOS_API_KEY) {
    return {
      api_url: process.env.CHRONOS_API_URL || 'http://localhost:3000',
      api_key: process.env.CHRONOS_API_KEY,
      user_id: process.env.CHRONOS_USER_ID,
    };
  }

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
// Per-Session Submitted UUIDs
// ============================================================================

function sanitizeSessionId(sessionId) {
  return String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getSessionFile(sessionId) {
  return path.join(SESSIONS_DIR, `${sanitizeSessionId(sessionId)}.json`);
}

function loadSessionUuids(sessionId) {
  if (!sessionId) return new Set();
  try {
    return new Set(JSON.parse(fs.readFileSync(getSessionFile(sessionId), 'utf-8')));
  } catch (e) {
    return new Set();
  }
}

function saveSessionUuids(sessionId, uuids) {
  if (!sessionId) return;
  ensureSessionsDir();
  fs.writeFileSync(getSessionFile(sessionId), JSON.stringify(Array.from(uuids)));
}

function deleteSessionFile(sessionId) {
  if (!sessionId) return;
  try {
    fs.unlinkSync(getSessionFile(sessionId));
  } catch (e) {
    // ignore
  }
}

function gcOldSessionFiles() {
  let files;
  try {
    files = fs.readdirSync(SESSIONS_DIR);
  } catch (e) {
    return;
  }
  const now = Date.now();
  for (const file of files) {
    const filePath = path.join(SESSIONS_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > SESSION_FILE_MAX_AGE_MS) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // ignore
    }
  }
}

// ============================================================================
// Offline Storage
// ============================================================================

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
  fs.writeFileSync(OFFLINE_FILE, JSON.stringify({ heartbeats }));
}

function appendOfflineHeartbeat(heartbeat) {
  const heartbeats = loadOfflineHeartbeats();
  heartbeats.push(heartbeat);
  saveOfflineHeartbeats(heartbeats);
}

function clearOfflineHeartbeats() {
  try {
    fs.unlinkSync(OFFLINE_FILE);
  } catch (e) {
    // ignore
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
  const entries = [];

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return entries;
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
      if (!entry.uuid) continue;
      const usage = entry.usage || (entry.message && entry.message.usage) || null;
      entries.push({ uuid: entry.uuid, usage });
    } catch (e) {
      // ignore
    }
  }

  return entries;
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
  const heartbeatPromise = (async () => {
    const heartbeat = createHeartbeat(config, input, 'session_start');
    await sendHeartbeat(config, heartbeat);
    await syncOfflineHeartbeats(config);
  })();

  // Skip re-baselining when state already exists — overwriting would silently
  // swallow any deltas accumulated since the last Stop.
  if (input.session_id && !fs.existsSync(getSessionFile(input.session_id))) {
    const entries = await parseTranscript(input.transcript_path);
    saveSessionUuids(input.session_id, new Set(entries.map(e => e.uuid)));
    debugLog('Baseline established', { session_id: input.session_id, count: entries.length });
  }

  await heartbeatPromise;

  gcOldSessionFiles();
}

async function handleStop(config, input) {
  debugLog('handleStop called', { transcript_path: input.transcript_path });

  const entries = await parseTranscript(input.transcript_path);
  const submittedUuids = loadSessionUuids(input.session_id);

  const newEntries = entries.filter(e => !submittedUuids.has(e.uuid));
  debugLog('New entries', {
    new_count: newEntries.length,
    submitted_count: submittedUuids.size,
    total_count: entries.length,
  });

  let input_tokens = 0;
  let output_tokens = 0;
  let cache_read_tokens = 0;
  let cache_write_tokens = 0;

  for (const entry of newEntries) {
    if (!entry.usage) continue;
    input_tokens += entry.usage.input_tokens || 0;
    output_tokens += entry.usage.output_tokens || 0;
    cache_read_tokens += entry.usage.cache_read_input_tokens || 0;
    cache_write_tokens += entry.usage.cache_creation_input_tokens || 0;
  }

  // Mark before send: a crashed send loses one heartbeat; a crashed
  // send-then-mark replays every retry. The smaller failure mode wins.
  if (newEntries.length > 0 && input.session_id) {
    for (const entry of newEntries) submittedUuids.add(entry.uuid);
    saveSessionUuids(input.session_id, submittedUuids);
  }

  const heartbeat = createHeartbeat(config, input, 'stop', {
    input_tokens,
    output_tokens,
    cache_read_tokens,
    cache_write_tokens,
  });

  debugLog('Sending heartbeat', heartbeat);
  const success = await sendHeartbeat(config, heartbeat);
  debugLog('Heartbeat result', { success });
}

async function handleSessionEnd(config, input) {
  const heartbeat = createHeartbeat(config, input, 'session_end');
  await sendHeartbeat(config, heartbeat);
  deleteSessionFile(input.session_id);
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

const DEBUG_LOG_FILE = path.join(CONFIG_DIR, 'debug.log');

function debugLog(message, data = null) {
  if (!process.env.CHRONOS_DEBUG) return;
  const timestamp = new Date().toISOString();
  const logLine = data
    ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}\n`
    : `[${timestamp}] ${message}\n`;
  try {
    ensureConfigDir();
    fs.appendFileSync(DEBUG_LOG_FILE, logLine);
  } catch (e) {
    // ignore
  }
}

async function main() {
  try {
    const config = loadConfig();
    if (!config || !config.api_key) {
      process.exit(0);
    }

    const stdinData = await readStdin();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const input = JSON.parse(stdinData);
    const eventName = input.hook_event_name;

    debugLog(`Event: ${eventName}`, {
      session_id: input.session_id,
      cwd: input.cwd,
      transcript_path: input.transcript_path,
      all_keys: Object.keys(input)
    });

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
        break;
    }

    process.exit(0);
  } catch (e) {
    debugLog('Error', { message: e.message, stack: e.stack });
    if (process.env.CHRONOS_DEBUG) {
      console.error('chronos hook error:', e);
    }
    process.exit(0); // Don't block Claude Code
  }
}

main();
