#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const readline = __importStar(require("readline"));
const config_1 = require("../lib/config");
const heartbeat_1 = require("../lib/heartbeat");
const tracker_1 = require("../lib/tracker");
const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
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
async function setupClaudeHooks() {
    console.log('Setting up Claude Code hooks...\n');
    const hookCommand = 'chronos-hook';
    let settings = {};
    if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
        try {
            settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8'));
        }
        catch {
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
    const hasSessionStart = settings.hooks.SessionStart.some((h) => h.hooks?.some((hh) => hh.command === hookCommand));
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
    const hasStop = settings.hooks.Stop.some((h) => h.hooks?.some((hh) => hh.command === hookCommand));
    if (!hasStop) {
        settings.hooks.Stop.push(hookConfig);
    }
    // SessionEnd hook
    if (!settings.hooks.SessionEnd) {
        settings.hooks.SessionEnd = [];
    }
    const hasSessionEnd = settings.hooks.SessionEnd.some((h) => h.hooks?.some((hh) => hh.command === hookCommand));
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
async function setup() {
    console.log('\n🔧 Chronos Setup\n');
    console.log('This will configure Chronos to track your AI usage.\n');
    const existingConfig = (0, config_1.loadConfig)();
    const apiUrl = (await prompt(`API URL [${existingConfig?.api_url || 'http://localhost:3000'}]: `)) ||
        existingConfig?.api_url ||
        'http://localhost:3000';
    const apiKey = await prompt(`API Key${existingConfig?.api_key ? ' [press Enter to keep existing]' : ''}: `);
    if (!apiKey && !existingConfig?.api_key) {
        console.error('\n❌ API Key is required. Get one from your Chronos server admin.\n');
        process.exit(1);
    }
    const config = {
        api_url: apiUrl,
        api_key: apiKey || existingConfig.api_key,
        user_id: existingConfig?.user_id,
        debug: existingConfig?.debug,
    };
    (0, config_1.saveConfig)(config);
    console.log(`\n✅ Config saved to ${(0, config_1.getConfigDir)()}/config.json\n`);
    // Setup Claude Code hooks
    await setupClaudeHooks();
}
async function status() {
    console.log('\n📊 Chronos Status\n');
    const config = (0, config_1.loadConfig)();
    if (!config) {
        console.log('❌ Not configured. Run "chronos setup" first.\n');
        return;
    }
    console.log(`API URL: ${config.api_url}`);
    console.log(`API Key: ${config.api_key.substring(0, 8)}...`);
    console.log(`Config: ${(0, config_1.getConfigDir)()}/config.json`);
    console.log('');
}
async function sync() {
    console.log('\n🔄 Syncing offline heartbeats...\n');
    try {
        const result = await (0, heartbeat_1.syncOfflineHeartbeats)();
        console.log(`✅ Synced: ${result.synced}`);
        console.log(`❌ Failed: ${result.failed}`);
        console.log('');
    }
    catch (error) {
        console.error('Sync failed:', error);
    }
}
async function main() {
    const program = new commander_1.Command();
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
        const tracker = new tracker_1.ChronosTracker();
        const success = await tracker.track({
            eventType: opts.event,
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
        }
        else {
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
        }
        else {
            // Try dev path one more time
            const devSkillPath = path.resolve(__dirname, '../../../skills/chronos/SKILL.md');
            if (fs.existsSync(devSkillPath)) {
                fs.copyFileSync(devSkillPath, skillDestPath);
                console.log(`✅ SKILL.md installed (from dev source)`);
                console.log(`\nSkill installed! You can now use "Chronos Time Tracker" in your agent.`);
            }
            else {
                console.error('❌ Could not find SKILL.md source file.');
            }
        }
    });
    await program.parseAsync(process.argv);
}
main().catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHlDQUFvQztBQUNwQyx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHVDQUF5QjtBQUN6QixtREFBcUM7QUFDckMsMENBQW9GO0FBQ3BGLGdEQUF5RDtBQUN6RCw0Q0FBZ0Q7QUFHaEQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFakYsU0FBUyxNQUFNLENBQUMsUUFBZ0I7SUFDOUIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUNsQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7UUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0tBQ3ZCLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELEtBQUssVUFBVSxnQkFBZ0I7SUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBRWpELE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztJQUVuQyxJQUFJLFFBQVEsR0FBUSxFQUFFLENBQUM7SUFDdkIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQztRQUN4QyxJ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LElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXZELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7UUFDMUYsQ0FBQzthQUFNLENBQUM7WUFDTCw2QkFBNkI7WUFDN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUNqRixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO1lBQzVGLENBQUM7aUJBQU0sQ0FBQztnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVMLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCB7IGxvYWRDb25maWcsIHNhdmVDb25maWcsIENocm9ub3NDb25maWcsIGdldENvbmZpZ0RpciB9IGZyb20gJy4uL2xpYi9jb25maWcnO1xuaW1wb3J0IHsgc3luY09mZmxpbmVIZWFydGJlYXRzIH0gZnJvbSAnLi4vbGliL2hlYXJ0YmVhdCc7XG5pbXBvcnQgeyBDaHJvbm9zVHJhY2tlciB9IGZyb20gJy4uL2xpYi90cmFja2VyJztcbmltcG9ydCB7IEhlYXJ0YmVhdEV2ZW50VHlwZSB9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3QgQ0xBVURFX1NFVFRJTkdTX1BBVEggPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmNsYXVkZScsICdzZXR0aW5ncy5qc29uJyk7XG5cbmZ1bmN0aW9uIHByb21wdChxdWVzdGlvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcmwgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgIGlucHV0OiBwcm9jZXNzLnN0ZGluLFxuICAgIG91dHB1dDogcHJvY2Vzcy5zdGRvdXQsXG4gIH0pO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHJsLnF1ZXN0aW9uKHF1ZXN0aW9uLCAoYW5zd2VyKSA9PiB7XG4gICAgICBybC5jbG9zZSgpO1xuICAgICAgcmVzb2x2ZShhbnN3ZXIudHJpbSgpKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldHVwQ2xhdWRlSG9va3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGUubG9nKCdTZXR0aW5nIHVwIENsYXVkZSBDb2RlIGhvb2tzLi4uXFxuJyk7XG5cbiAgY29uc3QgaG9va0NvbW1hbmQgPSAnY2hyb25vcy1ob29rJztcblxuICBsZXQgc2V0dGluZ3M6IGFueSA9IHt9O1xuICBpZiAoZnMuZXhpc3RzU3luYyhDTEFVREVfU0VUVElOR1NfUEFUSCkpIHtcbiAgICB0cnkge1xuICAgICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhDTEFVREVfU0VUVElOR1NfUEFUSCwgJ3V0Zi04JykpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU3RhcnQgd2l0aCBlbXB0eSBzZXR0aW5nc1xuICAgIH1cbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgaG9va3MgaWYgbm90IHByZXNlbnRcbiAgaWYgKCFzZXR0aW5ncy5ob29rcykge1xuICAgIHNldHRpbmdzLmhvb2tzID0ge307XG4gIH1cblxuICAvLyBBZGQgb3VyIGhvb2tzXG4gIGNvbnN0IGhvb2tDb25maWcgPSB7XG4gICAgaG9va3M6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ2NvbW1hbmQnLFxuICAgICAgICBjb21tYW5kOiBob29rQ29tbWFuZCxcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG5cbiAgLy8gU2Vzc2lvblN0YXJ0IGhvb2tcbiAgaWYgKCFzZXR0aW5ncy5ob29rcy5TZXNzaW9uU3RhcnQpIHtcbiAgICBzZXR0aW5ncy5ob29rcy5TZXNzaW9uU3RhcnQgPSBbXTtcbiAgfVxuICBjb25zdCBoYXNTZXNzaW9uU3RhcnQgPSBzZXR0aW5ncy5ob29rcy5TZXNzaW9uU3RhcnQuc29tZSgoaDogYW55KSA9PlxuICAgIGguaG9va3M/LnNvbWUoKGhoOiBhbnkpID0+IGhoLmNvbW1hbmQgPT09IGhvb2tDb21tYW5kKVxuICApO1xuICBpZiAoIWhhc1Nlc3Npb25TdGFydCkge1xuICAgIHNldHRpbmdzLmhvb2tzLlNlc3Npb25TdGFydC5wdXNoKHtcbiAgICAgIG1hdGNoZXI6ICdzdGFydHVwJyxcbiAgICAgIC4uLmhvb2tDb25maWcsXG4gICAgfSk7XG4gIH1cblxuICAvLyBTdG9wIGhvb2tcbiAgaWYgKCFzZXR0aW5ncy5ob29rcy5TdG9wKSB7XG4gICAgc2V0dGluZ3MuaG9va3MuU3RvcCA9IFtdO1xuICB9XG4gIGNvbnN0IGhhc1N0b3AgPSBzZXR0aW5ncy5ob29rcy5TdG9wLnNvbWUoKGg6IGFueSkgPT5cbiAgICBoLmhvb2tzPy5zb21lKChoaDogYW55KSA9PiBoaC5jb21tYW5kID09PSBob29rQ29tbWFuZClcbiAgKTtcbiAgaWYgKCFoYXNTdG9wKSB7XG4gICAgc2V0dGluZ3MuaG9va3MuU3RvcC5wdXNoKGhvb2tDb25maWcpO1xuICB9XG5cbiAgLy8gU2Vzc2lvbkVuZCBob29rXG4gIGlmICghc2V0dGluZ3MuaG9va3MuU2Vzc2lvbkVuZCkge1xuICAgIHNldHRpbmdzLmhvb2tzLlNlc3Npb25FbmQgPSBbXTtcbiAgfVxuICBjb25zdCBoYXNTZXNzaW9uRW5kID0gc2V0dGluZ3MuaG9va3MuU2Vzc2lvbkVuZC5zb21lKChoOiBhbnkpID0+XG4gICAgaC5ob29rcz8uc29tZSgoaGg6IGFueSkgPT4gaGguY29tbWFuZCA9PT0gaG9va0NvbW1hbmQpXG4gICk7XG4gIGlmICghaGFzU2Vzc2lvbkVuZCkge1xuICAgIHNldHRpbmdzLmhvb2tzLlNlc3Npb25FbmQucHVzaChob29rQ29uZmlnKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSAuY2xhdWRlIGRpcmVjdG9yeSBleGlzdHNcbiAgY29uc3QgY2xhdWRlRGlyID0gcGF0aC5kaXJuYW1lKENMQVVERV9TRVRUSU5HU19QQVRIKTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGNsYXVkZURpcikpIHtcbiAgICBmcy5ta2RpclN5bmMoY2xhdWRlRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIGZzLndyaXRlRmlsZVN5bmMoQ0xBVURFX1NFVFRJTkdTX1BBVEgsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKSk7XG4gIGNvbnNvbGUubG9nKGDinIUgQ2xhdWRlIENvZGUgaG9va3MgY29uZmlndXJlZCBpbiAke0NMQVVERV9TRVRUSU5HU19QQVRIfVxcbmApO1xuICBjb25zb2xlLmxvZygnQ2hyb25vcyBpcyBub3cgYWN0aXZlISBZb3VyIENsYXVkZSBDb2RlIHVzYWdlIHdpbGwgYmUgdHJhY2tlZC5cXG4nKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0dXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGUubG9nKCdcXG7wn5SnIENocm9ub3MgU2V0dXBcXG4nKTtcbiAgY29uc29sZS5sb2coJ1RoaXMgd2lsbCBjb25maWd1cmUgQ2hyb25vcyB0byB0cmFjayB5b3VyIEFJIHVzYWdlLlxcbicpO1xuXG4gIGNvbnN0IGV4aXN0aW5nQ29uZmlnID0gbG9hZENvbmZpZygpO1xuXG4gIGNvbnN0IGFwaVVybCA9XG4gICAgKGF3YWl0IHByb21wdChgQVBJIFVSTCBbJHtleGlzdGluZ0NvbmZpZz8uYXBpX3VybCB8fCAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ31dOiBgKSkgfHxcbiAgICBleGlzdGluZ0NvbmZpZz8uYXBpX3VybCB8fFxuICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAnO1xuXG4gIGNvbnN0IGFwaUtleSA9IGF3YWl0IHByb21wdChcbiAgICBgQVBJIEtleSR7ZXhpc3RpbmdDb25maWc/LmFwaV9rZXkgPyAnIFtwcmVzcyBFbnRlciB0byBrZWVwIGV4aXN0aW5nXScgOiAnJ306IGBcbiAgKTtcblxuICBpZiAoIWFwaUtleSAmJiAhZXhpc3RpbmdDb25maWc/LmFwaV9rZXkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdcXG7inYwgQVBJIEtleSBpcyByZXF1aXJlZC4gR2V0IG9uZSBmcm9tIHlvdXIgQ2hyb25vcyBzZXJ2ZXIgYWRtaW4uXFxuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgY29uZmlnOiBDaHJvbm9zQ29uZmlnID0ge1xuICAgIGFwaV91cmw6IGFwaVVybCxcbiAgICBhcGlfa2V5OiBhcGlLZXkgfHwgZXhpc3RpbmdDb25maWchLmFwaV9rZXksXG4gICAgdXNlcl9pZDogZXhpc3RpbmdDb25maWc/LnVzZXJfaWQsXG4gICAgZGVidWc6IGV4aXN0aW5nQ29uZmlnPy5kZWJ1ZyxcbiAgfTtcblxuICBzYXZlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnNvbGUubG9nKGBcXG7inIUgQ29uZmlnIHNhdmVkIHRvICR7Z2V0Q29uZmlnRGlyKCl9L2NvbmZpZy5qc29uXFxuYCk7XG5cbiAgLy8gU2V0dXAgQ2xhdWRlIENvZGUgaG9va3NcbiAgYXdhaXQgc2V0dXBDbGF1ZGVIb29rcygpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGUubG9nKCdcXG7wn5OKIENocm9ub3MgU3RhdHVzXFxuJyk7XG5cbiAgY29uc3QgY29uZmlnID0gbG9hZENvbmZpZygpO1xuICBpZiAoIWNvbmZpZykge1xuICAgIGNvbnNvbGUubG9nKCfinYwgTm90IGNvbmZpZ3VyZWQuIFJ1biBcImNocm9ub3Mgc2V0dXBcIiBmaXJzdC5cXG4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zb2xlLmxvZyhgQVBJIFVSTDogJHtjb25maWcuYXBpX3VybH1gKTtcbiAgY29uc29sZS5sb2coYEFQSSBLZXk6ICR7Y29uZmlnLmFwaV9rZXkuc3Vic3RyaW5nKDAsIDgpfS4uLmApO1xuICBjb25zb2xlLmxvZyhgQ29uZmlnOiAke2dldENvbmZpZ0RpcigpfS9jb25maWcuanNvbmApO1xuICBjb25zb2xlLmxvZygnJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGUubG9nKCdcXG7wn5SEIFN5bmNpbmcgb2ZmbGluZSBoZWFydGJlYXRzLi4uXFxuJyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzeW5jT2ZmbGluZUhlYXJ0YmVhdHMoKTtcbiAgICBjb25zb2xlLmxvZyhg4pyFIFN5bmNlZDogJHtyZXN1bHQuc3luY2VkfWApO1xuICAgIGNvbnNvbGUubG9nKGDinYwgRmFpbGVkOiAke3Jlc3VsdC5mYWlsZWR9YCk7XG4gICAgY29uc29sZS5sb2coJycpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1N5bmMgZmFpbGVkOicsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBwcm9ncmFtID0gbmV3IENvbW1hbmQoKTtcblxuICBwcm9ncmFtXG4gICAgLm5hbWUoJ2Nocm9ub3MnKVxuICAgIC5kZXNjcmlwdGlvbignQ2hyb25vcyBDbGllbnQgLSBBSSBVc2FnZSBUcmFja2luZycpXG4gICAgLnZlcnNpb24oJzAuMS4xJyk7XG5cbiAgcHJvZ3JhbVxuICAgIC5jb21tYW5kKCdzZXR1cCcpXG4gICAgLmRlc2NyaXB0aW9uKCdDb25maWd1cmUgQVBJIGtleSBhbmQgc2VydmVyIFVSTCcpXG4gICAgLmFjdGlvbihzZXR1cCk7XG5cbiAgcHJvZ3JhbVxuICAgIC5jb21tYW5kKCdzdGF0dXMnKVxuICAgIC5kZXNjcmlwdGlvbignQ2hlY2sgY29uZmlndXJhdGlvbiBhbmQgY29ubmVjdGlvbiBzdGF0dXMnKVxuICAgIC5hY3Rpb24oc3RhdHVzKTtcblxuICBwcm9ncmFtXG4gICAgLmNvbW1hbmQoJ3N5bmMnKVxuICAgIC5kZXNjcmlwdGlvbignU3luYyBvZmZsaW5lIGhlYXJ0YmVhdHMnKVxuICAgIC5hY3Rpb24oc3luYyk7XG5cbiAgcHJvZ3JhbVxuICAgIC5jb21tYW5kKCd0cmFjaycpXG4gICAgLmRlc2NyaXB0aW9uKCdUcmFjayBhbiB1c2FnZSBldmVudCAoZm9yIGV4dGVybmFsIGFnZW50cy90b29scyknKVxuICAgIC5yZXF1aXJlZE9wdGlvbignLWUsIC0tZXZlbnQgPHR5cGU+JywgJ0V2ZW50IHR5cGUgKHNlc3Npb25fc3RhcnQsIHN0b3AsIGV0YyknKVxuICAgIC5yZXF1aXJlZE9wdGlvbignLXAsIC0tcHJvamVjdCA8cGF0aD4nLCAnQWJzb2x1dGUgcGF0aCB0byBwcm9qZWN0JylcbiAgICAub3B0aW9uKCctLXNlc3Npb24gPGlkPicsICdTZXNzaW9uIElEJylcbiAgICAub3B0aW9uKCctLWlucHV0IDxuPicsICdJbnB1dCB0b2tlbnMnLCAnMCcpXG4gICAgLm9wdGlvbignLS1vdXRwdXQgPG4+JywgJ091dHB1dCB0b2tlbnMnLCAnMCcpXG4gICAgLm9wdGlvbignLS1jLXJlYWQgPG4+JywgJ0NhY2hlIHJlYWQgdG9rZW5zJywgJzAnKVxuICAgIC5vcHRpb24oJy0tYy13cml0ZSA8bj4nLCAnQ2FjaGUgd3JpdGUgdG9rZW5zJywgJzAnKVxuICAgIC5vcHRpb24oJy0tdG9vbCA8bmFtZT4nLCAnVG9vbCBuYW1lJylcbiAgICAuYWN0aW9uKGFzeW5jIChvcHRzKSA9PiB7XG4gICAgICBjb25zdCB0cmFja2VyID0gbmV3IENocm9ub3NUcmFja2VyKCk7XG4gICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgdHJhY2tlci50cmFjayh7XG4gICAgICAgIGV2ZW50VHlwZTogb3B0cy5ldmVudCBhcyBIZWFydGJlYXRFdmVudFR5cGUsXG4gICAgICAgIHByb2plY3RQYXRoOiBvcHRzLnByb2plY3QsXG4gICAgICAgIHNlc3Npb25JZDogb3B0cy5zZXNzaW9uLFxuICAgICAgICBpbnB1dFRva2VuczogcGFyc2VJbnQob3B0cy5pbnB1dCwgMTApLFxuICAgICAgICBvdXRwdXRUb2tlbnM6IHBhcnNlSW50KG9wdHMub3V0cHV0LCAxMCksXG4gICAgICAgIGNhY2hlUmVhZFRva2VuczogcGFyc2VJbnQob3B0cy5jUmVhZCwgMTApLFxuICAgICAgICBjYWNoZVdyaXRlVG9rZW5zOiBwYXJzZUludChvcHRzLmNXcml0ZSwgMTApLFxuICAgICAgICB0b29sTmFtZTogb3B0cy50b29sLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFdmVudCB0cmFja2VkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0V2ZW50IHF1ZXVlZCAob2ZmbGluZSkgb3IgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgcHJvZ3JhbVxuICAgIC5jb21tYW5kKCdpbnN0YWxsLXNraWxsJylcbiAgICAuZGVzY3JpcHRpb24oJ0luc3RhbGwgdGhlIEFudGlncmF2aXR5IFNraWxsIGludG8geW91ciBwcm9qZWN0JylcbiAgICAub3B0aW9uKCctZCwgLS1kaXIgPHBhdGg+JywgJ1RhcmdldCBkaXJlY3RvcnkgZm9yIHNraWxscycsICcuLy5hZ2VudC9za2lsbHMnKVxuICAgIC5hY3Rpb24oYXN5bmMgKG9wdHMpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGgucmVzb2x2ZShvcHRzLmRpciwgJ2Nocm9ub3MnKTtcbiAgICAgIGNvbnN0IHNvdXJjZURpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9za2lsbHMvY2hyb25vcycpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxu8J+TpiBJbnN0YWxsaW5nIENocm9ub3MgU2tpbGwgdG8gJHt0YXJnZXREaXJ9Li4uXFxuYCk7XG5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzb3VyY2VEaXIpKSB7XG4gICAgICAgICAvLyBGYWxsYmFjayBmb3IgZGV2ZWxvcG1lbnQgc3RydWN0dXJlIHdoZXJlIGRpc3QgaXMgc2libGluZyB0byBza2lsbHNcbiAgICAgICAgIGNvbnN0IGRldlNvdXJjZURpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi9za2lsbHMvY2hyb25vcycpO1xuICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRldlNvdXJjZURpcikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvcjogQ291bGQgbm90IGZpbmQgc2tpbGwgZGVmaW5pdGlvbiBpbiAke3NvdXJjZURpcn0gb3IgJHtkZXZTb3VyY2VEaXJ9YCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0YXJnZXREaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyh0YXJnZXREaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb3B5IFNLSUxMLm1kXG4gICAgICBjb25zdCBza2lsbEZpbGUgPSAnU0tJTEwubWQnO1xuICAgICAgLy8gSGFuZGxlIGJvdGggcHJvZCAoaW4gZGlzdCkgYW5kIGRldiAob3V0c2lkZSBkaXN0KSBwYXRocyBpZiBuZWVkZWQsIFxuICAgICAgLy8gYnV0IHNpbXBsZXIgdG8gcmVseSBvbiBwcm9wZXIgcGFja2FnaW5nLlxuICAgICAgLy8gRm9yIG5vdywgbGV0J3MgYXNzdW1lIHdlIGNvcHkgdGhlIHNraWxscyBmb2xkZXIgaW50byBkaXN0IGR1cmluZyBidWlsZCBvciBwdWJsaXNoXG4gICAgICBcbiAgICAgIC8vIEFjdHVhbGx5LCBhIGJldHRlciB3YXkgZm9yIG5wbSBwYWNrYWdlcyBpcyB0byByZWFkIGZyb20gdGhlIHBhY2thZ2Ugcm9vdFxuICAgICAgLy8gSW4gcHJvZHVjdGlvbiBpbnN0YWxsZWQgdmlhIG5wbTogXG4gICAgICAvLyBub2RlX21vZHVsZXMvQGNocm9ub3MvY2xpZW50L2Rpc3QvY2xpL2luZGV4LmpzXG4gICAgICAvLyBub2RlX21vZHVsZXMvQGNocm9ub3MvY2xpZW50L3NraWxscy9jaHJvbm9zL1NLSUxMLm1kXG4gICAgICBcbiAgICAgIGNvbnN0IHNraWxsU291cmNlUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9za2lsbHMvY2hyb25vcy9TS0lMTC5tZCcpO1xuICAgICAgY29uc3Qgc2tpbGxEZXN0UGF0aCA9IHBhdGguam9pbih0YXJnZXREaXIsICdTS0lMTC5tZCcpO1xuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhza2lsbFNvdXJjZVBhdGgpKSB7XG4gICAgICAgIGZzLmNvcHlGaWxlU3luYyhza2lsbFNvdXJjZVBhdGgsIHNraWxsRGVzdFBhdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhg4pyFIFNLSUxMLm1kIGluc3RhbGxlZGApO1xuICAgICAgICBjb25zb2xlLmxvZyhgXFxuU2tpbGwgaW5zdGFsbGVkISBZb3UgY2FuIG5vdyB1c2UgXCJDaHJvbm9zIFRpbWUgVHJhY2tlclwiIGluIHlvdXIgYWdlbnQuYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgLy8gVHJ5IGRldiBwYXRoIG9uZSBtb3JlIHRpbWVcbiAgICAgICAgIGNvbnN0IGRldlNraWxsUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi9za2lsbHMvY2hyb25vcy9TS0lMTC5tZCcpO1xuICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGV2U2tpbGxQYXRoKSkge1xuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKGRldlNraWxsUGF0aCwgc2tpbGxEZXN0UGF0aCk7XG4gICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSBTS0lMTC5tZCBpbnN0YWxsZWQgKGZyb20gZGV2IHNvdXJjZSlgKTtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxuU2tpbGwgaW5zdGFsbGVkISBZb3UgY2FuIG5vdyB1c2UgXCJDaHJvbm9zIFRpbWUgVHJhY2tlclwiIGluIHlvdXIgYWdlbnQuYCk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIENvdWxkIG5vdCBmaW5kIFNLSUxMLm1kIHNvdXJjZSBmaWxlLicpO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gIGF3YWl0IHByb2dyYW0ucGFyc2VBc3luYyhwcm9jZXNzLmFyZ3YpO1xufVxuXG5tYWluKCkuY2F0Y2goY29uc29sZS5lcnJvcik7XG4iXX0=