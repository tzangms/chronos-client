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
exports.parseTranscript = parseTranscript;
exports.getNewEntriesSince = getNewEntriesSince;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
async function parseTranscript(transcriptPath) {
    const stats = {
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        total_cost_usd: 0,
        total_messages: 0,
        user_prompts: 0,
        assistant_responses: 0,
        tool_uses: 0,
        entries: [],
    };
    if (!fs.existsSync(transcriptPath)) {
        return stats;
    }
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        if (!line.trim())
            continue;
        try {
            const entry = JSON.parse(line);
            stats.entries.push(entry);
            stats.total_messages++;
            if (entry.usage) {
                stats.input_tokens += entry.usage.input_tokens || 0;
                stats.output_tokens += entry.usage.output_tokens || 0;
                stats.cache_read_tokens += entry.usage.cache_read_input_tokens || 0;
                stats.cache_write_tokens += entry.usage.cache_creation_input_tokens || 0;
            }
            if (entry.costUSD) {
                stats.total_cost_usd += entry.costUSD;
            }
            if (entry.message?.role === 'user') {
                stats.user_prompts++;
            }
            else if (entry.message?.role === 'assistant') {
                stats.assistant_responses++;
            }
            // Count tool uses
            if (entry.type === 'tool_use' || entry.type === 'tool_result') {
                stats.tool_uses++;
            }
        }
        catch {
            // Skip invalid lines
        }
    }
    return stats;
}
async function getNewEntriesSince(transcriptPath, lastEntryUuid) {
    const { entries } = await parseTranscript(transcriptPath);
    if (!lastEntryUuid) {
        return entries;
    }
    const lastIndex = entries.findIndex((e) => e.uuid === lastEntryUuid);
    if (lastIndex === -1) {
        return entries;
    }
    return entries.slice(lastIndex + 1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdHJhbnNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQSwwQ0EyREM7QUFFRCxnREFnQkM7QUE5RkQsdUNBQXlCO0FBQ3pCLG1EQUFxQztBQWdCOUIsS0FBSyxVQUFVLGVBQWUsQ0FBQyxjQUFzQjtJQUMxRCxNQUFNLEtBQUssR0FBb0I7UUFDN0IsWUFBWSxFQUFFLENBQUM7UUFDZixhQUFhLEVBQUUsQ0FBQztRQUNoQixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLGtCQUFrQixFQUFFLENBQUM7UUFDckIsY0FBYyxFQUFFLENBQUM7UUFDakIsY0FBYyxFQUFFLENBQUM7UUFDakIsWUFBWSxFQUFFLENBQUM7UUFDZixtQkFBbUIsRUFBRSxDQUFDO1FBQ3RCLFNBQVMsRUFBRSxDQUFDO1FBQ1osT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDO0lBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztRQUNuQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdkQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUNsQyxLQUFLLEVBQUUsVUFBVTtRQUNqQixTQUFTLEVBQUUsUUFBUTtLQUNwQixDQUFDLENBQUM7SUFFSCxJQUFJLEtBQUssRUFBRSxNQUFNLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUFFLFNBQVM7UUFFM0IsSUFBSSxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXZCLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixLQUFLLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztnQkFDcEQsS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7Z0JBQ3RELEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLENBQUMsQ0FBQztnQkFDcEUsS0FBSyxDQUFDLGtCQUFrQixJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsMkJBQTJCLElBQUksQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEIsS0FBSyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQ3hDLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNuQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkIsQ0FBQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUMvQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM5QixDQUFDO1lBRUQsa0JBQWtCO1lBQ2xCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxhQUFhLEVBQUUsQ0FBQztnQkFDOUQsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLENBQUM7UUFDSCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AscUJBQXFCO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUN0QyxjQUFzQixFQUN0QixhQUFzQjtJQUV0QixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFMUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxDQUFDO0lBQ3JFLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCB7IFRyYW5zY3JpcHRFbnRyeSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2NyaXB0U3RhdHMge1xuICBpbnB1dF90b2tlbnM6IG51bWJlcjtcbiAgb3V0cHV0X3Rva2VuczogbnVtYmVyO1xuICBjYWNoZV9yZWFkX3Rva2VuczogbnVtYmVyO1xuICBjYWNoZV93cml0ZV90b2tlbnM6IG51bWJlcjtcbiAgdG90YWxfY29zdF91c2Q6IG51bWJlcjtcbiAgdG90YWxfbWVzc2FnZXM6IG51bWJlcjtcbiAgdXNlcl9wcm9tcHRzOiBudW1iZXI7XG4gIGFzc2lzdGFudF9yZXNwb25zZXM6IG51bWJlcjtcbiAgdG9vbF91c2VzOiBudW1iZXI7XG4gIGVudHJpZXM6IFRyYW5zY3JpcHRFbnRyeVtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFyc2VUcmFuc2NyaXB0KHRyYW5zY3JpcHRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRyYW5zY3JpcHRTdGF0cz4ge1xuICBjb25zdCBzdGF0czogVHJhbnNjcmlwdFN0YXRzID0ge1xuICAgIGlucHV0X3Rva2VuczogMCxcbiAgICBvdXRwdXRfdG9rZW5zOiAwLFxuICAgIGNhY2hlX3JlYWRfdG9rZW5zOiAwLFxuICAgIGNhY2hlX3dyaXRlX3Rva2VuczogMCxcbiAgICB0b3RhbF9jb3N0X3VzZDogMCxcbiAgICB0b3RhbF9tZXNzYWdlczogMCxcbiAgICB1c2VyX3Byb21wdHM6IDAsXG4gICAgYXNzaXN0YW50X3Jlc3BvbnNlczogMCxcbiAgICB0b29sX3VzZXM6IDAsXG4gICAgZW50cmllczogW10sXG4gIH07XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKHRyYW5zY3JpcHRQYXRoKSkge1xuICAgIHJldHVybiBzdGF0cztcbiAgfVxuXG4gIGNvbnN0IGZpbGVTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRyYW5zY3JpcHRQYXRoKTtcbiAgY29uc3QgcmwgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgIGlucHV0OiBmaWxlU3RyZWFtLFxuICAgIGNybGZEZWxheTogSW5maW5pdHksXG4gIH0pO1xuXG4gIGZvciBhd2FpdCAoY29uc3QgbGluZSBvZiBybCkge1xuICAgIGlmICghbGluZS50cmltKCkpIGNvbnRpbnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJ5OiBUcmFuc2NyaXB0RW50cnkgPSBKU09OLnBhcnNlKGxpbmUpO1xuICAgICAgc3RhdHMuZW50cmllcy5wdXNoKGVudHJ5KTtcbiAgICAgIHN0YXRzLnRvdGFsX21lc3NhZ2VzKys7XG5cbiAgICAgIGlmIChlbnRyeS51c2FnZSkge1xuICAgICAgICBzdGF0cy5pbnB1dF90b2tlbnMgKz0gZW50cnkudXNhZ2UuaW5wdXRfdG9rZW5zIHx8IDA7XG4gICAgICAgIHN0YXRzLm91dHB1dF90b2tlbnMgKz0gZW50cnkudXNhZ2Uub3V0cHV0X3Rva2VucyB8fCAwO1xuICAgICAgICBzdGF0cy5jYWNoZV9yZWFkX3Rva2VucyArPSBlbnRyeS51c2FnZS5jYWNoZV9yZWFkX2lucHV0X3Rva2VucyB8fCAwO1xuICAgICAgICBzdGF0cy5jYWNoZV93cml0ZV90b2tlbnMgKz0gZW50cnkudXNhZ2UuY2FjaGVfY3JlYXRpb25faW5wdXRfdG9rZW5zIHx8IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbnRyeS5jb3N0VVNEKSB7XG4gICAgICAgIHN0YXRzLnRvdGFsX2Nvc3RfdXNkICs9IGVudHJ5LmNvc3RVU0Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbnRyeS5tZXNzYWdlPy5yb2xlID09PSAndXNlcicpIHtcbiAgICAgICAgc3RhdHMudXNlcl9wcm9tcHRzKys7XG4gICAgICB9IGVsc2UgaWYgKGVudHJ5Lm1lc3NhZ2U/LnJvbGUgPT09ICdhc3Npc3RhbnQnKSB7XG4gICAgICAgIHN0YXRzLmFzc2lzdGFudF9yZXNwb25zZXMrKztcbiAgICAgIH1cblxuICAgICAgLy8gQ291bnQgdG9vbCB1c2VzXG4gICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ3Rvb2xfdXNlJyB8fCBlbnRyeS50eXBlID09PSAndG9vbF9yZXN1bHQnKSB7XG4gICAgICAgIHN0YXRzLnRvb2xfdXNlcysrO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbnZhbGlkIGxpbmVzXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TmV3RW50cmllc1NpbmNlKFxuICB0cmFuc2NyaXB0UGF0aDogc3RyaW5nLFxuICBsYXN0RW50cnlVdWlkPzogc3RyaW5nXG4pOiBQcm9taXNlPFRyYW5zY3JpcHRFbnRyeVtdPiB7XG4gIGNvbnN0IHsgZW50cmllcyB9ID0gYXdhaXQgcGFyc2VUcmFuc2NyaXB0KHRyYW5zY3JpcHRQYXRoKTtcblxuICBpZiAoIWxhc3RFbnRyeVV1aWQpIHtcbiAgICByZXR1cm4gZW50cmllcztcbiAgfVxuXG4gIGNvbnN0IGxhc3RJbmRleCA9IGVudHJpZXMuZmluZEluZGV4KChlKSA9PiBlLnV1aWQgPT09IGxhc3RFbnRyeVV1aWQpO1xuICBpZiAobGFzdEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9XG5cbiAgcmV0dXJuIGVudHJpZXMuc2xpY2UobGFzdEluZGV4ICsgMSk7XG59XG4iXX0=