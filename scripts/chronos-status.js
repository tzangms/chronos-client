#!/usr/bin/env node

/**
 * Chronos Status Script
 *
 * Check Chronos configuration and connection status.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const https = require('https');

const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const OFFLINE_FILE = path.join(CONFIG_DIR, 'offline_heartbeats.json');

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

function getOfflineCount() {
  try {
    if (fs.existsSync(OFFLINE_FILE)) {
      const data = JSON.parse(fs.readFileSync(OFFLINE_FILE, 'utf-8'));
      return (data.heartbeats || []).length;
    }
  } catch (e) {
    // ignore
  }
  return 0;
}

function testConnection(apiUrl, apiKey) {
  return new Promise((resolve) => {
    const url = new URL('/health', apiUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'chronos-status/0.1.0',
      },
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      resolve({ ok: false, error: e.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Connection timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log('');
  console.log('=== Chronos Status ===');
  console.log('');

  // Check configuration
  const config = loadConfig();

  if (!config || !config.api_key) {
    console.log('Status: NOT CONFIGURED');
    console.log('');
    console.log('Run /chronos:setup to configure Chronos.');
    process.exit(0);
  }

  console.log('Configuration:');
  console.log(`  API URL:  ${config.api_url}`);
  console.log(`  API Key:  ${config.api_key.substring(0, 8)}...`);
  console.log(`  Config:   ${CONFIG_FILE}`);
  console.log('');

  // Check offline queue
  const offlineCount = getOfflineCount();
  if (offlineCount > 0) {
    console.log(`Offline queue: ${offlineCount} heartbeat(s) pending`);
    console.log('');
  }

  // Test connection
  console.log('Testing connection...');
  const result = await testConnection(config.api_url, config.api_key);

  if (result.ok) {
    console.log('Connection: OK');
  } else {
    const reason = result.error || `HTTP ${result.status}`;
    console.log(`Connection: FAILED (${reason})`);
  }
}

main().catch((e) => {
  console.error('Status check failed:', e.message);
  process.exit(1);
});
