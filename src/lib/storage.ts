import * as fs from 'fs';
import { Heartbeat } from '@utrack/shared';
import { ensureConfigDir, getOfflineDbPath } from './config';

interface OfflineStorage {
  heartbeats: Heartbeat[];
  last_sync_attempt?: number;
}

export function loadOfflineHeartbeats(): Heartbeat[] {
  try {
    const dbPath = getOfflineDbPath();
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const storage: OfflineStorage = JSON.parse(data);
      return storage.heartbeats || [];
    }
  } catch (error) {
    console.error('Failed to load offline heartbeats:', error);
  }
  return [];
}

export function saveOfflineHeartbeats(heartbeats: Heartbeat[]): void {
  ensureConfigDir();
  const storage: OfflineStorage = {
    heartbeats,
    last_sync_attempt: Date.now(),
  };
  fs.writeFileSync(getOfflineDbPath(), JSON.stringify(storage, null, 2));
}

export function appendOfflineHeartbeat(heartbeat: Heartbeat): void {
  const heartbeats = loadOfflineHeartbeats();
  heartbeats.push(heartbeat);
  saveOfflineHeartbeats(heartbeats);
}

export function clearOfflineHeartbeats(): void {
  const dbPath = getOfflineDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

// Track which entries we've already submitted to avoid duplicates
const SUBMITTED_FILE = getOfflineDbPath().replace('.json', '_submitted.json');

export function loadSubmittedIds(): Set<string> {
  try {
    if (fs.existsSync(SUBMITTED_FILE)) {
      const data = fs.readFileSync(SUBMITTED_FILE, 'utf-8');
      const ids: string[] = JSON.parse(data);
      return new Set(ids);
    }
  } catch {
    // Ignore errors
  }
  return new Set();
}

export function saveSubmittedIds(ids: Set<string>): void {
  ensureConfigDir();
  // Keep only last 10000 IDs to prevent file from growing too large
  const idsArray = Array.from(ids).slice(-10000);
  fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(idsArray));
}

export function markAsSubmitted(id: string): void {
  const ids = loadSubmittedIds();
  ids.add(id);
  saveSubmittedIds(ids);
}
