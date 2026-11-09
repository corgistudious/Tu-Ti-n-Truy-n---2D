-- Phiên 2: hệ thống sức mạnh (linh căn, thể chất, kinh mạch), danh vọng thế lực, cơ duyên, lựa chọn nhiệm vụ
CREATE TABLE character_power (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  root_element  TEXT,
  root_grade    INT NOT NULL DEFAULT 0 CHECK (root_grade BETWEEN 0 AND 6),
  physique      TEXT NOT NULL DEFAULT 'pham_the',
  meridians     INT NOT NULL DEFAULT 0 CHECK (meridians >= 0),   -- bitmask 20 kinh mạch
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO character_power(character_id) SELECT id FROM characters ON CONFLICT DO NOTHING;
CREATE TABLE faction_reputation (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  faction       TEXT NOT NULL,
  value         INT NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, faction)
);
CREATE TABLE fortune_log (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  fortune_id    TEXT NOT NULL,
  rewards       JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX fortune_log_char_idx ON fortune_log (character_id, fortune_id, created_at DESC);
CREATE TABLE fortune_global (
  fortune_id    TEXT PRIMARY KEY,
  claimed       INT NOT NULL DEFAULT 0
);
CREATE TABLE quest_choices (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id      TEXT NOT NULL,
  choice_id     TEXT NOT NULL,
  chosen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, quest_id)
);
