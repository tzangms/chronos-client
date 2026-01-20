import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ChronosConfig {
  api_key: string;
  api_url: string;
  user_id?: string;
  debug?: boolean;
}

const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const OFFLINE_DB_FILE = path.join(CONFIG_DIR, 'offline_heartbeats.json');

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): ChronosConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  return null;
}

export function saveConfig(config: ChronosConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getOfflineDbPath(): string {
  return OFFLINE_DB_FILE;
}
