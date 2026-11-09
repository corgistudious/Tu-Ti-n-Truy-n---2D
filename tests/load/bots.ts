/**
 * Load test: N bot đăng ký, tạo nhân vật, vào game, đi lại + đánh + chat trên cùng bản đồ/kênh,
 * đo độ trễ RPC, số gói tin nhận, thời gian tick server (/metrics), RSS.
 * Dùng: npx tsx tests/load/bots.ts --base http://127.0.0.1:8080 --bots 200 --seconds 60
 */
import { Bot, sleep } from '../../server/test/bot.js';

const args = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const base = opt('base', 'http://127.0.0.1:8080');
const N = Number(opt('bots', '100'));
const SECONDS = Number(opt('seconds', '60'));

async function metrics(): Promise<Record<string, number>> {
  const t = await (await fetch(base + '/metrics')).text();
  const o: Record<string, number> = {};
  for (const l of t.split('\n')) { const m = /^(\w+) ([\d.e+]+)$/.exec(l); if (m) o[m[1]] = Number(m[2]); }
  return o;
}
function pct(a: number[], p: number): number { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; }

const bots: Bot[] = [];
const t0 = Date.now();
const tag = Math.random().toString(36).slice(2, 6);
for (let i = 0; i < N; i += 20) {
  await Promise.all(Array.from({ length: Math.min(20, N - i) }, async (_, k) => {
    const b = new Bot(base);
    const id = `${tag}${i + k}`;
    await b.register(`load${id}@test.vn`, 'matkhau123');
    await b.createCharacter(`Bot${id}`.slice(0, 14));
    await b.connect();
    bots.push(b);
  }));
}
console.log(`đã kết nối ${bots.length} bot trong ${((Date.now() - t0) / 1000).toFixed(1)}s`);
const lat: number[] = [];
let msgs0 = bots.reduce((a, b) => a + b.messages.length, 0);
let recv = 0;
for (const b of bots) b.listeners.push(() => { recv++; });
const ticks: number[] = [];
const end = Date.now() + SECONDS * 1000;
const loops = bots.map(async (b, idx) => {
  let dir = idx % 2 ? 1 : -1;
  while (Date.now() < end && !b.closed) {
    const target = Math.max(200, Math.min(2600, b.x + dir * (100 + Math.random() * 200)));
    await b.walkTo(target);
    dir = -dir;
    b.attack();
    if (Math.random() < 0.3) { const s = Date.now(); await b.rpc('inv.list').catch(() => undefined); lat.push(Date.now() - s); }
    if (Math.random() < 0.05) await b.rpc('chat.send', { ch: 'map', text: `xin chào ${Math.random().toString(36).slice(2, 6)}` }).catch(() => undefined);
    await sleep(200 + Math.random() * 400);
  }
});
const sampler = setInterval(async () => { try { const m = await metrics(); ticks.push(m.tt_tick_ms); } catch { /* */ } }, 2000);
await Promise.all(loops);
clearInterval(sampler);
const m = await metrics();
const corr = bots.reduce((a, b) => a + b.corrections, 0);
console.log(JSON.stringify({
  bots: bots.length, seconds: SECONDS,
  rpc_inv_list_ms: { p50: pct(lat, 0.5), p95: pct(lat, 0.95), p99: pct(lat, 0.99), n: lat.length },
  server_tick_ms_avg: { mean: +(ticks.reduce((a, b) => a + b, 0) / Math.max(1, ticks.length)).toFixed(2), max: Math.max(...ticks) },
  msgs_received_per_bot_per_sec: +(recv / bots.length / SECONDS).toFixed(1),
  movement_corrections_total: corr,
  server_online: m.tt_online, server_rss_mb: Math.round(m.process_resident_memory_bytes / 1048576),
}, null, 2));
for (const b of bots) b.close();
process.exit(0);
void msgs0;
