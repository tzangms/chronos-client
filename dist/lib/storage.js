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
exports.loadOfflineHeartbeats = loadOfflineHeartbeats;
exports.saveOfflineHeartbeats = saveOfflineHeartbeats;
exports.appendOfflineHeartbeat = appendOfflineHeartbeat;
exports.clearOfflineHeartbeats = clearOfflineHeartbeats;
exports.loadSubmittedIds = loadSubmittedIds;
exports.saveSubmittedIds = saveSubmittedIds;
exports.markAsSubmitted = markAsSubmitted;
const fs = __importStar(require("fs"));
const config_1 = require("./config");
function loadOfflineHeartbeats() {
    try {
        const dbPath = (0, config_1.getOfflineDbPath)();
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf-8');
            const storage = JSON.parse(data);
            return storage.heartbeats || [];
        }
    }
    catch (error) {
        console.error('Failed to load offline heartbeats:', error);
    }
    return [];
}
function saveOfflineHeartbeats(heartbeats) {
    (0, config_1.ensureConfigDir)();
    const storage = {
        heartbeats,
        last_sync_attempt: Date.now(),
    };
    fs.writeFileSync((0, config_1.getOfflineDbPath)(), JSON.stringify(storage, null, 2));
}
function appendOfflineHeartbeat(heartbeat) {
    const heartbeats = loadOfflineHeartbeats();
    heartbeats.push(heartbeat);
    saveOfflineHeartbeats(heartbeats);
}
function clearOfflineHeartbeats() {
    const dbPath = (0, config_1.getOfflineDbPath)();
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
}
// Track which entries we've already submitted to avoid duplicates
const SUBMITTED_FILE = (0, config_1.getOfflineDbPath)().replace('.json', '_submitted.json');
function loadSubmittedIds() {
    try {
        if (fs.existsSync(SUBMITTED_FILE)) {
            const data = fs.readFileSync(SUBMITTED_FILE, 'utf-8');
            const ids = JSON.parse(data);
            return new Set(ids);
        }
    }
    catch {
        // Ignore errors
    }
    return new Set();
}
function saveSubmittedIds(ids) {
    (0, config_1.ensureConfigDir)();
    // Keep only last 10000 IDs to prevent file from growing too large
    const idsArray = Array.from(ids).slice(-10000);
    fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(idsArray));
}
function markAsSubmitted(id) {
    const ids = loadSubmittedIds();
    ids.add(id);
    saveSubmittedIds(ids);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLHNEQVlDO0FBRUQsc0RBT0M7QUFFRCx3REFJQztBQUVELHdEQUtDO0FBS0QsNENBV0M7QUFFRCw0Q0FLQztBQUVELDBDQUlDO0FBeEVELHVDQUF5QjtBQUV6QixxQ0FBNkQ7QUFPN0QsU0FBZ0IscUJBQXFCO0lBQ25DLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWdCLEdBQUUsQ0FBQztRQUNsQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMxQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5QyxNQUFNLE9BQU8sR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxPQUFPLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLFVBQXVCO0lBQzNELElBQUEsd0JBQWUsR0FBRSxDQUFDO0lBQ2xCLE1BQU0sT0FBTyxHQUFtQjtRQUM5QixVQUFVO1FBQ1YsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtLQUM5QixDQUFDO0lBQ0YsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFBLHlCQUFnQixHQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsQ0FBQztBQUVELFNBQWdCLHNCQUFzQixDQUFDLFNBQW9CO0lBQ3pELE1BQU0sVUFBVSxHQUFHLHFCQUFxQixFQUFFLENBQUM7SUFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQixxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsU0FBZ0Isc0JBQXNCO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWdCLEdBQUUsQ0FBQztJQUNsQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUMxQixFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7QUFDSCxDQUFDO0FBRUQsa0VBQWtFO0FBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUEseUJBQWdCLEdBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFFOUUsU0FBZ0IsZ0JBQWdCO0lBQzlCLElBQUksQ0FBQztRQUNILElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sR0FBRyxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLGdCQUFnQjtJQUNsQixDQUFDO0lBQ0QsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxHQUFnQjtJQUMvQyxJQUFBLHdCQUFlLEdBQUUsQ0FBQztJQUNsQixrRUFBa0U7SUFDbEUsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxFQUFVO0lBQ3hDLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixFQUFFLENBQUM7SUFDL0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBIZWFydGJlYXQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBlbnN1cmVDb25maWdEaXIsIGdldE9mZmxpbmVEYlBhdGggfSBmcm9tICcuL2NvbmZpZyc7XG5cbmludGVyZmFjZSBPZmZsaW5lU3RvcmFnZSB7XG4gIGhlYXJ0YmVhdHM6IEhlYXJ0YmVhdFtdO1xuICBsYXN0X3N5bmNfYXR0ZW1wdD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRPZmZsaW5lSGVhcnRiZWF0cygpOiBIZWFydGJlYXRbXSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGJQYXRoID0gZ2V0T2ZmbGluZURiUGF0aCgpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGRiUGF0aCkpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZGJQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIHJldHVybiBzdG9yYWdlLmhlYXJ0YmVhdHMgfHwgW107XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIG9mZmxpbmUgaGVhcnRiZWF0czonLCBlcnJvcik7XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZU9mZmxpbmVIZWFydGJlYXRzKGhlYXJ0YmVhdHM6IEhlYXJ0YmVhdFtdKTogdm9pZCB7XG4gIGVuc3VyZUNvbmZpZ0RpcigpO1xuICBjb25zdCBzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSA9IHtcbiAgICBoZWFydGJlYXRzLFxuICAgIGxhc3Rfc3luY19hdHRlbXB0OiBEYXRlLm5vdygpLFxuICB9O1xuICBmcy53cml0ZUZpbGVTeW5jKGdldE9mZmxpbmVEYlBhdGgoKSwgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZSwgbnVsbCwgMikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kT2ZmbGluZUhlYXJ0YmVhdChoZWFydGJlYXQ6IEhlYXJ0YmVhdCk6IHZvaWQge1xuICBjb25zdCBoZWFydGJlYXRzID0gbG9hZE9mZmxpbmVIZWFydGJlYXRzKCk7XG4gIGhlYXJ0YmVhdHMucHVzaChoZWFydGJlYXQpO1xuICBzYXZlT2ZmbGluZUhlYXJ0YmVhdHMoaGVhcnRiZWF0cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck9mZmxpbmVIZWFydGJlYXRzKCk6IHZvaWQge1xuICBjb25zdCBkYlBhdGggPSBnZXRPZmZsaW5lRGJQYXRoKCk7XG4gIGlmIChmcy5leGlzdHNTeW5jKGRiUGF0aCkpIHtcbiAgICBmcy51bmxpbmtTeW5jKGRiUGF0aCk7XG4gIH1cbn1cblxuLy8gVHJhY2sgd2hpY2ggZW50cmllcyB3ZSd2ZSBhbHJlYWR5IHN1Ym1pdHRlZCB0byBhdm9pZCBkdXBsaWNhdGVzXG5jb25zdCBTVUJNSVRURURfRklMRSA9IGdldE9mZmxpbmVEYlBhdGgoKS5yZXBsYWNlKCcuanNvbicsICdfc3VibWl0dGVkLmpzb24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdWJtaXR0ZWRJZHMoKTogU2V0PHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFNVQk1JVFRFRF9GSUxFKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhTVUJNSVRURURfRklMRSwgJ3V0Zi04Jyk7XG4gICAgICBjb25zdCBpZHM6IHN0cmluZ1tdID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIHJldHVybiBuZXcgU2V0KGlkcyk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBJZ25vcmUgZXJyb3JzXG4gIH1cbiAgcmV0dXJuIG5ldyBTZXQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVTdWJtaXR0ZWRJZHMoaWRzOiBTZXQ8c3RyaW5nPik6IHZvaWQge1xuICBlbnN1cmVDb25maWdEaXIoKTtcbiAgLy8gS2VlcCBvbmx5IGxhc3QgMTAwMDAgSURzIHRvIHByZXZlbnQgZmlsZSBmcm9tIGdyb3dpbmcgdG9vIGxhcmdlXG4gIGNvbnN0IGlkc0FycmF5ID0gQXJyYXkuZnJvbShpZHMpLnNsaWNlKC0xMDAwMCk7XG4gIGZzLndyaXRlRmlsZVN5bmMoU1VCTUlUVEVEX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGlkc0FycmF5KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrQXNTdWJtaXR0ZWQoaWQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBpZHMgPSBsb2FkU3VibWl0dGVkSWRzKCk7XG4gIGlkcy5hZGQoaWQpO1xuICBzYXZlU3VibWl0dGVkSWRzKGlkcyk7XG59XG4iXX0=