/** Tổng hợp âm thanh nguyên bản (WAV PCM 16-bit mono) — nhạc nền ngũ cung và hiệu ứng. Không dùng mẫu âm thanh bên ngoài. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { seededRng } from '@tt/shared';

const SR = 22050;
export function wav(samples: Float32Array, rate = SR): Buffer {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32000), 44 + i * 2);
  return buf;
}
export function save(path: string, s: Float32Array, rate = SR): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, wav(s, rate)); }

type Wave = 'sine' | 'tri' | 'square' | 'noise' | 'pluck';
function osc(w: Wave, ph: number, rng: () => number): number {
  switch (w) {
    case 'sine': return Math.sin(ph * 2 * Math.PI);
    case 'tri': return 4 * Math.abs((ph % 1) - 0.5) - 1;
    case 'square': return (ph % 1) < 0.5 ? 0.6 : -0.6;
    case 'noise': return rng() * 2 - 1;
    case 'pluck': return Math.sin(ph * 2 * Math.PI) * 0.7 + Math.sin(ph * 4 * Math.PI) * 0.3;
  }
}
function note(out: Float32Array, start: number, dur: number, freq: number, vol: number, w: Wave, rng: () => number, rate = SR, decay = 3): void {
  const s0 = Math.floor(start * rate), n = Math.floor(dur * rate);
  let ph = 0;
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / rate;
    const env = Math.min(1, t * 80) * Math.exp(-t * decay);
    ph += freq / rate;
    out[s0 + i] += osc(w, ph, rng) * vol * env;
  }
}
// Ngũ cung (cung, thương, giốc, chủy, vũ) — âm hưởng phương Đông
const PENTA = [0, 2, 4, 7, 9];
const hz = (semi: number) => 220 * Math.pow(2, semi / 12);

export const BGM_THEMES: Record<string, { root: number; tempo: number; lead: Wave; pad: Wave; mood: 'calm' | 'tense' | 'grand' | 'dark' }> = {
  village: { root: 0, tempo: 92, lead: 'pluck', pad: 'sine', mood: 'calm' },
  forest: { root: 2, tempo: 84, lead: 'tri', pad: 'sine', mood: 'calm' },
  mountain: { root: -3, tempo: 100, lead: 'pluck', pad: 'tri', mood: 'tense' },
  city: { root: 5, tempo: 110, lead: 'pluck', pad: 'tri', mood: 'grand' },
  cave: { root: -5, tempo: 70, lead: 'sine', pad: 'sine', mood: 'dark' },
  battle: { root: -2, tempo: 132, lead: 'square', pad: 'tri', mood: 'tense' },
  celestial: { root: 7, tempo: 76, lead: 'sine', pad: 'sine', mood: 'grand' },
  chaos: { root: -6, tempo: 118, lead: 'square', pad: 'sine', mood: 'dark' },
};
/** map bgm id -> chủ đề nhạc */
export const BGM_MAP: Record<string, string> = {
  bgm_village: 'village', bgm_forest: 'forest', bgm_mountain: 'mountain', bgm_city: 'city', bgm_academy: 'village', bgm_villa: 'forest', bgm_wild: 'mountain', bgm_valley: 'forest',
  bgm_sect: 'celestial', bgm_cave: 'cave', bgm_battle: 'battle', bgm_cloud: 'celestial', bgm_cult_city: 'city', bgm_pavilion: 'city', bgm_thunder: 'battle', bgm_ruins: 'cave',
  bgm_demon: 'chaos', bgm_void: 'chaos', bgm_ascension: 'celestial', bgm_immortal_city: 'celestial', bgm_immortal_mt: 'celestial', bgm_palace: 'city',
  bgm_chaos: 'chaos', bgm_trial: 'cave', bgm_home: 'village', bgm_dungeon: 'battle',
};

