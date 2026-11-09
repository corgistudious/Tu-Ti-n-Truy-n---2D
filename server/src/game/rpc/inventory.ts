import { EQUIP_SLOTS, ITEMS, LIMITS, NEAREST_CITY, SHOPS, enhanceCost, enhanceFailPenalty, enhanceSuccessRate, PETS, petExpRequired, type EquipSlot } from '@tt/shared';
import { q, q1, tx, type Tx } from '../../db.js';
import { changeCurrency, getWallet } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { bagItems, consumeTemplate, def, detach, grantItems, ownedInstance, placeIntoBag, rollAffixes, type ItemRow } from '../../services/items.js';
import { eff } from '../combat.js';
import { nearNpc, questEvent } from '../quests.js';
import type { PlayerSession } from '../player.js';
import { requireService } from './core.js';
import { int, optInt, rpc, str, uuid } from './registry.js';
import type { MonsterEnt } from '../entities.js';

function view(r: ItemRow) {
  return { id: r.id, t: r.template_id, q: r.quantity, s: r.slot, b: r.bound, l: r.locked, e: r.enhance, r: r.refine, so: r.sockets, g: r.gems, a: r.affixes, d: r.durability };
}
export async function pushInventory(s: PlayerSession, c?: Tx): Promise<void> {
  const run = async (cc: Tx) => {
    const bag = await bagItems(cc, s.charId, 'bag');
    const equip = await bagItems(cc, s.charId, 'equip');
    const wallet = await getWallet(cc, s.charId);
    s.send({ t: 'ev', k: 'inv', bag: bag.map(view), equip: equip.map(view), wallet, tradeLocked: [...s.tradeLocked] });
  };
  if (c) await run(c); else await tx(run);
}
async function mutate<T>(s: PlayerSession, fn: (c: Tx) => Promise<T>, after?: () => void): Promise<T> {
  return s.enqueue(async () => {
    const r = await tx(async (c) => { const out = await fn(c); return out; });
    after?.();
    await pushInventory(s);
    return r;
  });
}
function notTradeLocked(s: PlayerSession, id: string): void { if (s.tradeLocked.has(id)) throw new GameError('Vật phẩm đang trong giao dịch'); }

rpc('inv.list', async (s, p) => {
  return tx(async (c) => {
    const bag = await bagItems(c, s.charId, 'bag');
    const equip = await bagItems(c, s.charId, 'equip');
    const wallet = await getWallet(c, s.charId);
    const storage = p.storage ? (await bagItems(c, s.charId, 'storage')).map(view) : undefined;
    return { bag: bag.map(view), equip: equip.map(view), wallet, storage, bagSlots: LIMITS.bagSlots };
  });
});

rpc('inv.pickup', async (s, p) => {
  const id = str(p, 'id', 40);
  const inst = s.ent.inst;
  const d = inst.drops.get(id);
  assert(d, 'Vật phẩm đã biến mất');
  assert(Math.abs(d.x - s.ent.x) < 90 && Math.abs(d.y - s.ent.y) < 120, 'Quá xa');
  assert(!d.owners || d.owners.includes(s.charId) || inst.now >= d.freeAt, 'Vật phẩm thuộc về người khác');
  inst.drops.delete(id); // giữ chỗ ngay để không ai khác nhặt trùng
  try {
    await mutate(s, (c) => grantItems(c, s.charId, [{ item: d.item, qty: d.qty }], `drop:${inst.def.id}`));
  } catch (e) { inst.drops.set(id, d); throw e; }
  inst.emitNear(d.x, { t: 'ev', k: 'pick', i: id, by: s.ent.id });
  return { ok: true, item: d.item, qty: d.qty };
});

