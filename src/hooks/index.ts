#!/usr/bin/env node

import * as path from 'path';
import {
  ClaudeHookInput,
  ClaudeStopInput,
  ClaudePostToolUseInput,
  Heartbeat,
} from '../types';
import { loadConfig } from '../lib/config';
import { getMachineId, getOS } from '../lib/machine';
import { sendHeartbeat, syncOfflineHeartbeats } from '../lib/heartbeat';
import { parseTranscript } from '../lib/transcript';
import { loadSubmittedIds, markAsSubmitted } from '../lib/storage';

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function getProjectName(cwd: string): string {
  return path.basename(cwd);
}

async function handleSessionStart(input: ClaudeHookInput): Promise<void> {
  const config = loadConfig();
  if (!config) return;

  const heartbeat: Heartbeat = {
    user_id: config.user_id || 'anonymous',
    api_key: config.api_key,
    timestamp: Math.floor(Date.now() / 1000),
    project: getProjectName(input.cwd),
    project_path: input.cwd,
    event_type: 'session_start',
    session_id: input.session_id,
    machine_id: getMachineId(),
    os: getOS(),
  };

  await sendHeartbeat(heartbeat);

  // Try to sync any offline heartbeats
  await syncOfflineHeartbeats();
}

async function handlePostToolUse(input: ClaudePostToolUseInput): Promise<void> {
  const config = loadConfig();
  if (!config) return;

  const heartbeat: Heartbeat = {
    user_id: config.user_id || 'anonymous',
    api_key: config.api_key,
    timestamp: Math.floor(Date.now() / 1000),
    project: getProjectName(input.cwd),
    project_path: input.cwd,
    event_type: 'tool_use',
    tool_name: input.tool_name,
    session_id: input.session_id,
    machine_id: getMachineId(),
    os: getOS(),
  };

  await sendHeartbeat(heartbeat);
}

async function handleStop(input: ClaudeStopInput): Promise<void> {
  const config = loadConfig();
  if (!config) return;

  // Parse transcript to get token usage
  const stats = await parseTranscript(input.transcript_path);

  // Check if we've already submitted this data
  const submittedIds = loadSubmittedIds();

  // Find new entries that haven't been submitted
  const newEntries = stats.entries.filter((e) => e.uuid && !submittedIds.has(e.uuid));

  if (newEntries.length === 0) {
    return; // Nothing new to submit
  }

  // Calculate tokens from new entries only
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

  const heartbeat: Heartbeat = {
    user_id: config.user_id || 'anonymous',
    api_key: config.api_key,
    timestamp: Math.floor(Date.now() / 1000),
    project: getProjectName(input.cwd),
    project_path: input.cwd,
    event_type: 'stop',
    session_id: input.session_id,
    machine_id: getMachineId(),
    os: getOS(),
    input_tokens,
    output_tokens,
    cache_read_tokens,
    cache_write_tokens,
  };

  const success = await sendHeartbeat(heartbeat);

  // Mark entries as submitted if successful
  if (success) {
    for (const entry of newEntries) {
      if (entry.uuid) {
        markAsSubmitted(entry.uuid);
      }
    }
  }
}

async function handleSessionEnd(input: ClaudeHookInput): Promise<void> {
  const config = loadConfig();
  if (!config) return;

  const heartbeat: Heartbeat = {
    user_id: config.user_id || 'anonymous',
    api_key: config.api_key,
    timestamp: Math.floor(Date.now() / 1000),
    project: getProjectName(input.cwd),
    project_path: input.cwd,
    event_type: 'session_end',
    session_id: input.session_id,
    machine_id: getMachineId(),
    os: getOS(),
  };

  await sendHeartbeat(heartbeat);
}

async function main(): Promise<void> {
  try {
    const stdinData = await readStdin();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const input: ClaudeHookInput = JSON.parse(stdinData);
    const eventName = input.hook_event_name;

    switch (eventName) {
      case 'SessionStart':
        await handleSessionStart(input);
        break;
      case 'PostToolUse':
        await handlePostToolUse(input as ClaudePostToolUseInput);
        break;
      case 'Stop':
        await handleStop(input as ClaudeStopInput);
        break;
      case 'SessionEnd':
        await handleSessionEnd(input);
        break;
      default:
        // Unknown event, ignore
        break;
    }

    process.exit(0);
  } catch (error) {
    if (process.env.CHRONOS_DEBUG) {
      console.error('Hook error:', error);
    }
    process.exit(0); // Don't block Claude Code on errors
  }
}

main();
