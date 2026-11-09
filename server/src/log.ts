/** Logger JSON tối giản, tự che các khóa nhạy cảm — không bao giờ ghi mật khẩu/token/khóa API ra log. */
const SENSITIVE = /pass(word)?|token|secret|authorization|api[_-]?key|cookie|hash/i;
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;
let min: number = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? 20;
export function setLogLevel(l: Level): void { min = LEVELS[l]; }

export function redact(v: unknown, depth = 0): unknown {
  if (depth > 5 || v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map((x) => redact(x, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = SENSITIVE.test(k) ? '[redacted]' : redact(val, depth + 1);
  return out;
}
function emit(level: Level, msg: string, meta?: Record<string, unknown>): void {
  if (LEVELS[level] < min) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...(meta ? (redact(meta) as object) : {}) });
  if (level === 'error' || level === 'warn') process.stderr.write(line + '\n'); else process.stdout.write(line + '\n');
}
export const log = {
  debug: (m: string, meta?: Record<string, unknown>) => emit('debug', m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit('info', m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit('warn', m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit('error', m, meta),
};
