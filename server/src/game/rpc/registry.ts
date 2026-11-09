import type { PlayerSession } from '../player.js';
import { GameError } from '../../services/errors.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;
export type Handler = (s: PlayerSession, p: Params) => Promise<unknown> | unknown;
export const handlers: Record<string, Handler> = {};
export function rpc(name: string, fn: Handler): void {
  if (handlers[name]) throw new Error('duplicate rpc ' + name);
  handlers[name] = fn;
}

// --- kiểm tra tham số ---
export function str(p: Params, k: string, max = 100): string {
  const v = p[k];
  if (typeof v !== 'string' || v.length === 0 || v.length > max) throw new GameError(`Tham số ${k} không hợp lệ`);
  return v;
}
export function optStr(p: Params, k: string, max = 100): string | undefined { return p[k] === undefined || p[k] === null ? undefined : str(p, k, max); }
export function int(p: Params, k: string, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const v = p[k];
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) throw new GameError(`Tham số ${k} không hợp lệ`);
  return v;
}
export function optInt(p: Params, k: string, min = 0, max = Number.MAX_SAFE_INTEGER): number | undefined { return p[k] === undefined || p[k] === null ? undefined : int(p, k, min, max); }
export function uuid(p: Params, k: string): string { const v = str(p, k, 36); if (!/^[0-9a-f-]{36}$/i.test(v)) throw new GameError(`Tham số ${k} không hợp lệ`); return v; }
export function oneOf<T extends string>(p: Params, k: string, list: readonly T[]): T { const v = str(p, k, 40) as T; if (!list.includes(v)) throw new GameError(`Tham số ${k} không hợp lệ`); return v; }
