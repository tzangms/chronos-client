#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import { loadConfig, saveConfig, UtrackConfig, getConfigDir } from '../lib/config';
import { syncOfflineHeartbeats } from '../lib/heartbeat';

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

function prompt(question: string): Promise<string> {
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

async function setup(): Promise<void> {
  console.log('\n🔧 uTrack Setup\n');
  console.log('This will configure uTrack to track your Claude Code usage.\n');

  const existingConfig = loadConfig();

  const apiUrl =
    (await prompt(`API URL [${existingConfig?.api_url || 'http://localhost:3000'}]: `)) ||
    existingConfig?.api_url ||
    'http://localhost:3000';

  const apiKey = await prompt(
    `API Key${existingConfig?.api_key ? ' [press Enter to keep existing]' : ''}: `
  );

  if (!apiKey && !existingConfig?.api_key) {
    console.error('\n❌ API Key is required. Get one from your uTrack server admin.\n');
    process.exit(1);
  }

  const config: UtrackConfig = {
    api_url: apiUrl,
    api_key: apiKey || existingConfig!.api_key,
    user_id: existingConfig?.user_id,
    debug: existingConfig?.debug,
  };

  saveConfig(config);
  console.log(`\n✅ Config saved to ${getConfigDir()}/config.json\n`);

  // Setup Claude Code hooks
  await setupClaudeHooks();
}

async function setupClaudeHooks(): Promise<void> {
  console.log('Setting up Claude Code hooks...\n');

  const hookCommand = 'utrack-hook';

  let settings: any = {};
  if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8'));
    } catch {
      // Start with empty settings
    }
  }

  // Initialize hooks if not present
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Add our hooks
  const hookConfig = {
    hooks: [
      {
        type: 'command',
        command: hookCommand,
        timeout: 30,
      },
    ],
  };

  // SessionStart hook
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [];
  }
  const hasSessionStart = settings.hooks.SessionStart.some((h: any) =>
    h.hooks?.some((hh: any) => hh.command === hookCommand)
  );
  if (!hasSessionStart) {
    settings.hooks.SessionStart.push({
      matcher: 'startup',
      ...hookConfig,
    });
  }

  // Stop hook
  if (!settings.hooks.Stop) {
    settings.hooks.Stop = [];
  }
  const hasStop = settings.hooks.Stop.some((h: any) =>
    h.hooks?.some((hh: any) => hh.command === hookCommand)
  );
  if (!hasStop) {
    settings.hooks.Stop.push(hookConfig);
  }

  // SessionEnd hook
  if (!settings.hooks.SessionEnd) {
    settings.hooks.SessionEnd = [];
  }
  const hasSessionEnd = settings.hooks.SessionEnd.some((h: any) =>
    h.hooks?.some((hh: any) => hh.command === hookCommand)
  );
  if (!hasSessionEnd) {
    settings.hooks.SessionEnd.push(hookConfig);
  }

  // Ensure .claude directory exists
  const claudeDir = path.dirname(CLAUDE_SETTINGS_PATH);
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2));
  console.log(`✅ Claude Code hooks configured in ${CLAUDE_SETTINGS_PATH}\n`);
  console.log('uTrack is now active! Your Claude Code usage will be tracked.\n');
}

async function status(): Promise<void> {
  console.log('\n📊 uTrack Status\n');

  const config = loadConfig();
  if (!config) {
    console.log('❌ Not configured. Run "utrack setup" first.\n');
    return;
  }

  console.log(`API URL: ${config.api_url}`);
  console.log(`API Key: ${config.api_key.substring(0, 8)}...`);
  console.log(`Config: ${getConfigDir()}/config.json`);
  console.log('');
}

async function sync(): Promise<void> {
  console.log('\n🔄 Syncing offline heartbeats...\n');

  try {
    const result = await syncOfflineHeartbeats();
    console.log(`✅ Synced: ${result.synced}`);
    console.log(`❌ Failed: ${result.failed}`);
    console.log('');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await setup();
      break;
    case 'status':
      await status();
      break;
    case 'sync':
      await sync();
      break;
    default:
      console.log('\nuTrack - Claude Code Usage Tracker\n');
      console.log('Usage:');
      console.log('  utrack setup   - Configure uTrack');
      console.log('  utrack status  - Show current status');
      console.log('  utrack sync    - Sync offline heartbeats');
      console.log('');
      break;
  }
}

main().catch(console.error);
