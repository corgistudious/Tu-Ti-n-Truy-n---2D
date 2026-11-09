import pg from 'pg';
import { config } from './config.js';
import { log } from './log.js';

// BIGINT -> number (tiền tệ/tu vi luôn < 2^53 nhờ giới hạn công thức)
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1700, (v) => Number(v));

let pool: pg.Pool | null = null;
export function db(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: config().DATABASE_URL, max: 20, idleTimeoutMillis: 30000 });
    pool.on('error', (e) => log.error('pg pool error', { err: e.message }));
  }
  return pool;
}
export async function closeDb(): Promise<void> { if (pool) { await pool.end(); pool = null; } }

export type Tx = pg.PoolClient;
/** Chạy trong transaction; tự rollback khi lỗi. Retry khi deadlock/serialization failure. */
export async function tx<T>(fn: (c: Tx) => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const c = await db().connect();
    try {
      await c.query('BEGIN');
      const r = await fn(c);
      await c.query('COMMIT');
      return r;
    } catch (e) {
      await c.query('ROLLBACK').catch(() => undefined);
      const code = (e as { code?: string }).code;
      if ((code === '40P01' || code === '40001') && attempt < retries) continue;
      throw e;
    } finally {
      c.release();
    }
  }
}
export async function q<T extends pg.QueryResultRow = pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const r = await db().query<T>(sql, params);
  return r.rows;
}
export async function q1<T extends pg.QueryResultRow = pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}
