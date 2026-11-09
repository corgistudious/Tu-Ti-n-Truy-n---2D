export * from './constants.js';
export * from './types.js';
export * from './formulas.js';
export * from './tilemap.js';
export * from './protocol.js';
export { REALMS, realmDef, realmName, herbForRealm, oreForRealm } from './data/realms.js';
export { ITEMS, SET_DEFS, rarityForRealm } from './data/items.js';
export { SKILLS, PLAYER_SKILL_PATHS, PATH_NAMES } from './data/skills.js';
export { MONSTERS } from './data/monsters.js';
export { MAPS, NPCS, SHOPS, PETS, DUNGEONS, BUILDINGS, HOUSING_LEVELS, GATHER_TABLES, WORLD_EVENTS, NEAREST_CITY } from './data/world.js';
export { QUESTS } from './data/quests.js';
export { RECIPES, PROFESSION_NAMES } from './data/recipes.js';
export { WORLD_TIERS, CHAPTERS, EVENT_SCHEDULE, HIDDEN_ORIGIN } from './data/worlds_ext.js';
export { ROOT_ELEMENTS, ROOT_GRADES, AWAKEN_TABLE, PHYSIQUES, MERIDIANS, FACTIONS, REP_TIERS, FORTUNES, repTier, combatLevel, combatLevelStats, isNight, npcX, type RootElement, type FortuneDef } from './data/power.js';

import { createHash } from 'node:crypto';
import type { GameData } from './types.js';
import { REALMS } from './data/realms.js';
import { ITEMS, SET_DEFS } from './data/items.js';
import { SKILLS } from './data/skills.js';
import { MONSTERS } from './data/monsters.js';
import { MAPS, NPCS, SHOPS, PETS, DUNGEONS, BUILDINGS, GATHER_TABLES, WORLD_EVENTS } from './data/world.js';
import { QUESTS } from './data/quests.js';
import { RECIPES } from './data/recipes.js';
import { WORLD_TIERS, CHAPTERS } from './data/worlds_ext.js';
import { ROOT_ELEMENTS, ROOT_GRADES, PHYSIQUES, MERIDIANS, FACTIONS, REP_TIERS } from './data/power.js';

let cached: GameData | null = null;
/** Toàn bộ dữ liệu game (nguồn duy nhất). Client tải bản này qua /api/data/bundle. */
export function gameData(): GameData {
  if (cached) return cached;
  const body = { tiers: WORLD_TIERS, chapters: CHAPTERS, power: { roots: ROOT_ELEMENTS, grades: ROOT_GRADES, physiques: PHYSIQUES, meridians: MERIDIANS, factions: FACTIONS, repTiers: REP_TIERS.map((t) => ({ ...t, min: Number.isFinite(t.min) ? t.min : -1e15 })) }, realms: REALMS, items: ITEMS, skills: SKILLS, monsters: MONSTERS, maps: MAPS, npcs: NPCS, quests: QUESTS, recipes: RECIPES, gatherTables: GATHER_TABLES, shops: SHOPS, pets: PETS, dungeons: DUNGEONS, buildings: BUILDINGS, sets: SET_DEFS, events: WORLD_EVENTS };
  const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
  cached = { version, ...body };
  return cached;
}
