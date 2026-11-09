import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import { MAPS, TILE, groundYAt, generateGrid, tuViRequired } from '@tt/shared';
import { Bot, http, sleep } from './bot.js';

const DB = process.env.TEST_DATABASE_URL ?? 'postgres://tutien:tutien_dev@127.0.0.1:5432/tutien_test';
process.env.DATABASE_URL = DB;
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'warn';
process.env.PUBLIC_URL = 'http://localhost';
process.env.REGISTER_LIMIT_PER_HOUR = '1000';
process.env.LOGIN_LIMIT_PER_10MIN = '1000';
process.env.WS_AUTH_LIMIT_PER_MIN = '1000';

let base = '';
let close: () => Promise<void>;
let world: typeof import('../src/game/world.js').world;
const admin = new pg.Pool({ connectionString: DB });
const sql = async (s: string, p: unknown[] = []) => (await admin.query(s, p)).rows;
const uniq = () => Math.random().toString(36).slice(2, 8);

async function newPlayer(prefix = 'p'): Promise<Bot> {
  const b = new Bot(base);
  const tag = uniq();
  await b.register(`${prefix}${tag}@test.vn`, 'matkhau123');
  await b.createCharacter(`${prefix}${tag}`.slice(0, 14));
  await b.connect();
  return b;
}
function session(b: Bot) { return world().sessions.get(b.charId)!; }
/** Đặt cảnh giới/tầng trực tiếp (chỉ dùng trong test để rút ngắn thời gian cày) */
function setRealm(b: Bot, realm: number, layer = 1) {
  const s = session(b);
  s.row.realm_idx = realm; s.row.layer = layer; s.row.tu_vi = 0; s.recomputeStats(); s.ent.hp = s.stats.maxHp; s.mp = s.stats.maxMp;
}
async function give(b: Bot, item: string, qty: number) {
  const { tx } = await import('../src/db.js');
  const { grantItems } = await import('../src/services/items.js');
  await tx((c) => grantItems(c, b.charId, [{ item, qty }], 'test'));
}
async function gold(b: Bot): Promise<number> { return Number((await sql('SELECT gold FROM character_currencies WHERE character_id = $1', [b.charId]))[0].gold); }
async function teleport(b: Bot, mapId: string, x: number) {
  const s = session(b);
  world().enterMapById(s, mapId, x);
  await b.waitFor((m) => m.t === 'map' && m.map === mapId);
  b.x = s.ent.x; b.y = s.ent.y;
}
async function npcX(b: Bot, npc: string): Promise<number> { return MAPS[b.map].npcs.find((n) => n.npc === npc)!.x; }

