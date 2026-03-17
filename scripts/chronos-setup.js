#!/usr/bin/env node

/**
 * Chronos Setup Script
 *
 * Interactive setup for configuring Chronos client.
 * Creates ~/.chronos/config.json with API URL and API key.
 *
 * Usage: node chronos-setup.js [--api-url URL] [--api-key KEY]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const http = require('http');
const https = require('https');

const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_API_URL = 'http://localhost:3000';

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

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
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
        'User-Agent': 'chronos-setup/0.1.0',
      },
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
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

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--api-url' && argv[i + 1]) {
      args.apiUrl = argv[++i];
    } else if (argv[i] === '--api-key' && argv[i + 1]) {
      args.apiKey = argv[++i];
    }
  }
  return args;
}

async function main() {
  const cliArgs = parseArgs();
  const existing = loadConfig();
  const isNonInteractive = cliArgs.apiUrl && cliArgs.apiKey;

  let apiUrl, apiKey;

  if (isNonInteractive) {
    // Non-interactive mode: use CLI args directly
    apiUrl = cliArgs.apiUrl;
    apiKey = cliArgs.apiKey;
  } else {
    // Interactive mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('');
    console.log('=== Chronos Setup ===');
    console.log('');

    if (existing) {
      console.log('Existing configuration found:');
      console.log(`  API URL: ${existing.api_url}`);
      console.log(`  API Key: ${existing.api_key ? existing.api_key.substring(0, 8) + '...' : '(not set)'}`);
      console.log('');
    }

    const defaultUrl = cliArgs.apiUrl || (existing && existing.api_url) || DEFAULT_API_URL;
    apiUrl = (await ask(rl, `API URL [${defaultUrl}]: `)) || defaultUrl;

    const defaultKey = cliArgs.apiKey || (existing && existing.api_key) || '';
    const keyPrompt = defaultKey ? `API Key [${defaultKey.substring(0, 8)}...]: ` : 'API Key: ';
    apiKey = (await ask(rl, keyPrompt)) || defaultKey;

    rl.close();
  }

  // Validate URL
  try {
    new URL(apiUrl);
  } catch (e) {
    console.error(`Error: Invalid URL format: ${apiUrl}`);
    process.exit(1);
  }

  // Remove trailing slash
  apiUrl = apiUrl.replace(/\/+$/, '');

  if (!apiKey) {
    console.error('Error: API key is required.');
    console.error('Get your API key from your Chronos server administrator.');
    process.exit(1);
  }

  // Test connection
  console.log('');
  console.log('Testing connection...');
  const result = await testConnection(apiUrl, apiKey);

  if (result.ok) {
    console.log('Connection: OK');
  } else {
    const reason = result.error || `HTTP ${result.status}`;
    console.log(`Connection: FAILED (${reason})`);
    console.log('Configuration will be saved anyway. The hook will retry when the server is available.');
  }

  // Save config
  const config = {
    api_url: apiUrl,
    api_key: apiKey,
  };

  saveConfig(config);

  console.log('');
  console.log(`Configuration saved to ${CONFIG_FILE}`);
  console.log('Chronos is now configured. Usage tracking will start with your next session.');
}

main().catch((e) => {
  console.error('Setup failed:', e.message);
  process.exit(1);
});
