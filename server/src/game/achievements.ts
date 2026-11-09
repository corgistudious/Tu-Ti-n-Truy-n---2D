import { ACHIEVEMENTS, STRONGEST_TITLES, STRONGEST_FORMULA, type AchType } from '@tt/shared';
import { q, tx } from '../db.js';
import { log } from '../log.js';
import { changeCurrency } from '../services/currency.js';
import type { PlayerSession } from './player.js';
import { world } from './world.js';

/** Bộ đếm dùng cho thành tựu và bảng Vạn Giới */
const COUNTER_OF: Partial<Record<AchType, string>> = { kill: 'kills', kill_rank: 'boss_kills', quest_main: 'main_quests', quest_any: 'quests', arena_win: 'arena_wins', pvp_kill: 'pvp_kills', fortune: 'fortunes', craft: 'crafts', dungeon: 'dungeons' };

export async function loadAchievements(s: PlayerSession): Promise<void> {
  for (const r of await q<{ achievement_id: string }>('SELECT achievement_id FROM achievement_progress WHERE character_id = $1', [s.charId])) s.achDone.add(r.achievement_id);
  for (const r of await q<{ key: string; value: number }>('SELECT key, value FROM character_counters WHERE character_id = $1', [s.charId])) s.counters.set(r.key, Number(r.value));
  const dyn = await q<{ title: string }>('SELECT title FROM dynamic_titles WHERE character_id = $1', [s.charId]);
  s.dynamicTitles = dyn.map((d) => d.title);
}
export async function flushCounters(s: PlayerSession): Promise<void> {
  for (const key of s.dirtyCounters) await q('INSERT INTO character_counters(character_id, key, value) VALUES ($1,$2,$3) ON CONFLICT (character_id, key) DO UPDATE SET value = $3', [s.charId, key, s.counters.get(key) ?? 0]);
  s.dirtyCounters.clear();
}

/**
 * Sự kiện thành tích. n = số cộng thêm; với realm/discover/meridian/guild_join/territory là giá trị tuyệt đối.
 */
export function achEvent(s: PlayerSession, type: AchType, n = 1, target?: string): void {
  const counter = COUNTER_OF[type];
  let value = n;
  if (counter && !(type === 'kill_rank' && target !== 'boss')) {
    value = (s.counters.get(counter) ?? 0) + n;
    s.counters.set(counter, value); s.dirtyCounters.add(counter);
  }
  for (const a of Object.values(ACHIEVEMENTS)) {
    if (a.type !== type || s.achDone.has(a.id)) continue;
    if (a.target && a.target !== target) continue;
    if (type === 'kill_monster' ? true : value >= a.count) complete(s, a.id).catch((e) => log.warn('achievement', { err: String(e) }));
  }
}
async function complete(s: PlayerSession, id: string): Promise<void> {
  if (s.achDone.has(id)) return;
  s.achDone.add(id);
  const a = ACHIEVEMENTS[id];
  await tx(async (c) => {
    const r = await c.query('INSERT INTO achievement_progress(character_id, achievement_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING 1', [s.charId, id]);
    if (!r.rowCount) return;
    if (a.reward?.gold) await changeCurrency(c, s.charId, 'gold', a.reward.gold, 'achievement', 'achievement', id);
    if (a.title && !s.row.titles.includes(a.title)) { s.row.titles.push(a.title); await c.query('UPDATE characters SET titles = $2 WHERE id = $1', [s.charId, JSON.stringify(s.row.titles)]); }
  });
  s.send({ t: 'ev', k: 'achievement', id, name: a.name, points: a.points, title: a.title });
  s.notify(`Thành tựu: ${a.name} (+${a.points} điểm)${a.title ? ` — danh hiệu "${a.title}"` : ''}`, 'good');
}

/** Điểm thành tựu của một nhân vật (SQL dùng cho bảng xếp hạng) */
const ACH_POINTS_SQL = `COALESCE((SELECT sum(CASE ${Object.values(ACHIEVEMENTS).map((a) => `WHEN ap.achievement_id = '${a.id.replace(/'/g, "''")}' THEN ${a.points}`).join(' ')} ELSE 0 END) FROM achievement_progress ap WHERE ap.character_id = c.id), 0)`;
const CNT = (k: string) => `COALESCE((SELECT value FROM character_counters cc WHERE cc.character_id = c.id AND cc.key = '${k}'), 0)`;
export const STRONGEST_SQL = `SELECT c.id, c.name, c.realm_idx, c.layer, c.arena_rating, c.created_at, ${CNT('boss_kills')} AS boss_kills, ${CNT('dungeons')} AS dungeons, ${ACH_POINTS_SQL} AS ach_points,
  (c.realm_idx * 1000 + c.layer * 100 + GREATEST(0, c.arena_rating - 1000) * 2 + LEAST(${CNT('boss_kills')}, 2000) * 5 + ${ACH_POINTS_SQL} * 3 + LEAST(${CNT('dungeons')}, 1000) * 10) AS score
  FROM characters c WHERE c.deleted_at IS NULL`;