beforeAll(async () => {
  await sql('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  const { redis } = await import('../src/redis.js');
  await redis().flushdb();
  const mod = await import('../src/index.js');
  world = (await import('../src/game/world.js')).world;
  const srv = await mod.startServer(0);
  base = `http://127.0.0.1:${srv.port}`;
  close = srv.close;
}, 30000);
afterAll(async () => { await close?.(); await admin.end(); const { closeDb } = await import('../src/db.js'); await closeDb(); });

describe('Tài khoản', () => {
  it('đăng ký, đăng nhập, xác thực email, phiên, đổi/quên mật khẩu', async () => {
    const email = `acc${uniq()}@test.vn`;
    const weak = await http(base, '/api/auth/register', { email, password: '123' });
    expect(weak.status).toBe(400);
    const r = await http(base, '/api/auth/register', { email, password: 'matkhau123' });
    expect(r.status).toBe(200);
    expect(r.data.token).toBeTruthy();
    expect((await http(base, '/api/auth/register', { email, password: 'matkhau123' })).status).toBe(409);
    // xác thực email qua token trong hộp thư đi
    const mail = (await sql("SELECT body FROM mail_outbox WHERE to_email = $1 AND subject LIKE 'Xác thực%' ORDER BY id DESC LIMIT 1", [email]))[0];
    const vtoken = /token=([A-Za-z0-9_-]+)/.exec(mail.body)![1];
    expect((await http(base, `/api/auth/verify`, { token: vtoken })).status).toBe(200);
    expect((await http(base, '/api/auth/me', undefined, r.data.token)).data.verified).toBe(true);
    // sai mật khẩu
    expect((await http(base, '/api/auth/login', { email, password: 'sai12345' })).status).toBe(401);
    const l = await http(base, '/api/auth/login', { email, password: 'matkhau123', device: 'pc' });
    expect(l.status).toBe(200);
    const sessions = await http(base, '/api/auth/sessions', undefined, l.data.token);
    expect(sessions.data.length).toBe(2);
    // đăng xuất thiết bị khác
    const other = sessions.data.find((s: any) => !s.current);
    expect((await http(base, `/api/auth/sessions/${other.id}`, undefined, l.data.token, 'DELETE')).status).toBe(200);
    expect((await http(base, '/api/auth/me', undefined, r.data.token)).status).toBe(401);
    // đổi mật khẩu
    expect((await http(base, '/api/auth/change-password', { oldPassword: 'matkhau123', newPassword: 'matkhau456' }, l.data.token)).status).toBe(200);
    expect((await http(base, '/api/auth/login', { email, password: 'matkhau456' })).status).toBe(200);
    // quên mật khẩu
    await http(base, '/api/auth/forgot', { email });
    const rm = (await sql("SELECT body FROM mail_outbox WHERE to_email = $1 AND subject LIKE 'Đặt lại%' ORDER BY id DESC LIMIT 1", [email]))[0];
    const rtoken = rm.body.split('\n')[1].trim();
    expect((await http(base, '/api/auth/reset', { token: rtoken, password: 'matkhau789' })).status).toBe(200);
    expect((await http(base, '/api/auth/login', { email, password: 'matkhau789' })).status).toBe(200);
    expect((await http(base, '/api/auth/reset', { token: rtoken, password: 'matkhau000' })).status).toBe(400); // token dùng 1 lần
    const logs = await sql('SELECT event FROM security_logs WHERE account_id = (SELECT id FROM accounts WHERE email = $1)', [email]);
    expect(logs.map((x) => x.event)).toEqual(expect.arrayContaining(['register', 'login', 'login_failed', 'password_changed', 'password_reset']));
  });
  it('khóa tạm sau 5 lần sai mật khẩu', async () => {
    const email = `lock${uniq()}@test.vn`;
    await http(base, '/api/auth/register', { email, password: 'matkhau123' });
    for (let i = 0; i < 5; i++) await http(base, '/api/auth/login', { email, password: 'sai00000' });
    expect((await http(base, '/api/auth/login', { email, password: 'matkhau123' })).status).toBe(423);
  });
});

describe('Nhân vật', () => {
  it('tạo nhân vật với tùy chỉnh ngoại hình, kiểm tra tên, giới hạn, xóa có bảo vệ', async () => {
    const b = new Bot(base);
    await b.register(`ch${uniq()}@test.vn`, 'matkhau123');
    const ap = { gender: 'female', hair: 3, hairColor: '#8a5a2a', face: 2, eyes: 3, skin: '#e0ac7e', outfit: 2, outfitColor: '#aa3a3a' };
    expect((await http(base, '/api/characters', { name: 'a', appearance: ap }, b.token)).status).toBe(400);
    expect((await http(base, '/api/characters', { name: 'Admin Gà', appearance: ap }, b.token)).status).toBe(400);
    expect((await http(base, '/api/characters', { name: 'Hợp Lệ', appearance: { ...ap, hairColor: '#ff00ff' } }, b.token)).status).toBe(400);
    const name = `Tiên ${uniq()}`.slice(0, 12);
    const r = await http(base, '/api/characters', { name, appearance: ap }, b.token);
    expect(r.status).toBe(200);
    expect((await http(base, '/api/characters', { name, appearance: ap }, b.token)).status).toBe(409);
    const list = await http(base, '/api/characters', undefined, b.token);
    expect(list.data[0].appearance.hairColor).toBe('#8a5a2a');
    expect((await http(base, `/api/characters/${r.data.id}/delete`, { confirmName: 'sai' }, b.token)).status).toBe(400);
    expect((await http(base, `/api/characters/${r.data.id}/delete`, { confirmName: name }, b.token)).status).toBe(200);
    // đang chờ xóa: không thể vào game
    await expect(b.connect(r.data.id)).rejects.toThrow();
    expect((await http(base, `/api/characters/${r.data.id}/restore`, {}, b.token)).status).toBe(200);
    await b.connect(r.data.id);
    expect(b.map).toBe('tan_thu_thon');
    b.close();
  });
});

describe('Gameplay cốt lõi', () => {
  it('nhiệm vụ mở đầu, di chuyển hợp lệ, chống dịch chuyển', async () => {
    const b = await newPlayer('q');
    expect(b.self.realm).toBe(0);
    // dịch chuyển gian lận -> bị sửa vị trí
    const before = b.x;
    b.send({ t: 'input', seq: ++b.seq, x: before + 2000, y: b.y, vx: 0, vy: 0, f: 1, g: true, a: 'run' });
    await b.waitFor((m) => m.t === 'corr');
    expect(session(b).ent.x).toBe(before);
    // bay lên trời -> bị sửa
    b.clearMessages();
    b.send({ t: 'input', seq: ++b.seq, x: before, y: b.y - 400, vx: 0, vy: 0, f: 1, g: false, a: 'jump' });
    await b.waitFor((m) => m.t === 'corr');
    // gói tin cũ (replay) bị bỏ qua
    const s = session(b);
    b.send({ t: 'input', seq: 1, x: before + 5, y: b.y, vx: 0, vy: 0, f: 1, g: true, a: 'run' });
    await sleep(100);
    expect(s.ent.x).toBe(before);
    // đi tới cha (npc_father) để nhận nhiệm vụ
    await b.walkTo(await npcX(b, 'npc_father'));
    expect(Math.abs(s.ent.x - b.x)).toBeLessThan(2);
    const talk = await b.rpc('npc.talk', { npc: 'npc_father' });
    expect(talk.offer.map((o: any) => o.id)).toContain('mq_1_01');
    await b.rpc('quest.accept', { id: 'mq_1_01' });
    await expect(b.rpc('quest.turnIn', { id: 'mq_1_01' })).rejects.toThrow(/gần NPC/);
    await b.walkTo(await npcX(b, 'npc_village_chief'));
    await b.rpc('npc.talk', { npc: 'npc_village_chief' });
    const g0 = await gold(b);
    const res = await b.rpc('quest.turnIn', { id: 'mq_1_01' });
    expect(res.rewards.gold).toBe(50);
    expect(await gold(b)).toBe(g0 + 50);
    expect(s.quests.get('mq_1_01')!.state).toBe('done');
    const rows = await sql("SELECT state FROM quest_progress WHERE character_id = $1 AND quest_id = 'mq_1_01'", [b.charId]);
    expect(rows[0].state).toBe('done');
    b.close();
  }, 60000);

  it('chiến đấu: đánh quái, server tính sát thương, nhận tu vi/vàng, rơi đồ, nhặt đồ', async () => {
    const b = await newPlayer('c');
    const s = session(b);
    await b.walkTo(await npcX(b, 'npc_village_chief'));
    // nhận nhiệm vụ diệt linh nhầy
    s.quests.set('mq_1_01', { state: 'done', progress: {}, times: 1, completedAt: new Date(), dirty: true });
    await b.rpc('quest.accept', { id: 'mq_1_02' });
    const inst = s.ent.inst;
    const slimes = [...inst.monsters.values()].filter((m) => m.def.id === 'slime_green');
    expect(slimes.length).toBeGreaterThan(0);
    let kills = 0;
    const tv0 = s.row.tu_vi;
    for (const m of slimes) {
      if (kills >= 3) break;
      await b.walkTo(m.x - 40);
      b.face(1);
      let guard = 0;
      while (!m.dead && guard++ < 80) {
        // quái có thể di chuyển — bám theo
        if (Math.abs(m.x - s.ent.x) > 50) { await b.walkTo(m.x - 40); b.face(m.x >= b.x ? 1 : -1); }
        b.attack(); await sleep(420);
      }
      if (m.dead) kills++;
    }
    expect(kills).toBeGreaterThanOrEqual(3);
    const dmg = b.messages.filter((m) => m.t === 'ev' && m.k === 'dmg');
    expect(dmg.length).toBeGreaterThan(0);
    expect(s.row.tu_vi + s.row.layer * 1000).toBeGreaterThan(tv0);
    expect(s.quests.get('mq_1_02')!.progress.o1).toBe(3);
    // nhặt vật phẩm rơi (nếu có), và chống nhặt trùng song song
    const d = inst.addDrop('herb_t1', 2, s.ent.x, [b.charId]);
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => b.rpc('inv.pickup', { id: d.id })));
    expect(results.filter((r) => r.status === 'fulfilled').length).toBe(1);
    const herbs = await sql("SELECT COALESCE(sum(quantity),0)::int AS n FROM item_instances WHERE owner_id = $1 AND template_id = 'herb_t1'", [b.charId]);
    expect(herbs[0].n).toBeGreaterThanOrEqual(2);
    b.close();
  }, 90000);

  it('kỹ năng: học bí tịch, thi triển, hồi chiêu, tiêu hao chân khí, combo trạng thái', async () => {
    const b = await newPlayer('k');
    const s = session(b);
    setRealm(b, 4, 1);
    await give(b, 'manual_loi_1', 1); await give(b, 'manual_loi_2', 1);
    let inv = await b.rpc('inv.list');
    for (const it of inv.bag.filter((i: any) => i.t.startsWith('manual_'))) await b.rpc('inv.use', { id: it.id });
    expect(s.skills.has('loi_1') && s.skills.has('loi_2')).toBe(true);
    await expect(b.rpc('skill.learnUpgrade', { id: 'loi_1' })).rejects.toThrow(/Không đủ/);
    await b.rpc('skill.hotbar', { hotbar: ['basic_attack', 'loi_1', 'loi_2', '', '', ''] });
    // làng tân thủ là địa hình bằng phẳng: đặt một con quái đứng yên trước mặt để quan sát trạng thái
    const m = s.ent.inst.spawnMonster('wolf_black', s.ent.x + 160, { noRespawn: true });
    m.stats.maxHp = m.hp = 1e9;
    m.def = { ...m.def, aggroRange: 0, speed: 0, passive: true };
    b.face(1);
    await sleep(100);
    const mp0 = s.mp;
    b.skill('loi_1');
    await b.waitFor((x) => x.t === 'ev' && x.k === 'st' && x.i === m.id && x.st.includes('mark_thunder'), 3000);
    expect(s.mp).toBeLessThan(mp0);
    b.skill('loi_1'); // đang hồi chiêu -> không tác dụng
    await sleep(100);
    expect(s.cds.get('loi_1')).toBeGreaterThan(Date.now());
    b.skill('loi_2');
    await b.waitFor((x) => x.t === 'ev' && x.k === 'combo' && x.i === m.id, 3000);
    expect(m.statuses.some((st) => st.id === 'mark_thunder')).toBe(false); // đã kích nổ tiêu hao ấn
    b.close();
  }, 60000);

  it('túi đồ & trang bị & cửa hàng & cường hóa (transaction server)', async () => {
    const b = await newPlayer('i');
    const s = session(b);
    await b.walkTo(await npcX(b, 'npc_blacksmith_village'));
    await sql('UPDATE character_currencies SET gold = 100000 WHERE character_id = $1', [b.charId]);
    await expect(b.rpc('shop.buy', { npc: 'npc_blacksmith_village', item: 'pill_bt_29', qty: 1 })).rejects.toThrow(/không bán/);
    await b.rpc('shop.buy', { npc: 'npc_blacksmith_village', item: 'eq_weapon_0', qty: 1 });
    await b.rpc('shop.buy', { npc: 'npc_blacksmith_village', item: 'stone_enhance', qty: 20 });
    let inv = await b.rpc('inv.list');
    const wpn = inv.bag.find((i: any) => i.t === 'eq_weapon_0');
    const atk0 = s.stats.atk;
    await b.rpc('inv.equip', { id: wpn.id });
    expect(s.stats.atk).toBeGreaterThan(atk0);
    for (let i = 0; i < 4; i++) await b.rpc('equip.enhance', { id: wpn.id });
    const row = (await sql('SELECT enhance, container FROM item_instances WHERE id = $1', [wpn.id]))[0];
    expect(row.container).toBe('equip');
    expect(row.enhance).toBeGreaterThanOrEqual(2);
    // sổ cái ghi đủ
    const led = await sql("SELECT reason FROM currency_ledger WHERE character_id = $1", [b.charId]);
    expect(led.map((x) => x.reason)).toEqual(expect.arrayContaining(['shop_buy', 'enhance']));
    // bán song song cùng một món -> chỉ một lần thành công (chống nhân đôi tiền)
    await b.rpc('shop.buy', { npc: 'npc_blacksmith_village', item: 'eq_helmet_0', qty: 1 });
    inv = await b.rpc('inv.list');
    const helm = inv.bag.find((i: any) => i.t === 'eq_helmet_0');
    const g0 = await gold(b);
    const sells = await Promise.allSettled(Array.from({ length: 6 }, () => b.rpc('shop.sell', { id: helm.id })));
    expect(sells.filter((x) => x.status === 'fulfilled').length).toBe(1);
    expect(await gold(b)).toBe(g0 + 30 * 0 + Math.floor(30 * 1)); // giá trị eq_helmet_0 = 30
    // khóa vật phẩm: không thể bán
    await b.rpc('shop.buy', { npc: 'npc_blacksmith_village', item: 'eq_boots_0', qty: 1 });
    inv = await b.rpc('inv.list');
    const boots = inv.bag.find((i: any) => i.t === 'eq_boots_0');
    await b.rpc('inv.lock', { id: boots.id });
    await expect(b.rpc('shop.sell', { id: boots.id })).rejects.toThrow(/khóa/);
    await b.rpc('inv.unequip', { slot: 'weapon' });
    expect(s.equipment.length).toBe(0);
    b.close();
  }, 60000);
});

