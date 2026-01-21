import { Heartbeat } from '../types';
export declare function loadOfflineHeartbeats(): Heartbeat[];
export declare function saveOfflineHeartbeats(heartbeats: Heartbeat[]): void;
export declare function appendOfflineHeartbeat(heartbeat: Heartbeat): void;
export declare function clearOfflineHeartbeats(): void;
export declare function loadSubmittedIds(): Set<string>;
export declare function saveSubmittedIds(ids: Set<string>): void;
export declare function markAsSubmitted(id: string): void;
