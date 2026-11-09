import type { Currency } from '@tt/shared';
import type { Tx } from '../db.js';
import { GameError } from './errors.js';

const COL: Record<Currency | 'guild_contrib', string> = { gold: 'gold', spirit_stones: 'spirit_stones', guild_contrib: 'guild_contrib' };
const NAME: Record<string, string> = { gold: 'Tiền Vàng', spirit_stones: 'Linh Thạch', guild_contrib: 'Cống Hiến' };

/**
 * Thay đổi tiền tệ trong transaction. Khóa hàng (FOR UPDATE), kiểm tra không âm, ghi sổ cái.
 * Trả về số dư mới. Đây là con đường DUY NHẤT để thay đổi tiền.
 */
export async function changeCurrency(c: Tx, charId: number, currency: Currency | 'guild_contrib', delta: number, reason: string, refType?: string, refId?: string | number): Promise<number> {
  if (!Number.isFinite(delta) || !Number.isInteger(delta)) throw new GameError('Số tiền không hợp lệ');
  const col = COL[currency];
  const r = await c.query(`SELECT ${col} AS bal FROM character_currencies WHERE character_id = $1 FOR UPDATE`, [charId]);
  if (!r.rows[0]) throw new GameError('Không tìm thấy ví nhân vật');
  const bal = Number(r.rows[0].bal);
  const next = bal + delta;
  if (next < 0) throw new GameError(`Không đủ ${NAME[currency]}`, 'INSUFFICIENT_FUNDS');
  if (next > Number.MAX_SAFE_INTEGER) throw new GameError('Vượt giới hạn tiền tệ');
  if (delta === 0) return bal;
  await c.query(`UPDATE character_currencies SET ${col} = $2 WHERE character_id = $1`, [charId, next]);
  await c.query('INSERT INTO currency_ledger(character_id, currency, delta, balance_after, reason, ref_type, ref_id) VALUES ($1,$2,$3,$4,$5,$6,$7)', [charId, currency, delta, next, reason, refType ?? null, refId != null ? String(refId) : null]);
  return next;
}
export async function getWallet(c: Tx, charId: number): Promise<{ gold: number; spirit_stones: number; guild_contrib: number }> {
  const r = await c.query('SELECT gold, spirit_stones, guild_contrib FROM character_currencies WHERE character_id = $1', [charId]);
  return r.rows[0];
}
