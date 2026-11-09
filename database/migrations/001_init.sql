-- Tu Tiên Truyện 2D — schema khởi tạo
-- Quy ước: tiền tệ dùng BIGINT có CHECK >= 0; mọi thay đổi tiền ghi vào currency_ledger;
-- vật phẩm là item_instances có owner + container; mọi thay đổi quan trọng ghi item_logs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ TÀI KHOẢN & PHIÊN ============
CREATE TABLE accounts (
  id               BIGSERIAL PRIMARY KEY,
  email            TEXT NOT NULL,
  password_hash    TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  role             TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player','support','gm','admin')),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
  ban_reason       TEXT,
  banned_until     TIMESTAMPTZ,
  muted_until      TIMESTAMPTZ,
  failed_logins    INT NOT NULL DEFAULT 0,
  locked_until     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at    TIMESTAMPTZ
);
CREATE UNIQUE INDEX accounts_email_uq ON accounts (lower(email));

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  device        TEXT,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX sessions_account_idx ON sessions (account_id) WHERE revoked_at IS NULL;

CREATE TABLE email_tokens (
  id          BIGSERIAL PRIMARY KEY,
  account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('verify','reset')),
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hộp thư đi (dev: xem qua admin; prod: worker gửi SMTP)
CREATE TABLE mail_outbox (
  id          BIGSERIAL PRIMARY KEY,
  to_email    TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_logs (
  id          BIGSERIAL PRIMARY KEY,
  account_id  BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  event       TEXT NOT NULL,
  ip          TEXT,
  meta        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX security_logs_account_idx ON security_logs (account_id, created_at DESC);

-- ============ DỮ LIỆU THAM CHIẾU (đồng bộ từ shared khi khởi động) ============
CREATE TABLE realms (
  idx         INT PRIMARY KEY,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  stage       TEXT NOT NULL,
  data        JSONB NOT NULL
);
CREATE TABLE content_overrides (
  kind        TEXT NOT NULL,            -- item | quest | boss | shop
  ref_id      TEXT NOT NULL,
  data        JSONB NOT NULL,           -- vd {"disabled":true} hoặc {"price":123}
  updated_by  BIGINT REFERENCES accounts(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, ref_id)
);

-- ============ NHÂN VẬT ============
CREATE TABLE characters (
  id               BIGSERIAL PRIMARY KEY,
  account_id       BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  gender           TEXT NOT NULL CHECK (gender IN ('male','female')),
  appearance       JSONB NOT NULL,
  realm_idx        INT NOT NULL DEFAULT 0 CHECK (realm_idx >= 0),
  layer            INT NOT NULL DEFAULT 1 CHECK (layer BETWEEN 1 AND 9),
  tu_vi            BIGINT NOT NULL DEFAULT 0 CHECK (tu_vi >= 0),
  exp              BIGINT NOT NULL DEFAULT 0 CHECK (exp >= 0),
  hp               DOUBLE PRECISION NOT NULL DEFAULT 0,
  mp               DOUBLE PRECISION NOT NULL DEFAULT 0,
  map_id           TEXT NOT NULL DEFAULT 'tan_thu_thon',
  x                DOUBLE PRECISION NOT NULL DEFAULT 192,
  y                DOUBLE PRECISION NOT NULL DEFAULT 0,
  hotbar           JSONB NOT NULL DEFAULT '[]',
  keybinds         JSONB,
  title            TEXT,
  titles           JSONB NOT NULL DEFAULT '[]',
  pvp_mode         TEXT NOT NULL DEFAULT 'peace' CHECK (pvp_mode IN ('peace','guild','all')),
  pk_points        INT NOT NULL DEFAULT 0,
  arena_rating     INT NOT NULL DEFAULT 1000,
  bt_fail_streak   INT NOT NULL DEFAULT 0,
  bt_cooldown_until TIMESTAMPTZ,
  playtime_sec     BIGINT NOT NULL DEFAULT 0,
  combat_power     BIGINT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_played_at   TIMESTAMPTZ,
  delete_requested_at TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ
);
CREATE UNIQUE INDEX characters_name_uq ON characters (lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX characters_account_idx ON characters (account_id) WHERE deleted_at IS NULL;
CREATE INDEX characters_rank_realm_idx ON characters (realm_idx DESC, layer DESC, tu_vi DESC) WHERE deleted_at IS NULL;
CREATE INDEX characters_rank_power_idx ON characters (combat_power DESC) WHERE deleted_at IS NULL;

-- chỉ số cộng thêm vĩnh viễn (đan dược tẩy tủy...), không lưu chỉ số tính toán
CREATE TABLE character_stats (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  bonus         JSONB NOT NULL DEFAULT '{}',
  uses          JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE cultivation_logs (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  from_realm    INT NOT NULL,
  to_realm      INT NOT NULL,
  success       BOOLEAN NOT NULL,
  rate          DOUBLE PRECISION NOT NULL,
  trial         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE character_skills (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id      TEXT NOT NULL,
  level         INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  PRIMARY KEY (character_id, skill_id)
);

CREATE TABLE character_currencies (
  character_id   BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  gold           BIGINT NOT NULL DEFAULT 0 CHECK (gold >= 0),
  spirit_stones  BIGINT NOT NULL DEFAULT 0 CHECK (spirit_stones >= 0),
  guild_contrib  BIGINT NOT NULL DEFAULT 0 CHECK (guild_contrib >= 0)
);

CREATE TABLE currency_ledger (
  id             BIGSERIAL PRIMARY KEY,
  character_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  currency       TEXT NOT NULL,
  delta          BIGINT NOT NULL,
  balance_after  BIGINT NOT NULL,
  reason         TEXT NOT NULL,
  ref_type       TEXT,
  ref_id         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX currency_ledger_char_idx ON currency_ledger (character_id, created_at DESC);
CREATE INDEX currency_ledger_reason_idx ON currency_ledger (reason, created_at DESC);

-- ============ VẬT PHẨM ============
CREATE TABLE item_instances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id      TEXT NOT NULL,
  owner_id         BIGINT REFERENCES characters(id) ON DELETE CASCADE,
  container        TEXT NOT NULL CHECK (container IN ('bag','storage','equip','market','auction','mail','guild','pet','housing','escrow')),
  slot             INT,
  quantity         INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  bound            BOOLEAN NOT NULL DEFAULT false,
  locked           BOOLEAN NOT NULL DEFAULT false,
  enhance          INT NOT NULL DEFAULT 0 CHECK (enhance >= 0),
  refine           INT NOT NULL DEFAULT 0 CHECK (refine >= 0),
  sockets          INT NOT NULL DEFAULT 0,
  gems             JSONB NOT NULL DEFAULT '[]',
  affixes          JSONB NOT NULL DEFAULT '[]',
  durability       INT,
  ref_id           TEXT,             -- mail_id / guild_id / pet_id / listing ...
  origin           TEXT NOT NULL,
  version          INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX item_owner_idx ON item_instances (owner_id, container);
CREATE INDEX item_ref_idx ON item_instances (container, ref_id);
-- một ô trang bị chỉ có 1 món
CREATE UNIQUE INDEX item_equip_slot_uq ON item_instances (owner_id, slot) WHERE container = 'equip';
CREATE VIEW equipment AS SELECT * FROM item_instances WHERE container = 'equip';
CREATE VIEW inventory AS SELECT * FROM item_instances WHERE container IN ('bag','storage');

CREATE TABLE item_logs (
  id               BIGSERIAL PRIMARY KEY,
  item_id          UUID,
  template_id      TEXT NOT NULL,
  character_id     BIGINT,
  action           TEXT NOT NULL,
  quantity         INT NOT NULL,
  details          JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX item_logs_char_idx ON item_logs (character_id, created_at DESC);
CREATE INDEX item_logs_item_idx ON item_logs (item_id);

-- ============ NHIỆM VỤ & NPC ============
CREATE TABLE quest_progress (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id      TEXT NOT NULL,
  state         TEXT NOT NULL CHECK (state IN ('active','done')),
  progress      JSONB NOT NULL DEFAULT '{}',
  accepted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  times_done    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, quest_id)
);
CREATE TABLE npc_states (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  npc_id        TEXT NOT NULL,
  state         JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (character_id, npc_id)
);

-- ============ NGHỀ ============
CREATE TABLE profession_levels (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  profession    TEXT NOT NULL,
  level         INT NOT NULL DEFAULT 0,
  exp           BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, profession)
);
CREATE TABLE crafting_jobs (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  recipe_id     TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finishes_at   TIMESTAMPTZ NOT NULL,
  success       BOOLEAN NOT NULL,
  claimed_at    TIMESTAMPTZ
);
CREATE INDEX crafting_jobs_char_idx ON crafting_jobs (character_id) WHERE claimed_at IS NULL;

-- ============ LINH THÚ ============
CREATE TABLE pets (
  id            BIGSERIAL PRIMARY KEY,
  owner_id      BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  template_id   TEXT NOT NULL,
  name          TEXT NOT NULL,
  level         INT NOT NULL DEFAULT 1,
  exp           BIGINT NOT NULL DEFAULT 0,
  quality       INT NOT NULL DEFAULT 0 CHECK (quality BETWEEN 0 AND 5),
  skills        JSONB NOT NULL DEFAULT '[]',
  summoned      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pets_owner_idx ON pets (owner_id);

-- ============ ĐỘNG PHỦ ============
CREATE TABLE housing (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  level         INT NOT NULL DEFAULT 1,
  name          TEXT NOT NULL,
  access        TEXT NOT NULL DEFAULT 'private' CHECK (access IN ('private','friends','guild','public')),
  buildings     JSONB NOT NULL DEFAULT '{}',
  decorations   JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE housing_plots (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  plot_idx      INT NOT NULL,
  seed_item     TEXT NOT NULL,
  planted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ready_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (character_id, plot_idx)
);

-- ============ XÃ HỘI ============
CREATE TABLE friends (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  friend_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('pending','accepted','blocked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, friend_id),
  CHECK (character_id <> friend_id)
);
CREATE TABLE parties (
  id            BIGSERIAL PRIMARY KEY,
  leader_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE party_members (
  party_id      BIGINT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, character_id)
);
CREATE TABLE guilds (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  leader_id     BIGINT NOT NULL REFERENCES characters(id),
  level         INT NOT NULL DEFAULT 1,
  exp           BIGINT NOT NULL DEFAULT 0,
  gold          BIGINT NOT NULL DEFAULT 0 CHECK (gold >= 0),
  notice        TEXT NOT NULL DEFAULT '',
  boss_last_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  disbanded_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX guilds_name_uq ON guilds (lower(name)) WHERE disbanded_at IS NULL;
CREATE TABLE guild_members (
  guild_id      BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  rank          TEXT NOT NULL CHECK (rank IN ('leader','vice','elder','member')),
  contribution  BIGINT NOT NULL DEFAULT 0,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, character_id)
);
CREATE TABLE guild_logs (
  id            BIGSERIAL PRIMARY KEY,
  guild_id      BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  character_id  BIGINT,
  action        TEXT NOT NULL,
  details       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE guild_wars (
  id            BIGSERIAL PRIMARY KEY,
  guild_a       BIGINT NOT NULL REFERENCES guilds(id),
  guild_b       BIGINT NOT NULL REFERENCES guilds(id),
  score_a       INT NOT NULL DEFAULT 0,
  score_b       INT NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at       TIMESTAMPTZ NOT NULL,
  winner        BIGINT,
  CHECK (guild_a <> guild_b)
);

-- ============ KINH TẾ ============
CREATE TABLE trades (
  id            BIGSERIAL PRIMARY KEY,
  char_a        BIGINT NOT NULL REFERENCES characters(id),
  char_b        BIGINT NOT NULL REFERENCES characters(id),
  offer_a       JSONB NOT NULL,
  offer_b       JSONB NOT NULL,
  fee_a         BIGINT NOT NULL DEFAULT 0,
  fee_b         BIGINT NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL UNIQUE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE market_listings (
  id            BIGSERIAL PRIMARY KEY,
  seller_id     BIGINT NOT NULL REFERENCES characters(id),
  item_id       UUID NOT NULL REFERENCES item_instances(id),
  template_id   TEXT NOT NULL,
  quantity      INT NOT NULL,
  price         BIGINT NOT NULL CHECK (price > 0),
  currency      TEXT NOT NULL CHECK (currency IN ('gold','spirit_stones')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','cancelled','expired')),
  buyer_id      BIGINT REFERENCES characters(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  closed_at     TIMESTAMPTZ
);
CREATE INDEX market_active_idx ON market_listings (template_id, price) WHERE status = 'active';
CREATE TABLE auctions (
  id            BIGSERIAL PRIMARY KEY,
  seller_id     BIGINT NOT NULL REFERENCES characters(id),
  item_id       UUID NOT NULL REFERENCES item_instances(id),
  template_id   TEXT NOT NULL,
  quantity      INT NOT NULL,
  currency      TEXT NOT NULL CHECK (currency IN ('gold','spirit_stones')),
  start_price   BIGINT NOT NULL CHECK (start_price > 0),
  buyout        BIGINT,
  current_bid   BIGINT,
  current_bidder BIGINT REFERENCES characters(id),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','expired','cancelled')),
  ends_at       TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at     TIMESTAMPTZ
);
CREATE INDEX auctions_active_idx ON auctions (ends_at) WHERE status = 'active';
CREATE TABLE auction_bids (
  id            BIGSERIAL PRIMARY KEY,
  auction_id    BIGINT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id     BIGINT NOT NULL REFERENCES characters(id),
  amount        BIGINT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE idempotency_keys (
  key           TEXT PRIMARY KEY,
  character_id  BIGINT,
  op            TEXT NOT NULL,
  result        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ THƯ ============
CREATE TABLE mail (
  id            BIGSERIAL PRIMARY KEY,
  to_char       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  from_name     TEXT NOT NULL,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  gold          BIGINT NOT NULL DEFAULT 0 CHECK (gold >= 0),
  spirit_stones BIGINT NOT NULL DEFAULT 0 CHECK (spirit_stones >= 0),
  claimed_at    TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX mail_to_idx ON mail (to_char) WHERE deleted_at IS NULL;

-- ============ SỰ KIỆN, XẾP HẠNG, BÁO CÁO, QUẢN TRỊ ============
CREATE TABLE events (
  id            BIGSERIAL PRIMARY KEY,
  event_key     TEXT NOT NULL,
  name          TEXT NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  created_by    BIGINT REFERENCES accounts(id),
  cancelled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE announcements (
  id            BIGSERIAL PRIMARY KEY,
  message       TEXT NOT NULL,
  created_by    BIGINT REFERENCES accounts(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ranking_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  kind          TEXT NOT NULL,
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE arena_matches (
  id            BIGSERIAL PRIMARY KEY,
  char_a        BIGINT NOT NULL REFERENCES characters(id),
  char_b        BIGINT NOT NULL REFERENCES characters(id),
  winner        BIGINT,
  rating_a_before INT NOT NULL,
  rating_b_before INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE dungeon_runs (
  id            BIGSERIAL PRIMARY KEY,
  dungeon_id    TEXT NOT NULL,
  members       JSONB NOT NULL,
  result        TEXT NOT NULL CHECK (result IN ('cleared','failed','abandoned')),
  started_at    TIMESTAMPTZ NOT NULL,
  ended_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE dungeon_entries (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  dungeon_id    TEXT NOT NULL,
  day           DATE NOT NULL,
  count         INT NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, dungeon_id, day)
);
CREATE TABLE reports (
  id            BIGSERIAL PRIMARY KEY,
  reporter_id   BIGINT NOT NULL REFERENCES characters(id),
  target_id     BIGINT NOT NULL REFERENCES characters(id),
  reason        TEXT NOT NULL,
  details       TEXT NOT NULL DEFAULT '',
  context       JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  handled_by    BIGINT REFERENCES accounts(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  handled_at    TIMESTAMPTZ
);
CREATE TABLE chat_logs (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL,
  channel       TEXT NOT NULL,
  target        TEXT,
  message       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_logs_char_idx ON chat_logs (character_id, created_at DESC);
CREATE TABLE admin_logs (
  id            BIGSERIAL PRIMARY KEY,
  admin_id      BIGINT REFERENCES accounts(id),
  action        TEXT NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  details       JSONB NOT NULL DEFAULT '{}',
  ip            TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE server_errors (
  id            BIGSERIAL PRIMARY KEY,
  source        TEXT NOT NULL,
  message       TEXT NOT NULL,
  stack         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
