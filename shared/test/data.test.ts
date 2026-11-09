import { describe, expect, it } from 'vitest';
import { gameData, generateGrid, moveBody, overlapsSolid, groundYAt, TILE, PHYSICS, computeDamage, tuViRequired, statCurve, realmDef, SKILLS, PLAYER_SKILL_PATHS, breakthroughRate, monsterStats, baseCharacterStats, MAX_DAMAGE } from '../src/index.js';

const D = gameData();

describe('dữ liệu game — toàn vẹn tham chiếu', () => {
  it('có đủ 29 cảnh giới đặt tên + Hỗn Độn vô hạn', () => {
    expect(D.realms.length).toBe(29);
    expect(D.realms[0].name).toBe('Phàm Nhân');
    expect(D.realms[9].name).toBe('Võ Đạo Đại Đế');
    expect(D.realms[18].name).toBe('Độ Kiếp');
    expect(D.realms[28].name).toBe('Tiên Đế');
    expect(realmDef(40).stage).toBe('hon_don');
  });
  it('nguyên liệu đột phá đều tồn tại', () => {
    for (let i = 0; i < 45; i++) for (const m of realmDef(i).breakthrough.materials) expect(D.items[m.item], `${i}:${m.item}`).toBeTruthy();
  });
  it('quest gate tồn tại', () => {
    for (const r of D.realms) if (r.breakthrough.questRequired) expect(D.quests[r.breakthrough.questRequired], r.id).toBeTruthy();
  });
  it('vật phẩm rơi của quái tồn tại', () => {
    for (const m of Object.values(D.monsters)) {
      for (const d of m.drops) expect(D.items[d.item], `${m.id} drop ${d.item}`).toBeTruthy();
      for (const s of m.skills) expect(D.skills[s], `${m.id} skill ${s}`).toBeTruthy();
      for (const p of m.phases ?? []) { for (const s of p.skills) expect(D.skills[s]).toBeTruthy(); if (p.summon) expect(D.monsters[p.summon.monster]).toBeTruthy(); }
      if (m.capturable) expect(D.pets[m.capturable], m.id).toBeTruthy();
    }
  });
  it('bản đồ: NPC, quái, cổng, tài nguyên hợp lệ', () => {
    for (const m of Object.values(D.maps)) {
      for (const n of m.npcs) expect(D.npcs[n.npc], `${m.id}:${n.npc}`).toBeTruthy();
      for (const s of m.spawns) expect(D.monsters[s.monster], `${m.id}:${s.monster}`).toBeTruthy();
      for (const p of m.portals) { expect(D.maps[p.to]).toBeTruthy(); expect(D.maps[p.to].portals.find((q) => q.id === p.toPortal), `${m.id}->${p.to}`).toBeTruthy(); }
      for (const nd of m.nodes) expect(D.gatherTables[nd.table], nd.table).toBeTruthy();
      for (const it of m.interacts) { expect(D.quests[it.quest], it.id).toBeTruthy(); expect(D.quests[it.quest].objectives.find((o) => o.id === it.objective && o.type === 'interact' && o.target === it.id), it.id).toBeTruthy(); }
    }
  });
  it('mọi khu vực trong đặc tả đều có bản đồ', () => {
    const names = ['Tân Thủ Thôn', 'Rừng Thanh Trúc', 'Hắc Phong Sơn', 'Thanh Vân Thành', 'Võ Đạo Học Viện', 'Cổ Kiếm Sơn Trang', 'Yêu Thú Sơn Mạch', 'Vạn Dược Cốc', 'Thiên Kiếm Tông', 'U Minh Động', 'Cổ Chiến Trường', 'Linh Vân Châu', 'Thiên Huyền Thành', 'Vạn Bảo Các', 'Lôi Kiếp Đài', 'Thượng Cổ Bí Cảnh', 'Ma Vực', 'Thiên Ngoại Chiến Trường', 'Phi Thăng Đài', 'Cửu Thiên Tiên Thành', 'Vạn Tiên Sơn', 'Thiên Đế Cung', 'Hỗn Độn Hải'];
    const have = new Set(Object.values(D.maps).map((m) => m.name));
    for (const n of names) expect(have.has(n), n).toBe(true);
  });
  it('nhiệm vụ: NPC/mục tiêu/phần thưởng hợp lệ', () => {
    for (const q of Object.values(D.quests)) {
      expect(D.npcs[q.giver], `${q.id} giver`).toBeTruthy();
      expect(D.npcs[q.turnIn], `${q.id} turnIn`).toBeTruthy();
      for (const p of q.prereq) expect(D.quests[p], `${q.id} prereq ${p}`).toBeTruthy();
      for (const o of q.objectives) {
        if (o.type === 'kill') expect(D.monsters[o.target], `${q.id} ${o.target}`).toBeTruthy();
        if (o.type === 'collect') expect(D.items[o.target], `${q.id} ${o.target}`).toBeTruthy();
        if (o.type === 'talk' || o.type === 'deliver' || o.type === 'escort') expect(D.npcs[o.target], `${q.id} ${o.target}`).toBeTruthy();
        if (o.type === 'reach') expect(D.maps[o.target]).toBeTruthy();
        if (o.type === 'craft') expect(D.recipes[o.target], o.target).toBeTruthy();
        if (o.type === 'dungeon') expect(D.dungeons[o.target]).toBeTruthy();
      }
      for (const it of q.rewards.items ?? []) expect(D.items[it.item], `${q.id} reward ${it.item}`).toBeTruthy();
    }
    const main = Object.values(D.quests).filter((q) => q.kind === 'main');
    expect(new Set(main.map((q) => q.chapter)).size).toBe(7);
    expect(main.length).toBeGreaterThanOrEqual(35);
  });
  it('cửa hàng, công thức, phó bản, linh thú tham chiếu hợp lệ', () => {
    for (const s of Object.values(D.shops)) for (const it of s.items) expect(D.items[it.item], `${s.id}:${it.item}`).toBeTruthy();
    for (const r of Object.values(D.recipes)) { for (const i of r.inputs) expect(D.items[i.item], `${r.id}:${i.item}`).toBeTruthy(); expect(D.items[r.output.item], r.id).toBeTruthy(); }
    for (const d of Object.values(D.dungeons)) { expect(D.maps[d.map]).toBeTruthy(); expect(D.monsters[d.boss]).toBeTruthy(); for (const w of d.waves) for (const s of w) expect(D.monsters[s.monster]).toBeTruthy(); }
    for (const p of Object.values(D.pets)) { if (p.evolvesTo) expect(D.pets[p.evolvesTo]).toBeTruthy(); for (const s of p.skills) expect(D.skills[s]).toBeTruthy(); }
    for (const n of Object.values(D.npcs)) { if (n.shop) expect(D.shops[n.shop], n.id).toBeTruthy(); for (const t of n.teleports ?? []) expect(D.maps[t]).toBeTruthy(); }
    for (const it of Object.values(D.items)) if (it.use?.kind === 'learn_skill') expect(D.skills[it.use.skill]).toBeTruthy();
  });
  it('12 con đường công pháp, mỗi đường 5 kỹ năng có cơ chế khác nhau', () => {
    expect(PLAYER_SKILL_PATHS.length).toBe(12);
    for (const p of PLAYER_SKILL_PATHS) {
      const list = Object.values(SKILLS).filter((s) => s.path === p);
      expect(list.length).toBe(5);
      const signatures = new Set(list.map((s) => `${s.shape.type}|${s.effects.map((e) => e.id).join(',')}|${s.combo?.requires ?? ''}|${s.heal ?? 0}`));
      expect(signatures.size, p).toBeGreaterThanOrEqual(4);
    }
  });
  it('10 độ hiếm được sử dụng', () => {
    const r = new Set(Object.values(D.items).map((i) => i.rarity));
    for (let i = 0; i <= 9; i++) expect(r.has(i), `rarity ${i}`).toBe(true);
  });
});

