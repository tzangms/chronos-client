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
exports.ChronosTracker = void 0;
const config_1 = require("./config");
const machine_1 = require("./machine");
const heartbeat_1 = require("./heartbeat");
const path = __importStar(require("path"));
class ChronosTracker {
    config;
    constructor() {
        this.config = (0, config_1.loadConfig)();
    }
    async track(options) {
        if (!this.config) {
            // If setup hasn't run, we can't track.
            // In a real scenario we might want to log this if debug is on
            if (process.env.CHRONOS_DEBUG) {
                console.warn('Chronos not configured. Run "chronos setup" first.');
            }
            return false;
        }
        const projectName = options.projectName || path.basename(options.projectPath);
        const sessionId = options.sessionId || `session-${Date.now()}`;
        const heartbeat = {
            user_id: this.config.user_id || "anonymous",
            api_key: this.config.api_key,
            timestamp: Math.floor(Date.now() / 1000),
            project: projectName,
            project_path: options.projectPath,
            event_type: options.eventType,
            session_id: sessionId,
            machine_id: (0, machine_1.getMachineId)(),
            os: (0, machine_1.getOS)(),
            input_tokens: options.inputTokens,
            output_tokens: options.outputTokens,
            cache_read_tokens: options.cacheReadTokens,
            cache_write_tokens: options.cacheWriteTokens,
            tool_name: options.toolName,
        };
        const success = await (0, heartbeat_1.sendHeartbeat)(heartbeat);
        // Try to sync offline heartbeats if we are online now
        // We do this in the background usually, but here we can just fire and forget or await
        if (success) {
            await (0, heartbeat_1.syncOfflineHeartbeats)().catch(() => { });
        }
        return success;
    }
}
exports.ChronosTracker = ChronosTracker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBcUQ7QUFDckQsdUNBQWdEO0FBQ2hELDJDQUFtRTtBQUVuRSwyQ0FBNkI7QUFjN0IsTUFBYSxjQUFjO0lBQ2pCLE1BQU0sQ0FBdUI7SUFFckM7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsbUJBQVUsR0FBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQXFCO1FBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsdUNBQXVDO1lBQ3ZDLDhEQUE4RDtZQUM5RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQztZQUNyRSxDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQ2YsT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFFL0QsTUFBTSxTQUFTLEdBQWM7WUFDM0IsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLFdBQVc7WUFDM0MsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUM1QixTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxXQUFXO1lBQ3BCLFlBQVksRUFBRSxPQUFPLENBQUMsV0FBVztZQUNqQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDN0IsVUFBVSxFQUFFLFNBQVM7WUFDckIsVUFBVSxFQUFFLElBQUEsc0JBQVksR0FBRTtZQUMxQixFQUFFLEVBQUUsSUFBQSxlQUFLLEdBQUU7WUFDWCxZQUFZLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDakMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQ25DLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxlQUFlO1lBQzFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7WUFDNUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxRQUFRO1NBQzVCLENBQUM7UUFFRixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEseUJBQWEsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUUvQyxzREFBc0Q7UUFDdEQsc0ZBQXNGO1FBQ3RGLElBQUksT0FBTyxFQUFFLENBQUM7WUFDWixNQUFNLElBQUEsaUNBQXFCLEdBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRjtBQWhERCx3Q0FnREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkQ29uZmlnLCBDaHJvbm9zQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBnZXRNYWNoaW5lSWQsIGdldE9TIH0gZnJvbSBcIi4vbWFjaGluZVwiO1xuaW1wb3J0IHsgc2VuZEhlYXJ0YmVhdCwgc3luY09mZmxpbmVIZWFydGJlYXRzIH0gZnJvbSBcIi4vaGVhcnRiZWF0XCI7XG5pbXBvcnQgeyBIZWFydGJlYXQsIEhlYXJ0YmVhdEV2ZW50VHlwZSB9IGZyb20gXCIuLi90eXBlc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYWNrT3B0aW9ucyB7XG4gIGV2ZW50VHlwZTogSGVhcnRiZWF0RXZlbnRUeXBlO1xuICBwcm9qZWN0UGF0aDogc3RyaW5nO1xuICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gIGlucHV0VG9rZW5zPzogbnVtYmVyO1xuICBvdXRwdXRUb2tlbnM/OiBudW1iZXI7XG4gIGNhY2hlUmVhZFRva2Vucz86IG51bWJlcjtcbiAgY2FjaGVXcml0ZVRva2Vucz86IG51bWJlcjtcbiAgdG9vbE5hbWU/OiBzdHJpbmc7XG4gIHByb2plY3ROYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hyb25vc1RyYWNrZXIge1xuICBwcml2YXRlIGNvbmZpZzogQ2hyb25vc0NvbmZpZyB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSBsb2FkQ29uZmlnKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgdHJhY2sob3B0aW9uczogVHJhY2tPcHRpb25zKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZykge1xuICAgICAgLy8gSWYgc2V0dXAgaGFzbid0IHJ1biwgd2UgY2FuJ3QgdHJhY2suXG4gICAgICAvLyBJbiBhIHJlYWwgc2NlbmFyaW8gd2UgbWlnaHQgd2FudCB0byBsb2cgdGhpcyBpZiBkZWJ1ZyBpcyBvblxuICAgICAgaWYgKHByb2Nlc3MuZW52LkNIUk9OT1NfREVCVUcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDaHJvbm9zIG5vdCBjb25maWd1cmVkLiBSdW4gXCJjaHJvbm9zIHNldHVwXCIgZmlyc3QuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvamVjdE5hbWUgPVxuICAgICAgb3B0aW9ucy5wcm9qZWN0TmFtZSB8fCBwYXRoLmJhc2VuYW1lKG9wdGlvbnMucHJvamVjdFBhdGgpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IG9wdGlvbnMuc2Vzc2lvbklkIHx8IGBzZXNzaW9uLSR7RGF0ZS5ub3coKX1gO1xuXG4gICAgY29uc3QgaGVhcnRiZWF0OiBIZWFydGJlYXQgPSB7XG4gICAgICB1c2VyX2lkOiB0aGlzLmNvbmZpZy51c2VyX2lkIHx8IFwiYW5vbnltb3VzXCIsXG4gICAgICBhcGlfa2V5OiB0aGlzLmNvbmZpZy5hcGlfa2V5LFxuICAgICAgdGltZXN0YW1wOiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICAgIHByb2plY3Q6IHByb2plY3ROYW1lLFxuICAgICAgcHJvamVjdF9wYXRoOiBvcHRpb25zLnByb2plY3RQYXRoLFxuICAgICAgZXZlbnRfdHlwZTogb3B0aW9ucy5ldmVudFR5cGUsXG4gICAgICBzZXNzaW9uX2lkOiBzZXNzaW9uSWQsXG4gICAgICBtYWNoaW5lX2lkOiBnZXRNYWNoaW5lSWQoKSxcbiAgICAgIG9zOiBnZXRPUygpLFxuICAgICAgaW5wdXRfdG9rZW5zOiBvcHRpb25zLmlucHV0VG9rZW5zLFxuICAgICAgb3V0cHV0X3Rva2Vuczogb3B0aW9ucy5vdXRwdXRUb2tlbnMsXG4gICAgICBjYWNoZV9yZWFkX3Rva2Vuczogb3B0aW9ucy5jYWNoZVJlYWRUb2tlbnMsXG4gICAgICBjYWNoZV93cml0ZV90b2tlbnM6IG9wdGlvbnMuY2FjaGVXcml0ZVRva2VucyxcbiAgICAgIHRvb2xfbmFtZTogb3B0aW9ucy50b29sTmFtZSxcbiAgICB9O1xuXG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHNlbmRIZWFydGJlYXQoaGVhcnRiZWF0KTtcblxuICAgIC8vIFRyeSB0byBzeW5jIG9mZmxpbmUgaGVhcnRiZWF0cyBpZiB3ZSBhcmUgb25saW5lIG5vd1xuICAgIC8vIFdlIGRvIHRoaXMgaW4gdGhlIGJhY2tncm91bmQgdXN1YWxseSwgYnV0IGhlcmUgd2UgY2FuIGp1c3QgZmlyZSBhbmQgZm9yZ2V0IG9yIGF3YWl0XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgIGF3YWl0IHN5bmNPZmZsaW5lSGVhcnRiZWF0cygpLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VjY2VzcztcbiAgfVxufVxuIl19