rpc('inv.use', async (s, p) => {
  const id = uuid(p, 'id');
  notTradeLocked(s, id);
  let effect: (() => void) | null = null;
  const res = await mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const d = def(row.template_id);
    assert(d.use, 'Vật phẩm không thể sử dụng');
    assert(s.realmIdx >= d.reqRealm, 'Cảnh giới chưa đủ');
    assert(!s.ent.dead, 'Đã tử vong');
    const cdKey = d.use.kind === 'heal' ? (d.use.hp ? 'heal_hp' : 'heal_mp') : d.id;
    const now = Date.now();
    if ((s.itemCds.get(cdKey) ?? 0) > now) throw new GameError('Vật phẩm đang hồi');
    const u = d.use;
    const es = eff(s.ent);
    switch (u.kind) {
      case 'heal':
        effect = () => {
          if (u.hp) s.ent.hp = Math.min(es.maxHp, s.ent.hp + (u.pct ? es.maxHp * u.hp : u.hp));
          if (u.mp) s.mp = Math.min(es.maxMp, s.mp + (u.pct ? es.maxMp * u.mp : u.mp));
          s.ent.inst.emitNear(s.ent.x, { t: 'ev', k: 'heal', i: s.ent.id, v: 0, hp: Math.round(s.ent.hp) });
        };
        break;
      case 'tuvi': effect = () => s.addTuVi(u.amount, 'pill'); break;
      case 'buff': {
        const power = u.buff === 'speed_up' ? 0.25 : u.buff === 'shield' ? 0.2 : 0.15;
        effect = () => s.applyBuff(u.buff as never, u.duration, power);
        break;
      }
      case 'cleanse': effect = () => { s.ent.statuses = s.ent.statuses.filter((x) => !['burn', 'poison', 'slow', 'armor_break', 'tam_ma'].includes(x.id)); }; break;
      case 'learn_skill': {
        const { SKILLS } = await import('@tt/shared');
        const sk = SKILLS[u.skill];
        assert(!s.skills.has(u.skill), 'Đã lĩnh ngộ công pháp này — dùng để nâng cấp ở bảng Kỹ Năng');
        assert(s.realmIdx >= sk.reqRealm, 'Cảnh giới chưa đủ để lĩnh ngộ');
        await c.query('INSERT INTO character_skills(character_id, skill_id, level) VALUES ($1,$2,1)', [s.charId, u.skill]);
        effect = () => {
          s.skills.set(u.skill, 1);
          const hb = [...s.row.hotbar]; while (hb.length < LIMITS.hotbarSize) hb.push('');
          const empty = hb.findIndex((x, i) => i > 0 && !x);
          if (empty > 0) { hb[empty] = u.skill; s.row.hotbar = hb; q('UPDATE characters SET hotbar = $2 WHERE id = $1', [s.charId, JSON.stringify(hb)]).catch(() => undefined); }
          s.notify(`Lĩnh ngộ công pháp: ${sk.name}`, 'good');
          s.send({ t: 'ev', k: 'skills', skills: Object.fromEntries(s.skills), hotbar: s.row.hotbar });
        };
        break;
      }
      case 'teleport': {
        assert(!s.ent.inst.instanceKind, 'Không thể dùng trong phó bản');
        assert(now - s.lastCombatAt > 5000, 'Không thể dùng khi đang chiến đấu');
        const { MAPS } = await import('@tt/shared');
        const city = NEAREST_CITY[s.ent.inst.def.tier] ?? NEAREST_CITY[s.ent.inst.def.world] ?? 'thanh_van_thanh';
        const target = MAPS[city] && s.realmIdx >= MAPS[city].minRealm ? city : 'thanh_van_thanh';
        effect = () => s.world.enterMapById(s, target);
        break;
      }
      case 'capture': {
        const targetId = str(p, 'target', 40);
        const m = s.ent.inst.monsters.get(targetId) as MonsterEnt | undefined;
        assert(m && !m.dead, 'Không có mục tiêu');
        assert(m.def.capturable, 'Không thể thu phục quái này');
        assert(Math.abs(m.x - s.ent.x) < 260, 'Mục tiêu quá xa');
        const hpPct = m.hp / m.stats.maxHp;
        assert(hpPct <= 0.3, 'Hãy đánh mục tiêu xuống dưới 30% sinh lực');
        const count = await q1<{ n: number }>('SELECT count(*)::int AS n FROM pets WHERE owner_id = $1', [s.charId]);
        assert((count?.n ?? 0) < 12, 'Đã có tối đa 12 linh thú');
        const chance = Math.min(0.95, u.power * (1.2 - hpPct) * (m.def.rank === 'rare' ? 0.5 : 1));
        const ok = Math.random() < chance;
        if (ok) {
          const quality = weightedQuality(m.def.rank === 'rare' ? 2 : 0);
          const pet = PETS[m.def.capturable];
          await c.query('INSERT INTO pets(owner_id, template_id, name, quality, skills) VALUES ($1,$2,$3,$4,$5)', [s.charId, pet.id, pet.name, quality, JSON.stringify(pet.skills)]);
          effect = () => { s.ent.inst.monsters.get(m.id) && (m.noRespawn ? s.ent.inst.monsters.delete(m.id) : s.ent.inst.kill(m, null)); s.notify(`Thu phục thành công ${pet.name} (phẩm chất ${quality})!`, 'good'); questEvent(s, 'capture', pet.id, 1); };
        } else effect = () => s.notify('Thu phục thất bại!', 'warn');
        break;
      }
      case 'pet_food': {
        const petId = int(p, 'pet', 1);
        const pet = (await c.query('SELECT id FROM pets WHERE id = $1 AND owner_id = $2 FOR UPDATE', [petId, s.charId])).rows[0];
        assert(pet, 'Không tìm thấy linh thú');
        await addPetExp(c, s, pet.id, u.exp);
        break;
      }
      case 'hatch': {
        const pet = PETS[u.pet];
        await c.query('INSERT INTO pets(owner_id, template_id, name, quality, skills) VALUES ($1,$2,$3,$4,$5)', [s.charId, pet.id, pet.name, weightedQuality(1), JSON.stringify(pet.skills)]);
        effect = () => s.notify(`Trứng nở ra ${pet.name}!`, 'good');
        break;
      }
      case 'permanent_stat': {
        const st = (await c.query('SELECT bonus, uses FROM character_stats WHERE character_id = $1 FOR UPDATE', [s.charId])).rows[0];
        const uses = st.uses ?? {}; const used = uses[d.id] ?? 0;
        assert(used < u.maxUses, `Đã dùng tối đa ${u.maxUses} viên`);
        uses[d.id] = used + 1;
        const bonus = st.bonus ?? {};
        for (const [k, v] of Object.entries(u.stats)) bonus[k] = (bonus[k] ?? 0) + (v as number);
        await c.query('UPDATE character_stats SET bonus = $2, uses = $3 WHERE character_id = $1', [s.charId, JSON.stringify(bonus), JSON.stringify(uses)]);
        effect = () => { s.permanent = bonus; s.recomputeStats(); s.pushStats(); };
        break;
      }
      case 'currency': await changeCurrency(c, s.charId, u.currency, u.amount, 'item_open', 'item', d.id); break;
    }
    await consumeTemplateById(c, row);
    if (d.cooldown) s.itemCds.set(cdKey, now + d.cooldown * 1000);
    return { ok: true, used: d.id };
  });
  (effect as (() => void) | null)?.();
  return res;
});
function weightedQuality(boost: number): number {
  const r = Math.random();
  const base = r < 0.45 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : r < 0.97 ? 3 : r < 0.995 ? 4 : 5;
  return Math.min(5, base + (Math.random() < 0.3 ? boost : 0));
}
async function consumeTemplateById(c: Tx, row: ItemRow): Promise<void> {
  if (row.quantity > 1) await c.query('UPDATE item_instances SET quantity = quantity - 1, version = version + 1 WHERE id = $1', [row.id]);
  else await c.query('DELETE FROM item_instances WHERE id = $1', [row.id]);
  await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity) VALUES ($1,$2,$3,$4,1)', [row.id, row.template_id, row.owner_id, 'use']);
}
export async function addPetExp(c: Tx, s: PlayerSession, petId: number, exp: number): Promise<void> {
  const pet = (await c.query('SELECT * FROM pets WHERE id = $1 FOR UPDATE', [petId])).rows[0];
  if (!pet) return;
  let { level, exp: e } = pet as { level: number; exp: number };
  e += exp;
  const cap = Math.min(200, (s.realmIdx + 1) * 10);
  while (level < cap && e >= petExpRequired(level)) { e -= petExpRequired(level); level++; }
  if (level >= cap) e = Math.min(e, petExpRequired(level));
  await c.query('UPDATE pets SET level = $2, exp = $3 WHERE id = $1', [petId, level, e]);
  if (level > pet.level) { s.notify(`${pet.name} lên cấp ${level}!`, 'good'); if (s.summonedPetId === petId) s.world.spawnOwnedPet(s).catch(() => undefined); }
}

