import * as fs from 'fs';
import * as readline from 'readline';
import { TranscriptEntry } from '../types';

export interface TranscriptStats {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  total_cost_usd: number;
  total_messages: number;
  user_prompts: number;
  assistant_responses: number;
  tool_uses: number;
  entries: TranscriptEntry[];
}

export async function parseTranscript(transcriptPath: string): Promise<TranscriptStats> {
  const stats: TranscriptStats = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    total_cost_usd: 0,
    total_messages: 0,
    user_prompts: 0,
    assistant_responses: 0,
    tool_uses: 0,
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
      const entry: TranscriptEntry = JSON.parse(line);
      stats.entries.push(entry);
      stats.total_messages++;

      if (entry.usage) {
        stats.input_tokens += entry.usage.input_tokens || 0;
        stats.output_tokens += entry.usage.output_tokens || 0;
        stats.cache_read_tokens += entry.usage.cache_read_input_tokens || 0;
        stats.cache_write_tokens += entry.usage.cache_creation_input_tokens || 0;
      }

      if (entry.costUSD) {
        stats.total_cost_usd += entry.costUSD;
      }

      if (entry.message?.role === 'user') {
        stats.user_prompts++;
      } else if (entry.message?.role === 'assistant') {
        stats.assistant_responses++;
      }

      // Count tool uses
      if (entry.type === 'tool_use' || entry.type === 'tool_result') {
        stats.tool_uses++;
      }
    } catch {
      // Skip invalid lines
    }
  }

  return stats;
}

export async function getNewEntriesSince(
  transcriptPath: string,
  lastEntryUuid?: string
): Promise<TranscriptEntry[]> {
  const { entries } = await parseTranscript(transcriptPath);

  if (!lastEntryUuid) {
    return entries;
  }

  const lastIndex = entries.findIndex((e) => e.uuid === lastEntryUuid);
  if (lastIndex === -1) {
    return entries;
  }

  return entries.slice(lastIndex + 1);
}
