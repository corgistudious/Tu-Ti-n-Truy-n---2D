import type { MonsterDef, PetDef, SkillDef, Stats, StatusId } from '@tt/shared';
import type { MapInstance } from './mapInstance.js';
import type { PlayerSession } from './player.js';

export interface StatusInst { id: StatusId; until: number; power: number; stacks: number; srcId?: string; srcAtk?: number; nextTick: number }

export interface BaseEnt {
  id: string;
  kind: 'p' | 'm' | 'pet' | 'e';
  name: string;
  x: number; y: number; vx: number; vy: number;
  w: number; h: number;
  facing: 1 | -1;
  anim: string;
  animUntil: number;
  hp: number;
  stats: Stats;
  statuses: StatusInst[];
  shield: number;
  dead: boolean;
  onGround: boolean;
  inst: MapInstance;
  lastHitBy?: string;
}

export interface PlayerEnt extends BaseEnt {
  kind: 'p';
  s: PlayerSession;
}

export type MonsterState = 'idle' | 'patrol' | 'chase' | 'windup' | 'return' | 'retreat' | 'dead';

export interface MonsterEnt extends BaseEnt {
  kind: 'm';
  def: MonsterDef;
  state: MonsterState;
  targetId?: string;
  homeX: number;
  spawnX1: number; spawnX2: number;
  cds: Record<string, number>;
  phase: number;
  threat: Map<string, number>;   // entity id người chơi -> sát thương gây ra
  respawnAt: number;
  nextThink: number;
  patrolX: number;
  windup?: { skill: SkillDef; until: number };
  retreatUntil: number;
  retreated: boolean;
  enrage: number;
  speedMult: number;
  noRespawn?: boolean;
  tag?: string;                  // 'wave' | 'trial' | 'event' | 'summon'
  ownerTrial?: number;           // charId sở hữu (tâm ma)
  diedAt?: number;
}

export interface PetEnt extends BaseEnt {
  kind: 'pet';
  ownerId: string;               // entity id người chủ
  def: PetDef;
  petId?: number;                // id DB (linh thú thật) hoặc undefined (triệu hồi tạm thời)
  expiresAt?: number;
  cds: Record<string, number>;
  targetId?: string;
  level: number;
}

export interface EscortEnt extends BaseEnt {
  kind: 'e';
  npcId: string;
  ownerChar: number;
  questId: string;
  objectiveId: string;
  destX: number;
  waitUntil: number;
}

export type CombatEnt = PlayerEnt | MonsterEnt | PetEnt | EscortEnt;

export interface DropEnt {
  id: string; item: string; qty: number; x: number; y: number;
  owners: number[] | null;       // charId được nhặt trước
  freeAt: number; expiresAt: number;
}

export interface Projectile {
  id: string; ownerId: string; skill: SkillDef; level: number;
  x: number; y: number; vx: number; vy: number; traveled: number; range: number; radius: number;
  pierce: number; hit: Set<string>; mult: number;
}

export interface PendingAoe {
  id: string; ownerId: string; skill: SkillDef; level: number; x: number; y: number; radius: number; at: number; hitsLeft: number; mult: number; fixedDamage?: number;
}
export interface Zone {
  id: string; ownerId: string; skill: SkillDef; level: number; x: number; y: number; radius: number; until: number; nextTick: number; interval: number; mult: number;
}