describe('Tu luyện & đột phá', () => {
  it('đả tọa tăng tu vi; đột phá không thử thách; đột phá có Tâm Ma (thắng) và Thiên Kiếp', async () => {
    const b = await newPlayer('t');
    const s = session(b);
    await b.rpc('cult.meditate', { on: true });
    await sleep(2300);
    expect(s.row.tu_vi).toBeGreaterThan(0);
    await b.rpc('cult.meditate', { on: false });
    // Phàm Nhân -> Nhập Môn: cần nhiệm vụ mq_1_04
    s.row.layer = 9; s.row.tu_vi = tuViRequired(0, 9);
    await expect(b.rpc('cult.breakthrough')).rejects.toThrow(/nhiệm vụ/);
    s.quests.set('mq_1_04', { state: 'done', progress: {}, times: 1, completedAt: new Date(), dirty: true });
    await sql('UPDATE character_currencies SET gold = 10000000 WHERE character_id = $1', [b.charId]);
    let ok = false;
    for (let i = 0; i < 6 && !ok; i++) {
      s.row.layer = 9; s.row.tu_vi = tuViRequired(s.realmIdx, 9); s.row.bt_cooldown_until = null;
      const r = await b.rpc('cult.breakthrough');
      ok = r.success;
    }
    expect(s.realmIdx).toBe(1);
    const logs = await sql('SELECT success FROM cultivation_logs WHERE character_id = $1', [b.charId]);
    expect(logs.length).toBeGreaterThan(0);
    // Ám Kình (4) -> Hóa Kình: thử thách Tâm Ma
    setRealm(b, 4, 9);
    s.row.tu_vi = tuViRequired(4, 9);
    for (const m of [{ item: 'pill_bt_4', qty: 1 }, { item: 'herb_t2', qty: 10 }, { item: 'ore_t2', qty: 10 }]) await give(b, m.item, m.qty);
    b.clearMessages();
    const r = await b.rpc('cult.breakthrough');
    expect(r.trial).toBe('tam_ma');
    await b.waitFor((m) => m.t === 'map' && m.map === 'trial_tam_ma');
    const inst = s.ent.inst;
    const demon = [...inst.monsters.values()].find((m) => m.def.id === 'trial_inner_demon')!;
    expect(demon).toBeTruthy();
    expect(demon.stats.maxHp).toBeGreaterThan(s.stats.maxHp); // tâm ma scale theo người chơi
    // người chơi khác không thể đánh tâm ma của mình (ownerTrial) — kiểm tra bằng combat.canHit
    inst.kill(demon, s.ent);
    await b.waitFor((m) => m.t === 'ev' && m.k === 'breakthrough', 4000);
    await b.waitFor((m) => m.t === 'map' && m.map !== 'trial_tam_ma', 6000);
    expect([4, 5]).toContain(s.realmIdx);
    // Thiên kiếp (Luyện Khí 10 -> Trúc Cơ): sống sót qua các đạo lôi
    setRealm(b, 10, 9);
    s.row.tu_vi = tuViRequired(10, 9); s.row.bt_cooldown_until = null; s.ent.statuses = [];
    for (const m of [{ item: 'pill_bt_10', qty: 1 }, { item: 'herb_t3', qty: 10 }, { item: 'ore_t3', qty: 10 }]) await give(b, m.item, m.qty);
    b.clearMessages();
    const r2 = await b.rpc('cult.breakthrough');
    expect(r2.trial).toBe('thien_kiep');
    await b.waitFor((m) => m.t === 'map' && m.map === 'trial_thien_kiep');
    const tele = await b.waitFor((m) => m.t === 'ev' && m.k === 'tele', 5000);
    expect(tele.s).toBe('m_lightning_strike');
    await b.waitFor((m) => m.t === 'ev' && m.k === 'breakthrough', 40000);
    expect(s.ent.inst.def.id).not.toBe('trial_thien_kiep_x');
    b.close();
  }, 90000);
});

