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
exports.sendHeartbeats = sendHeartbeats;
exports.sendHeartbeat = sendHeartbeat;
exports.syncOfflineHeartbeats = syncOfflineHeartbeats;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const config_1 = require("./config");
const storage_1 = require("./storage");
async function sendHeartbeats(heartbeats) {
    const config = (0, config_1.loadConfig)();
    if (!config) {
        throw new Error('No config found. Run "chronos setup" first.');
    }
    const url = new URL('/api/v1/heartbeats/bulk', config.api_url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ heartbeats });
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `Bearer ${config.api_key}`,
                'User-Agent': 'chronos-client/0.1.0',
            },
            timeout: 30000,
        };
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                }
                catch {
                    reject(new Error(`Invalid response: ${data}`));
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.write(postData);
        req.end();
    });
}
async function sendHeartbeat(heartbeat) {
    try {
        const response = await sendHeartbeats([heartbeat]);
        return response.success && response.accepted > 0;
    }
    catch (error) {
        // Store offline for later sync
        (0, storage_1.appendOfflineHeartbeat)(heartbeat);
        if (process.env.CHRONOS_DEBUG) {
            console.error('Failed to send heartbeat, stored offline:', error);
        }
        return false;
    }
}
async function syncOfflineHeartbeats() {
    const offlineHeartbeats = (0, storage_1.loadOfflineHeartbeats)();
    if (offlineHeartbeats.length === 0) {
        return { synced: 0, failed: 0 };
    }
    let synced = 0;
    let failed = 0;
    // Send in batches of 25 (similar to WakaTime)
    const batchSize = 25;
    for (let i = 0; i < offlineHeartbeats.length; i += batchSize) {
        const batch = offlineHeartbeats.slice(i, i + batchSize);
        try {
            const response = await sendHeartbeats(batch);
            synced += response.accepted;
            failed += response.rejected;
        }
        catch {
            failed += batch.length;
        }
    }
    // Clear offline storage after sync attempt
    if (synced > 0) {
        (0, storage_1.clearOfflineHeartbeats)();
    }
    return { synced, failed };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhcnRiZWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9oZWFydGJlYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSx3Q0FzREM7QUFFRCxzQ0FZQztBQUVELHNEQTRCQztBQXhHRCw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBRTdCLHFDQUFzQztBQUN0Qyx1Q0FBa0c7QUFFM0YsS0FBSyxVQUFVLGNBQWMsQ0FBQyxVQUF1QjtJQUMxRCxNQUFNLE1BQU0sR0FBRyxJQUFBLG1CQUFVLEdBQUUsQ0FBQztJQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQztJQUMxQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxPQUFPLEdBQUc7WUFDZCxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7WUFDdEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUTtZQUNsQixNQUFNLEVBQUUs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LE1BQU0sRUFBRSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDN0QsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDNUIsTUFBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDOUIsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2YsSUFBQSxnQ0FBc0IsR0FBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQzVCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgSGVhcnRiZWF0LCBIZWFydGJlYXRSZXNwb25zZSB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IGxvYWRDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBhcHBlbmRPZmZsaW5lSGVhcnRiZWF0LCBsb2FkT2ZmbGluZUhlYXJ0YmVhdHMsIGNsZWFyT2ZmbGluZUhlYXJ0YmVhdHMgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEhlYXJ0YmVhdHMoaGVhcnRiZWF0czogSGVhcnRiZWF0W10pOiBQcm9taXNlPEhlYXJ0YmVhdFJlc3BvbnNlPiB7XG4gIGNvbnN0IGNvbmZpZyA9IGxvYWRDb25maWcoKTtcbiAgaWYgKCFjb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbmZpZyBmb3VuZC4gUnVuIFwiY2hyb25vcyBzZXR1cFwiIGZpcnN0LicpO1xuICB9XG5cbiAgY29uc3QgdXJsID0gbmV3IFVSTCgnL2FwaS92MS9oZWFydGJlYXRzL2J1bGsnLCBjb25maWcuYXBpX3VybCk7XG4gIGNvbnN0IGlzSHR0cHMgPSB1cmwucHJvdG9jb2wgPT09ICdodHRwczonO1xuICBjb25zdCBjbGllbnQgPSBpc0h0dHBzID8gaHR0cHMgOiBodHRwO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcG9zdERhdGEgPSBKU09OLnN0cmluZ2lmeSh7IGhlYXJ0YmVhdHMgfSk7XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgaG9zdG5hbWU6IHVybC5ob3N0bmFtZSxcbiAgICAgIHBvcnQ6IHVybC5wb3J0IHx8IChpc0h0dHBzID8gNDQzIDogODApLFxuICAgICAgcGF0aDogdXJsLnBhdGhuYW1lLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdDb250ZW50LUxlbmd0aCc6IEJ1ZmZlci5ieXRlTGVuZ3RoKHBvc3REYXRhKSxcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7Y29uZmlnLmFwaV9rZXl9YCxcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnY2hyb25vcy1jbGllbnQvMC4xLjAnLFxuICAgICAgfSxcbiAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgIH07XG5cbiAgICBjb25zdCByZXEgPSBjbGllbnQucmVxdWVzdChvcHRpb25zLCAocmVzKSA9PiB7XG4gICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgcmVzLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgIGRhdGEgKz0gY2h1bms7XG4gICAgICB9KTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKSBhcyBIZWFydGJlYXRSZXNwb25zZTtcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSW52YWxpZCByZXNwb25zZTogJHtkYXRhfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXEub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgcmVxLm9uKCd0aW1lb3V0JywgKCkgPT4ge1xuICAgICAgcmVxLmRlc3Ryb3koKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKTtcbiAgICB9KTtcblxuICAgIHJlcS53cml0ZShwb3N0RGF0YSk7XG4gICAgcmVxLmVuZCgpO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRIZWFydGJlYXQoaGVhcnRiZWF0OiBIZWFydGJlYXQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRIZWFydGJlYXRzKFtoZWFydGJlYXRdKTtcbiAgICByZXR1cm4gcmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5hY2NlcHRlZCA+IDA7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gU3RvcmUgb2ZmbGluZSBmb3IgbGF0ZXIgc3luY1xuICAgIGFwcGVuZE9mZmxpbmVIZWFydGJlYXQoaGVhcnRiZWF0KTtcbiAgICBpZiAocHJvY2Vzcy5lbnYuQ0hST05PU19ERUJVRykge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlbmQgaGVhcnRiZWF0LCBzdG9yZWQgb2ZmbGluZTonLCBlcnJvcik7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3luY09mZmxpbmVIZWFydGJlYXRzKCk6IFByb21pc2U8eyBzeW5jZWQ6IG51bWJlcjsgZmFpbGVkOiBudW1iZXIgfT4ge1xuICBjb25zdCBvZmZsaW5lSGVhcnRiZWF0cyA9IGxvYWRPZmZsaW5lSGVhcnRiZWF0cygpO1xuICBpZiAob2ZmbGluZUhlYXJ0YmVhdHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHsgc3luY2VkOiAwLCBmYWlsZWQ6IDAgfTtcbiAgfVxuXG4gIGxldCBzeW5jZWQgPSAwO1xuICBsZXQgZmFpbGVkID0gMDtcblxuICAvLyBTZW5kIGluIGJhdGNoZXMgb2YgMjUgKHNpbWlsYXIgdG8gV2FrYVRpbWUpXG4gIGNvbnN0IGJhdGNoU2l6ZSA9IDI1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9mZmxpbmVIZWFydGJlYXRzLmxlbmd0aDsgaSArPSBiYXRjaFNpemUpIHtcbiAgICBjb25zdCBiYXRjaCA9IG9mZmxpbmVIZWFydGJlYXRzLnNsaWNlKGksIGkgKyBiYXRjaFNpemUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRIZWFydGJlYXRzKGJhdGNoKTtcbiAgICAgIHN5bmNlZCArPSByZXNwb25zZS5hY2NlcHRlZDtcbiAgICAgIGZhaWxlZCArPSByZXNwb25zZS5yZWplY3RlZDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGZhaWxlZCArPSBiYXRjaC5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2xlYXIgb2ZmbGluZSBzdG9yYWdlIGFmdGVyIHN5bmMgYXR0ZW1wdFxuICBpZiAoc3luY2VkID4gMCkge1xuICAgIGNsZWFyT2ZmbGluZUhlYXJ0YmVhdHMoKTtcbiAgfVxuXG4gIHJldHVybiB7IHN5bmNlZCwgZmFpbGVkIH07XG59XG4iXX0=