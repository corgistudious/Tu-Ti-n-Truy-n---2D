import type { Currency, EquipSlot } from './constants.js';

export type StatKey =
  | 'maxHp' | 'maxMp' | 'atk' | 'matk' | 'def' | 'mdef'
  | 'crit' | 'critDmg' | 'pen' | 'res' | 'moveSpeed' | 'hpRegen' | 'mpRegen';

export type Stats = Record<StatKey, number>;
export type PartialStats = Partial<Stats>;

export type RealmStage = 'vo_dao' | 'tu_chan' | 'tien_gioi' | 'thuong_tien' | 'than' | 'hon_don' | 'thai_co' | 'van_gioi';
export type TrialKind = 'none' | 'tam_ma' | 'thien_kiep' | 'both';

export interface RealmDef {
  idx: number;
  id: string;
  name: string;
  stage: RealmStage;
  layers: number;
  /** Nguyên liệu tiêu hao khi đột phá lên cảnh giới KẾ TIẾP */
  breakthrough: {
    materials: { item: string; qty: number }[];
    gold: number;
    baseRate: number;          // 0..1
    trial: TrialKind;
    questRequired?: string;
  };
  unlockMaps: string[];
  description: string;
}

export type ItemType =
  | 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet' | 'artifact'
  | 'pill' | 'herb' | 'ore' | 'manual' | 'talisman' | 'material' | 'quest'
  | 'fashion' | 'mount' | 'pet_egg' | 'event' | 'gem' | 'seed' | 'tool' | 'furniture' | 'pet_gear';

export type UseEffect =
  | { kind: 'heal'; hp?: number; mp?: number; pct?: boolean }
  | { kind: 'tuvi'; amount: number }
  | { kind: 'buff'; buff: string; duration: number; stats: PartialStats }
  | { kind: 'learn_skill'; skill: string }
  | { kind: 'teleport'; map: string }
  | { kind: 'capture'; power: number }
  | { kind: 'pet_food'; exp: number }
  | { kind: 'hatch'; pet: string }
  | { kind: 'permanent_stat'; stats: PartialStats; maxUses: number }
  | { kind: 'cleanse' }
  | { kind: 'currency'; currency: Currency; amount: number };

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  type: ItemType;
  rarity: number;
  slot?: EquipSlot;
  stats?: PartialStats;
  reqRealm: number;        // chỉ số cảnh giới tối thiểu
  stackable: boolean;
  maxStack: number;
  value: number;           // giá bán NPC (vàng)
  tradable: boolean;
  sources: string[];
  set?: string;
  durability?: number;
  use?: UseEffect;
  cooldown?: number;
  appearance?: string;     // khóa sprite layer cho ngoại hình (vũ khí/thời trang/thú cưỡi)
  toolFor?: ProfessionId;
  toolPower?: number;
  gemStat?: { stat: StatKey; value: number };
  seed?: { herb: string; growSeconds: number; yield: [number, number] };
  furniture?: { w: number; h: number; spiritBonus?: number };
}

export type SkillPath =
  | 'kiem' | 'dao' | 'quyen' | 'the' | 'phap' | 'loi' | 'hoa' | 'bang' | 'doc' | 'phu' | 'tran' | 'ngu_thu' | 'co_ban';

export type StatusId = 'burn' | 'freeze' | 'poison' | 'stun' | 'slow' | 'shield' | 'regen' | 'mark_thunder' | 'armor_break' | 'atk_up' | 'def_up' | 'speed_up' | 'tam_ma';

export interface StatusApply {
  id: StatusId;
  duration: number;   // giây
  power?: number;     // DoT: hệ số theo sát thương nguồn; shield: hệ số maxHp; buff: phần trăm
  chance?: number;    // 0..1
  stacks?: number;    // số tầng tối đa
}

export type SkillShape =
  | { type: 'melee'; range: number; height: number }
  | { type: 'projectile'; speed: number; range: number; radius: number; pierce?: number; count?: number; spread?: number }
  | { type: 'aoe'; radius: number; offset: number; delay?: number }
  | { type: 'self' }
  | { type: 'dash'; distance: number; height: number }
  | { type: 'zone'; radius: number; offset: number; duration: number; interval: number }
  | { type: 'summon'; pet: string; duration: number };

export interface SkillDef {
  id: string;
  name: string;
  path: SkillPath;
  desc: string;
  icon: string;
  anim: 'attack' | 'cast';
  fx: string;
  scaling: 'atk' | 'matk';
  power: number;          // hệ số sát thương ở cấp 1
  powerPerLevel: number;
  hits: number;
  cost: number;           // MP
  cooldown: number;       // giây
  castTime: number;       // giây
  shape: SkillShape;
  effects: StatusApply[];
  knockback?: number;
  reqRealm: number;
  maxLevel: number;
  /** Kết hợp: tăng sát thương nếu mục tiêu đang chịu trạng thái này, có thể tiêu hao nó */
  combo?: { requires: StatusId; bonus: number; consume: boolean; extra?: StatusApply };
  heal?: number;          // hồi máu (hệ số matk)
  learnCost: { gold: number; spirit_stones: number };
}

