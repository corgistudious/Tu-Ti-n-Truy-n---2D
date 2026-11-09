import { config } from './config.js';
import { log } from './log.js';
import { migrate } from './migrate.js';
import { buildApp } from './http/app.js';
import { attachWebSocket } from './ws.js';
import { world } from './game/world.js';
import { economyHousekeeping } from './game/rpc/economy.js';
import { arenaMatchmake } from './game/rpc/pvp.js';
import { runEventScheduler } from './http/admin.js';
import { finalizeDeletions } from './http/characters.js';
import { closeDb } from './db.js';
import { closeRedis } from './redis.js';

export async function startServer(port = config().PORT): Promise<{ close: () => Promise<void>; port: number }> {
  if (process.env.SKIP_MIGRATE !== '1') await migrate();
  const app = await buildApp();
  await app.listen({ port, host: config().HOST });
  const addr = app.server.address();
  const realPort = typeof addr === 'object' && addr ? addr.port : port;
  const wss = attachWebSocket(app.server);
  const w = world();
  w.housekeepingHook = async () => { await economyHousekeeping(); await runEventScheduler(); };
  w.start();
  const mm = setInterval(arenaMatchmake, 2000);
  const del = setInterval(() => finalizeDeletions().catch(() => undefined), 3600_000);
  log.info('server started', { port: realPort, env: config().NODE_ENV });
  return {
    port: realPort,
    close: async () => {
      clearInterval(mm); clearInterval(del);
      await w.stop();
      wss.close();
      await app.close();
    },
  };
}

const isMain = process.argv[1] && /index\.(ts|js)$/.test(process.argv[1]);
if (isMain) {
  startServer().then((srv) => {
    const shutdown = async (sig: string) => {
      log.info('shutting down', { sig });
      await srv.close().catch(() => undefined);
      await closeDb(); await closeRedis();
      process.exit(0);
    };
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  }).catch((e) => { log.error('failed to start', { err: String((e as Error).stack ?? e) }); process.exit(1); });
}
