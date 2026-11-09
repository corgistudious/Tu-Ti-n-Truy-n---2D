-- Phiên 2: thế giới nhiều tầng — trạng thái khám phá, sương mù bản đồ, lịch sự kiện định kỳ (idempotent)
CREATE TABLE map_discovery (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  map_id        TEXT NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visits        INT NOT NULL DEFAULT 1,
  PRIMARY KEY (character_id, map_id)
);
CREATE UNIQUE INDEX events_key_start_uq ON events (event_key, starts_at);
-- nhân vật đã có: coi như đã khám phá bản đồ đang đứng
INSERT INTO map_discovery(character_id, map_id) SELECT id, map_id FROM characters WHERE deleted_at IS NULL ON CONFLICT DO NOTHING;
