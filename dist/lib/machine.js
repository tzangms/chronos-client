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
exports.getMachineId = getMachineId;
exports.getOS = getOS;
exports.getHostname = getHostname;
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
let cachedMachineId = null;
function getMachineId() {
    if (cachedMachineId) {
        return cachedMachineId;
    }
    // Try to use node-machine-id if available
    try {
        const { machineIdSync } = require('node-machine-id');
        const id = machineIdSync();
        cachedMachineId = id;
        return id;
    }
    catch {
        // Fallback: generate a hash from system info
        const info = [
            os.hostname(),
            os.platform(),
            os.arch(),
            os.cpus()[0]?.model || 'unknown',
        ].join('|');
        cachedMachineId = crypto.createHash('sha256').update(info).digest('hex').substring(0, 32);
        return cachedMachineId;
    }
}
function getOS() {
    return os.platform();
}
function getHostname() {
    return os.hostname();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjaGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvbWFjaGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtBLG9DQXVCQztBQUVELHNCQUVDO0FBRUQsa0NBRUM7QUFwQ0QsdUNBQXlCO0FBQ3pCLCtDQUFpQztBQUVqQyxJQUFJLGVBQWUsR0FBa0IsSUFBSSxDQUFDO0FBRTFDLFNBQWdCLFlBQVk7SUFDMUIsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNwQixPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0lBRUQsMENBQTBDO0lBQzFDLElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNyRCxNQUFNLEVBQUUsR0FBRyxhQUFhLEVBQUUsQ0FBQztRQUMzQixlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLDZDQUE2QztRQUM3QyxNQUFNLElBQUksR0FBRztZQUNYLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDYixFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ2IsRUFBRSxDQUFDLElBQUksRUFBRTtZQUNULEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksU0FBUztTQUNqQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVaLGVBQWUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRixPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQWdCLEtBQUs7SUFDbkIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQUVELFNBQWdCLFdBQVc7SUFDekIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5sZXQgY2FjaGVkTWFjaGluZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hY2hpbmVJZCgpOiBzdHJpbmcge1xuICBpZiAoY2FjaGVkTWFjaGluZUlkKSB7XG4gICAgcmV0dXJuIGNhY2hlZE1hY2hpbmVJZDtcbiAgfVxuXG4gIC8vIFRyeSB0byB1c2Ugbm9kZS1tYWNoaW5lLWlkIGlmIGF2YWlsYWJsZVxuICB0cnkge1xuICAgIGNvbnN0IHsgbWFjaGluZUlkU3luYyB9ID0gcmVxdWlyZSgnbm9kZS1tYWNoaW5lLWlkJyk7XG4gICAgY29uc3QgaWQgPSBtYWNoaW5lSWRTeW5jKCk7XG4gICAgY2FjaGVkTWFjaGluZUlkID0gaWQ7XG4gICAgcmV0dXJuIGlkO1xuICB9IGNhdGNoIHtcbiAgICAvLyBGYWxsYmFjazogZ2VuZXJhdGUgYSBoYXNoIGZyb20gc3lzdGVtIGluZm9cbiAgICBjb25zdCBpbmZvID0gW1xuICAgICAgb3MuaG9zdG5hbWUoKSxcbiAgICAgIG9zLnBsYXRmb3JtKCksXG4gICAgICBvcy5hcmNoKCksXG4gICAgICBvcy5jcHVzKClbMF0/Lm1vZGVsIHx8ICd1bmtub3duJyxcbiAgICBdLmpvaW4oJ3wnKTtcblxuICAgIGNhY2hlZE1hY2hpbmVJZCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoaW5mbykuZGlnZXN0KCdoZXgnKS5zdWJzdHJpbmcoMCwgMzIpO1xuICAgIHJldHVybiBjYWNoZWRNYWNoaW5lSWQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9TKCk6IHN0cmluZyB7XG4gIHJldHVybiBvcy5wbGF0Zm9ybSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgcmV0dXJuIG9zLmhvc3RuYW1lKCk7XG59XG4iXX0=