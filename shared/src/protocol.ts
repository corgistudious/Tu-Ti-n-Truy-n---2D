/**
 * Giao thức WebSocket (JSON). Mỗi tin nhắn có trường `t` (type).
 * - Thời gian thực: input, atk, skill, dodge (không phản hồi, server phát snapshot/sự kiện)
 * - RPC: { t:'rpc', id, m, p } -> { t:'res', id, ok, d?, e? }
 * Server luôn là nguồn xác thực: client chỉ gửi Ý ĐỊNH, không gửi kết quả.
 */
export interface ClientInput { t: 'input'; seq: number; x: number; y: number; vx: number; vy: number; f: 1 | -1; g: boolean; a: string }
export interface ClientAttack { t: 'atk'; seq: number }
export interface ClientSkill { t: 'skill'; seq: number; s: string; tx?: number }
export interface ClientDodge { t: 'dodge'; seq: number }
export interface ClientRpc { t: 'rpc'; id: number; m: string; p?: Record<string, unknown> }
export interface ClientAuth { t: 'auth'; token: string; characterId: number; resume?: boolean }
export interface ClientPing { t: 'ping'; c: number }
export type ClientMessage = ClientInput | ClientAttack | ClientSkill | ClientDodge | ClientRpc | ClientAuth | ClientPing;

/** Thực thể trong snapshot (khóa ngắn để giảm băng thông) */
export interface NetEntity {
  i: string;        // id
  k: 'p' | 'm' | 'n' | 'd' | 'j' | 'e' | 'pet' | 'node' | 'portal' | 'int';  // player, monster, npc, drop, projectile, escort, pet, node, portal, interact
  x: number; y: number;
  f?: 1 | -1;
  a?: string;       // animation
  hp?: number; mhp?: number;
  n?: string;       // name
  s?: string;       // sprite/template
  ap?: unknown;     // appearance
  st?: string[];    // status ids
  lv?: string;      // realm label
  g?: string;       // guild
  r?: number;       // rarity / rank
  vx?: number;
}
export interface ServerSnapshot { t: 'snap'; tick: number; e: NetEntity[]; gone: string[]; ack?: number }

export const RPC_METHODS = [
  'npc.talk', 'npc.service', 'quest.accept', 'quest.turnIn', 'quest.abandon', 'quest.list',
  'inv.list', 'inv.use', 'inv.equip', 'inv.unequip', 'inv.move', 'inv.destroy', 'inv.lock', 'inv.sort', 'inv.toStorage', 'inv.fromStorage', 'inv.pickup',
  'shop.list', 'shop.buy', 'shop.sell', 'portal.use', 'teleport.npc', 'chat.send',
  'skill.list', 'skill.learnUpgrade', 'skill.hotbar',
  'cult.meditate', 'cult.breakthrough', 'cult.info',
  'equip.enhance', 'equip.refine', 'equip.socket', 'equip.gem', 'equip.reroll', 'equip.repair',
  'craft.list', 'craft.start', 'craft.claim', 'gather.start', 'interact.use',
  'trade.request', 'trade.respond', 'trade.offer', 'trade.lock', 'trade.confirm', 'trade.cancel',
  'market.search', 'market.list', 'market.buy', 'market.cancel', 'market.mine',
  'auction.search', 'auction.create', 'auction.bid', 'auction.mine',
  'party.invite', 'party.respond', 'party.leave', 'party.kick',
  'guild.create', 'guild.info', 'guild.invite', 'guild.respond', 'guild.leave', 'guild.kick', 'guild.setRank', 'guild.deposit', 'guild.withdraw', 'guild.notice', 'guild.war', 'guild.boss', 'guild.list', 'guild.donate',
  'friend.list', 'friend.add', 'friend.respond', 'friend.remove', 'friend.block',
  'pet.list', 'pet.summon', 'pet.dismiss', 'pet.feed', 'pet.evolve', 'pet.rename', 'pet.release', 'pet.equip',
  'house.claim', 'house.enter', 'house.info', 'house.upgrade', 'house.build', 'house.plant', 'house.harvest', 'house.place', 'house.remove', 'house.access', 'house.leave',
  'duel.request', 'duel.respond', 'arena.queue', 'arena.leave', 'pvp.mode',
  'dungeon.enter', 'dungeon.leave', 'mail.list', 'mail.claim', 'mail.delete',
  'rank.get', 'report.player', 'settings.keybinds', 'char.info', 'title.set', 'respawn',
] as const;
export type RpcMethod = typeof RPC_METHODS[number];
