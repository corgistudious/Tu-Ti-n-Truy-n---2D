import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { db, closeDb } from './db.js';
import { log } from './log.js';
import { REALMS } from '@tt/shared';

function migrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR;
  const here = dirname(fileURLToPath(import.meta.url));
  for (const c of ['../../database/migrations', '../database/migrations', '../../../database/migrations', './database/migrations']) {
    const p = resolve(here, c);
    try { readdirSync(p); return p; } catch { /* thử tiếp */ }
  }
  throw new Error('Không tìm thấy thư mục database/migrations');
}

/** Chạy migration có kiểm soát: mỗi file chỉ chạy một lần, lưu checksum, phát hiện file đã chạy bị sửa. */
export async function migrate(): Promise<string[]> {
  const pool = db();
  const dir = migrationsDir();
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const ran: string[] = [];
  // khóa advisory để nhiều instance không chạy cùng lúc
  const c = await pool.connect();
  try {
    await c.query('SELECT pg_advisory_lock(727272)');
    await c.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    const applied = new Map((await c.query('SELECT name, checksum FROM schema_migrations')).rows.map((r) => [r.name as string, r.checksum as string]));
    for (const f of files) {
      const sql = readFileSync(join(dir, f), 'utf8');
      const sum = createHash('sha256').update(sql).digest('hex');
      if (applied.has(f)) {
        if (applied.get(f) !== sum) throw new Error(`Migration ${f} đã chạy nhưng nội dung bị thay đổi — tạo migration mới thay vì sửa file cũ`);
        continue;
      }
      await c.query('BEGIN');
      try {
        await c.query(sql);
        await c.query('INSERT INTO schema_migrations(name, checksum) VALUES ($1,$2)', [f, sum]);
        await c.query('COMMIT');
        ran.push(f);
        log.info('migration applied', { file: f });
      } catch (e) {
        await c.query('ROLLBACK');
        throw e;
      }
    }
    // đồng bộ bảng tham chiếu cảnh giới
    for (const r of REALMS) {
      await c.query('INSERT INTO realms(idx, code, name, stage, data) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (idx) DO UPDATE SET code=$2, name=$3, stage=$4, data=$5', [r.idx, r.id, r.name, r.stage, JSON.stringify(r)]);
    }
  } finally {
    await c.query('SELECT pg_advisory_unlock(727272)').catch(() => undefined);
    c.release();
  }
  return ran;
}

if (process.argv[1] && /migrate\.(ts|js)$/.test(process.argv[1])) {
  migrate().then((r) => { log.info('migrations done', { ran: r }); return closeDb(); }).catch((e) => { log.error('migration failed', { err: String(e) }); process.exit(1); });
}