describe('công thức', () => {
  it('sát thương không tràn số và nằm trong giới hạn', () => {
    const rng = () => 0.5;
    const d = computeDamage({ attack: 1e14, defense: 1, pen: 0, power: 100, crit: 1, critDmg: 10, targetRes: 0, bonus: 5, rng });
    expect(d.amount).toBeLessThanOrEqual(MAX_DAMAGE);
    const low = computeDamage({ attack: 0, defense: 1e9, pen: 0, power: 0.1, crit: 0, critDmg: 1.5, targetRes: 0, bonus: 0, rng });
    expect(low.amount).toBe(1);
  });
  it('cân bằng: người chơi cùng cấp hạ quái thường trong vài đòn, quái không hạ người chơi trong 1-2 đòn', () => {
    for (const realm of [0, 5, 12, 20, 28]) {
      const p = baseCharacterStats(realm, 5);
      const mStats = monsterStats({ ...Object.values(D.monsters)[0], level: realm * 9 + 5, hpMult: 1, atkMult: 1, defMult: 1, rank: 'normal' });
      const hit = computeDamage({ attack: p.atk * 1.4, defense: mStats.def, pen: 0, power: 1, crit: 0, critDmg: 1.5, targetRes: 0, bonus: 0, rng: () => 0.5 }).amount;
      const hitsToKill = Math.ceil(mStats.maxHp / hit);
      expect(hitsToKill, `realm ${realm}`).toBeGreaterThanOrEqual(2);
      expect(hitsToKill, `realm ${realm}`).toBeLessThanOrEqual(12);
      const back = computeDamage({ attack: mStats.atk, defense: p.def, pen: 0, power: 1, crit: 0, critDmg: 1.5, targetRes: 0, bonus: 0, rng: () => 0.5 }).amount;
      expect(Math.ceil(p.maxHp / back), `realm ${realm}`).toBeGreaterThanOrEqual(8);
    }
  });
  it('tu vi yêu cầu tăng đơn điệu và hữu hạn tới Hỗn Độn sâu', () => {
    let prev = 0;
    for (let r = 0; r < 60; r++) for (let l = 1; l <= 9; l++) { const v = tuViRequired(r, l); expect(v).toBeGreaterThan(prev); expect(Number.isFinite(v)).toBe(true); expect(v).toBeLessThan(Number.MAX_SAFE_INTEGER); prev = v; }
    expect(Number.isFinite(statCurve(2000))).toBe(true);
  });
  it('tỉ lệ đột phá được kẹp', () => {
    expect(breakthroughRate(0.1, 0, 0)).toBeGreaterThanOrEqual(0.05);
    expect(breakthroughRate(0.95, 0.5, 10)).toBeLessThanOrEqual(0.98);
  });
});

