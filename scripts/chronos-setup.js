#!/usr/bin/env node

/**
 * Chronos Setup Script
 *
 * Run this to configure your API key and server URL.
 * Usage: node chronos-setup.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

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
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🔧 Chronos Setup\n');
  console.log('Configure Chronos to track your Claude Code usage.\n');

  const existingConfig = loadConfig();

  const defaultUrl = existingConfig?.api_url || 'http://localhost:3000';
  const apiUrl = (await prompt(`API URL [${defaultUrl}]: `)) || defaultUrl;

  const apiKey = await prompt(
    `API Key${existingConfig?.api_key ? ' [Enter to keep existing]' : ''}: `
  );

  if (!apiKey && !existingConfig?.api_key) {
    console.error('\n❌ API Key is required.\n');
    console.log('Get your API key from your Chronos server admin.\n');
    process.exit(1);
  }

  const config = {
    api_url: apiUrl,
    api_key: apiKey || existingConfig.api_key,
    user_id: existingConfig?.user_id,
  };

  saveConfig(config);

  console.log(`\n✅ Configuration saved to ${CONFIG_FILE}\n`);
  console.log('Chronos is now configured!\n');
  console.log('Make sure the chronos plugin is installed in Claude Code:\n');
  console.log('  claude --plugin-dir /path/to/chronos/client\n');
  console.log('Or install permanently:\n');
  console.log('  /plugin install chronos\n');
}

main().catch((e) => {
  console.error('Setup error:', e);
  process.exit(1);
});
