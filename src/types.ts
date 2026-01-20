// Heartbeat - the core data structure for tracking usage
export interface Heartbeat {
  id?: string;
  user_id: string;
  api_key: string;
  timestamp: number; // Unix timestamp in seconds

  // Project info
  project: string;
  project_path: string;

  // Activity info
  event_type: HeartbeatEventType;
  tool_name?: string;

  // Token usage (from Claude Code transcript)
  input_tokens?: number;
  output_tokens?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;

  // Environment info
  session_id: string;
  machine_id: string;
  os: string;

  // Optional git info
  branch?: string;

  // Metadata
  created_at?: string;
}

export type HeartbeatEventType =
  | 'session_start'
  | 'heartbeat'
  | 'tool_use'
  | 'prompt'
  | 'stop'
  | 'session_end';

// API Response types
export interface HeartbeatResponse {
  success: boolean;
  accepted: number;
  rejected: number;
  errors?: string[];
}

// Claude Code Hook Input types (what we receive from Claude Code)
export interface ClaudeHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
}

export interface ClaudePreToolUseInput extends ClaudeHookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_use_id: string;
}

export interface ClaudePostToolUseInput extends ClaudePreToolUseInput {
  tool_response: Record<string, unknown>;
}

export interface ClaudeStopInput extends ClaudeHookInput {
  stop_hook_active: boolean;
}

// Transcript entry from Claude Code
export interface TranscriptEntry {
  type: string;
  message?: {
    role: string;
    content: unknown;
    model?: string;
  };
  costUSD?: number;
  durationMs?: number;
  uuid?: string;
  userType?: string;
  cwd?: string;
  sessionId?: string;
  timestamp?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}
