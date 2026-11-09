import { BUILDINGS, HOUSING_LEVELS, ITEMS, PETS, TILE, petExpRequired, petStats } from '@tt/shared';
import { q, q1, tx } from '../../db.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { sanitizeText, validateCharacterName } from '../../services/filter.js';
import { consumeTemplate, grantItems, ownedInstance, placeIntoBag, detach } from '../../services/items.js';
import type { PlayerSession } from '../player.js';
import { world } from '../world.js';
import { requireService } from './core.js';
import { addPetExp, pushInventory } from './inventory.js';
import { addProfExp } from './progression.js';
import { int, oneOf, rpc, str, uuid } from './registry.js';

// ======================= LINH THÚ =======================
rpc('pet.list', async (s) => {
  const pets = await q<{ id: number; template_id: string; name: string; level: number; exp: number; quality: number; skills: string[]; summoned: boolean }>('SELECT * FROM pets WHERE owner_id = $1 ORDER BY id', [s.charId]);
  const gear = await q<{ id: string; template_id: string; ref_id: string }>("SELECT id, template_id, ref_id FROM item_instances WHERE container = 'pet' AND owner_id = $1", [s.charId]);
  return pets.map((p) => ({ ...p, def: p.template_id, stats: petStats(PETS[p.template_id].baseStats, PETS[p.template_id].growth, p.level, p.quality), next: petExpRequired(p.level), gear: gear.filter((g) => g.ref_id === String(p.id)), summoned: s.summonedPetId === p.id, canEvolve: !!PETS[p.template_id].evolvesTo && p.level >= (PETS[p.template_id].evolveLevel ?? 999) }));
});
async function ownPet(s: PlayerSession, id: number) {
  const p = await q1<{ id: number; template_id: string; name: string; level: number; quality: number }>('SELECT * FROM pets WHERE id = $1 AND owner_id = $2', [id, s.charId]);
  assert(p, 'Không tìm thấy linh thú');
  return p;
}
rpc('pet.summon', async (s, p) => {
  const id = int(p, 'id', 1);
  await ownPet(s, id);
  s.summonedPetId = id;
  await q('UPDATE pets SET summoned = (id = $2) WHERE owner_id = $1', [s.charId, id]);
  await world().spawnOwnedPet(s);
  return { ok: true };
});
rpc('pet.dismiss', async (s) => {
  if (s.summonedPetId) for (const pe of [...s.ent.inst.pets.values()]) if (pe.ownerId === s.ent.id && pe.petId) s.ent.inst.removePet(pe);
  s.summonedPetId = null;
  await q('UPDATE pets SET summoned = false WHERE owner_id = $1', [s.charId]);
  return { ok: true };
});
rpc('pet.feed', async (s, p) => {
  const id = int(p, 'id', 1);
  const food = str(p, 'food', 40);
  const d = ITEMS[food];
  assert(d?.use?.kind === 'pet_food', 'Không phải thức ăn linh thú');
  await ownPet(s, id);
  const house = await q1<{ buildings: Record<string, number> }>('SELECT buildings FROM housing WHERE character_id = $1', [s.charId]);
  const bonus = 1 + (house?.buildings?.linh_thu_vien ?? 0) * 0.2;
  await s.enqueue(() => tx(async (c) => {
    await consumeTemplate(c, s.charId, food, 1, 'pet_feed');
    await addPetExp(c, s, id, Math.round((d.use as { exp: number }).exp * bonus));
  }));
  await pushInventory(s);
  return { ok: true };
});
rpc('pet.evolve', async (s, p) => {
  const id = int(p, 'id', 1);
  const pet = await ownPet(s, id);
  const def = PETS[pet.template_id];
  assert(def.evolvesTo, 'Linh thú này không thể tiến hóa thêm');
  assert(pet.level >= (def.evolveLevel ?? 999), `Cần cấp ${def.evolveLevel}`);
  const next = PETS[def.evolvesTo];
  await s.enqueue(() => tx(async (c) => {
    for (const it of def.evolveItems ?? []) await consumeTemplate(c, s.charId, it.item, it.qty, 'pet_evolve');
    await c.query('UPDATE pets SET template_id = $2, name = CASE WHEN name = $3 THEN $4 ELSE name END, skills = $5, quality = LEAST(5, quality + 1) WHERE id = $1', [id, next.id, def.name, next.name, JSON.stringify(next.skills)]);
  }));
  if (s.summonedPetId === id) await world().spawnOwnedPet(s);
  s.notify(`${pet.name} tiến hóa thành ${next.name}!`, 'good');
  await pushInventory(s);
  return { ok: true };
});
rpc('pet.rename', async (s, p) => {
  const id = int(p, 'id', 1);
  const name = str(p, 'name', 14).normalize('NFC').trim();
  const bad = validateCharacterName(name);
  if (bad) throw new GameError(bad);
  await ownPet(s, id);
  await q('UPDATE pets SET name = $2 WHERE id = $1', [id, name]);
  return { ok: true };
});
rpc('pet.release', async (s, p) => {
  const id = int(p, 'id', 1);
  await ownPet(s, id);
  assert(s.summonedPetId !== id, 'Hãy thu hồi trước khi phóng sinh');
  await s.enqueue(() => tx(async (c) => {
    const gear = (await c.query("SELECT * FROM item_instances WHERE container = 'pet' AND ref_id = $1 AND owner_id = $2", [String(id), s.charId])).rows;
    for (const g of gear) await placeIntoBag(c, g, s.charId);
    await c.query('DELETE FROM pets WHERE id = $1', [id]);
    await grantItems(c, s.charId, [{ item: 'pet_food_1', qty: 5 }], 'pet_release');
  }));
  await pushInventory(s);
  return { ok: true };
});
rpc('pet.equip', async (s, p) => {
  const id = int(p, 'pet', 1);
  const itemId = uuid(p, 'item');
  await ownPet(s, id);
  await s.enqueue(() => tx(async (c) => {
    const row = await ownedInstance(c, s.charId, itemId);
    assert(ITEMS[row.template_id].type === 'pet_gear', 'Không phải trang bị linh thú');
    assert(s.realmIdx >= ITEMS[row.template_id].reqRealm, 'Cảnh giới chưa đủ');
    const cur = (await c.query("SELECT * FROM item_instances WHERE container = 'pet' AND ref_id = $1 AND owner_id = $2 FOR UPDATE", [String(id), s.charId])).rows[0];
    await detach(c, row, 1, { owner: s.charId, container: 'pet', refId: String(id) }, false);
    if (cur) await placeIntoBag(c, cur, s.charId);
  }));
  if (s.summonedPetId === id) await world().spawnOwnedPet(s);
  await pushInventory(s);
  return { ok: true };
});
world().petExpHook = (s, exp) => {
  if (!s.summonedPetId || exp <= 0) return;
  const id = s.summonedPetId;
  s.enqueue(() => tx((c) => addPetExp(c, s, id, exp))).catch(() => undefined);
};