/** Tính lại bảng Vạn Giới + trao/thu hồi danh hiệu cạnh tranh (chạy định kỳ). Tiêu chí công khai, không mua được. */
export async function recomputeStrongest(): Promise<{ top: unknown[]; titles: Record<string, number[]> }> {
  const all = await q<{ id: number; name: string; realm_idx: number; layer: number; arena_rating: number; created_at: Date; boss_kills: number; dungeons: number; ach_points: number; score: number }>(`${STRONGEST_SQL} ORDER BY score DESC, id ASC LIMIT 2000`);
  const holders: Record<string, { id: number; rank: number; score: number }[]> = {};
  const pick = (title: string, list: typeof all, from: number, to: number, scoreOf = (x: (typeof all)[number]) => Number(x.score)) => {
    holders[title] = list.slice(from - 1, to).map((x, i) => ({ id: x.id, rank: from + i, score: scoreOf(x) }));
  };
  for (const t of STRONGEST_TITLES) {
    if (t.scope === 'all') pick(t.id, all, t.from, t.to);
    else if (t.scope === 'tien') pick(t.id, all.filter((x) => x.realm_idx >= 19 && x.realm_idx <= 28), t.from, t.to);
    else if (t.scope === 'new') pick(t.id, all.filter((x) => Date.now() - new Date(x.created_at).getTime() < 30 * 86400_000), t.from, t.to);
    else if (t.scope === 'vo_dao_arena') pick(t.id, [...all.filter((x) => x.realm_idx <= 9 && x.arena_rating > 1000)].sort((a, b) => b.arena_rating - a.arena_rating), t.from, t.to, (x) => x.arena_rating);
  }
  await tx(async (c) => {
    await c.query('DELETE FROM dynamic_titles');
    for (const [title, list] of Object.entries(holders)) for (const h of list) await c.query('INSERT INTO dynamic_titles(title, character_id, rank, score) VALUES ($1,$2,$3,$4)', [title, h.id, h.rank, h.score]);
    await c.query('INSERT INTO ranking_snapshots(kind, data) VALUES ($1,$2)', ['strongest', JSON.stringify(all.slice(0, 100))]);
    await c.query("DELETE FROM ranking_snapshots WHERE kind = 'strongest' AND created_at < now() - interval '2 days'");
    // danh hiệu đang đeo mà đã mất -> gỡ
    const dynTitles = STRONGEST_TITLES.map((t) => t.id);
    await c.query(`UPDATE characters SET title = NULL WHERE title = ANY($1) AND NOT EXISTS (SELECT 1 FROM dynamic_titles d WHERE d.character_id = characters.id AND d.title = characters.title)`, [dynTitles]);
  });
  // cập nhật người chơi trực tuyến
  for (const s of world().sessions.values()) {
    const before = new Set(s.dynamicTitles);
    s.dynamicTitles = Object.entries(holders).filter(([, l]) => l.some((h) => h.id === s.charId)).map(([t]) => t);
    for (const t of s.dynamicTitles) if (!before.has(t)) s.notify(`Bạn giành danh hiệu "${t}"!`, 'good');
    if (s.row.title && STRONGEST_TITLES.some((t) => t.id === s.row.title) && !s.dynamicTitles.includes(s.row.title)) { s.row.title = null; s.known.clear(); }
  }
  const champ = holders['Vạn Giới Chí Tôn']?.[0];
  if (champ && champ.id !== lastChampion) { if (lastChampion) world().announce(`Ngôi Vạn Giới Chí Tôn đổi chủ: ${all[0].name}!`); lastChampion = champ.id; }
  return { top: all.slice(0, 100), titles: Object.fromEntries(Object.entries(holders).map(([k, v]) => [k, v.map((h) => h.id)])) };
}
let lastChampion = 0;
export const STRONGEST_INFO = { formula: STRONGEST_FORMULA, titles: STRONGEST_TITLES };