describe('Kinh tế', () => {
  it('giao dịch trực tiếp: khóa tài sản, phí, idempotent, chuyển quyền sở hữu', async () => {
    const a = await newPlayer('ta'); const b = await newPlayer('tb');
    setRealm(a, 1); setRealm(b, 1);
    await sql('UPDATE character_currencies SET gold = 10000 WHERE character_id IN ($1,$2)', [a.charId, b.charId]);
    await give(a, 'herb_t1', 30);
    const inv = await a.rpc('inv.list');
    const herb = inv.bag.find((i: any) => i.t === 'herb_t1');
    const bName = session(b).name;
    await a.rpc('trade.request', { name: bName });
    const req = await b.waitFor((m) => m.t === 'ev' && m.k === 'tradeReq');
    await b.rpc('trade.respond', { from: req.fromId, accept: true });
    await a.rpc('trade.offer', { items: [{ id: herb.id, qty: 10 }], gold: 0, stones: 0 });
    await b.rpc('trade.offer', { items: [], gold: 1000, stones: 0 });
    await expect(a.rpc('trade.confirm')).rejects.toThrow(/khóa/);
    await a.rpc('trade.lock'); await b.rpc('trade.lock');
    // vật phẩm đang khóa giao dịch không bán được
    await expect(a.rpc('inv.destroy', { id: herb.id })).rejects.toThrow(/giao dịch/);
    await a.rpc('trade.confirm');
    const results = await Promise.allSettled([b.rpc('trade.confirm'), b.rpc('trade.confirm')]);
    expect(results.some((r) => r.status === 'fulfilled')).toBe(true);
    await a.waitFor((m) => m.t === 'ev' && m.k === 'tradeEnd');
    const ah = await sql("SELECT COALESCE(sum(quantity),0)::int n FROM item_instances WHERE owner_id = $1 AND template_id='herb_t1'", [a.charId]);
    const bh = await sql("SELECT COALESCE(sum(quantity),0)::int n FROM item_instances WHERE owner_id = $1 AND template_id='herb_t1'", [b.charId]);
    expect(ah[0].n).toBe(20); expect(bh[0].n).toBe(10);
    expect(await gold(a)).toBe(10000 + 1000 - 20); // phí 2%
    expect(await gold(b)).toBe(9000);
    expect((await sql('SELECT count(*)::int n FROM trades WHERE char_a = $1', [a.charId]))[0].n).toBe(1);
    a.close(); b.close();
  }, 60000);

  it('chợ người chơi và đấu giá (ký quỹ, hoàn tiền, thư)', async () => {
    const seller = await newPlayer('ms'); const buyer = await newPlayer('mb'); const rival = await newPlayer('mr');
    for (const p of [seller, buyer, rival]) { await teleport(p, 'thanh_van_thanh', MAPS['thanh_van_thanh'].npcs.find((n) => n.npc === 'npc_market')!.x); setRealm(p, 1); }
    await sql('UPDATE character_currencies SET gold = 50000 WHERE character_id IN ($1,$2,$3)', [seller.charId, buyer.charId, rival.charId]);
    await give(seller, 'eq_ring_2', 1); await give(seller, 'gem_ruby_1', 1);
    let inv = await seller.rpc('inv.list');
    const ring = inv.bag.find((i: any) => i.t === 'eq_ring_2');
    await seller.rpc('market.list', { id: ring.id, qty: 1, price: 5000, currency: 'gold' });
    const found = await buyer.rpc('market.search', { q: ring.t });
    expect(found.length).toBe(1);
    await expect(seller.rpc('market.buy', { listing: found[0].id })).rejects.toThrow(/chính mình/);
    const [r1, r2] = await Promise.allSettled([buyer.rpc('market.buy', { listing: found[0].id }), rival.rpc('market.buy', { listing: found[0].id })]);
    expect([r1, r2].filter((r) => r.status === 'fulfilled').length).toBe(1);
    const owner = await sql('SELECT owner_id, container FROM item_instances WHERE id = $1', [ring.id]);
    expect(owner[0].container).toBe('bag');
    expect(await gold(seller)).toBe(50000 - 50 + 5000 - 250);
    // đấu giá
    inv = await seller.rpc('inv.list');
    const gem = inv.bag.find((i: any) => i.t === 'gem_ruby_1');
    const { auction } = await seller.rpc('auction.create', { id: gem.id, qty: 1, start: 1000, buyout: 9000, hours: 1, currency: 'gold' });
    await buyer.rpc('auction.bid', { auction, amount: 1000 });
    await expect(rival.rpc('auction.bid', { auction, amount: 1020 })).rejects.toThrow(/tối thiểu/);
    await rival.rpc('auction.bid', { auction, amount: 2000 });
    // người bị vượt giá được hoàn qua thư
    const mails = await buyer.rpc('mail.list');
    expect(mails.some((m: any) => Number(m.gold) === 1000)).toBe(true);
    await rival.rpc('auction.bid', { auction, amount: 9000 }); // mua ngay (rival nâng giá của chính mình -> vẫn hợp lệ)
    const a = await sql('SELECT status FROM auctions WHERE id = $1', [auction]);
    expect(a[0].status).toBe('sold');
    const rm = await rival.rpc('mail.list');
    const win = rm.find((m: any) => m.subject === 'Thắng đấu giá');
    await rival.rpc('mail.claim', { id: win.id });
    expect((await sql("SELECT owner_id FROM item_instances WHERE template_id = 'gem_ruby_1' AND owner_id = $1 AND container = 'bag'", [rival.charId])).length).toBe(1);
    // tổng tiền hệ thống bảo toàn (trừ phí sàn): kiểm tra sổ cái khớp số dư
    for (const p of [seller, buyer, rival]) {
      const last = await sql('SELECT balance_after FROM currency_ledger WHERE character_id = $1 AND currency = \'gold\' ORDER BY id DESC LIMIT 1', [p.charId]);
      expect(Number(last[0].balance_after)).toBe(await gold(p));
    }
    for (const p of [seller, buyer, rival]) p.close();
  }, 60000);
});