rpc('inv.equip', async (s, p) => {
  const id = uuid(p, 'id');
  notTradeLocked(s, id);
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const d = def(row.template_id);
    assert(d.slot, 'Không thể trang bị');
    assert(s.realmIdx >= d.reqRealm, `Cần cảnh giới ${d.reqRealm}`);
    const slotIdx = EQUIP_SLOTS.indexOf(d.slot);
    const cur = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'equip' AND slot = $2 FOR UPDATE", [s.charId, slotIdx])).rows[0] as ItemRow | undefined;
    const bagSlot = row.slot;
    // tháo món cũ trước để không vi phạm ràng buộc duy nhất của ô trang bị
    if (cur) await c.query("UPDATE item_instances SET container = 'escrow', slot = NULL WHERE id = $1", [cur.id]);
    await c.query("UPDATE item_instances SET container = 'equip', slot = $2, bound = bound OR $3, version = version + 1 WHERE id = $1", [row.id, slotIdx, d.rarity >= 3]);
    if (cur) await c.query("UPDATE item_instances SET container = 'bag', slot = $2 WHERE id = $1", [cur.id, bagSlot]);
    await s.reloadEquipment(c);
    return { ok: true };
  }, () => { s.pushStats(); s.known.clear(); });
});
rpc('inv.unequip', async (s, p) => {
  const slot = str(p, 'slot', 20) as EquipSlot;
  const idx = EQUIP_SLOTS.indexOf(slot);
  assert(idx >= 0, 'Ô trang bị không hợp lệ');
  return mutate(s, async (c) => {
    const cur = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'equip' AND slot = $2 FOR UPDATE", [s.charId, idx])).rows[0] as ItemRow | undefined;
    assert(cur, 'Ô trống');
    await c.query("UPDATE item_instances SET container = 'escrow', slot = NULL WHERE id = $1", [cur.id]);
    await placeIntoBag(c, { ...cur, container: 'escrow' }, s.charId);
    await s.reloadEquipment(c);
    return { ok: true };
  }, () => { s.pushStats(); s.known.clear(); });
});
rpc('inv.move', async (s, p) => {
  const id = uuid(p, 'id');
  const to = int(p, 'to', 0, LIMITS.bagSlots - 1);
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const other = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'bag' AND slot = $2 FOR UPDATE", [s.charId, to])).rows[0] as ItemRow | undefined;
    if (other && other.id !== row.id) {
      const d = def(row.template_id);
      if (d.stackable && other.template_id === row.template_id && other.bound === row.bound && other.quantity + row.quantity <= d.maxStack) {
        await c.query('UPDATE item_instances SET quantity = quantity + $2 WHERE id = $1', [other.id, row.quantity]);
        await c.query('DELETE FROM item_instances WHERE id = $1', [row.id]);
        return { ok: true };
      }
      await c.query('UPDATE item_instances SET slot = $2 WHERE id = $1', [other.id, row.slot]);
    }
    await c.query('UPDATE item_instances SET slot = $2 WHERE id = $1', [row.id, to]);
    return { ok: true };
  });
});
rpc('inv.sort', async (s) => mutate(s, async (c) => {
  const rows = await bagItems(c, s.charId);
  rows.sort((a, b) => { const da = ITEMS[a.template_id], db = ITEMS[b.template_id]; return da.type.localeCompare(db.type) || db.rarity - da.rarity || a.template_id.localeCompare(b.template_id); });
  // gộp chồng
  const merged: ItemRow[] = [];
  for (const r of rows) {
    const d = ITEMS[r.template_id];
    const last = merged[merged.length - 1];
    if (last && d.stackable && last.template_id === r.template_id && last.bound === r.bound && !last.locked && !r.locked && last.quantity + r.quantity <= d.maxStack && !s.tradeLocked.has(r.id) && !s.tradeLocked.has(last.id)) {
      last.quantity += r.quantity;
      await c.query('UPDATE item_instances SET quantity = $2 WHERE id = $1', [last.id, last.quantity]);
      await c.query('DELETE FROM item_instances WHERE id = $1', [r.id]);
    } else merged.push(r);
  }
  await c.query("UPDATE item_instances SET slot = slot + 10000 WHERE owner_id = $1 AND container = 'bag'", [s.charId]);
  for (let i = 0; i < merged.length; i++) await c.query('UPDATE item_instances SET slot = $2 WHERE id = $1', [merged[i].id, i]);
  return { ok: true };
}));
rpc('inv.lock', async (s, p) => {
  const id = uuid(p, 'id');
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id, ['bag', 'equip', 'storage']);
    await c.query('UPDATE item_instances SET locked = NOT locked WHERE id = $1', [row.id]);
    return { ok: true, locked: !row.locked };
  });
});
rpc('inv.destroy', async (s, p) => {
  const id = uuid(p, 'id');
  const qty = optInt(p, 'qty', 1);
  notTradeLocked(s, id);
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    assert(!row.locked, 'Vật phẩm đang khóa');
    const n = qty ?? row.quantity;
    assert(n <= row.quantity, 'Số lượng không hợp lệ');
    if (n === row.quantity) await c.query('DELETE FROM item_instances WHERE id = $1', [row.id]); else await c.query('UPDATE item_instances SET quantity = quantity - $2 WHERE id = $1', [row.id, n]);
    await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity) VALUES ($1,$2,$3,$4,$5)', [row.id, row.template_id, s.charId, 'destroy', n]);
    return { ok: true };
  });
});
rpc('inv.toStorage', async (s, p) => {
  requireService(s, 'storage');
  const id = uuid(p, 'id');
  notTradeLocked(s, id);
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const { capacity } = await import('../../services/items.js');
    const cap = await capacity(c, s.charId, 'storage');
    const used = new Set((await c.query("SELECT slot FROM item_instances WHERE owner_id = $1 AND container = 'storage'", [s.charId])).rows.map((r) => r.slot));
    let slot = -1; for (let i = 0; i < cap; i++) if (!used.has(i)) { slot = i; break; }
    assert(slot >= 0, 'Kho đồ đã đầy');
    await c.query("UPDATE item_instances SET container = 'storage', slot = $2 WHERE id = $1", [row.id, slot]);
    return { ok: true };
  });
});
rpc('inv.fromStorage', async (s, p) => {
  requireService(s, 'storage');
  const id = uuid(p, 'id');
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id, ['storage']);
    await placeIntoBag(c, row, s.charId);
    return { ok: true };
  });
});

