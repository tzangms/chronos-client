import * as https from 'https';
import * as http from 'http';
import { Heartbeat, HeartbeatResponse } from '@utrack/shared';
import { loadConfig } from './config';
import { appendOfflineHeartbeat, loadOfflineHeartbeats, clearOfflineHeartbeats } from './storage';

export async function sendHeartbeats(heartbeats: Heartbeat[]): Promise<HeartbeatResponse> {
  const config = loadConfig();
  if (!config) {
    throw new Error('No config found. Run "utrack setup" first.');
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
        'User-Agent': 'utrack-client/0.1.0',
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
          const response = JSON.parse(data) as HeartbeatResponse;
          resolve(response);
        } catch {
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

export async function sendHeartbeat(heartbeat: Heartbeat): Promise<boolean> {
  try {
    const response = await sendHeartbeats([heartbeat]);
    return response.success && response.accepted > 0;
  } catch (error) {
    // Store offline for later sync
    appendOfflineHeartbeat(heartbeat);
    if (process.env.UTRACK_DEBUG) {
      console.error('Failed to send heartbeat, stored offline:', error);
    }
    return false;
  }
}

export async function syncOfflineHeartbeats(): Promise<{ synced: number; failed: number }> {
  const offlineHeartbeats = loadOfflineHeartbeats();
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
    } catch {
      failed += batch.length;
    }
  }

  // Clear offline storage after sync attempt
  if (synced > 0) {
    clearOfflineHeartbeats();
  }

  return { synced, failed };
}
