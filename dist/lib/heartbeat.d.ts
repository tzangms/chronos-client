import { Heartbeat, HeartbeatResponse } from '../types';
export declare function sendHeartbeats(heartbeats: Heartbeat[]): Promise<HeartbeatResponse>;
export declare function sendHeartbeat(heartbeat: Heartbeat): Promise<boolean>;
export declare function syncOfflineHeartbeats(): Promise<{
    synced: number;
    failed: number;
}>;
