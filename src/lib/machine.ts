import * as os from 'os';
import * as crypto from 'crypto';

let cachedMachineId: string | null = null;

export function getMachineId(): string {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  // Try to use node-machine-id if available
  try {
    const { machineIdSync } = require('node-machine-id');
    const id = machineIdSync();
    cachedMachineId = id;
    return id;
  } catch {
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

export function getOS(): string {
  return os.platform();
}

export function getHostname(): string {
  return os.hostname();
}
