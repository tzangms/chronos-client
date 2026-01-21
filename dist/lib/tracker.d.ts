import { HeartbeatEventType } from "../types";
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
export declare class ChronosTracker {
    private config;
    constructor();
    track(options: TrackOptions): Promise<boolean>;
}