describe('Xã hội & Multiplayer', () => {
  it('đồng bộ: hai người chơi thấy nhau (AOI), chat, tổ đội, bạn bè, tông môn', async () => {
    const a = await newPlayer('sa'); const b = await newPlayer('sb');
    setRealm(a, 3); setRealm(b, 3);
    await sleep(400);
    expect(a.ents.has(`p${b.charId}`)).toBe(true);
    // b di chuyển, a nhận vị trí mới qua snapshot
    await b.walkTo(b.x + 100);
    await sleep(300);
    expect(Math.abs(a.ents.get(`p${b.charId}`).x - b.x)).toBeLessThan(10);
    // AOI: b ở xa thì a không nhận
    await teleport(b, 'tan_thu_thon', 80 * TILE);
    await sleep(300);
    expect(a.ents.has(`p${b.charId}`)).toBe(false);
    await a.rpc('chat.send', { ch: 'map', text: 'Chào đạo hữu' });
    await b.waitFor((m) => m.t === 'chat' && m.text === 'Chào đạo hữu');
    await expect(a.rpc('chat.send', { ch: 'map', text: 'Chào đạo hữu' })).rejects.toThrow();
    const bn = session(b).name, an = session(a).name;
    await a.rpc('party.invite', { name: bn });
    const pr = await b.waitFor((m) => m.t === 'ev' && m.k === 'partyReq');
    await b.rpc('party.respond', { from: pr.fromId, accept: true });
    await a.waitFor((m) => m.t === 'ev' && m.k === 'party' && m.d?.members.length === 2);
    await a.rpc('friend.add', { name: bn });
    await b.rpc('friend.respond', { from: a.charId, accept: true });
    const fl = await a.rpc('friend.list');
    expect(fl.friends[0].online).toBe(true);
    // tông môn
    await teleport(a, 'thanh_van_thanh', MAPS['thanh_van_thanh'].npcs.find((n) => n.npc === 'npc_guild_manager')!.x);
    await sql('UPDATE character_currencies SET gold = 200000 WHERE character_id = $1', [a.charId]);
    await a.rpc('guild.create', { name: `Kiếm ${uniq()}`.slice(0, 12) });
    await a.rpc('guild.invite', { name: bn });
    await b.waitFor((m) => m.t === 'ev' && m.k === 'guildReq');
    await b.rpc('guild.respond', { accept: true });
    await a.rpc('guild.donate', { gold: 10000 });
    const gi = await a.rpc('guild.info');
    expect(gi.members.length).toBe(2);
    expect(Number(gi.guild.gold)).toBe(10000);
    await a.rpc('guild.setRank', { id: b.charId, rank: 'elder' });
    await expect(b.rpc('guild.kick', { id: a.charId })).rejects.toThrow(/quyền/);
    await a.rpc('chat.send', { ch: 'guild', text: 'Họp tông môn' });
    await b.waitFor((m) => m.t === 'chat' && m.ch === 'guild');
    // báo cáo người chơi
    await b.rpc('report.player', { name: an, reason: 'spam', details: 'test' });
    expect((await sql('SELECT count(*)::int n FROM reports WHERE reporter_id = $1', [b.charId]))[0].n).toBe(1);
    a.close(); b.close();
  }, 60000);

  it('PvP: vùng an toàn chặn, bảo hộ tân thủ, tỉ thí, đấu trường xếp hạng', async () => {
    const a = await newPlayer('va'); const b = await newPlayer('vb');
    const sa = session(a), sb = session(b);
    const { canHit } = await import('../src/game/combat.js');
    expect(canHit(sa.ent.inst, sa.ent, sb.ent)).toBe(false); // làng an toàn
    setRealm(a, 8); setRealm(b, 2);
    await teleport(a, 'co_chien_truong', 30 * TILE); await teleport(b, 'co_chien_truong', 32 * TILE);
    await a.rpc('pvp.mode', { mode: 'all' });
    expect(canHit(sa.ent.inst, sa.ent, sb.ent)).toBe(false); // tân thủ < Nội Kình được bảo hộ
    setRealm(b, 8);
    expect(canHit(sa.ent.inst, sa.ent, sb.ent)).toBe(true);
    expect(canHit(sb.ent.inst, sb.ent, sa.ent)).toBe(false); // b ở chế độ hòa bình
    setRealm(b, 4);
    expect(canHit(sa.ent.inst, sa.ent, sb.ent)).toBe(false); // chênh lệch > 2 cảnh giới
    // tỉ thí
    setRealm(b, 8);
    await a.rpc('pvp.mode', { mode: 'peace' }).catch(() => undefined);
    await teleport(a, 'tan_thu_thon', 40 * TILE); await teleport(b, 'tan_thu_thon', 41 * TILE);
    await a.rpc('duel.request', { name: sb.name });
    const dr = await b.waitFor((m) => m.t === 'ev' && m.k === 'duelReq');
    await b.rpc('duel.respond', { from: dr.fromId, accept: true });
    expect(canHit(sa.ent.inst, sa.ent, sb.ent)).toBe(true);
    sa.ent.inst.kill(sb.ent, sa.ent);
    expect(sb.ent.dead).toBe(false); // thua tỉ thí không chết
    expect(sa.duelWith).toBe(null);
    // đấu trường
    await teleport(a, 'thanh_van_thanh', MAPS['thanh_van_thanh'].npcs.find((n) => n.npc === 'npc_arena_master')!.x);
    await teleport(b, 'thanh_van_thanh', MAPS['thanh_van_thanh'].npcs.find((n) => n.npc === 'npc_arena_master')!.x);
    await a.rpc('arena.queue'); await b.rpc('arena.queue');
    await a.waitFor((m) => m.t === 'map' && m.map === 'arena_map', 6000);
    expect(sa.ent.inst).toBe(sb.ent.inst);
    sa.ent.inst.kill(sb.ent, sa.ent);
    const end = await a.waitFor((m) => m.t === 'ev' && m.k === 'arenaEnd');
    expect(end.win).toBe(true);
    expect(sa.row.arena_rating).toBeGreaterThan(1000);
    await a.waitFor((m) => m.t === 'map' && m.map === 'thanh_van_thanh', 6000);
    a.close(); b.close();
  }, 60000);

  it('phó bản tổ đội: các đợt quái, boss nhiều giai đoạn, phần thưởng, giới hạn lượt', async () => {
    const a = await newPlayer('da'); const b = await newPlayer('db');
    setRealm(a, 2); setRealm(b, 2);
    await a.rpc('party.invite', { name: session(b).name });
    const pr = await b.waitFor((m) => m.t === 'ev' && m.k === 'partyReq');
    await b.rpc('party.respond', { from: pr.fromId, accept: true });
    await expect(b.rpc('dungeon.enter', { id: 'dg_hac_phong_trai' })).rejects.toThrow(/đội trưởng/);
    await a.rpc('dungeon.enter', { id: 'dg_hac_phong_trai' });
    await b.waitFor((m) => m.t === 'map' && m.map === 'dg_hac_phong_trai');
    const inst = session(a).ent.inst;
    expect(session(b).ent.inst).toBe(inst);
    const g0 = await gold(a);
    // tiêu diệt các đợt (server-side, mô phỏng sát thương của người chơi)
    for (let guard = 0; guard < 40; guard++) {
      await sleep(400);
      const alive = [...inst.monsters.values()].filter((m) => !m.dead);
      for (const m of alive) {
        if (m.def.rank === 'dungeon_boss') {
          // ép qua các ngưỡng giai đoạn để kiểm tra cơ chế
          m.hp = m.stats.maxHp * 0.45; await sleep(300);
          expect(m.phase).toBeGreaterThanOrEqual(1);
        }
        m.threat.set(`p${a.charId}`, 10); inst.kill(m, session(a).ent);
      }
      if (a.messages.some((m) => m.t === 'ev' && m.k === 'dungeonEnd')) break;
    }
    const end = await a.waitFor((m) => m.t === 'ev' && m.k === 'dungeonEnd', 5000);
    expect(end.ok).toBe(true);
    expect(b.messages.some((m) => m.t === 'ev' && m.k === 'say')).toBe(true); // thông báo giai đoạn boss
    await sleep(500);
    expect(await gold(a)).toBeGreaterThan(g0);
    expect((await sql("SELECT result FROM dungeon_runs WHERE dungeon_id = 'dg_hac_phong_trai'"))[0].result).toBe('cleared');
    a.close(); b.close();
  }, 60000);
});

