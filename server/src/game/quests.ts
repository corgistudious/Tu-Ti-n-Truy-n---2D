import { MAPS, NPCS, QUESTS, TILE, groundYAt, type QuestDef, type ObjectiveType } from '@tt/shared';
import { tx, type Tx } from '../db.js';
import { changeCurrency } from '../services/currency.js';
import { consumeTemplate, countTemplate, grantItems } from '../services/items.js';
import { GameError, assert } from '../services/errors.js';
import type { PlayerSession } from './player.js';
import type { EscortEnt } from './entities.js';

export function questEvent(s: PlayerSession, type: ObjectiveType, target: string, n: number): void {
  for (const [qid, qs] of s.quests) {
    if (qs.state !== 'active') continue;
    const d = QUESTS[qid];
    if (!d) continue;
    for (const o of d.objectives) {
      if (o.type !== type) continue;
      if (o.target !== target && !(o.target === 'any' && type === 'capture')) continue;
      if (o.map && type !== 'reach' && s.ent?.inst.def.id !== o.map && type !== 'escort') continue;
      const cur = qs.progress[o.id] ?? 0;
      if (cur >= o.count) continue;
      // các mục tiêu tuần tự: phải hoàn thành mục tiêu trước (trừ kill/collect song song)
      qs.progress[o.id] = Math.min(o.count, cur + n);
      qs.dirty = true;
      s.send({ t: 'ev', k: 'quest', id: qid, o: o.id, v: qs.progress[o.id], max: o.count });
      if (qs.progress[o.id] >= o.count) s.notify(`[${d.name}] Hoàn thành: ${o.desc}`, 'good');
    }
  }
}

export function checkRealmObjectives(s: PlayerSession): void {
  for (const [qid, qs] of s.quests) {
    if (qs.state !== 'active') continue;
    for (const o of QUESTS[qid]?.objectives ?? []) {
      if (o.type === 'realm' && s.realmIdx >= Number(o.target) && (qs.progress[o.id] ?? 0) < 1) { qs.progress[o.id] = 1; qs.dirty = true; s.send({ t: 'ev', k: 'quest', id: qid, o: o.id, v: 1, max: 1 }); }
    }
  }
}

export function canAccept(s: PlayerSession, d: QuestDef): string | null {
  const st = s.quests.get(d.id);
  if (st?.state === 'active') return 'Đang làm nhiệm vụ này';
  if (st?.state === 'done' && !d.repeatable) return 'Đã hoàn thành';
  if (st?.state === 'done' && d.repeatable === 'daily' && st.completedAt && new Date(st.completedAt).toDateString() === new Date().toDateString()) return 'Hôm nay đã hoàn thành';
  if (s.realmIdx < d.reqRealm) return `Cần cảnh giới ${d.reqRealm}`;
  for (const p of d.prereq) if (s.quests.get(p)?.state !== 'done') return 'Chưa đủ điều kiện';
  const active = [...s.quests.values()].filter((x) => x.state === 'active').length;
  if (active >= 25) return 'Quá nhiều nhiệm vụ đang nhận';
  return null;
}

/** Danh sách nhiệm vụ NPC này có thể giao / đang chờ trả */
export function npcQuests(s: PlayerSession, npcId: string): { offer: string[]; progress: string[]; complete: string[] } {
  const offer: string[] = [], progress: string[] = [], complete: string[] = [];
  for (const d of Object.values(QUESTS)) {
    const st = s.quests.get(d.id);
    if (d.giver === npcId && d.kind !== 'hidden' && !canAccept(s, d)) offer.push(d.id);
    if (d.giver === npcId && d.kind === 'hidden' && d.id === 'hq_grandma_story' && !canAccept(s, d)) offer.push(d.id);
    if (st?.state === 'active' && d.turnIn === npcId) progress.push(d.id);
  }
  return { offer, progress, complete };
}

export function startEscortIfNeeded(s: PlayerSession, qid: string): void {
  const d = QUESTS[qid];
  const qs = s.quests.get(qid);
  if (!d || !qs || qs.state !== 'active') return;
  for (const o of d.objectives) {
    if (o.type !== 'escort' || (qs.progress[o.id] ?? 0) >= o.count) continue;
    const inst = s.ent.inst;
    if (inst.def.id !== o.map) continue;
    // các mục tiêu trước phải xong
    const idx = d.objectives.indexOf(o);
    if (d.objectives.slice(0, idx).some((p) => (qs.progress[p.id] ?? 0) < p.count && p.type !== 'collect')) continue;
    if ([...inst.escorts.values()].some((e) => e.ownerChar === s.charId && e.questId === qid)) continue;
    const place = MAPS[o.map!].npcs.find((n) => n.npc === o.target);
    const x = place?.x ?? s.ent.x;
    const hp = Math.round(s.stats.maxHp * 2.5);
    const e: EscortEnt = {
      id: inst.nextId('e'), kind: 'e', name: NPCS[o.target]?.name ?? 'NPC', x, y: groundYAt(inst.grid, x), vx: 0, vy: 0, w: 26, h: 58, facing: -1, anim: 'idle', animUntil: 0,
      hp, stats: { ...s.stats, maxHp: hp, def: s.stats.def, mdef: s.stats.mdef }, statuses: [], shield: 0, dead: false, onGround: true, inst,
      npcId: o.target, ownerChar: s.charId, questId: qid, objectiveId: o.id, destX: o.x ?? 12 * TILE, waitUntil: inst.now + 1500,
    };
    inst.addEscort(e);
    s.notify(`${e.name} đang đi theo bạn. Bảo vệ người đó đến nơi an toàn!`, 'info');
  }
}

