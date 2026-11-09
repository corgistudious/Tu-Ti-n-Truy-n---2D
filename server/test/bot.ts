/**
 * Bot client dùng cho kiểm thử tích hợp và load test.
 * Nói chuyện với server đúng như client Godot: HTTP để đăng nhập, WebSocket để chơi.
 */
import WebSocket from 'ws';
import { MAPS, PHYSICS, generateGrid, groundYAt, type TileGrid } from '@tt/shared';

export interface BotOpts { base: string; email: string; password: string; name: string }

export async function http<T = any>(base: string, path: string, body?: unknown, token?: string, method?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(base + path, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch { /* html */ }
  return { status: res.status, data };
}

export const DEFAULT_APPEARANCE = { gender: 'male', hair: 1, hairColor: '#1a1a1a', face: 0, eyes: 1, skin: '#f2c9a0', outfit: 0, outfitColor: '#3a6aaa' };

export class Bot {
  ws!: WebSocket;
  token = '';
  charId = 0;
  seq = 0;
  rpcId = 0;
  pending = new Map<number, { res: (v: any) => void; rej: (e: Error) => void }>();
  messages: any[] = [];
  listeners: ((m: any) => void)[] = [];
  map = '';
  grid: TileGrid | null = null;
  x = 0; y = 0;
  self: any = null;
  ents = new Map<string, any>();
  corrections = 0;
  closed = false;
  closeCode = 0;

  constructor(readonly base: string) {}

  async register(email: string, password: string): Promise<void> {
    const r = await http(this.base, '/api/auth/register', { email, password, device: 'bot' });
    if (r.status !== 200) throw new Error('register failed ' + JSON.stringify(r.data));
    this.token = r.data.token;
  }
  async login(email: string, password: string): Promise<void> {
    const r = await http(this.base, '/api/auth/login', { email, password, device: 'bot' });
    if (r.status !== 200) throw new Error('login failed ' + JSON.stringify(r.data));
    this.token = r.data.token;
  }
  async createCharacter(name: string, appearance = DEFAULT_APPEARANCE): Promise<number> {
    const r = await http(this.base, '/api/characters', { name, appearance }, this.token);
    if (r.status !== 200) throw new Error('create char failed ' + JSON.stringify(r.data));
    this.charId = r.data.id;
    return this.charId;
  }

  connect(charId = this.charId): Promise<void> {
    this.charId = charId;
    this.closed = false;
    const wsUrl = this.base.replace(/^http/, 'ws') + '/ws';
    this.ws = new WebSocket(wsUrl);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('connect timeout')), 8000);
      this.ws.on('open', () => this.ws.send(JSON.stringify({ t: 'auth', token: this.token, characterId: charId })));
      this.ws.on('message', (raw) => {
        const m = JSON.parse(raw.toString());
        this.onMessage(m);
        if (m.t === 'map') { clearTimeout(timer); resolve(); }
        if (m.t === 'authErr') { clearTimeout(timer); reject(new Error(m.e)); }
      });
      this.ws.on('close', (code) => { this.closed = true; this.closeCode = code; for (const p of this.pending.values()) p.rej(new Error('closed')); this.pending.clear(); });
      this.ws.on('error', () => undefined);
    });
  }
  private onMessage(m: any): void {
    this.messages.push(m);
    if (this.messages.length > 2000) this.messages.splice(0, 1000);
    switch (m.t) {
      case 'res': { const p = this.pending.get(m.id); if (p) { this.pending.delete(m.id); m.ok ? p.res(m.d) : p.rej(Object.assign(new Error(m.e), { code: m.code })); } break; }
      case 'map': this.map = m.map; this.grid = generateGrid(MAPS[m.map]); this.x = m.x; this.y = m.y; this.self = m.self; this.ents.clear(); break;
      case 'corr': this.x = m.x; this.y = m.y; this.corrections++; break;
      case 'snap': for (const e of m.e) this.ents.set(e.i, { ...(this.ents.get(e.i) ?? {}), ...e }); for (const g of m.gone) this.ents.delete(g); if (m.me) this.self = { ...this.self, ...m.me }; break;
      case 'ev': if (m.k === 'die') { const e = this.ents.get(m.i); if (e) e.dead = true; } if (m.k === 'spawn') { const e = this.ents.get(m.i); if (e) e.dead = false; } break;
    }
    for (const l of this.listeners) l(m);
  }
  send(m: object): void { if (this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); }
  rpc<T = any>(m: string, p: object = {}): Promise<T> {
    const id = ++this.rpcId;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.send({ t: 'rpc', id, m, p });
      setTimeout(() => { if (this.pending.delete(id)) rej(new Error('rpc timeout ' + m)); }, 10000);
    });
  }
  waitFor(pred: (m: any) => boolean, timeout = 5000): Promise<any> {
    const found = this.messages.find(pred);
    if (found) return Promise.resolve(found);
    return new Promise((resolve, reject) => {
      const l = (m: any) => { if (pred(m)) { this.listeners = this.listeners.filter((x) => x !== l); clearTimeout(t); resolve(m); } };
      const t = setTimeout(() => { this.listeners = this.listeners.filter((x) => x !== l); reject(new Error('waitFor timeout')); }, timeout);
      this.listeners.push(l);
    });
  }
  clearMessages(): void { this.messages = []; }

  /** Đi bộ hợp lệ tới x (gửi input theo tốc độ chạy thật, bám mặt đất) */
  async walkTo(tx: number, speedMult = 1): Promise<void> {
    const step = 1 / 15;
    let guard = 0;
    while (Math.abs(this.x - tx) > 6 && guard++ < 2000) {
      const dir = Math.sign(tx - this.x);
      const dx = Math.min(Math.abs(tx - this.x), PHYSICS.runSpeed * speedMult * step) * dir;
      const nx = this.x + dx;
      const ny = groundYAt(this.grid!, nx);
      // bậc cao hơn -> nhảy (gửi theo đường cong hợp lệ)
      if (ny < this.y - 2) { await this.jumpTo(nx, ny); continue; }
      this.x = nx; this.y = ny;
      this.send({ t: 'input', seq: ++this.seq, x: this.x, y: this.y, vx: dx / step, vy: 0, f: dir as 1 | -1, g: true, a: 'run' });
      await sleep(step * 1000);
    }
    this.send({ t: 'input', seq: ++this.seq, x: this.x, y: this.y, vx: 0, vy: 0, f: 1, g: true, a: 'idle' });
    await sleep(80);
  }
  private async jumpTo(nx: number, ny: number): Promise<void> {
    const step = 1 / 15;
    // đi lên theo vận tốc nhảy
    let vy = -PHYSICS.jumpVelocity; let y = this.y; const x0 = this.x;
    for (let i = 0; i < 12; i++) {
      vy += PHYSICS.gravity * step; y += vy * step;
      const x = x0 + (nx - x0) * ((i + 1) / 12);
      if (vy > 0 && y >= ny) { y = ny; this.x = x; this.y = y; this.send({ t: 'input', seq: ++this.seq, x, y, vx: 0, vy: 0, f: 1, g: true, a: 'idle' }); await sleep(step * 1000); break; }
      this.x = x; this.y = y;
      this.send({ t: 'input', seq: ++this.seq, x, y, vx: 0, vy, f: 1, g: false, a: vy < 0 ? 'jump' : 'fall' });
      await sleep(step * 1000);
    }
    this.x = nx; this.y = ny;
  }
  face(dir: 1 | -1): void { this.send({ t: 'input', seq: ++this.seq, x: this.x, y: this.y, vx: 0, vy: 0, f: dir, g: true, a: 'idle' }); }
  attack(): void { this.send({ t: 'atk', seq: ++this.seq }); }
  skill(id: string): void { this.send({ t: 'skill', seq: ++this.seq, s: id }); }
  close(): void { try { this.ws.close(); } catch { /* */ } }
}
export function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
