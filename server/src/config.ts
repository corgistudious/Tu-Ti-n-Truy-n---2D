import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']).default('development'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgres://tutien:tutien_dev@127.0.0.1:5432/tutien'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  PUBLIC_URL: z.string().default('http://localhost:8080'),
  CORS_ORIGINS: z.string().default('*'),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default('Tu Tiên Truyện 2D <no-reply@localhost>'),
  SESSION_DAYS: z.coerce.number().default(30),
  REQUIRE_EMAIL_VERIFIED: z.enum(['true', 'false']).default('false'),
  CLIENT_DIR: z.string().optional(),
  ADMIN_DIR: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ASSET_API_ENABLED: z.enum(['true', 'false']).default('false'),
  REGISTER_LIMIT_PER_HOUR: z.coerce.number().default(5),
  LOGIN_LIMIT_PER_10MIN: z.coerce.number().default(20),
  WS_AUTH_LIMIT_PER_MIN: z.coerce.number().default(30),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof Env>;
let cfg: Config | null = null;
export function config(): Config {
  if (!cfg) {
    cfg = Env.parse(process.env);
    if ((cfg.NODE_ENV === 'production' || cfg.NODE_ENV === 'staging') && cfg.DATABASE_URL.includes('tutien_dev')) {
      throw new Error('DATABASE_URL mặc định (dev) không được dùng cho production/staging');
    }
  }
  return cfg;
}
export function overrideConfig(patch: Partial<Config>): void { cfg = { ...config(), ...patch }; }