describe('bản đồ & vật lý', () => {
  it('sinh bản đồ tất định và nhân vật đứng được trên mặt đất', () => {
    for (const m of Object.values(D.maps)) {
      const g1 = generateGrid(m), g2 = generateGrid(m);
      expect(g1.rows).toEqual(g2.rows);
      expect(g1.rows.length).toBe(m.height);
      const x = m.spawnX;
      const y = groundYAt(g1, x);
      expect(overlapsSolid(g1, x, y, PHYSICS.playerW, PHYSICS.playerH), m.id).toBe(false);
      // cổng nằm trên mặt đất, không kẹt trong tường
      for (const p of m.portals) expect(overlapsSolid(g1, p.x, groundYAt(g1, p.x), PHYSICS.playerW, PHYSICS.playerH), `${m.id}:${p.id}`).toBe(false);
    }
  });
  it('rơi tự do dừng ở mặt đất và không xuyên tường', () => {
    const m = D.maps['rung_thanh_truc'];
    const g = generateGrid(m);
    const b = { x: 300, y: 100, vx: 0, vy: 0, w: PHYSICS.playerW, h: PHYSICS.playerH, onGround: false };
    for (let i = 0; i < 200; i++) moveBody(g, b, 1 / 60, PHYSICS.gravity, PHYSICS.maxFall);
    expect(b.onGround).toBe(true);
    expect(b.y).toBe(groundYAt(g, 300));
    b.vx = -5000;
    for (let i = 0; i < 60; i++) { b.vx = -5000; moveBody(g, b, 1 / 60, PHYSICS.gravity, PHYSICS.maxFall); }
    expect(b.x).toBeGreaterThan(TILE); // tường trái ở cột 0
  });
  it('nhảy đạt độ cao ~3 ô để lên bục', () => {
    const h = (PHYSICS.jumpVelocity ** 2) / (2 * PHYSICS.gravity);
    expect(h).toBeGreaterThan(3 * TILE);
    expect(h).toBeLessThan(5 * TILE);
  });
});
