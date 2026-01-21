import { loadConfig, ChronosConfig } from "./config";
import { getMachineId, getOS } from "./machine";
import { sendHeartbeat, syncOfflineHeartbeats } from "./heartbeat";
import { Heartbeat, HeartbeatEventType } from "../types";
import * as path from "path";

export interface TrackOptions {
  eventType: HeartbeatEventType;
  projectPath: string;
  sessionId?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  toolName?: string;
  projectName?: string;
}

export class ChronosTracker {
  private config: ChronosConfig | null;

  constructor() {
    this.config = loadConfig();
  }

  public async track(options: TrackOptions): Promise<boolean> {
    if (!this.config) {
      // If setup hasn't run, we can't track.
      // In a real scenario we might want to log this if debug is on
      if (process.env.CHRONOS_DEBUG) {
        console.warn('Chronos not configured. Run "chronos setup" first.');
      }
      return false;
    }

    const projectName =
      options.projectName || path.basename(options.projectPath);
    const sessionId = options.sessionId || `session-${Date.now()}`;

    const heartbeat: Heartbeat = {
      user_id: this.config.user_id || "anonymous",
      api_key: this.config.api_key,
      timestamp: Math.floor(Date.now() / 1000),
      project: projectName,
      project_path: options.projectPath,
      event_type: options.eventType,
      session_id: sessionId,
      machine_id: getMachineId(),
      os: getOS(),
      input_tokens: options.inputTokens,
      output_tokens: options.outputTokens,
      cache_read_tokens: options.cacheReadTokens,
      cache_write_tokens: options.cacheWriteTokens,
      tool_name: options.toolName,
    };

    const success = await sendHeartbeat(heartbeat);

    // Try to sync offline heartbeats if we are online now
    // We do this in the background usually, but here we can just fire and forget or await
    if (success) {
      await syncOfflineHeartbeats().catch(() => {});
    }

    return success;
  }
}