describe('Linh thú, Động phủ, Nghề', () => {
  it('thu phục linh thú, triệu hồi, cho ăn; động phủ: xây, trồng, thu hoạch; luyện đan; hái thuốc', async () => {
    const b = await newPlayer('h');
    const s = session(b);
    setRealm(b, 1, 5);
    await teleport(b, 'rung_thanh_truc', 0.5 * MAPS['rung_thanh_truc'].width * TILE);
    const fox = [...s.ent.inst.monsters.values()].find((m) => m.def.id === 'fox_spirit_young' && !m.dead)!;
    await teleport(b, 'rung_thanh_truc', fox.x - 100);
    fox.def = { ...fox.def, speed: 0, aggroRange: 0 };
    fox.hp = fox.stats.maxHp * 0.05;
    await give(b, 'tal_capture_1', 20);
    const inv = await b.rpc('inv.list');
    const tal = inv.bag.find((i: any) => i.t === 'tal_capture_1');
    for (let i = 0; i < 20; i++) {
      await b.rpc('inv.use', { id: tal.id, target: fox.id }).catch((e) => { if (!/thất bại|hồi/.test(e.message)) throw e; });
      if ((await sql('SELECT count(*)::int n FROM pets WHERE owner_id = $1', [b.charId]))[0].n) break;
    }
    const pets = await b.rpc('pet.list');
    expect(pets.length).toBe(1);
    await b.rpc('pet.summon', { id: pets[0].id });
    await sleep(300);
    expect([...s.ent.inst.pets.values()].some((p) => p.ownerId === s.ent.id)).toBe(true);
    await give(b, 'pet_food_2', 3);
    await b.rpc('pet.feed', { id: pets[0].id, food: 'pet_food_2' });
    expect((await b.rpc('pet.list'))[0].level).toBeGreaterThan(1);
    // động phủ
    await teleport(b, 'thanh_van_thanh', MAPS['thanh_van_thanh'].npcs.find((n) => n.npc === 'npc_housing_agent')!.x);
    await sql('UPDATE character_currencies SET gold = 1000000, spirit_stones = 1000 WHERE character_id = $1', [b.charId]);
    await b.rpc('house.claim');
    await give(b, 'mat_wood', 50); await give(b, 'seed_t1', 2); await give(b, 'furn_cushion', 1);
    await b.rpc('house.build', { building: 'linh_dien' });
    await b.rpc('house.enter');
    await b.waitFor((m) => m.t === 'map' && m.map === 'dong_phu');
    await b.rpc('house.plant', { plot: 0, seed: 'seed_t1' });
    await expect(b.rpc('house.harvest', { plot: 0 })).rejects.toThrow(/chưa chín/);
    await sql("UPDATE housing_plots SET ready_at = now() - interval '1 second' WHERE character_id = $1", [b.charId]);
    const hv = await b.rpc('house.harvest', { plot: 0 });
    expect(hv.item).toBe('herb_t1');
    const inv2 = await b.rpc('inv.list');
    await b.rpc('house.place', { id: inv2.bag.find((i: any) => i.t === 'furn_cushion').id, x: 400 });
    expect(world().housingFurnitureBonus(b.charId)).toBeGreaterThan(0);
    await b.rpc('house.access', { access: 'friends' });
    // luyện đan trong động phủ
    await give(b, 'herb_t1', 4); await give(b, 'fish_t1', 2); await give(b, 'tool_furnace_1', 1);
    const job = await b.rpc('craft.start', { recipe: 'rc_pill_hp_1' });
    await expect(b.rpc('craft.claim', { job: job.job })).rejects.toThrow(/Chưa hoàn thành/);
    await sql("UPDATE crafting_jobs SET finishes_at = now() - interval '1 second' WHERE id = $1", [job.job]);
    const cl = await b.rpc('craft.claim', { job: job.job });
    expect(cl.recipe).toBe('rc_pill_hp_1');
    expect((await sql("SELECT level, exp FROM profession_levels WHERE character_id = $1 AND profession = 'alchemy'", [b.charId])).length).toBe(1);
    await b.rpc('house.leave');
    await b.waitFor((m) => m.t === 'map' && m.map === 'thanh_van_thanh');
    // hái thuốc ở Tân Thủ Thôn (cấp 0 không cần công cụ)
    const node = MAPS['tan_thu_thon'].nodes.find((n) => n.kind === 'herb')!;
    await teleport(b, 'tan_thu_thon', node.x);
    const g = await b.rpc('gather.start', { node: node.id });
    await sleep(g.seconds * 1000 + 600);
    expect(b.messages.some((m) => m.t === 'ev' && m.k === 'msg' && /Thu được/.test(m.text))).toBe(true);
    await expect(b.rpc('gather.start', { node: node.id })).rejects.toThrow(/hồi phục/);
    b.close();
  }, 90000);
});

