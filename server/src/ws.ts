import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { q1 } from './db.js';
import { config } from './config.js';
import { log } from './log.js';
import { accountFromToken } from './http/auth.js';
import { serverError } from './services/audit.js';
import { GameError } from './services/errors.js';
import { rateLimit } from './redis.js';
import { world } from './game/world.js';
import { handlers } from './game/rpc/registry.js';
import './game/rpc/index.js';
import type { PlayerSession } from './game/player.js';

const MAX_MSG = 16 * 1024;

export function attachWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MSG, perMessageDeflate: false });
  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/ws')) { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });
  wss.on('connection', (ws: WebSocket & { alive?: boolean }, req: IncomingMessage) => onConnection(ws, req));
  // nhịp tim: phát hiện kết nối chết
  const hb = setInterval(() => {
    for (const ws of wss.clients as Set<WebSocket & { alive?: boolean }>) {
      if (ws.alive === false) { ws.terminate(); continue; }
      ws.alive = false; ws.ping();
    }
  }, 20_000);
  wss.on('close', () => clearInterval(hb));
  return wss;
}

function ip(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'];
  return (typeof xf === 'string' ? xf.split(',')[0].trim() : undefined) ?? req.socket.remoteAddress ?? '?';
}

function onConnection(ws: WebSocket & { alive?: boolean }, req: IncomingMessage): void {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  let session: PlayerSession | null = null;
  const addr = ip(req);
  const authTimer = setTimeout(() => { if (!session) ws.close(4000, 'auth timeout'); }, 10_000);

  ws.on('message', async (raw, isBinary) => {
    if (isBinary) return;
    let m: Record<string, unknown>;
    try { m = JSON.parse(raw.toString()); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (!session) {
      if (m.t !== 'auth') return;
      if (!(await rateLimit(`wsauth:${addr}`, config().WS_AUTH_LIMIT_PER_MIN, 60))) { ws.close(4029, 'rate limited'); return; }
      try {
        const acc = await accountFromToken(String(m.token ?? ''));
        if (!acc) { ws.send(JSON.stringify({ t: 'authErr', e: 'Phiên đăng nhập không hợp lệ' })); ws.close(4001, 'unauthorized'); return; }
        const cid = Number(m.characterId);
        const ch = await q1<{ id: number }>('SELECT id FROM characters WHERE id = $1 AND account_id = $2 AND deleted_at IS NULL AND delete_requested_at IS NULL', [cid, acc.id]);
        if (!ch) { ws.send(JSON.stringify({ t: 'authErr', e: 'Nhân vật không hợp lệ' })); ws.close(4003, 'bad character'); return; }
        clearTimeout(authTimer);
        session = await world().connect(ws, acc.id, acc.role, cid, acc.mutedUntil);
      } catch (e) {
        log.error('ws auth error', { err: String((e as Error).stack ?? e) });
        ws.close(1011, 'error');
      }
      return;
    }
    const s = session;
    if (s.ws !== ws) return;
    if (!s.allowMessage()) { s.violations++; return; }
    try {
      switch (m.t) {
        case 'input': s.handleInput(m as never); break;
        case 'atk': s.handleAttack(); break;
        case 'skill': if (typeof m.s === 'string') s.handleSkill(m.s, typeof m.tx === 'number' ? m.tx : undefined); break;
        case 'dodge': s.handleDodge(); break;
        case 'ping': ws.send(JSON.stringify({ t: 'pong', c: m.c, s: Date.now() })); break;
        case 'rpc': {
          const id = Number(m.id);
          const name = String(m.m ?? '');
          const h = handlers[name];
          if (!h) { ws.send(JSON.stringify({ t: 'res', id, ok: false, e: 'Lệnh không tồn tại' })); break; }
          try {
            const d = await h(s, (m.p && typeof m.p === 'object' ? m.p : {}) as Record<string, unknown>);
            s.send({ t: 'res', id, ok: true, d });
          } catch (e) {
            if (e instanceof GameError) s.send({ t: 'res', id, ok: false, e: e.message, code: e.code });
            else {
              log.error('rpc error', { rpc: name, char: s.charId, err: String((e as Error).stack ?? e) });
              serverError(`rpc:${name}`, e).catch(() => undefined);
              s.send({ t: 'res', id, ok: false, e: 'Lỗi máy chủ, vui lòng thử lại' });
            }
          }
          break;
        }
      }
    } catch (e) {
      log.error('ws message error', { err: String((e as Error).stack ?? e) });
    }
  });
  ws.on('close', () => { clearTimeout(authTimer); if (session) world().onSocketClosed(session, ws); });
  ws.on('error', () => undefined);
}
