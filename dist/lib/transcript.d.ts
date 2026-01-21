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
export declare function parseTranscript(transcriptPath: string): Promise<TranscriptStats>;
export declare function getNewEntriesSince(transcriptPath: string, lastEntryUuid?: string): Promise<TranscriptEntry[]>;