export type MonsterRank = 'normal' | 'elite' | 'rare' | 'boss' | 'world_boss' | 'dungeon_boss' | 'guild_boss' | 'event_boss';

export interface BossPhase {
  hpBelow: number;               // phần trăm 0..1
  skills: string[];
  speedMult?: number;
  enrage?: number;               // nhân sát thương
  summon?: { monster: string; count: number };
  shieldPct?: number;            // nhận khiên khi vào giai đoạn
  announce: string;
}

export interface MonsterDef {
  id: string;
  name: string;
  sprite: string;
  rank: MonsterRank;
  level: number;
  w: number; h: number;
  hpMult: number; atkMult: number; defMult: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackCooldown: number;
  scaling: 'atk' | 'matk';
  passive?: boolean;             // không chủ động tấn công
  flying?: boolean;
  skills: string[];
  phases?: BossPhase[];
  drops: DropEntry[];
  exp: number;
  tuvi: number;
  gold: [number, number];
  respawn: number;               // giây
  capturable?: string;           // pet template id
  element?: 'hoa' | 'bang' | 'loi' | 'doc' | 'none';
  leashRange: number;
  retreatAtHp?: number;
}

export interface DropEntry { item: string; chance: number; min: number; max: number; questOnly?: string }

export interface PortalDef { id: string; x: number; y: number; to: string; toPortal: string; reqRealm?: number; reqQuest?: string }
export interface SpawnDef { monster: string; count: number; x1: number; x2: number }
export interface NodeDef { id: string; kind: 'herb' | 'ore' | 'fishing'; x: number; y: number; table: string; respawn: number }
export interface MapNpcDef { npc: string; x: number; y: number; nightX?: number }
export interface InteractDef { id: string; x: number; y: number; name: string; quest: string; objective: string }

export type WorldTierId = 'pham_nhan' | 'vo_dao' | 'tu_chan' | 'linh_gioi' | 'tien_gioi' | 'thuong_tien' | 'than_vuc' | 'hon_don' | 'thai_co' | 'van_gioi' | 'special';

export interface WorldTierDef {
  id: WorldTierId;
  name: string;
  order: number;
  minRealm: number;         // cảnh giới tối thiểu để chịu được linh khí tầng thế giới này (giới hạn cứng)
  desc: string;
  continents: { id: string; name: string; regions: { id: string; name: string }[] }[];
  hub: string;              // thành chính / điểm hồi sinh mặc định
}

export interface MapDef {
  id: string;
  name: string;
  world: 'nhan_gioi' | 'tu_chan_gioi' | 'tien_gioi' | 'special';
  tier: WorldTierId;
  continent: string;
  region: string;
  danger: number;           // 1..10 — mức nguy hiểm hiển thị
  minRealm: number;         // giới hạn cứng (theo tầng thế giới); reqRealm chỉ là KHUYẾN NGHỊ
  hidden?: boolean;         // khu vực ẩn — chỉ vào được khi đã khám phá (cơ duyên)
  coords: { x: number; y: number }; // vị trí trên bản đồ thế giới
  theme: string;
  width: number;   // ô
  height: number;  // ô
  seed: number;
  terrain: 'plains' | 'hills' | 'mountain' | 'city' | 'cave' | 'sky' | 'arena' | 'sea';
  platforms: number;
  reqRealm: number;         // cảnh giới khuyến nghị (vào sớm hơn được cảnh báo nguy hiểm)
  reqQuest?: string;
  safe: boolean;
  pvp: 'none' | 'open' | 'arena';
  bgm: string;
  weather: 'clear' | 'rain' | 'snow' | 'mist' | 'ash' | 'petals' | 'storm';
  dayNight: boolean;
  spiritDensity: number;  // nhân hệ số tu luyện khi đả tọa
  instance?: 'dungeon' | 'trial' | 'housing' | 'arena' | 'guild';
  spawnX: number;
  portals: PortalDef[];
  npcs: MapNpcDef[];
  spawns: SpawnDef[];
  nodes: NodeDef[];
  interacts: InteractDef[];
  channels: number;
  description: string;
}

export interface NpcDef {
  id: string;
  name: string;
  title: string;
  sprite: string;
  appearance: Appearance;
  greeting: string;
  shop?: string;
  services?: ('storage' | 'enhance' | 'craft' | 'market' | 'auction' | 'guild' | 'arena' | 'housing' | 'teleport' | 'mail' | 'breakthrough' | 'skills' | 'pets')[];
  teleports?: string[];
  faction?: string;
}

