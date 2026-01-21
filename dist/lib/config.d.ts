export interface ChronosConfig {
    api_key: string;
    api_url: string;
    user_id?: string;
    debug?: boolean;
}
export declare function ensureConfigDir(): void;
export declare function loadConfig(): ChronosConfig | null;
export declare function saveConfig(config: ChronosConfig): void;
export declare function getConfigDir(): string;
export declare function getOfflineDbPath(): string;