export function accept(s: PlayerSession, qid: string): void {
  const d = QUESTS[qid];
  assert(d, 'Nhiệm vụ không tồn tại');
  if (d.kind !== 'hidden') {
    // phải ở gần NPC giao nhiệm vụ
    assert(nearNpc(s, d.giver), 'Hãy đến gần NPC giao nhiệm vụ');
  }
  const why = canAccept(s, d);
  if (why) throw new GameError(why);
  const prev = s.quests.get(qid);
  s.quests.set(qid, { state: 'active', progress: {}, times: prev?.times ?? 0, completedAt: null, dirty: true });
  // mục tiêu đã thỏa sẵn
  for (const o of d.objectives) {
    if (o.type === 'realm' && s.realmIdx >= Number(o.target)) s.quests.get(qid)!.progress[o.id] = 1;
    if (o.type === 'reach' && s.ent.inst.def.id === o.target) s.quests.get(qid)!.progress[o.id] = 1;
  }
  s.send({ t: 'ev', k: 'questAccepted', id: qid });
  startEscortIfNeeded(s, qid);
}

export function nearNpc(s: PlayerSession, npcId: string, range = 160): boolean {
  const inst = s.ent.inst;
  const place = inst.def.npcs.find((n) => n.npc === npcId);
  if (!place) return false;
  return Math.abs(place.x - s.ent.x) <= range;
}

/** Tiến độ hiển thị (gồm đếm vật phẩm thu thập trong túi) */
export async function questView(s: PlayerSession, c: Tx): Promise<unknown[]> {
  const out = [];
  for (const [qid, qs] of s.quests) {
    if (qs.state !== 'active') continue;
    const d = QUESTS[qid];
    if (!d) continue;
    const objs = [];
    for (const o of d.objectives) {
      let v = qs.progress[o.id] ?? 0;
      if (o.type === 'collect') v = Math.min(o.count, await countTemplate(c, s.charId, o.target));
      objs.push({ id: o.id, desc: o.desc, v, max: o.count, type: o.type, target: o.target, map: o.map });
    }
    out.push({ id: qid, name: d.name, kind: d.kind, chapter: d.chapter, turnIn: d.turnIn, turnInName: NPCS[d.turnIn]?.name, objectives: objs, progressText: d.dialogue.progress });
  }
  return out;
}

export async function turnIn(s: PlayerSession, qid: string): Promise<{ rewards: QuestDef['rewards'] }> {
  const d = QUESTS[qid];
  const qs = s.quests.get(qid);
  assert(d && qs && qs.state === 'active', 'Không có nhiệm vụ này');
  assert(nearNpc(s, d.turnIn), 'Hãy đến gần NPC trả nhiệm vụ');
  // talk/deliver đến NPC trả nhiệm vụ tính là hoàn thành khi trả
  for (const o of d.objectives) if ((o.type === 'talk' || o.type === 'deliver') && o.target === d.turnIn) qs.progress[o.id] = o.count;
  for (const o of d.objectives) if (o.type === 'realm' && s.realmIdx >= Number(o.target)) qs.progress[o.id] = 1;
  await tx(async (c) => {
    for (const o of d.objectives) {
      if (o.type === 'collect') {
        const have = await countTemplate(c, s.charId, o.target);
        if (have < o.count) throw new GameError(`Chưa đủ: ${o.desc} (${have}/${o.count})`);
      } else if ((qs.progress[o.id] ?? 0) < o.count) throw new GameError(`Chưa hoàn thành: ${o.desc}`);
    }
    for (const o of d.objectives) if (o.type === 'collect') await consumeTemplate(c, s.charId, o.target, o.count, `quest:${qid}`);
    const r = d.rewards;
    if (r.gold) await changeCurrency(c, s.charId, 'gold', r.gold, 'quest_reward', 'quest', qid);
    if (r.spirit_stones) await changeCurrency(c, s.charId, 'spirit_stones', r.spirit_stones, 'quest_reward', 'quest', qid);
    if (r.items?.length) await grantItems(c, s.charId, r.items.map((i) => ({ item: i.item, qty: i.qty, bound: true })), `quest:${qid}`);
    if (r.title && !s.row.titles.includes(r.title)) { s.row.titles.push(r.title); await c.query('UPDATE characters SET titles = $2 WHERE id = $1', [s.charId, JSON.stringify(s.row.titles)]); }
    qs.state = 'done'; qs.completedAt = new Date(); qs.times += 1; qs.dirty = true;
    await s.flushQuests(c);
  }).catch((e) => { if (qs.state === 'done') { qs.state = 'active'; qs.times -= 1; } throw e; });
  s.addTuVi(d.rewards.tuvi + d.rewards.exp * 0.5, 'quest');
  s.addExp(d.rewards.exp);
  if (d.rewards.title) s.notify(`Nhận danh hiệu: ${d.rewards.title}`, 'good');
  // nhiệm vụ cho phép gọi sự kiện "talk" của các nhiệm vụ khác
  questEvent(s, 'talk', d.turnIn, 1);
  return { rewards: d.rewards };
}
