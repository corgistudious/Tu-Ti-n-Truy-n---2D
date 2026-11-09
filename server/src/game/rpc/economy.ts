import { randomUUID } from 'node:crypto';
import { ITEMS, LIMITS, type Currency } from '@tt/shared';
import { q, tx, type Tx } from '../../db.js';
import { log } from '../../log.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { detach, grantItems, ownedInstance, placeIntoBag, bagFreeCount, type ItemRow } from '../../services/items.js';
import type { PlayerSession } from '../player.js';
import { world } from '../world.js';
import { requireService } from './core.js';
import { pushInventory } from './inventory.js';
import { int, oneOf, optInt, rpc, str, uuid } from './registry.js';

// ======================= THƯ (MAIL) =======================
export async function sendMail(c: Tx, to: number, fromName: string, subject: string, body: string, opts: { gold?: number; stones?: number; items?: ItemRow[] } = {}): Promise<number> {
  const m = (await c.query("INSERT INTO mail(to_char, from_name, subject, body, gold, spirit_stones, expires_at) VALUES ($1,$2,$3,$4,$5,$6, now() + ($7 || ' days')::interval) RETURNING id",
    [to, fromName, subject, body, opts.gold ?? 0, opts.stones ?? 0, String(LIMITS.mailExpireDays)])).rows[0].id as number;
  for (const it of opts.items ?? []) await c.query("UPDATE item_instances SET owner_id = $2, container = 'mail', ref_id = $3, slot = NULL WHERE id = $1", [it.id, to, String(m)]);
  const s = world().sessions.get(to);
  if (s) s.send({ t: 'ev', k: 'mail', subject });
  return m;
}
rpc('mail.list', async (s) => {
  const rows = await q('SELECT id, from_name, subject, body, gold, spirit_stones, claimed_at, read_at, created_at, expires_at FROM mail WHERE to_char = $1 AND deleted_at IS NULL AND expires_at > now() ORDER BY id DESC LIMIT 100', [s.charId]);
  const items = await q<{ ref_id: string; template_id: string; quantity: number }>("SELECT ref_id, template_id, quantity FROM item_instances WHERE owner_id = $1 AND container = 'mail'", [s.charId]);
  await q('UPDATE mail SET read_at = now() WHERE to_char = $1 AND read_at IS NULL', [s.charId]);
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.ref_id === String(r.id)).map((i) => ({ t: i.template_id, q: i.quantity })) }));
});
rpc('mail.claim', async (s, p) => {
  const id = int(p, 'id', 1);
  const r = await s.enqueue(() => tx(async (c) => {
    const m = (await c.query('SELECT * FROM mail WHERE id = $1 AND to_char = $2 AND deleted_at IS NULL FOR UPDATE', [id, s.charId])).rows[0];
    assert(m, 'Không tìm thấy thư');
    assert(!m.claimed_at, 'Đã nhận rồi');
    const items = (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'mail' AND ref_id = $2 FOR UPDATE", [s.charId, String(id)])).rows as ItemRow[];
    assert(items.length <= await bagFreeCount(c, s.charId) || items.every((i) => ITEMS[i.template_id].stackable), 'Túi đồ không đủ chỗ');
    for (const it of items) await placeIntoBag(c, it, s.charId);
    if (m.gold) await changeCurrency(c, s.charId, 'gold', Number(m.gold), 'mail_claim', 'mail', id);
    if (m.spirit_stones) await changeCurrency(c, s.charId, 'spirit_stones', Number(m.spirit_stones), 'mail_claim', 'mail', id);
    await c.query('UPDATE mail SET claimed_at = now() WHERE id = $1', [id]);
    return { ok: true };
  }));
  await pushInventory(s);
  return r;
});
rpc('mail.delete', async (s, p) => {
  const id = int(p, 'id', 1);
  const has = await q("SELECT 1 FROM item_instances WHERE container = 'mail' AND ref_id = $1 AND owner_id = $2", [String(id), s.charId]);
  const m = await q<{ gold: number; spirit_stones: number; claimed_at: Date | null }>('SELECT gold, spirit_stones, claimed_at FROM mail WHERE id = $1 AND to_char = $2', [id, s.charId]);
  assert(m[0], 'Không tìm thấy thư');
  assert(!has.length && (m[0].claimed_at || (!m[0].gold && !m[0].spirit_stones)), 'Hãy nhận vật phẩm trước khi xóa');
  await q('UPDATE mail SET deleted_at = now() WHERE id = $1', [id]);
  return { ok: true };
});

// ======================= GIAO DỊCH TRỰC TIẾP =======================
interface Offer { items: { id: string; qty: number }[]; gold: number; stones: number }
interface Trade { id: string; a: number; b: number; offers: Record<number, Offer>; locked: Record<number, boolean>; confirmed: Record<number, boolean>; at: number; executing: boolean }
const trades = new Map<string, Trade>();
const tradeRequests = new Map<number, { from: number; at: number }>();

function tradeOf(s: PlayerSession): Trade { const t = s.tradeId ? trades.get(s.tradeId) : undefined; assert(t, 'Bạn không ở trong giao dịch'); return t; }
function pushTrade(t: Trade): void {
  const w = world();
  for (const cid of [t.a, t.b]) {
    const other = cid === t.a ? t.b : t.a;
    w.sessions.get(cid)?.send({ t: 'ev', k: 'trade', d: { id: t.id, with: w.sessions.get(other)?.name, mine: t.offers[cid], theirs: t.offers[other], myLock: t.locked[cid], theirLock: t.locked[other], myConfirm: t.confirmed[cid], theirConfirm: t.confirmed[other] } });
  }
}
function closeTrade(t: Trade, reason: string): void {
  trades.delete(t.id);
  for (const cid of [t.a, t.b]) {
    const s = world().sessions.get(cid);
    if (!s) continue;
    s.tradeId = null;
    for (const it of t.offers[cid].items) s.tradeLocked.delete(it.id);
    s.send({ t: 'ev', k: 'tradeEnd', reason });
  }
}
world().tradeCancelHook = (s) => { const t = s.tradeId ? trades.get(s.tradeId) : undefined; if (t) closeTrade(t, `${s.name} đã rời đi`); };

rpc('trade.request', (s, p) => {
  const t = world().byName(str(p, 'name', 30));
  assert(t && t !== s, 'Người chơi không trực tuyến');
  assert(t.ent.inst === s.ent.inst && Math.abs(t.ent.x - s.ent.x) < 400, 'Cần đứng gần người chơi kia');
  assert(!s.tradeId && !t.tradeId, 'Một bên đang giao dịch');
  assert(s.realmIdx >= 1 && t.realmIdx >= 1, 'Cần đạt Nhập Môn để giao dịch');
  tradeRequests.set(t.charId, { from: s.charId, at: Date.now() });
  t.send({ t: 'ev', k: 'tradeReq', from: s.name, fromId: s.charId });
  return { ok: true };
});
rpc('trade.respond', (s, p) => {
  const from = int(p, 'from', 1);
  const req = tradeRequests.get(s.charId);
  assert(req && req.from === from && Date.now() - req.at < 60_000, 'Lời mời đã hết hạn');
  tradeRequests.delete(s.charId);
  const other = world().sessions.get(from);
  if (!p.accept) { other?.notify(`${s.name} từ chối giao dịch`); return { ok: true }; }
  assert(other && !other.tradeId && !s.tradeId, 'Không thể giao dịch lúc này');
  const t: Trade = { id: randomUUID(), a: from, b: s.charId, offers: { [from]: { items: [], gold: 0, stones: 0 }, [s.charId]: { items: [], gold: 0, stones: 0 } }, locked: {}, confirmed: {}, at: Date.now(), executing: false };
  trades.set(t.id, t); s.tradeId = t.id; other.tradeId = t.id;
  pushTrade(t);
  return { ok: true };
});
rpc('trade.offer', async (s, p) => {
  const t = tradeOf(s);
  assert(!t.locked[s.charId], 'Đã khóa — hủy khóa bằng cách hủy giao dịch');
  const items = Array.isArray(p.items) ? p.items.slice(0, 12) : [];
  const gold = optInt(p, 'gold', 0) ?? 0;
  const stones = optInt(p, 'stones', 0) ?? 0;
  const clean: Offer['items'] = [];
  await tx(async (c) => {
    for (const it of items) {
      const id = uuid(it, 'id'); const qty = int(it, 'qty', 1, LIMITS.maxStack);
      const row = await ownedInstance(c, s.charId, id);
      assert(qty <= row.quantity, 'Số lượng vượt quá');
      assert(!row.locked && !row.bound && ITEMS[row.template_id].tradable, `${ITEMS[row.template_id].name} không thể giao dịch`);
      assert(!clean.some((x) => x.id === id), 'Trùng vật phẩm');
      clean.push({ id, qty });
    }
    const w = (await c.query('SELECT gold, spirit_stones FROM character_currencies WHERE character_id = $1', [s.charId])).rows[0];
    assert(Number(w.gold) >= gold && Number(w.spirit_stones) >= stones, 'Không đủ tiền');
  });
  t.offers[s.charId] = { items: clean, gold, stones };
  t.locked = {}; t.confirmed = {};
  for (const cid of [t.a, t.b]) { const x = world().sessions.get(cid); if (x) for (const it of t.offers[cid].items) x.tradeLocked.delete(it.id); }
  pushTrade(t);
  return { ok: true };
});
rpc('trade.lock', (s) => {
  const t = tradeOf(s);
  t.locked[s.charId] = true;
  for (const it of t.offers[s.charId].items) s.tradeLocked.add(it.id); // khóa tài sản trong giao dịch
  pushTrade(t);
  return { ok: true };
});
rpc('trade.cancel', (s) => { const t = tradeOf(s); closeTrade(t, `${s.name} đã hủy giao dịch`); return { ok: true }; });
rpc('trade.confirm', async (s) => {
  const t = tradeOf(s);
  assert(t.locked[t.a] && t.locked[t.b], 'Cả hai bên phải khóa trước khi xác nhận');
  t.confirmed[s.charId] = true;
  pushTrade(t);
  if (!(t.confirmed[t.a] && t.confirmed[t.b]) || t.executing) return { ok: true, waiting: true };
  t.executing = true;
  const A = world().sessions.get(t.a), B = world().sessions.get(t.b);
  try {
    assert(A && B, 'Một bên đã ngắt kết nối');
    assert(A.ent.inst === B.ent.inst, 'Hai bên phải ở cùng bản đồ');
    await executeTrade(t);
    closeTrade(t, 'Giao dịch thành công');
    await pushInventory(A); await pushInventory(B);
    return { ok: true, done: true };
  } catch (e) {
    closeTrade(t, `Giao dịch thất bại: ${(e as Error).message}`);
    throw e;
  }
});
async function executeTrade(t: Trade): Promise<void> {
  await tx(async (c) => {
    // idempotency: một mã giao dịch chỉ thực thi đúng một lần
    const dup = await c.query('INSERT INTO idempotency_keys(key, op) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING key', [`trade:${t.id}`, 'trade']);
    if (!dup.rowCount) throw new GameError('Giao dịch đã được xử lý');
    const [first, second] = t.a < t.b ? [t.a, t.b] : [t.b, t.a];
    await c.query('SELECT 1 FROM character_currencies WHERE character_id IN ($1,$2) ORDER BY character_id FOR UPDATE', [first, second]);
    const moved: Record<number, ItemRow[]> = { [t.a]: [], [t.b]: [] };
    for (const from of [t.a, t.b]) {
      const to = from === t.a ? t.b : t.a;
      for (const it of t.offers[from].items) {
        const row = await ownedInstance(c, from, it.id);
        const esc = await detach(c, row, it.qty, { owner: null, container: 'escrow' }, true);
        moved[to].push(esc);
        await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5,$6)', [esc.id, esc.template_id, from, 'trade_out', it.qty, JSON.stringify({ to, trade: t.id })]);
      }
    }
    const fees: Record<number, number> = { [t.a]: 0, [t.b]: 0 };
    for (const from of [t.a, t.b]) {
      const to = from === t.a ? t.b : t.a;
      const o = t.offers[from];
      for (const [cur, amt] of [['gold', o.gold], ['spirit_stones', o.stones]] as [Currency, number][]) {
        if (!amt) continue;
        const fee = Math.floor(amt * LIMITS.tradeFeeRate);
        if (cur === 'gold') fees[from] = fee;
        await changeCurrency(c, from, cur, -amt, 'trade_out', 'trade', t.id);
        await changeCurrency(c, to, cur, amt - fee, 'trade_in', 'trade', t.id);
      }
    }
    for (const to of [t.a, t.b]) for (const row of moved[to]) await placeIntoBag(c, row, to);
    await c.query('INSERT INTO trades(char_a, char_b, offer_a, offer_b, fee_a, fee_b, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6,$7)', [t.a, t.b, JSON.stringify(t.offers[t.a]), JSON.stringify(t.offers[t.b]), fees[t.a], fees[t.b], t.id]);
  });
}

