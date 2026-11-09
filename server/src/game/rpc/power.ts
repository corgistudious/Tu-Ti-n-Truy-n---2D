import { FACTIONS, FORTUNES, HIDDEN_ORIGIN, MAPS, MERIDIANS, PHYSIQUES, ROOT_ELEMENTS, ROOT_GRADES, combatLevel, repTier } from '@tt/shared';
import { q, q1 } from '../../db.js';
import { assert } from '../../services/errors.js';
import { openMeridian, refineRoot, cultivationMultiplier } from '../power.js';
import { int, rpc, str } from './registry.js';

rpc('power.info', (s) => {
  const p = s.power;
  return {
    root: p.element ? { element: p.element, name: ROOT_ELEMENTS[p.element].name, grade: p.grade, gradeName: ROOT_GRADES[p.grade].name, paths: ROOT_ELEMENTS[p.element].paths, cultivation: cultivationMultiplier(s), dmg: ROOT_GRADES[p.grade].dmg } : null,
    physique: { id: p.physique, ...PHYSIQUES[p.physique] },
    meridians: MERIDIANS.map((m) => ({ ...m, open: !!(p.meridians & (1 << m.idx)) })),
    combatLevel: combatLevel(s.row.exp),
  };
});
rpc('power.meridian', (s, p) => openMeridian(s, int(p, 'idx', 0, MERIDIANS.length - 1)));
rpc('power.refineRoot', (s) => refineRoot(s));
rpc('rep.list', (s) => Object.entries(FACTIONS).map(([id, f]) => { const v = s.rep.get(id) ?? 0; const t = repTier(v); return { id, name: f.name, kind: f.kind, desc: f.desc, value: v, tier: t.name, discount: t.discount }; }));
rpc('fortune.list', async (s) => {
  const rows = await q<{ fortune_id: string; created_at: Date }>('SELECT fortune_id, max(created_at) AS created_at FROM fortune_log WHERE character_id = $1 GROUP BY fortune_id', [s.charId]);
  const got = new Map(rows.map((r) => [r.fortune_id, r.created_at]));
  // chỉ lộ cơ duyên đã gặp + gợi ý mơ hồ về số chưa gặp (không tiết lộ điều kiện)
  return { found: FORTUNES.filter((f) => got.has(f.id)).map((f) => ({ id: f.id, name: f.name, desc: f.desc, at: got.get(f.id) })), undiscovered: FORTUNES.filter((f) => !got.has(f.id)).length };
});
rpc('world.enterHidden', async (s, p) => {
  const mapId = str(p, 'map', 60);
  const m = MAPS[mapId];
  assert(m?.hidden, 'Không phải khu vực ẩn');
  assert(HIDDEN_ORIGIN[mapId] === s.ent.inst.def.id, `Lối vào nằm ở ${MAPS[HIDDEN_ORIGIN[mapId]]?.name}`);
  const d = await q1('SELECT 1 FROM map_discovery WHERE character_id = $1 AND map_id = $2', [s.charId, mapId]);
  assert(d, 'Khu vực chưa được khám phá');
  assert(Date.now() - s.lastCombatAt > 3000, 'Không thể vào khi đang chiến đấu');
  s.world.enterMapById(s, mapId, 6 * 32);
  return { ok: true };
});