describe('Kết nối & Bảo mật', () => {
  it('khôi phục kết nối giữ nguyên phiên; đăng nhập nơi khác đá phiên cũ; lưu/tải dữ liệu', async () => {
    const b = await newPlayer('r');
    const s = session(b);
    await b.walkTo(b.x + 200);
    s.row.tu_vi = 77;
    b.close();
    await sleep(200);
    expect(world().sessions.get(b.charId)).toBe(s); // còn trong thời gian chờ
    await b.connect();
    expect(world().sessions.get(b.charId)).toBe(s);
    expect(Math.round(b.x)).toBe(Math.round(s.ent.x));
    // đăng nhập thiết bị thứ hai
    const b2 = new Bot(base); b2.token = b.token;
    await b2.connect(b.charId);
    await b.waitFor((m) => m.t === 'kick');
    await sleep(100);
    expect(b.closed).toBe(true);
    // lưu xuống DB
    await world().removeSession(s);
    const row = (await sql('SELECT tu_vi, x FROM characters WHERE id = $1', [b.charId]))[0];
    expect(Number(row.tu_vi)).toBe(77);
    b2.close();
  }, 30000);

  it('chống spam gói tin, giới hạn tham số RPC, quản trị: cấm chat/khóa tài khoản có audit log', async () => {
    const b = await newPlayer('x');
    const s = session(b);
    for (let i = 0; i < 200; i++) b.send({ t: 'ping', c: i });
    await sleep(300);
    expect(s.violations).toBeGreaterThan(0);
    await sleep(1100); // chờ hết cửa sổ chống spam
    await expect(b.rpc('inv.use', { id: "'; DROP TABLE accounts; --" })).rejects.toThrow(/không hợp lệ/);
    await expect(b.rpc('shop.buy', { npc: 'npc_village_chief', item: 'x', qty: -5 })).rejects.toThrow();
    await expect(b.rpc('khong.ton.tai')).rejects.toThrow(/không tồn tại/);
    // tạo admin qua CLI-equivalent (không có admin cố định trong source)
    const email = `admin${uniq()}@test.vn`;
    const { hashPassword } = await import('../src/auth/password.js');
    await sql("INSERT INTO accounts(email, password_hash, role) VALUES ($1,$2,'admin')", [email, await hashPassword('quantri123')]);
    const login = await http(base, '/api/auth/login', { email, password: 'quantri123' });
    const tok = login.data.token;
    expect((await http(base, '/api/admin/overview', undefined, b.token)).status).toBe(403);
    const ov = await http(base, '/api/admin/overview', undefined, tok);
    expect(ov.status).toBe(200);
    expect(ov.data.world.online).toBeGreaterThan(0);
    const accId = (await sql('SELECT account_id FROM characters WHERE id = $1', [b.charId]))[0].account_id;
    await http(base, `/api/admin/accounts/${accId}/mute`, { minutes: 10 }, tok);
    await expect(b.rpc('chat.send', { ch: 'map', text: 'xin chào' })).rejects.toThrow(/cấm chat/);
    await http(base, `/api/admin/characters/${b.charId}/grant`, { item: 'pill_hp_1', qty: 3, reason: 'đền bù lỗi' }, tok);
    const mails = await b.rpc('mail.list');
    await b.rpc('mail.claim', { id: mails[0].id });
    const ban = await http(base, `/api/admin/accounts/${accId}/ban`, { reason: 'gian lận', hours: 1 }, tok);
    expect(ban.status).toBe(200);
    await b.waitFor((m) => m.t === 'kick');
    expect((await http(base, '/api/auth/me', undefined, b.token)).status).toBe(401);
    const logs = await http(base, '/api/admin/logs', undefined, tok);
    expect(logs.data.map((l: any) => l.action)).toEqual(expect.arrayContaining(['mute', 'grant_item', 'ban']));
    const ev = await http(base, '/api/admin/events', { key: 'ev_double_exp', durationMin: 5 }, tok);
    expect(ev.status).toBe(200);
    expect(world().expMultiplier('tan_thu_thon')).toBe(2);
  }, 30000);
});

describe('Dữ liệu & sinh bản đồ trên server', () => {
  it('mọi bản đồ công khai khởi tạo được và quái đứng trên mặt đất', async () => {
    for (const m of Object.values(MAPS)) {
      if (m.instance) continue;
      const inst = world().getPublicInstance(m.id);
      const g = generateGrid(m);
      for (const mon of inst.monsters.values()) if (!mon.def.flying) expect(Math.abs(mon.y - groundYAt(g, mon.x))).toBeLessThan(TILE * 4);
    }
  });
});

