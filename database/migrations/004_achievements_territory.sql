-- Phiên 2: thành tựu, bộ đếm thành tích, danh hiệu cạnh tranh, liên minh & lãnh thổ tông môn
CREATE TABLE achievement_progress (
  character_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, achievement_id)
);
CREATE TABLE character_counters (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,
  value         BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, key)
);
CREATE INDEX character_counters_key_idx ON character_counters (key, value DESC);
CREATE TABLE dynamic_titles (
  title         TEXT NOT NULL,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  rank          INT NOT NULL,
  score         BIGINT NOT NULL,
  awarded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (title, character_id)
);
CREATE TABLE guild_alliances (
  guild_a       BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  guild_b       BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_a, guild_b),
  CHECK (guild_a < guild_b)
);
CREATE TABLE territories (
  map_id        TEXT PRIMARY KEY,
  guild_id      BIGINT REFERENCES guilds(id) ON DELETE SET NULL,
  captured_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