export type ObjectiveType =
  | 'talk' | 'kill' | 'collect' | 'gather' | 'reach' | 'escort' | 'interact' | 'craft' | 'realm' | 'dungeon' | 'deliver' | 'capture';

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  target: string;      // npc id / monster id / item id / map id / recipe id / realm idx / dungeon id
  count: number;
  desc: string;
  map?: string;
  x?: number;
}

export interface DialogueLine { speaker: string; text: string }

export interface QuestDef {
  id: string;
  name: string;
  kind: 'main' | 'side' | 'sect' | 'hidden' | 'daily' | 'profession';
  chapter?: number;
  category?: 'hunt' | 'gather' | 'investigate' | 'escort' | 'rescue' | 'secret_realm' | 'lost_item' | 'profession' | 'sect' | 'hidden' | 'story';
  giver: string;
  turnIn: string;
  reqRealm: number;
  prereq: string[];
  dialogue: { offer: DialogueLine[]; progress: string; complete: DialogueLine[] };
  objectives: QuestObjective[];
  rewards: { exp: number; tuvi: number; gold: number; spirit_stones?: number; items?: { item: string; qty: number }[]; skill?: string; title?: string };
  repeatable?: 'daily' | 'weekly';
  hiddenTrigger?: { map: string; x: number };
  /** Lựa chọn khi trả nhiệm vụ — hậu quả khác nhau (danh vọng thế lực / phần thưởng) */
  choices?: { id: string; text: string; rep: Record<string, number>; items?: { item: string; qty: number }[]; outcome: string }[];
}

export type ProfessionId = 'alchemy' | 'forging' | 'talisman' | 'formation' | 'mining' | 'herbalism' | 'fishing' | 'farming' | 'tailoring';

export interface RecipeDef {
  id: string;
  name: string;
  profession: ProfessionId;
  level: number;
  inputs: { item: string; qty: number }[];
  output: { item: string; qty: number };
  seconds: number;
  exp: number;
  successRate: number;
  gold: number;
  toolRequired?: boolean;
}

export interface GatherTable { id: string; profession: ProfessionId; level: number; seconds: number; exp: number; loot: { item: string; weight: number; min: number; max: number }[] }

export interface ShopDef { id: string; name: string; items: { item: string; price: number; currency: Currency; stock?: number }[] }

export interface PetDef {
  id: string; name: string; sprite: string; element: string;
  baseStats: PartialStats; growth: number; skills: string[];
  evolvesTo?: string; evolveLevel?: number; evolveItems?: { item: string; qty: number }[];
  mountable?: boolean;
}

export interface DungeonDef {
  id: string; name: string; map: string; reqRealm: number; minPlayers: number; maxPlayers: number;
  waves: { monster: string; count: number }[][]; boss: string; timeLimit: number; dailyLimit: number;
  rewards: { exp: number; tuvi: number; gold: number; items: { item: string; qty: number; chance: number }[] };
}

export interface HousingBuildingDef {
  id: string; name: string; maxLevel: number; desc: string;
  costs: { gold: number; spirit_stones: number; items: { item: string; qty: number }[] }[];
  effect: 'plots' | 'cultivation' | 'craft_speed' | 'storage' | 'pet_exp';
  perLevel: number;
}

export interface Appearance {
  gender: 'male' | 'female';
  hair: number;
  hairColor: string;
  face: number;
  eyes: number;
  skin: string;
  outfit: number;
  outfitColor: string;
}

export interface SetDef { id: string; name: string; pieces: string[]; bonuses: { count: number; stats: PartialStats }[] }

export interface WorldEventDef { id: string; name: string; desc: string; map: string; boss?: string; durationMin: number; spawns?: SpawnDef[]; expMult?: number; dropMult?: number }

export interface GameData {
  version: string;
  tiers: WorldTierDef[];
  chapters: Record<number, string>;
  power: Record<string, unknown>;
  realms: RealmDef[];
  items: Record<string, ItemDef>;
  skills: Record<string, SkillDef>;
  monsters: Record<string, MonsterDef>;
  maps: Record<string, MapDef>;
  npcs: Record<string, NpcDef>;
  quests: Record<string, QuestDef>;
  recipes: Record<string, RecipeDef>;
  gatherTables: Record<string, GatherTable>;
  shops: Record<string, ShopDef>;
  pets: Record<string, PetDef>;
  dungeons: Record<string, DungeonDef>;
  buildings: Record<string, HousingBuildingDef>;
  sets: Record<string, SetDef>;
  events: Record<string, WorldEventDef>;
}