// ======================= ĐỘNG PHỦ / TIÊN PHỦ =======================
interface HouseRow { character_id: number; level: number; name: string; access: string; buildings: Record<string, number>; decorations: { item: string; x: number; id: string }[] }
async function myHouse(s: PlayerSession): Promise<HouseRow> {
  const h = await q1<HouseRow>('SELECT * FROM housing WHERE character_id = $1', [s.charId]);
  assert(h, 'Bạn chưa sở hữu động phủ — tìm Địa Chủ ở Thanh Vân Thành');
  return h;
}
function refreshHouseBonus(s: PlayerSession, h: HouseRow): void {
  s.housingBonus = (h.buildings.tu_linh_tran ?? 0) * 0.15;
  const fb = h.decorations.reduce((a, d) => a + (ITEMS[d.item]?.furniture?.spiritBonus ?? 0), 0);
  world().setFurnitureBonus(s.charId, Math.min(0.5, fb));
}
function inOwnHouse(s: PlayerSession): boolean { return s.ent.inst.instanceKind === 'housing' && s.ent.inst.ownerKey === String(s.charId); }

rpc('house.claim', async (s) => {
  requireService(s, 'housing');
  const exists = await q1('SELECT 1 FROM housing WHERE character_id = $1', [s.charId]);
  assert(!exists, 'Bạn đã có động phủ');
  const lvl = HOUSING_LEVELS[0];
  assert(s.realmIdx >= lvl.reqRealm, 'Cần cảnh giới Nhập Môn');
  await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -lvl.cost.gold, 'housing_claim');
    await c.query('INSERT INTO housing(character_id, name) VALUES ($1,$2)', [s.charId, `Động phủ của ${s.name}`]);
  }));
  await pushInventory(s);
  return { ok: true };
});
rpc('house.info', async (s, p) => {
  const ownerId = p.owner ? int(p, 'owner', 1) : s.charId;
  const h = await q1<HouseRow>('SELECT * FROM housing WHERE character_id = $1', [ownerId]);
  if (!h) return { owned: false, levels: HOUSING_LEVELS, buildings: BUILDINGS };
  const plots = await q('SELECT plot_idx, seed_item, planted_at, ready_at FROM housing_plots WHERE character_id = $1', [ownerId]);
  const lv = HOUSING_LEVELS[h.level - 1];
  return { owned: true, house: h, levelInfo: lv, nextLevel: HOUSING_LEVELS[h.level] ?? null, plots, plotCount: (h.buildings.linh_dien ?? 0) * BUILDINGS.linh_dien.perLevel, levels: HOUSING_LEVELS, buildings: BUILDINGS };
});
async function canVisit(visitor: PlayerSession, ownerId: number, access: string): Promise<boolean> {
  if (visitor.charId === ownerId || access === 'public') return true;
  if (access === 'friends') return !!(await q1("SELECT 1 FROM friends WHERE character_id = $1 AND friend_id = $2 AND status = 'accepted'", [ownerId, visitor.charId]));
  if (access === 'guild') { const g = await q1<{ guild_id: number }>('SELECT guild_id FROM guild_members WHERE character_id = $1', [ownerId]); return !!g && g.guild_id === visitor.guildId; }
  return false;
}
rpc('house.enter', async (s, p) => {
  assert(!s.ent.inst.instanceKind, 'Hãy rời khu vực hiện tại trước');
  assert(Date.now() - s.lastCombatAt > 5000, 'Không thể vào khi đang chiến đấu');
  let ownerId = s.charId;
  if (p.owner) { const t = await q1<{ id: number }>('SELECT id FROM characters WHERE lower(name) = lower($1) AND deleted_at IS NULL', [str(p, 'owner', 30)]); assert(t, 'Không tìm thấy chủ động phủ'); ownerId = t.id; }
  const h = await q1<HouseRow>('SELECT * FROM housing WHERE character_id = $1', [ownerId]);
  assert(h, ownerId === s.charId ? 'Bạn chưa sở hữu động phủ' : 'Người này chưa có động phủ');
  assert(await canVisit(s, ownerId, h.access), 'Chủ nhân không cho phép vào');
  let inst = world().findInstance((i) => i.instanceKind === 'housing' && i.ownerKey === String(ownerId));
  if (!inst) inst = world().createInstance('dong_phu', String(ownerId), { canLeaveByPortal: false });
  if (ownerId === s.charId) refreshHouseBonus(s, h);
  world().rememberReturn(s);
  world().enterInstance(s, inst, 6 * TILE);
  s.send({ t: 'ev', k: 'house', d: { owner: ownerId, level: h.level, name: h.name, decorations: h.decorations, buildings: h.buildings } });
  return { ok: true };
});
rpc('house.leave', (s) => { assert(s.ent.inst.instanceKind === 'housing', 'Bạn không ở trong động phủ'); world().leaveInstance(s); return { ok: true }; });
rpc('house.upgrade', async (s) => {
  const h = await myHouse(s);
  const next = HOUSING_LEVELS[h.level];
  assert(next, 'Đã đạt cấp tối đa');
  assert(s.realmIdx >= next.reqRealm, `Cần cảnh giới ${next.reqRealm} để nâng lên ${next.name}`);
  await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -next.cost.gold, 'housing_upgrade');
    if (next.cost.spirit_stones) await changeCurrency(c, s.charId, 'spirit_stones', -next.cost.spirit_stones, 'housing_upgrade');
    await c.query('UPDATE housing SET level = level + 1 WHERE character_id = $1', [s.charId]);
  }));
  s.notify(`Động phủ nâng cấp thành ${next.name}!`, 'good');
  await pushInventory(s);
  return { ok: true, level: next.level };
});
rpc('house.build', async (s, p) => {
  const id = str(p, 'building', 30);
  const b = BUILDINGS[id];
  assert(b, 'Công trình không tồn tại');
  const h = await myHouse(s);
  const cur = h.buildings[id] ?? 0;
  assert(cur < b.maxLevel, 'Công trình đã tối đa');
  assert(cur < HOUSING_LEVELS[h.level - 1].maxBuildingLevel, 'Hãy nâng cấp động phủ để xây cao hơn');
  const cost = b.costs[cur];
  await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -cost.gold, 'housing_build', 'building', id);
    if (cost.spirit_stones) await changeCurrency(c, s.charId, 'spirit_stones', -cost.spirit_stones, 'housing_build', 'building', id);
    for (const it of cost.items) await consumeTemplate(c, s.charId, it.item, it.qty, 'housing_build');
    await c.query("UPDATE housing SET buildings = jsonb_set(buildings, $2, to_jsonb($3::int)) WHERE character_id = $1", [s.charId, `{${id}}`, cur + 1]);
  }));
  const nh = await myHouse(s);
  refreshHouseBonus(s, nh);
  await pushInventory(s);
  return { ok: true, level: cur + 1 };
});
rpc('house.plant', async (s, p) => {
  assert(inOwnHouse(s), 'Hãy vào động phủ của bạn');
  const plot = int(p, 'plot', 0, 50);
  const seed = str(p, 'seed', 40);
  const d = ITEMS[seed];
  assert(d?.seed, 'Không phải hạt giống');
  const h = await myHouse(s);
  assert(plot < (h.buildings.linh_dien ?? 0) * BUILDINGS.linh_dien.perLevel, 'Ô linh điền chưa mở — xây/nâng cấp Linh Điền');
  await s.enqueue(() => tx(async (c) => {
    const used = (await c.query('SELECT 1 FROM housing_plots WHERE character_id = $1 AND plot_idx = $2', [s.charId, plot])).rowCount;
    assert(!used, 'Ô đã có cây');
    await consumeTemplate(c, s.charId, seed, 1, 'plant');
    await c.query("INSERT INTO housing_plots(character_id, plot_idx, seed_item, ready_at) VALUES ($1,$2,$3, now() + ($4 || ' seconds')::interval)", [s.charId, plot, seed, String(d.seed!.growSeconds)]);
  }));
  await pushInventory(s);
  return { ok: true, readyIn: d.seed.growSeconds };
});
rpc('house.harvest', async (s, p) => {
  assert(inOwnHouse(s), 'Hãy vào động phủ của bạn');
  const plot = int(p, 'plot', 0, 50);
  const r = await s.enqueue(() => tx(async (c) => {
    const row = (await c.query('SELECT * FROM housing_plots WHERE character_id = $1 AND plot_idx = $2 FOR UPDATE', [s.charId, plot])).rows[0];
    assert(row, 'Ô trống');
    assert(new Date(row.ready_at) <= new Date(), 'Cây chưa chín');
    const sd = ITEMS[row.seed_item].seed!;
    const qty = sd.yield[0] + Math.floor(Math.random() * (sd.yield[1] - sd.yield[0] + 1));
    await c.query('DELETE FROM housing_plots WHERE character_id = $1 AND plot_idx = $2', [s.charId, plot]);
    await grantItems(c, s.charId, [{ item: sd.herb, qty }], 'harvest');
    await addProfExp(c, s, 'farming', 20 + ITEMS[row.seed_item].rarity * 25);
    return { ok: true, item: sd.herb, qty };
  }));
  s.notify(`Thu hoạch ${ITEMS[r.item].name} x${r.qty}`, 'good');
  await pushInventory(s);
  return r;
});
rpc('house.place', async (s, p) => {
  assert(inOwnHouse(s), 'Hãy vào động phủ của bạn');
  const itemId = uuid(p, 'id');
  const x = int(p, 'x', 2 * TILE, 48 * TILE);
  const h = await myHouse(s);
  assert(h.decorations.length < HOUSING_LEVELS[h.level - 1].maxFurniture, 'Đã đạt giới hạn nội thất — nâng cấp động phủ');
  await s.enqueue(() => tx(async (c) => {
    const row = await ownedInstance(c, s.charId, itemId);
    assert(ITEMS[row.template_id].type === 'furniture', 'Không phải nội thất');
    await detach(c, row, 1, { owner: s.charId, container: 'housing', refId: String(s.charId) }, false);
    const decos = [...h.decorations, { item: row.template_id, x, id: row.id }];
    await c.query('UPDATE housing SET decorations = $2 WHERE character_id = $1', [s.charId, JSON.stringify(decos)]);
  }));
  const nh = await myHouse(s);
  refreshHouseBonus(s, nh);
  s.ent.inst.broadcast({ t: 'ev', k: 'house', d: { owner: s.charId, level: nh.level, name: nh.name, decorations: nh.decorations, buildings: nh.buildings } });
  await pushInventory(s);
  return { ok: true };
});
rpc('house.remove', async (s, p) => {
  assert(inOwnHouse(s), 'Hãy vào động phủ của bạn');
  const idx = int(p, 'index', 0, 100);
  const h = await myHouse(s);
  const deco = h.decorations[idx];
  assert(deco, 'Không có nội thất này');
  await s.enqueue(() => tx(async (c) => {
    const row = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'housing' AND id = $2 FOR UPDATE", [s.charId, deco.id])).rows[0];
    if (row) await placeIntoBag(c, row, s.charId);
    const decos = h.decorations.filter((_, i) => i !== idx);
    await c.query('UPDATE housing SET decorations = $2 WHERE character_id = $1', [s.charId, JSON.stringify(decos)]);
  }));
  const nh = await myHouse(s);
  refreshHouseBonus(s, nh);
  s.ent.inst.broadcast({ t: 'ev', k: 'house', d: { owner: s.charId, level: nh.level, name: nh.name, decorations: nh.decorations, buildings: nh.buildings } });
  await pushInventory(s);
  return { ok: true };
});
rpc('house.access', async (s, p) => {
  const access = oneOf(p, 'access', ['private', 'friends', 'guild', 'public'] as const);
  const name = p.name ? sanitizeText(p.name, 30) : undefined;
  await myHouse(s);
  await q('UPDATE housing SET access = $2, name = COALESCE($3, name) WHERE character_id = $1', [s.charId, access, name || null]);
  return { ok: true };
});
