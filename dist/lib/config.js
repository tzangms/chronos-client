"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureConfigDir = ensureConfigDir;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getConfigDir = getConfigDir;
exports.getOfflineDbPath = getOfflineDbPath;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CONFIG_DIR = path.join(os.homedir(), '.chronos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const OFFLINE_DB_FILE = path.join(CONFIG_DIR, 'offline_heartbeats.json');
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Failed to load config:', error);
    }
    return null;
}
function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
function getConfigDir() {
    return CONFIG_DIR;
}
function getOfflineDbPath() {
    return OFFLINE_DB_FILE;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSwwQ0FJQztBQUVELGdDQVVDO0FBRUQsZ0NBR0M7QUFFRCxvQ0FFQztBQUVELDRDQUVDO0FBNUNELHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsdUNBQXlCO0FBU3pCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUM7QUFFekUsU0FBZ0IsZUFBZTtJQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFnQixVQUFVO0lBQ3hCLElBQUksQ0FBQztRQUNILElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFnQixVQUFVLENBQUMsTUFBcUI7SUFDOUMsZUFBZSxFQUFFLENBQUM7SUFDbEIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELFNBQWdCLFlBQVk7SUFDMUIsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVELFNBQWdCLGdCQUFnQjtJQUM5QixPQUFPLGVBQWUsQ0FBQztBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuZXhwb3J0IGludGVyZmFjZSBDaHJvbm9zQ29uZmlnIHtcbiAgYXBpX2tleTogc3RyaW5nO1xuICBhcGlfdXJsOiBzdHJpbmc7XG4gIHVzZXJfaWQ/OiBzdHJpbmc7XG4gIGRlYnVnPzogYm9vbGVhbjtcbn1cblxuY29uc3QgQ09ORklHX0RJUiA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuY2hyb25vcycpO1xuY29uc3QgQ09ORklHX0ZJTEUgPSBwYXRoLmpvaW4oQ09ORklHX0RJUiwgJ2NvbmZpZy5qc29uJyk7XG5jb25zdCBPRkZMSU5FX0RCX0ZJTEUgPSBwYXRoLmpvaW4oQ09ORklHX0RJUiwgJ29mZmxpbmVfaGVhcnRiZWF0cy5qc29uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVDb25maWdEaXIoKTogdm9pZCB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhDT05GSUdfRElSKSkge1xuICAgIGZzLm1rZGlyU3luYyhDT05GSUdfRElSLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvbmZpZygpOiBDaHJvbm9zQ29uZmlnIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoQ09ORklHX0ZJTEUpKSB7XG4gICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKENPTkZJR19GSUxFLCAndXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjb25maWc6JywgZXJyb3IpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUNvbmZpZyhjb25maWc6IENocm9ub3NDb25maWcpOiB2b2lkIHtcbiAgZW5zdXJlQ29uZmlnRGlyKCk7XG4gIGZzLndyaXRlRmlsZVN5bmMoQ09ORklHX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnRGlyKCk6IHN0cmluZyB7XG4gIHJldHVybiBDT05GSUdfRElSO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2ZmbGluZURiUGF0aCgpOiBzdHJpbmcge1xuICByZXR1cm4gT0ZGTElORV9EQl9GSUxFO1xufVxuIl19