// ---------- cửa hàng NPC ----------
async function shopOverride(itemId: string): Promise<{ disabled?: boolean; price?: number } | undefined> {
  const r = await q1<{ data: { disabled?: boolean; price?: number } }>("SELECT data FROM content_overrides WHERE kind = 'shop' AND ref_id = $1", [itemId]);
  return r?.data;
}
rpc('shop.buy', async (s, p) => {
  const npcId = str(p, 'npc', 60);
  const itemId = str(p, 'item', 60);
  const qty = int(p, 'qty', 1, 999);
  assert(nearNpc(s, npcId, 220), 'Quá xa cửa hàng');
  const { NPCS } = await import('@tt/shared');
  const shop = SHOPS[NPCS[npcId]?.shop ?? ''];
  assert(shop, 'NPC không bán hàng');
  const entry = shop.items.find((i) => i.item === itemId);
  assert(entry, 'Cửa hàng không bán vật phẩm này');
  const ov = await shopOverride(itemId);
  assert(!ov?.disabled, 'Vật phẩm tạm ngừng bán');
  const price = (ov?.price ?? entry.price) * qty;
  assert(Number.isSafeInteger(price), 'Giá trị quá lớn');
  return mutate(s, async (c) => {
    await changeCurrency(c, s.charId, entry.currency, -price, 'shop_buy', 'item', itemId);
    await grantItems(c, s.charId, [{ item: itemId, qty }], `shop:${shop.id}`);
    return { ok: true, price };
  });
});
rpc('shop.sell', async (s, p) => {
  const id = uuid(p, 'id');
  const qty = optInt(p, 'qty', 1);
  notTradeLocked(s, id);
  // bán được ở bất kỳ NPC có cửa hàng nào gần đó
  const { NPCS } = await import('@tt/shared');
  assert(s.ent.inst.def.npcs.some((n) => NPCS[n.npc]?.shop && Math.abs(n.x - s.ent.x) < 220), 'Cần ở gần cửa hàng');
  return mutate(s, async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const d = def(row.template_id);
    assert(!row.locked, 'Vật phẩm đang khóa');
    assert(d.type !== 'quest', 'Không thể bán vật phẩm nhiệm vụ');
    const n = qty ?? row.quantity;
    assert(n <= row.quantity, 'Số lượng không hợp lệ');
    const gold = Math.floor(d.value * n * (1 + row.enhance * 0.1));
    if (n === row.quantity) await c.query('DELETE FROM item_instances WHERE id = $1', [row.id]); else await c.query('UPDATE item_instances SET quantity = quantity - $2 WHERE id = $1', [row.id, n]);
    await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5,$6)', [row.id, row.template_id, s.charId, 'sell_npc', n, JSON.stringify({ gold })]);
    if (gold > 0) await changeCurrency(c, s.charId, 'gold', gold, 'shop_sell', 'item', row.template_id);
    return { ok: true, gold };
  });
});

