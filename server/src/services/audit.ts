import { q } from '../db.js';
export async function securityLog(accountId: number | null, event: string, ip: string | undefined, meta: Record<string, unknown> = {}): Promise<void> {
  await q('INSERT INTO security_logs(account_id, event, ip, meta) VALUES ($1,$2,$3,$4)', [accountId, event, ip ?? null, JSON.stringify(meta)]);
}
export async function adminLog(adminId: number, action: string, targetType: string | null, targetId: string | number | null, details: Record<string, unknown>, ip?: string): Promise<void> {
  await q('INSERT INTO admin_logs(admin_id, action, target_type, target_id, details, ip) VALUES ($1,$2,$3,$4,$5,$6)', [adminId, action, targetType, targetId != null ? String(targetId) : null, JSON.stringify(details), ip ?? null]);
}
export async function serverError(source: string, err: unknown): Promise<void> {
  const e = err as Error;
  await q('INSERT INTO server_errors(source, message, stack) VALUES ($1,$2,$3)', [source, String(e?.message ?? err).slice(0, 1000), (e?.stack ?? '').slice(0, 4000)]).catch(() => undefined);
}