// ======================= CHỢ NGƯỜI CHƠI =======================
rpc('market.list', async (s, p) => {
  requireService(s, 'market');
  const id = uuid(p, 'id');
  const qty = int(p, 'qty', 1, LIMITS.maxStack);
  const price = int(p, 'price', 1, 1e13);
  const currency = oneOf(p, 'currency', ['gold', 'spirit_stones'] as const);
  assert(!s.tradeLocked.has(id), 'Vật phẩm đang trong giao dịch');
  const r = await s.enqueue(() => tx(async (c) => {
    const active = (await c.query("SELECT count(*)::int AS n FROM market_listings WHERE seller_id = $1 AND status = 'active'", [s.charId])).rows[0].n;
    assert(active < 20, 'Tối đa 20 món đang bán');
    const row = await ownedInstance(c, s.charId, id);
    const deposit = Math.max(1, Math.floor(price * 0.01));
    if (currency === 'gold') await changeCurrency(c, s.charId, 'gold', -deposit, 'market_listing_fee');
    const esc = await detach(c, row, qty, { owner: s.charId, container: 'market' }, true);
    const l = (await c.query("INSERT INTO market_listings(seller_id, item_id, template_id, quantity, price, currency, expires_at) VALUES ($1,$2,$3,$4,$5,$6, now() + interval '48 hours') RETURNING id", [s.charId, esc.id, esc.template_id, qty, price, currency])).rows[0];
    await c.query('UPDATE item_instances SET ref_id = $2 WHERE id = $1', [esc.id, String(l.id)]);
    return { ok: true, listing: l.id };
  }));
  await pushInventory(s);
  return r;
});
rpc('market.search', async (_s, p) => {
  const term = typeof p.q === 'string' ? p.q.slice(0, 40).toLowerCase() : '';
  const type = typeof p.type === 'string' ? p.type.slice(0, 20) : '';
  const ids = Object.values(ITEMS).filter((d) => (!term || d.name.toLowerCase().includes(term) || d.id.includes(term)) && (!type || d.type === type)).map((d) => d.id);
  if (!ids.length) return [];
  return q(`SELECT l.id, l.template_id, l.quantity, l.price, l.currency, l.expires_at, c.name AS seller, i.enhance, i.refine, i.affixes, i.gems
            FROM market_listings l JOIN characters c ON c.id = l.seller_id JOIN item_instances i ON i.id = l.item_id
            WHERE l.status = 'active' AND l.expires_at > now() AND l.template_id = ANY($1) ORDER BY l.price / GREATEST(l.quantity,1) ASC LIMIT 100`, [ids]);
});
rpc('market.mine', async (s) => q("SELECT id, template_id, quantity, price, currency, status, expires_at FROM market_listings WHERE seller_id = $1 AND (status = 'active' OR closed_at > now() - interval '3 days') ORDER BY id DESC LIMIT 50", [s.charId]));
rpc('market.buy', async (s, p) => {
  requireService(s, 'market');
  const id = int(p, 'listing', 1);
  const r = await s.enqueue(() => tx(async (c) => {
    const l = (await c.query("SELECT * FROM market_listings WHERE id = $1 AND status = 'active' AND expires_at > now() FOR UPDATE", [id])).rows[0];
    assert(l, 'Món hàng không còn');
    assert(l.seller_id !== s.charId, 'Không thể mua hàng của chính mình');
    const price = Number(l.price);
    const fee = Math.floor(price * LIMITS.marketFeeRate);
    await changeCurrency(c, s.charId, l.currency, -price, 'market_buy', 'listing', id);
    await changeCurrency(c, l.seller_id, l.currency, price - fee, 'market_sale', 'listing', id);
    const item = (await c.query('SELECT * FROM item_instances WHERE id = $1 FOR UPDATE', [l.item_id])).rows[0] as ItemRow;
    assert(item && item.container === 'market', 'Dữ liệu chợ không hợp lệ');
    try { await placeIntoBag(c, item, s.charId); }
    catch { await sendMail(c, s.charId, 'Chợ', 'Vật phẩm đã mua', 'Túi đầy, vật phẩm gửi qua thư.', { items: [item] }); }
    await c.query("UPDATE market_listings SET status = 'sold', buyer_id = $2, closed_at = now() WHERE id = $1", [id, s.charId]);
    await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5,$6)', [item.id, item.template_id, s.charId, 'market_buy', item.quantity, JSON.stringify({ listing: id, seller: l.seller_id, price })]);
    return { ok: true, seller: l.seller_id, template: l.template_id, price, currency: l.currency, fee };
  }));
  world().sessions.get(r.seller)?.notify(`Đã bán ${ITEMS[r.template].name} — nhận ${(r.price - r.fee).toLocaleString('vi-VN')} ${r.currency === 'gold' ? 'vàng' : 'linh thạch'}`, 'good');
  await pushInventory(s);
  return r;
});
rpc('market.cancel', async (s, p) => {
  const id = int(p, 'listing', 1);
  const r = await s.enqueue(() => tx(async (c) => {
    const l = (await c.query("SELECT * FROM market_listings WHERE id = $1 AND seller_id = $2 AND status = 'active' FOR UPDATE", [id, s.charId])).rows[0];
    assert(l, 'Không tìm thấy');
    const item = (await c.query('SELECT * FROM item_instances WHERE id = $1 FOR UPDATE', [l.item_id])).rows[0] as ItemRow;
    try { await placeIntoBag(c, item, s.charId); } catch { await sendMail(c, s.charId, 'Chợ', 'Hủy bán', 'Vật phẩm trả lại.', { items: [item] }); }
    await c.query("UPDATE market_listings SET status = 'cancelled', closed_at = now() WHERE id = $1", [id]);
    return { ok: true };
  }));
  await pushInventory(s);
  return r;
});