export function renderBgm(theme: string, seconds = 16): Float32Array {
  const T = BGM_THEMES[theme];
  const rng = seededRng(theme.length * 101 + T.root * 7 + 13);
  const out = new Float32Array(SR * seconds);
  const beat = 60 / T.tempo;
  const bars = Math.floor(seconds / (beat * 4));
  const prog = T.mood === 'dark' ? [0, -2, -4, -2] : T.mood === 'tense' ? [0, 3, -2, 0] : [0, 5, 7, 3];
  let deg = 2;
  for (let b = 0; b < bars; b++) {
    const chordRoot = T.root + prog[b % prog.length];
    // pad: hợp âm kéo dài
    for (const iv of [0, 7, 12]) note(out, b * 4 * beat, 4 * beat + 0.2, hz(chordRoot + iv - 12), 0.07, T.pad, rng, SR, 0.4);
    // bass
    for (let k = 0; k < 4; k += T.mood === 'tense' ? 1 : 2) note(out, (b * 4 + k) * beat, beat * 0.9, hz(chordRoot - 24), 0.12, 'tri', rng, SR, 3);
    // giai điệu ngũ cung đi bậc
    for (let k = 0; k < 8; k++) {
      if (rng() < (T.mood === 'calm' ? 0.35 : 0.2)) continue;
      deg = Math.max(0, Math.min(9, deg + Math.floor(rng() * 5) - 2));
      const semi = T.root + PENTA[deg % 5] + 12 * Math.floor(deg / 5);
      note(out, (b * 4 + k * 0.5) * beat, beat * (rng() < 0.3 ? 1 : 0.5), hz(semi), 0.13, T.lead, rng, SR, T.lead === 'pluck' ? 4 : 2.5);
    }
    // trống
    if (T.mood !== 'calm') for (let k = 0; k < 4; k++) note(out, (b * 4 + k) * beat, 0.08, 60, k % 2 ? 0.08 : 0.16, 'noise', rng, SR, 30);
  }
  // làm mượt điểm nối vòng lặp
  const fade = SR * 0.05;
  for (let i = 0; i < fade; i++) { out[i] *= i / fade; out[out.length - 1 - i] *= i / fade; }
  return out;
}

export const SFX: Record<string, (rng: () => number) => Float32Array> = {
  slash: (r) => sweep(0.15, 1800, 300, 'noise', 0.5, r),
  hit: (r) => sweep(0.12, 220, 80, 'square', 0.5, r),
  crit: (r) => mix(sweep(0.2, 400, 90, 'square', 0.6, r), sweep(0.2, 2400, 600, 'noise', 0.3, r)),
  magic: (r) => sweep(0.35, 400, 1400, 'sine', 0.4, r),
  fire: (r) => sweep(0.4, 900, 200, 'noise', 0.45, r),
  ice: (r) => mix(sweep(0.3, 2400, 1800, 'sine', 0.3, r), sweep(0.3, 3000, 2600, 'tri', 0.2, r)),
  thunder: (r) => mix(sweep(0.6, 3000, 60, 'noise', 0.7, r), sweep(0.6, 90, 40, 'square', 0.4, r)),
  poison: (r) => sweep(0.35, 300, 500, 'tri', 0.35, r),
  jump: (r) => sweep(0.12, 300, 700, 'sine', 0.35, r),
  pickup: (r) => mix(sweep(0.08, 900, 900, 'sine', 0.3, r), shift(sweep(0.1, 1350, 1350, 'sine', 0.3, r), 0.07)),
  coin: (r) => mix(sweep(0.06, 1800, 1800, 'square', 0.2, r), shift(sweep(0.12, 2400, 2400, 'square', 0.2, r), 0.05)),
  ui_click: (r) => sweep(0.04, 1200, 1000, 'square', 0.2, r),
  ui_open: (r) => sweep(0.1, 600, 1200, 'tri', 0.25, r),
  levelup: (r) => mix(...[0, 4, 7, 12].map((s, i) => shift(sweep(0.25, hz(s + 12), hz(s + 12), 'tri', 0.3, r), i * 0.09))),
  breakthrough: (r) => mix(...[0, 2, 4, 7, 9, 12, 14, 16].map((s, i) => shift(sweep(0.4, hz(s + 12), hz(s + 12), 'sine', 0.25, r), i * 0.11)), sweep(1.2, 200, 1600, 'sine', 0.2, r)),
  tribulation: (r) => mix(sweep(1.2, 4000, 40, 'noise', 0.8, r), sweep(1.0, 70, 30, 'square', 0.5, r)),
  monster_hit: (r) => sweep(0.1, 160, 70, 'tri', 0.45, r),
  monster_die: (r) => sweep(0.4, 400, 60, 'square', 0.35, r),
  boss_roar: (r) => mix(sweep(1.0, 120, 50, 'square', 0.5, r), sweep(1.0, 800, 200, 'noise', 0.3, r)),
  step: (r) => sweep(0.05, 140, 90, 'noise', 0.15, r),
};
function sweep(dur: number, f0: number, f1: number, w: Wave, vol: number, rng: () => number): Float32Array {
  const n = Math.floor(dur * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / n; ph += (f0 + (f1 - f0) * t) / SR; out[i] = osc(w, ph, rng) * vol * Math.min(1, i / (SR * 0.005)) * (1 - t) ** 1.5; }
  return out;
}
function shift(s: Float32Array, sec: number): Float32Array { const o = new Float32Array(s.length + Math.floor(sec * SR)); o.set(s, Math.floor(sec * SR)); return o; }
function mix(...xs: Float32Array[]): Float32Array { const o = new Float32Array(Math.max(...xs.map((x) => x.length))); for (const x of xs) for (let i = 0; i < x.length; i++) o[i] += x[i]; return o; }