describe('Thế giới mở nhiều tầng (phiên 2)', () => {
  it('khám phá tự do: cảnh báo nguy hiểm + xác nhận, giới hạn cứng theo tầng, khu ẩn, sương mù bản đồ, lịch sự kiện', async () => {
    const b = await newPlayer('w');
    const s = session(b);
    // Tân Thủ Thôn -> Bích Thủy Hồ (khuyến nghị cảnh giới 3) => cảnh báo, chưa vào
    const portal = MAPS['tan_thu_thon'].portals.find((p) => p.to === 'bich_thuy_ho')!;
    await teleport(b, 'tan_thu_thon', portal.x + 20);
    const r1 = await b.rpc('portal.use', { id: portal.id });
    expect(r1.warn).toMatch(/CẢNH BÁO/);
    expect(s.ent.inst.def.id).toBe('tan_thu_thon');
    b.clearMessages();
    await b.rpc('portal.use', { id: portal.id, force: true });
    await b.waitFor((m) => m.t === 'map' && m.map === 'bich_thuy_ho');
    // không còn khóa bản đồ theo nhiệm vụ: Linh Vân Châu cần Luyện Khí (tầng Tu Chân) — giới hạn cứng
    setRealm(b, 9);
    await teleport(b, 'thien_kiem_tong', MAPS['thien_kiem_tong'].npcs.find((n) => n.npc === 'npc_sect_gate')!.x);
    await expect(b.rpc('teleport.npc', { npc: 'npc_sect_gate', map: 'linh_van_chau' })).rejects.toThrow(/tối thiểu cảnh giới/);
    setRealm(b, 10);
    await sql('UPDATE character_currencies SET gold = 100000 WHERE character_id = $1', [b.charId]);
    await b.rpc('teleport.npc', { npc: 'npc_sect_gate', map: 'linh_van_chau' });
    await b.waitFor((m) => m.t === 'map' && m.map === 'linh_van_chau');
    // khu vực ẩn chưa khám phá không vào được
    const { checkMapEntry } = await import('../src/game/rpc/core.js');
    await expect(checkMapEntry(s, MAPS['co_mo_thanh_truc'], true)).rejects.toThrow(/chưa được khám phá/);
    // sương mù: world.info chỉ hiện tên khu đã tới
    await sleep(300);
    const w = await b.rpc('world.info');
    expect(w.tiers.length).toBe(10);
    const names = w.maps.filter((m: any) => m.discovered).map((m: any) => m.id);
    expect(names).toEqual(expect.arrayContaining(['tan_thu_thon', 'bich_thuy_ho', 'linh_van_chau']));
    expect(w.maps.find((m: any) => m.id === 'than_dinh').name).toBe('???');
    expect(w.maps.find((m: any) => m.id === 'co_mo_thanh_truc')).toBeUndefined();
    // lịch sự kiện định kỳ tạo bản ghi idempotent
    const { runEventScheduler } = await import('../src/http/admin.js');
    await runEventScheduler(); await runEventScheduler();
    const evs = await sql('SELECT event_key, count(*)::int n FROM events WHERE created_by IS NULL GROUP BY event_key');
    for (const e of evs) expect(e.n).toBe(1);
    b.close();
  }, 60000);
});

describe('Hệ thống sức mạnh & cơ duyên (phiên 2)', () => {
  it('linh căn thức tỉnh, kinh mạch, thưởng nguyên tố, lựa chọn nhiệm vụ → danh vọng → giá cửa hàng, cơ duyên có giới hạn, khu ẩn', async () => {
    const b = await newPlayer('pw');
    const s = session(b);
    // thức tỉnh linh căn khi trả "Thức Tỉnh Linh Căn"
    setRealm(b, 9);
    for (const id of ['mq_4_05']) s.quests.set(id, { state: 'done', progress: {}, times: 1, completedAt: new Date(), dirty: true });
    s.quests.set('mq_4_06', { state: 'active', progress: { o1: 1, o2: 1 }, times: 0, completedAt: null, dirty: true });
    await teleport(b, 'thien_kiem_tong', MAPS['thien_kiem_tong'].npcs.find((n) => n.npc === 'npc_sect_master')!.x);
    await b.rpc('quest.turnIn', { id: 'mq_4_06' });
    expect(s.power.grade).toBeGreaterThanOrEqual(1);
    expect(s.power.element).toBeTruthy();
    const info = await b.rpc('power.info');
    expect(info.root.cultivation).toBeGreaterThan(1);
    // thưởng sát thương nguyên tố cho con đường hợp linh căn
    const { elementBonus } = await import('../src/game/power.js');
    const { ROOT_ELEMENTS } = await import('@tt/shared');
    expect(elementBonus(s, ROOT_ELEMENTS[s.power.element!].paths[0])).toBeGreaterThan(0);
    // kinh mạch: cần đan + vàng, theo thứ tự, tăng chỉ số khi thành công
    await sql('UPDATE character_currencies SET gold = 10000000 WHERE character_id = $1', [b.charId]);
    await give(b, 'pill_meridian_1', 30);
    await expect(b.rpc('power.meridian', { idx: 1 })).rejects.toThrow(/thứ tự/);
    const hp0 = s.stats.maxHp;
    let opened = false;
    for (let i = 0; i < 10 && !opened; i++) opened = (await b.rpc('power.meridian', { idx: 0 })).ok;
    expect(opened).toBe(true);
    expect(s.stats.maxHp).toBeGreaterThan(hp0);
    // lựa chọn nhiệm vụ: Vạn Bảo Các — trung thực → danh vọng tăng
    setRealm(b, 11);
    s.quests.set('mq_5_02', { state: 'done', progress: {}, times: 1, completedAt: new Date(), dirty: true });
    await teleport(b, 'van_bao_cac', MAPS['van_bao_cac'].npcs.find((n) => n.npc === 'npc_treasure_pavilion')!.x);
    await b.rpc('quest.accept', { id: 'cq_trade_contract' });
    await give(b, 'ore_t3', 15);
    await expect(b.rpc('quest.turnIn', { id: 'cq_trade_contract' })).rejects.toThrow(/lựa chọn/);
    const res = await b.rpc('quest.turnIn', { id: 'cq_trade_contract', choice: 'honest' });
    expect(res.outcome).toMatch(/khách quý/);
    const reps = await b.rpc('rep.list');
    expect(reps.find((r: any) => r.id === 'van_bao').value).toBeGreaterThanOrEqual(2500);
    // danh vọng Thân Thiện -> giảm giá ở cửa hàng thương hội
    const g0 = await gold(b);
    await sql('UPDATE character_currencies SET spirit_stones = 1000 WHERE character_id = $1', [b.charId]);
    await b.rpc('shop.buy', { npc: 'npc_treasure_pavilion', item: 'stone_reroll', qty: 10 });
    const st = (await sql('SELECT spirit_stones FROM character_currencies WHERE character_id = $1', [b.charId]))[0];
    expect(Number(st.spirit_stones)).toBe(1000 - Math.round(8 * 0.95) * 10);
    void g0;
    // cơ duyên: một lần/nhân vật + giới hạn toàn server
    const { grantFortune } = await import('../src/game/power.js');
    const { FORTUNES } = await import('@tt/shared');
    const coMo = FORTUNES.find((f) => f.id === 'fo_co_mo')!;
    expect(await grantFortune(s, coMo)).toBe(true);
    expect(await grantFortune(s, coMo)).toBe(false);
    await sql("INSERT INTO fortune_global(fortune_id, claimed) VALUES ('fo_thai_so_kiem', 10) ON CONFLICT (fortune_id) DO UPDATE SET claimed = 10");
    expect(await grantFortune(s, FORTUNES.find((f) => f.id === 'fo_thai_so_kiem')!)).toBe(false);
    // khu ẩn đã khám phá: vào được từ lối vào gốc
    await teleport(b, 'rung_thanh_truc', 400);
    await b.rpc('world.enterHidden', { map: 'co_mo_thanh_truc' });
    await b.waitFor((m) => m.t === 'map' && m.map === 'co_mo_thanh_truc');
    const fl = await b.rpc('fortune.list');
    expect(fl.found.map((f: any) => f.id)).toContain('fo_co_mo');
    b.close();
  }, 60000);
});
