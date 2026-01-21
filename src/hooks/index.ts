#!/usr/bin/env node

import {
  ClaudeHookInput,
  ClaudeStopInput,
  ClaudePostToolUseInput,
} from '../types';
import { parseTranscript } from '../lib/transcript';
import { loadSubmittedIds, markAsSubmitted } from '../lib/storage';
import { ChronosTracker } from '../lib/tracker';

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

async function handleSessionStart(input: ClaudeHookInput): Promise<void> {
  const tracker = new ChronosTracker();
  await tracker.track({
    eventType: 'session_start',
    projectPath: input.cwd,
    sessionId: input.session_id,
  });
}

async function handlePostToolUse(input: ClaudePostToolUseInput): Promise<void> {
  const tracker = new ChronosTracker();
  await tracker.track({
    eventType: 'tool_use',
    projectPath: input.cwd,
    sessionId: input.session_id,
    toolName: input.tool_name,
  });
}

async function handleStop(input: ClaudeStopInput): Promise<void> {
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

  const tracker = new ChronosTracker();
  const success = await tracker.track({
    eventType: 'stop',
    projectPath: input.cwd,
    sessionId: input.session_id,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    cacheReadTokens: cache_read_tokens,
    cacheWriteTokens: cache_write_tokens,
  });

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
  const tracker = new ChronosTracker();
  await tracker.track({
    eventType: 'session_end',
    projectPath: input.cwd,
    sessionId: input.session_id,
  });
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