// ======================= ĐẤU GIÁ =======================
rpc('auction.create', async (s, p) => {
  requireService(s, 'auction');
  const id = uuid(p, 'id');
  const qty = int(p, 'qty', 1, LIMITS.maxStack);
  const start = int(p, 'start', 1, 1e13);
  const buyout = optInt(p, 'buyout', 1, 1e14);
  const hours = int(p, 'hours', 1, 24);
  const currency = oneOf(p, 'currency', ['gold', 'spirit_stones'] as const);
  assert(!buyout || buyout > start, 'Giá mua ngay phải lớn hơn giá khởi điểm');
  assert(!s.tradeLocked.has(id), 'Vật phẩm đang trong giao dịch');
  const r = await s.enqueue(() => tx(async (c) => {
    const row = await ownedInstance(c, s.charId, id);
    const esc = await detach(c, row, qty, { owner: s.charId, container: 'auction' }, true);
    const a = (await c.query("INSERT INTO auctions(seller_id, item_id, template_id, quantity, currency, start_price, buyout, ends_at) VALUES ($1,$2,$3,$4,$5,$6,$7, now() + ($8 || ' hours')::interval) RETURNING id", [s.charId, esc.id, esc.template_id, qty, currency, start, buyout ?? null, String(hours)])).rows[0];
    await c.query('UPDATE item_instances SET ref_id = $2 WHERE id = $1', [esc.id, String(a.id)]);
    return { ok: true, auction: a.id };
  }));
  await pushInventory(s);
  return r;
});
rpc('auction.search', async (_s, p) => {
  const term = typeof p.q === 'string' ? p.q.slice(0, 40).toLowerCase() : '';
  const ids = Object.values(ITEMS).filter((d) => !term || d.name.toLowerCase().includes(term)).map((d) => d.id);
  return q(`SELECT a.id, a.template_id, a.quantity, a.currency, a.start_price, a.buyout, a.current_bid, a.ends_at, c.name AS seller, b.name AS bidder, i.enhance, i.affixes
            FROM auctions a JOIN characters c ON c.id = a.seller_id LEFT JOIN characters b ON b.id = a.current_bidder JOIN item_instances i ON i.id = a.item_id
            WHERE a.status = 'active' AND a.ends_at > now() AND a.template_id = ANY($1) ORDER BY a.ends_at ASC LIMIT 100`, [ids]);
});
rpc('auction.mine', async (s) => q("SELECT a.id, a.template_id, a.quantity, a.currency, a.start_price, a.buyout, a.current_bid, a.ends_at, a.status, (a.current_bidder = $1) AS leading FROM auctions a WHERE (a.seller_id = $1 OR a.current_bidder = $1 OR EXISTS (SELECT 1 FROM auction_bids b WHERE b.auction_id = a.id AND b.bidder_id = $1)) AND (a.status = 'active' OR a.closed_at > now() - interval '3 days') ORDER BY a.id DESC LIMIT 50", [s.charId]));
rpc('auction.bid', async (s, p) => {
  requireService(s, 'auction');
  const id = int(p, 'auction', 1);
  const amount = int(p, 'amount', 1, 1e14);
  const r = await s.enqueue(() => tx(async (c) => {
    const a = (await c.query("SELECT * FROM auctions WHERE id = $1 AND status = 'active' AND ends_at > now() FOR UPDATE", [id])).rows[0];
    assert(a, 'Phiên đấu giá đã kết thúc');
    assert(a.seller_id !== s.charId, 'Không thể đấu giá vật phẩm của mình');
    const cur = a.current_bid ? Number(a.current_bid) : 0;
    const min = cur ? Math.ceil(cur * 1.05) : Number(a.start_price);
    const isBuyout = a.buyout && amount >= Number(a.buyout);
    const pay = isBuyout ? Number(a.buyout) : amount;
    assert(pay >= min, `Giá đặt tối thiểu ${min.toLocaleString('vi-VN')}`);
    // ký quỹ: trừ tiền người đặt, hoàn tiền người đặt trước qua thư
    await changeCurrency(c, s.charId, a.currency, -pay, 'auction_bid_escrow', 'auction', id);
    if (a.current_bidder) await sendMail(c, a.current_bidder, 'Đấu Giá', 'Bị vượt giá', `Bạn bị vượt giá ở phiên #${id}. Hoàn lại tiền ký quỹ.`, a.currency === 'gold' ? { gold: cur } : { stones: cur });
    await c.query('INSERT INTO auction_bids(auction_id, bidder_id, amount) VALUES ($1,$2,$3)', [id, s.charId, pay]);
    await c.query('UPDATE auctions SET current_bid = $2, current_bidder = $3, ends_at = GREATEST(ends_at, now() + interval \'2 minutes\') WHERE id = $1', [id, pay, s.charId]);
    if (isBuyout) await closeAuction(c, id);
    return { ok: true, buyout: !!isBuyout, prev: a.current_bidder as number | null };
  }));
  if (r.prev) world().sessions.get(r.prev)?.notify(`Bạn bị vượt giá ở phiên đấu giá #${id}`, 'warn');
  await pushInventory(s);
  return r;
});
async function closeAuction(c: Tx, id: number): Promise<void> {
  const a = (await c.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [id])).rows[0];
  if (!a || a.status !== 'active') return;
  const item = (await c.query('SELECT * FROM item_instances WHERE id = $1 FOR UPDATE', [a.item_id])).rows[0] as ItemRow;
  if (a.current_bidder) {
    const price = Number(a.current_bid);
    const fee = Math.floor(price * LIMITS.auctionFeeRate);
    await sendMail(c, a.current_bidder, 'Đấu Giá', 'Thắng đấu giá', `Bạn thắng phiên #${id}.`, { items: [item] });
    await sendMail(c, a.seller_id, 'Đấu Giá', 'Đã bán đấu giá', `Phiên #${id} kết thúc. Phí ${fee}.`, a.currency === 'gold' ? { gold: price - fee } : { stones: price - fee });
    await c.query("UPDATE auctions SET status = 'sold', closed_at = now() WHERE id = $1", [id]);
  } else {
    await sendMail(c, a.seller_id, 'Đấu Giá', 'Không có người mua', `Phiên #${id} kết thúc không có ai đặt giá.`, { items: [item] });
    await c.query("UPDATE auctions SET status = 'expired', closed_at = now() WHERE id = $1", [id]);
  }
}

