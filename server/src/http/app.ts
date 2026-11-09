import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fstatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from '../config.js';
import { q1 } from '../db.js';
import { redis } from '../redis.js';
import { log } from '../log.js';
import { authRoutes } from './auth.js';
import { characterRoutes } from './characters.js';
import { adminRoutes } from './admin.js';
import { assetRoutes } from './assets.js';
import { world } from '../game/world.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false, bodyLimit: 256 * 1024, trustProxy: true });
  const origins = config().CORS_ORIGINS;
  await app.register(cors, { origin: origins === '*' ? true : origins.split(',').map((s) => s.trim()), credentials: false });
  app.addHook('onSend', async (_req, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    return payload;
  });
  // Godot Web (threads) cần cross-origin isolation khi dùng SharedArrayBuffer; bản xuất mặc định không cần.
  app.setErrorHandler((err, req, reply) => {
    log.error('http error', { url: req.url, err: err.message });
    reply.code(err.statusCode && err.statusCode < 500 ? err.statusCode : 500).send({ error: err.statusCode && err.statusCode < 500 ? err.message : 'Lỗi máy chủ' });
  });
  app.get('/healthz', async () => ({ ok: true }));
  app.get('/readyz', async (_req, reply) => {
    try {
      await q1('SELECT 1');
      await redis().ping();
      return { ok: true, world: world().stats() };
    } catch (e) {
      return reply.code(503).send({ ok: false, error: (e as Error).message });
    }
  });
  app.get('/metrics', async (_req, reply) => {
    const s = world().stats() as Record<string, number>;
    reply.type('text/plain; version=0.0.4');
    return [
      `# TYPE tt_online gauge`, `tt_online ${s.online}`,
      `# TYPE tt_instances gauge`, `tt_instances ${s.instances}`,
      `# TYPE tt_monsters gauge`, `tt_monsters ${s.monsters}`,
      `# TYPE tt_tick_ms gauge`, `tt_tick_ms ${s.tickMsAvg}`,
      `# TYPE tt_uptime_seconds counter`, `tt_uptime_seconds ${s.uptimeSec}`,
      `# TYPE process_resident_memory_bytes gauge`, `process_resident_memory_bytes ${process.memoryUsage().rss}`,
    ].join('\n') + '\n';
  });
  authRoutes(app);
  characterRoutes(app);
  adminRoutes(app);
  assetRoutes(app);
  const adminDir = config().ADMIN_DIR ?? resolve(process.cwd(), '../admin');
  if (existsSync(adminDir)) await app.register(fstatic, { root: adminDir, prefix: '/admin/', decorateReply: false });
  const clientDir = config().CLIENT_DIR;
  if (clientDir && existsSync(clientDir)) {
    await app.register(fstatic, { root: clientDir, prefix: '/play/', decorateReply: false, setHeaders: (res, path) => { if (path.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm'); } });
  }
  return app;
}