// ---------- cường hóa / tinh luyện / khảm / tẩy luyện / sửa ----------
async function equipTarget(c: Tx, s: PlayerSession, id: string): Promise<ItemRow> {
  const row = await ownedInstance(c, s.charId, id, ['bag', 'equip']);
  assert(def(row.template_id).slot && !['fashion', 'mount'].includes(def(row.template_id).slot!), 'Chỉ áp dụng cho trang bị');
  return row;
}
rpc('equip.enhance', async (s, p) => {
  requireService(s, 'enhance');
  const id = uuid(p, 'id');
  notTradeLocked(s, id);
  let result = '';
  const r = await mutate(s, async (c) => {
    const row = await equipTarget(c, s, id);
    assert(row.enhance < LIMITS.maxEnhance, 'Đã đạt cấp cường hóa tối đa');
    const cost = enhanceCost(row.enhance, def(row.template_id).reqRealm);
    const stones = 1 + Math.floor(row.enhance / 3);
    await consumeTemplate(c, s.charId, 'stone_enhance', stones, 'enhance');
    await changeCurrency(c, s.charId, 'gold', -cost.gold, 'enhance', 'item', row.id);
    if (cost.stones) await changeCurrency(c, s.charId, 'spirit_stones', -cost.stones, 'enhance', 'item', row.id);
    const ok = Math.random() < enhanceSuccessRate(row.enhance);
    const next = ok ? row.enhance + 1 : row.enhance - enhanceFailPenalty(row.enhance);
    await c.query('UPDATE item_instances SET enhance = $2, version = version + 1 WHERE id = $1', [row.id, next]);
    await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,1,$5)', [row.id, row.template_id, s.charId, 'enhance', JSON.stringify({ from: row.enhance, to: next, ok })]);
    if (row.container === 'equip') await s.reloadEquipment(c);
    result = ok ? `Cường hóa thành công! +${next}` : next < row.enhance ? `Cường hóa thất bại, tụt xuống +${next}` : 'Cường hóa thất bại';
    return { ok, level: next };
  }, () => s.pushStats());
  s.notify(result, r.ok ? 'good' : 'warn');
  return r;
});
rpc('equip.refine', async (s, p) => {
  requireService(s, 'enhance');
  const id = uuid(p, 'id');
  return mutate(s, async (c) => {
    const row = await equipTarget(c, s, id);
    assert(row.refine < LIMITS.maxRefine, 'Đã tinh luyện tối đa');
    await consumeTemplate(c, s.charId, 'stone_refine', 1 + row.refine, 'refine');
    await changeCurrency(c, s.charId, 'gold', -Math.round(500 * Math.pow(1.6, row.refine) * (1 + def(row.template_id).reqRealm)), 'refine', 'item', row.id);
    await c.query('UPDATE item_instances SET refine = refine + 1, version = version + 1 WHERE id = $1', [row.id]);
    if (row.container === 'equip') await s.reloadEquipment(c);
    return { ok: true, level: row.refine + 1 };
  }, () => s.pushStats());
});
rpc('equip.socket', async (s, p) => {
  requireService(s, 'enhance');
  const id = uuid(p, 'id');
  return mutate(s, async (c) => {
    const row = await equipTarget(c, s, id);
    assert(row.sockets < LIMITS.gemSockets, 'Đã mở tối đa lỗ khảm');
    await consumeTemplate(c, s.charId, 'stone_socket', 1, 'socket');
    await c.query('UPDATE item_instances SET sockets = sockets + 1 WHERE id = $1', [row.id]);
    return { ok: true };
  });
});
rpc('equip.gem', async (s, p) => {
  requireService(s, 'enhance');
  const id = uuid(p, 'id');
  const gemTemplate = str(p, 'gem', 60);
  const remove = p.remove === true;
  return mutate(s, async (c) => {
    const row = await equipTarget(c, s, id);
    const gems: string[] = row.gems ?? [];
    if (remove) {
      const idx = int(p, 'index', 0, 2);
      assert(gems[idx], 'Lỗ khảm trống');
      await changeCurrency(c, s.charId, 'gold', -2000 * (1 + def(row.template_id).reqRealm), 'gem_remove', 'item', row.id);
      const g = gems.splice(idx, 1)[0];
      await grantItems(c, s.charId, [{ item: g, qty: 1 }], 'gem_remove');
    } else {
      const gd = ITEMS[gemTemplate];
      assert(gd?.type === 'gem', 'Không phải ngọc');
      assert(gems.length < row.sockets, 'Không còn lỗ khảm trống — hãy mở lỗ');
      const sameStat = gems.map((g) => ITEMS[g]?.gemStat?.stat).filter((x) => x === gd.gemStat!.stat).length;
      assert(sameStat < 2, 'Tối đa 2 viên cùng thuộc tính trên một trang bị');
      await consumeTemplate(c, s.charId, gemTemplate, 1, 'gem_insert');
      gems.push(gemTemplate);
    }
    await c.query('UPDATE item_instances SET gems = $2, version = version + 1 WHERE id = $1', [row.id, JSON.stringify(gems)]);
    if (row.container === 'equip') await s.reloadEquipment(c);
    return { ok: true, gems };
  }, () => s.pushStats());
});
rpc('equip.reroll', async (s, p) => {
  requireService(s, 'enhance');
  const id = uuid(p, 'id');
  return mutate(s, async (c) => {
    const row = await equipTarget(c, s, id);
    const d = def(row.template_id);
    assert(d.rarity >= 2, 'Trang bị Hiếm trở lên mới có thuộc tính phụ');
    await consumeTemplate(c, s.charId, 'stone_reroll', 1, 'reroll');
    const aff = rollAffixes(d);
    await c.query('UPDATE item_instances SET affixes = $2, version = version + 1 WHERE id = $1', [row.id, JSON.stringify(aff)]);
    if (row.container === 'equip') await s.reloadEquipment(c);
    return { ok: true, affixes: aff };
  }, () => s.pushStats());
});
rpc('equip.repair', async (s) => {
  requireService(s, 'enhance');
  return mutate(s, async (c) => {
    const rows = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container IN ('equip','bag') AND durability IS NOT NULL FOR UPDATE", [s.charId])).rows as ItemRow[];
    let cost = 0;
    for (const r of rows) { const max = def(r.template_id).durability ?? 100; if ((r.durability ?? max) < max) cost += Math.ceil((max - (r.durability ?? max)) * (5 + def(r.template_id).reqRealm * 8)); }
    assert(cost > 0, 'Trang bị không cần sửa');
    await changeCurrency(c, s.charId, 'gold', -cost, 'repair');
    for (const r of rows) await c.query('UPDATE item_instances SET durability = $2 WHERE id = $1', [r.id, def(r.template_id).durability ?? 100]);
    await s.reloadEquipment(c);
    return { ok: true, cost };
  }, () => s.pushStats());
});
export const _keep = { detach };