/** Tác vụ định kỳ: đóng đấu giá, trả hàng chợ hết hạn, hết hạn thư */
export async function economyHousekeeping(): Promise<void> {
  const ended = await q<{ id: number }>("SELECT id FROM auctions WHERE status = 'active' AND ends_at <= now() LIMIT 50");
  for (const a of ended) await tx((c) => closeAuction(c, a.id)).catch((e) => log.error('close auction', { id: a.id, err: String(e) }));
  const expired = await q<{ id: number }>("SELECT id FROM market_listings WHERE status = 'active' AND expires_at <= now() LIMIT 50");
  for (const l of expired) {
    await tx(async (c) => {
      const row = (await c.query("SELECT * FROM market_listings WHERE id = $1 AND status = 'active' FOR UPDATE", [l.id])).rows[0];
      if (!row) return;
      const item = (await c.query('SELECT * FROM item_instances WHERE id = $1', [row.item_id])).rows[0];
      await sendMail(c, row.seller_id, 'Chợ', 'Hết hạn bán', 'Món hàng không bán được, trả lại.', { items: [item] });
      await c.query("UPDATE market_listings SET status = 'expired', closed_at = now() WHERE id = $1", [l.id]);
    }).catch((e) => log.error('expire listing', { id: l.id, err: String(e) }));
  }
}
export const _e = { grantItems };
