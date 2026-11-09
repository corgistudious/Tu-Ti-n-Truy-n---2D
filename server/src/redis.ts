import { Redis } from 'ioredis';
import { config } from './config.js';
import { log } from './log.js';

let client: Redis | null = null;
export function redis(): Redis {
  if (!client) {
    client = new Redis(config().REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: false, enableOfflineQueue: true });
    client.on('error', (e) => log.warn('redis error', { err: e.message }));
  }
  return client;
}
export async function closeRedis(): Promise<void> { if (client) { await client.quit().catch(() => undefined); client = null; } }

/** Rate limit dạng cửa sổ cố định trên Redis. Trả về true nếu còn được phép. */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  try {
    const k = `rl:${key}`;
    const n = await redis().incr(k);
    if (n === 1) await redis().expire(k, windowSec);
    return n <= max;
  } catch {
    return true; // Redis lỗi: không chặn người chơi, rate limit trong bộ nhớ vẫn hoạt động ở tầng WS
  }
}
