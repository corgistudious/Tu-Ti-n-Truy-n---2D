import { ITEMS, LIMITS, RARITIES, equipmentBaseStats, type ItemDef, type StatKey } from '@tt/shared';
import type { Tx } from '../db.js';
import { GameError, assert } from './errors.js';

export interface ItemRow {
  id: string; template_id: string; owner_id: number | null; container: string; slot: number | null; quantity: number;
  bound: boolean; locked: boolean; enhance: number; refine: number; sockets: number; gems: string[]; affixes: { stat: StatKey; value: number }[];
  durability: number | null; ref_id: string | null; origin: string;
}
export function def(templateId: string): ItemDef {
  const d = ITEMS[templateId];
  if (!d) throw new GameError(`Vật phẩm không tồn tại: ${templateId}`);
  return d;
}

const AFFIX_POOL: StatKey[] = ['atk', 'matk', 'maxHp', 'def', 'mdef', 'crit', 'critDmg', 'pen', 'res'];
/** Thuộc tính phụ ngẫu nhiên cho trang bị (Hiếm trở lên) */
export function rollAffixes(d: ItemDef, rng: () => number = Math.random): { stat: StatKey; value: number }[] {
  if (!d.slot || d.rarity < 2 || ['fashion', 'mount'].includes(d.slot)) return [];
  const n = Math.min(4, d.rarity - 1);
  const ref = equipmentBaseStats('armor', d.reqRealm, d.rarity);
  const refAtk = equipmentBaseStats('weapon', d.reqRealm, d.rarity);
  const out: { stat: StatKey; value: number }[] = [];
  const pool = [...AFFIX_POOL];
  for (let i = 0; i < n && pool.length; i++) {
    const stat = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const roll = 0.08 + rng() * 0.14;
    let value: number;
    switch (stat) {
      case 'atk': case 'matk': value = Math.max(1, Math.round((refAtk.atk ?? 1) * roll)); break;
      case 'maxHp': value = Math.max(1, Math.round((ref.maxHp ?? 10) * roll)); break;
      case 'def': case 'mdef': value = Math.max(1, Math.round((ref.def ?? 1) * roll)); break;
      case 'crit': value = Math.round(roll * 0.12 * 1000) / 1000; break;
      case 'critDmg': value = Math.round(roll * 0.6 * 100) / 100; break;
      case 'pen': value = Math.round(roll * 0.15 * 1000) / 1000; break;
      default: value = Math.round(roll * 0.1 * 1000) / 1000;
    }
    out.push({ stat, value });
  }
  return out;
}

export async function bagItems(c: Tx, charId: number, container = 'bag'): Promise<ItemRow[]> {
  return (await c.query('SELECT * FROM item_instances WHERE owner_id = $1 AND container = $2 ORDER BY slot', [charId, container])).rows;
}
export async function capacity(c: Tx, charId: number, container: 'bag' | 'storage'): Promise<number> {
  if (container === 'bag') return LIMITS.bagSlots;
  const r = await c.query("SELECT (buildings->'tang_bao_cac')::int AS lvl FROM housing WHERE character_id = $1", [charId]);
  return LIMITS.storageSlots + (Number(r.rows[0]?.lvl) || 0) * 20;
}
async function freeSlots(c: Tx, charId: number, container: 'bag' | 'storage'): Promise<number[]> {
  const cap = await capacity(c, charId, container);
  const used = new Set((await c.query('SELECT slot FROM item_instances WHERE owner_id = $1 AND container = $2', [charId, container])).rows.map((r) => r.slot as number));
  const out: number[] = [];
  for (let i = 0; i < cap; i++) if (!used.has(i)) out.push(i);
  return out;
}

export interface Grant { item: string; qty: number; bound?: boolean }
/**
 * Cấp vật phẩm vào túi trong transaction (cộng dồn trước, sau đó ô trống).
 * Nếu thiếu chỗ: ném lỗi (mặc định) — bên gọi có thể chuyển qua thư (mail) thay thế.
 */
export async function grantItems(c: Tx, charId: number, grants: Grant[], origin: string, container: 'bag' | 'storage' = 'bag'): Promise<ItemRow[]> {
  const touched: ItemRow[] = [];
  // kiểm tra trước đủ chỗ
  const free = await freeSlots(c, charId, container);
  let fi = 0;
  for (const g of grants) {
    assert(Number.isInteger(g.qty) && g.qty > 0, 'Số lượng không hợp lệ');
    const d = def(g.item);
    let remaining = g.qty;
    if (d.stackable) {
      const stacks = (await c.query('SELECT * FROM item_instances WHERE owner_id = $1 AND container = $2 AND template_id = $3 AND bound = $4 AND quantity < $5 ORDER BY slot FOR UPDATE', [charId, container, g.item, !!g.bound, d.maxStack])).rows as ItemRow[];
      for (const s of stacks) {
        if (remaining <= 0) break;
        const add = Math.min(remaining, d.maxStack - s.quantity);
        const r = await c.query('UPDATE item_instances SET quantity = quantity + $2, version = version + 1 WHERE id = $1 RETURNING *', [s.id, add]);
        touched.push(r.rows[0]);
        remaining -= add;
      }
    }
    while (remaining > 0) {
      if (fi >= free.length) throw new GameError(container === 'bag' ? 'Túi đồ đã đầy' : 'Kho đồ đã đầy', 'BAG_FULL');
      const qty = d.stackable ? Math.min(remaining, d.maxStack) : 1;
      const affixes = rollAffixes(d);
      const r = await c.query(
        'INSERT INTO item_instances(template_id, owner_id, container, slot, quantity, bound, affixes, durability, origin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [g.item, charId, container, free[fi++], qty, !!g.bound, JSON.stringify(affixes), d.durability ?? null, origin]);
      touched.push(r.rows[0]);
      await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5,$6)', [r.rows[0].id, g.item, charId, 'grant', qty, JSON.stringify({ origin })]);
      remaining -= qty;
    }
  }
  return touched;
}

