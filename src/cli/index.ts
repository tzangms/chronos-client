#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import { loadConfig, saveConfig, ChronosConfig, getConfigDir } from '../lib/config';
import { syncOfflineHeartbeats } from '../lib/heartbeat';
import { ChronosTracker } from '../lib/tracker';
import { HeartbeatEventType } from '../types';

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

async function setupClaudeHooks(): Promise<void> {
  console.log('Setting up Claude Code hooks...\n');

  const hookCommand = 'chronos-hook';

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
  console.log('Chronos is now active! Your Claude Code usage will be tracked.\n');
}

async function setup(): Promise<void> {
  console.log('\n🔧 Chronos Setup\n');
  console.log('This will configure Chronos to track your AI usage.\n');

  const existingConfig = loadConfig();

  const apiUrl =
    (await prompt(`API URL [${existingConfig?.api_url || 'http://localhost:3000'}]: `)) ||
    existingConfig?.api_url ||
    'http://localhost:3000';

  const apiKey = await prompt(
    `API Key${existingConfig?.api_key ? ' [press Enter to keep existing]' : ''}: `
  );

  if (!apiKey && !existingConfig?.api_key) {
    console.error('\n❌ API Key is required. Get one from your Chronos server admin.\n');
    process.exit(1);
  }

  const config: ChronosConfig = {
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

async function status(): Promise<void> {
  console.log('\n📊 Chronos Status\n');

  const config = loadConfig();
  if (!config) {
    console.log('❌ Not configured. Run "chronos setup" first.\n');
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
  const program = new Command();

  program
    .name('chronos')
    .description('Chronos Client - AI Usage Tracking')
    .version('0.1.1');

  program
    .command('setup')
    .description('Configure API key and server URL')
    .action(setup);

  program
    .command('status')
    .description('Check configuration and connection status')
    .action(status);

  program
    .command('sync')
    .description('Sync offline heartbeats')
    .action(sync);

  program
    .command('track')
    .description('Track an usage event (for external agents/tools)')
    .requiredOption('-e, --event <type>', 'Event type (session_start, stop, etc)')
    .requiredOption('-p, --project <path>', 'Absolute path to project')
    .option('--session <id>', 'Session ID')
    .option('--input <n>', 'Input tokens', '0')
    .option('--output <n>', 'Output tokens', '0')
    .option('--c-read <n>', 'Cache read tokens', '0')
    .option('--c-write <n>', 'Cache write tokens', '0')
    .option('--tool <name>', 'Tool name')
    .action(async (opts) => {
      const tracker = new ChronosTracker();
      const success = await tracker.track({
        eventType: opts.event as HeartbeatEventType,
        projectPath: opts.project,
        sessionId: opts.session,
        inputTokens: parseInt(opts.input, 10),
        outputTokens: parseInt(opts.output, 10),
        cacheReadTokens: parseInt(opts.cRead, 10),
        cacheWriteTokens: parseInt(opts.cWrite, 10),
        toolName: opts.tool,
      });

      if (success) {
        console.log('Event tracked successfully');
      } else {
        console.log('Event queued (offline) or failed');
      }
    });

  program
    .command('install-skill')
    .description('Install the Antigravity Skill into your project')
    .option('-d, --dir <path>', 'Target directory for skills', './.agent/skills')
    .action(async (opts) => {
      const targetDir = path.resolve(opts.dir, 'chronos');
      const sourceDir = path.resolve(__dirname, '../../skills/chronos');

      console.log(`\n📦 Installing Chronos Skill to ${targetDir}...\n`);

      if (!fs.existsSync(sourceDir)) {
         // Fallback for development structure where dist is sibling to skills
         const devSourceDir = path.resolve(__dirname, '../../../skills/chronos');
         if (!fs.existsSync(devSourceDir)) {
            console.error(`❌ Error: Could not find skill definition in ${sourceDir} or ${devSourceDir}`);
            process.exit(1);
         }
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy SKILL.md
      const skillFile = 'SKILL.md';
      // Handle both prod (in dist) and dev (outside dist) paths if needed, 
      // but simpler to rely on proper packaging.
      // For now, let's assume we copy the skills folder into dist during build or publish
      
      // Actually, a better way for npm packages is to read from the package root
      // In production installed via npm: 
      // node_modules/@chronos/client/dist/cli/index.js
      // node_modules/@chronos/client/skills/chronos/SKILL.md
      
      const skillSourcePath = path.resolve(__dirname, '../../skills/chronos/SKILL.md');
      const skillDestPath = path.join(targetDir, 'SKILL.md');

      if (fs.existsSync(skillSourcePath)) {
        fs.copyFileSync(skillSourcePath, skillDestPath);
        console.log(`✅ SKILL.md installed`);
        console.log(`\nSkill installed! You can now use "Chronos Time Tracker" in your agent.`);
      } else {
         // Try dev path one more time
         const devSkillPath = path.resolve(__dirname, '../../../skills/chronos/SKILL.md');
         if (fs.existsSync(devSkillPath)) {
            fs.copyFileSync(devSkillPath, skillDestPath);
             console.log(`✅ SKILL.md installed (from dev source)`);
             console.log(`\nSkill installed! You can now use "Chronos Time Tracker" in your agent.`);
         } else {
            console.error('❌ Could not find SKILL.md source file.');
         }
      }
    });

  await program.parseAsync(process.argv);
}

main().catch(console.error);