/** Đếm số lượng theo mẫu trong túi */
export async function countTemplate(c: Tx, charId: number, templateId: string): Promise<number> {
  const r = await c.query("SELECT COALESCE(SUM(quantity),0)::bigint AS n FROM item_instances WHERE owner_id = $1 AND container = 'bag' AND template_id = $2", [charId, templateId]);
  return Number(r.rows[0].n);
}

/** Tiêu hao theo mẫu; ném lỗi nếu không đủ. Bỏ qua vật phẩm đang khóa giao dịch (lockedIds). */
export async function consumeTemplate(c: Tx, charId: number, templateId: string, qty: number, reason: string, excludeIds: Set<string> = new Set()): Promise<void> {
  if (qty <= 0) return;
  const rows = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'bag' AND template_id = $2 ORDER BY quantity ASC FOR UPDATE", [charId, templateId])).rows as ItemRow[];
  let remaining = qty;
  for (const r of rows) {
    if (excludeIds.has(r.id)) continue;
    if (remaining <= 0) break;
    const take = Math.min(r.quantity, remaining);
    if (take === r.quantity) await c.query('DELETE FROM item_instances WHERE id = $1', [r.id]);
    else await c.query('UPDATE item_instances SET quantity = quantity - $2, version = version + 1 WHERE id = $1', [r.id, take]);
    remaining -= take;
  }
  if (remaining > 0) throw new GameError(`Không đủ ${def(templateId).name} (thiếu ${remaining})`, 'MISSING_ITEMS');
  await c.query('INSERT INTO item_logs(template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5)', [templateId, charId, 'consume', qty, JSON.stringify({ reason })]);
}

/** Lấy (và khóa) một instance thuộc sở hữu */
export async function ownedInstance(c: Tx, charId: number, id: string, containers: string[] = ['bag']): Promise<ItemRow> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new GameError('Mã vật phẩm không hợp lệ');
  const r = await c.query('SELECT * FROM item_instances WHERE id = $1 FOR UPDATE', [id]);
  const row = r.rows[0] as ItemRow | undefined;
  if (!row || row.owner_id !== charId || !containers.includes(row.container)) throw new GameError('Không tìm thấy vật phẩm', 'NOT_FOUND');
  return row;
}

/**
 * Tách `qty` từ một instance sang container khác (giao dịch/chợ/đấu giá/thư).
 * Trả về instance đã chuyển. Kiểm tra khóa & ràng buộc.
 */
export async function detach(c: Tx, row: ItemRow, qty: number, to: { owner: number | null; container: string; refId?: string | null; slot?: number | null }, requireTradable: boolean): Promise<ItemRow> {
  assert(Number.isInteger(qty) && qty > 0 && qty <= row.quantity, 'Số lượng không hợp lệ');
  if (requireTradable) {
    assert(!row.locked, 'Vật phẩm đang khóa');
    assert(!row.bound, 'Vật phẩm đã khóa linh hồn, không thể giao dịch');
    assert(def(row.template_id).tradable, 'Vật phẩm không thể giao dịch');
  }
  if (qty === row.quantity) {
    const r = await c.query('UPDATE item_instances SET owner_id = $2, container = $3, ref_id = $4, slot = $5, version = version + 1 WHERE id = $1 RETURNING *', [row.id, to.owner, to.container, to.refId ?? null, to.slot ?? null]);
    return r.rows[0];
  }
  await c.query('UPDATE item_instances SET quantity = quantity - $2, version = version + 1 WHERE id = $1', [row.id, qty]);
  const r = await c.query(
    'INSERT INTO item_instances(template_id, owner_id, container, slot, quantity, bound, locked, enhance, refine, sockets, gems, affixes, durability, ref_id, origin) VALUES ($1,$2,$3,$4,$5,$6,false,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
    [row.template_id, to.owner, to.container, to.slot ?? null, qty, row.bound, row.enhance, row.refine, row.sockets, JSON.stringify(row.gems), JSON.stringify(row.affixes), row.durability, to.refId ?? null, `split:${row.id}`]);
  return r.rows[0];
}

/** Đặt một instance (đang ở container trung gian) vào túi của chủ mới; gộp chồng nếu có thể */
export async function placeIntoBag(c: Tx, row: ItemRow, charId: number): Promise<ItemRow> {
  const d = def(row.template_id);
  if (d.stackable) {
    const s = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'bag' AND template_id = $2 AND bound = $3 AND quantity + $4 <= $5 LIMIT 1 FOR UPDATE", [charId, row.template_id, row.bound, row.quantity, d.maxStack])).rows[0];
    if (s) {
      await c.query('DELETE FROM item_instances WHERE id = $1', [row.id]);
      const r = await c.query('UPDATE item_instances SET quantity = quantity + $2, version = version + 1 WHERE id = $1 RETURNING *', [s.id, row.quantity]);
      return r.rows[0];
    }
  }
  const free = await freeSlots(c, charId, 'bag');
  if (!free.length) throw new GameError('Túi đồ đã đầy', 'BAG_FULL');
  const r = await c.query("UPDATE item_instances SET owner_id = $2, container = 'bag', slot = $3, ref_id = NULL, version = version + 1 WHERE id = $1 RETURNING *", [row.id, charId, free[0]]);
  return r.rows[0];
}
export async function bagFreeCount(c: Tx, charId: number): Promise<number> { return (await freeSlots(c, charId, 'bag')).length; }

export function rarityName(r: number): string { return RARITIES[r]?.name ?? '?'; }
