import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ITEMS, MAPS, MONSTERS, NPCS, SKILLS } from '@tt/shared';
import { ARCHETYPES } from './gen/monsters.js';
import { HAIR_STYLES, OUTFIT_STYLES, WEAPON_LOOKS, ANIMS, FW, FH, COLS } from './gen/characters.js';
import { BGM_THEMES, SFX } from './gen/audio.js';
import { MON_ANIMS } from './gen/monsters.js';

export const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..');
export const CLIENT = join(ROOT, 'client');
export const MANIFEST_PATH = join(ROOT, 'assets', 'manifest.json');

export type Status = 'placeholder' | 'pending_review' | 'approved' | 'rejected';
export interface Spec { kind: 'sheet' | 'image' | 'atlas' | 'audio'; w?: number; h?: number; frameW?: number; frameH?: number; cols?: number; rows?: string[]; transparent?: boolean; maxColors?: number; seconds?: number }
export interface AssetEntry {
  id: string; category: string; path: string; spec: Spec; desc: string;
  status: Status; source: 'procedural-original' | 'chatgpt-manual' | 'openai-api' | 'licensed-third-party';
  license: string; version: number; sha256?: string; updatedAt?: string; reviewer?: string; notes?: string;
}
export interface Manifest { version: number; styleGuide: string; assets: Record<string, AssetEntry> }

export const STYLE_GUIDE = `TU TIÊN TRUYỆN 2D — HD Chibi Pixel Art. Nhân vật chibi đầu lớn vừa phải, thân cân đối, khí chất tiên hiệp phương Đông nguyên bản.
Pixel rõ ràng (không nhòe, không khử răng cưa, không gradient mềm), viền tối 1px, bảng màu sống động nhưng không chói, nền TRONG SUỐT (PNG RGBA).
Góc nhìn ngang (side-view), nhân vật quay mặt sang PHẢI. Không sao chép bất kỳ game nào (không Ninja School, không tài sản có bản quyền).`;

const charRows = ANIMS.map((a) => `${a.name}(${a.frames})`);
const monRows = MON_ANIMS.map((a) => `${a.name}(${a.frames})`);
const ORIG = 'Nguyên bản — sinh bằng mã trong dự án (asset-pipeline), thuộc sở hữu dự án';

function entry(e: Omit<AssetEntry, 'status' | 'source' | 'license' | 'version'>): AssetEntry {
  return { ...e, status: 'placeholder', source: 'procedural-original', license: ORIG, version: 1 };
}

/** Danh sách đầy đủ tài nguyên game cần (sinh từ dữ liệu game — data-driven) */
export function requiredAssets(): AssetEntry[] {
  const out: AssetEntry[] = [];
  const sheet = (rows: string[], fw: number, fh: number, cols: number): Spec => ({ kind: 'sheet', frameW: fw, frameH: fh, cols, rows, w: fw * cols, h: fh * rows.length, transparent: true, maxColors: 256 });
  for (const g of ['male', 'female']) out.push(entry({ id: `char_body_${g}`, category: 'character', path: `assets/characters/body_${g}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Lớp thân (da) ${g === 'male' ? 'nam' : 'nữ'} — xám để tô màu da` }));
  for (let f = 0; f < 4; f++) for (let e = 0; e < 4; e++) out.push(entry({ id: `char_face_${f}_${e}`, category: 'character', path: `assets/characters/face_${f}_${e}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Khuôn mặt ${f}, mắt ${e}` }));
  for (let h = 0; h < HAIR_STYLES; h++) out.push(entry({ id: `char_hair_${h}`, category: 'character', path: `assets/characters/hair_${h}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Kiểu tóc ${h} — xám để tô màu tóc` }));
  for (let o = 0; o < OUTFIT_STYLES; o++) {
    out.push(entry({ id: `char_outfit_${o}`, category: 'character', path: `assets/characters/outfit_${o}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Trang phục ${o} — xám để tô màu áo` }));
    out.push(entry({ id: `char_legs_${o}`, category: 'character', path: `assets/characters/legs_${o}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Quần/giày trang phục ${o}` }));
    out.push(entry({ id: `char_belt_${o}`, category: 'character', path: `assets/characters/belt_${o}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Đai/cổ áo trang phục ${o}` }));
  }
  for (const look of WEAPON_LOOKS) for (let t = 0; t < 5; t++) out.push(entry({ id: `wpn_${look}_${t}`, category: 'weapon', path: `assets/weapons/wpn_${look}_${t}.png`, spec: sheet(charRows, FW, FH, COLS), desc: `Vũ khí ${look} bậc ${t} cầm tay theo khung hình nhân vật` }));
  for (const [k, a] of Object.entries(ARCHETYPES)) out.push(entry({ id: `mon_${k}`, category: 'monster', path: `assets/monsters/${k}.png`, spec: sheet(monRows, a.size, a.size, 4), desc: `Quái nguyên mẫu ${k}; dùng cho: ${Object.values(MONSTERS).filter((m) => m.sprite === k).map((m) => m.name).join(', ')}` }));
  const themes = [...new Set(Object.values(MAPS).map((m) => m.theme))];
  for (const t of themes) {
    out.push(entry({ id: `tiles_${t}`, category: 'tileset', path: `assets/tiles/${t}.png`, spec: { kind: 'image', w: 256, h: 32, frameW: 32, frameH: 32, transparent: true }, desc: `Tileset ${t}: [0 mặt đất, 1 lấp đầy, 2 bục, 3 cỏ, 4 hoa, 5 đá, 6 đèn, 7 trần hang]` }));
    for (const l of [0, 1, 2]) out.push(entry({ id: `parallax_${t}_${l}`, category: 'parallax', path: `assets/parallax/${t}_${l}.png`, spec: { kind: 'image', w: 640, h: 360, transparent: l > 0 }, desc: `Nền parallax ${t} lớp ${l} (0 trời, 1 núi xa, 2 cận cảnh) — lặp ngang liền mạch` }));
  }
  out.push(entry({ id: 'icons_items', category: 'icon', path: 'assets/icons/items.png', spec: { kind: 'atlas', frameW: 32, frameH: 32, cols: 16, transparent: true }, desc: `Atlas icon vật phẩm 32×32 (${new Set(Object.values(ITEMS).map((i) => i.icon)).size} icon)` }));
  out.push(entry({ id: 'icons_skills', category: 'icon', path: 'assets/icons/skills.png', spec: { kind: 'atlas', frameW: 64, frameH: 64, cols: 8, transparent: false }, desc: `Atlas icon kỹ năng 64×64 (${Object.keys(SKILLS).length} kỹ năng)` }));
  for (const n of Object.values(NPCS)) out.push({ ...entry({ id: `portrait_${n.id}`, category: 'portrait', path: `assets/portraits/${n.id}.png`, spec: { kind: 'image', w: 256, h: 256, transparent: true }, desc: `Chân dung ${n.name} — ${n.title}` }), notes: 'Chưa có: client cắt phóng to đầu nhân vật từ lớp sprite cho tới khi có chân dung ChatGPT' });
  for (const t of Object.keys(BGM_THEMES)) out.push(entry({ id: `bgm_${t}`, category: 'audio', path: `assets/audio/bgm_${t}.wav`, spec: { kind: 'audio', seconds: 16 }, desc: `Nhạc nền chủ đề ${t} (ngũ cung, lặp)` }));
  for (const s of Object.keys(SFX)) out.push(entry({ id: `sfx_${s}`, category: 'audio', path: `assets/audio/sfx_${s}.wav`, spec: { kind: 'audio' }, desc: `Hiệu ứng âm thanh ${s}` }));
  // nhân vật mẫu đầu tiên
  out.push(entry({ id: 'CHR_001', category: 'character_preview', path: 'assets/characters/CHR_001_preview.png', spec: sheet(charRows, FW, FH, COLS), desc: 'Thiếu Niên Nhập Đạo: tóc đen, mắt sáng, áo võ sinh xanh lam, đai nâu, quần tối, giày vải, kiếm gỗ. Idle/Run/Jump/Attack/Hurt/Death/Cast.' }));
  return out;
}

export function loadManifest(): Manifest {
  if (existsSync(MANIFEST_PATH)) return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return { version: 1, styleGuide: STYLE_GUIDE, assets: {} };
}
export function saveManifest(m: Manifest): void { mkdirSync(dirname(MANIFEST_PATH), { recursive: true }); writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n'); }
export function sha256File(p: string): string { return createHash('sha256').update(readFileSync(p)).digest('hex'); }

/** Đồng bộ manifest với danh sách yêu cầu, giữ trạng thái/nguồn của tài nguyên đã nhập */
export function syncManifest(): Manifest {
  const m = loadManifest();
  m.styleGuide = STYLE_GUIDE;
  for (const e of requiredAssets()) {
    const prev = m.assets[e.id];
    const full = join(CLIENT, e.path);
    const next: AssetEntry = prev && prev.source !== 'procedural-original' ? { ...e, ...prev, spec: e.spec, desc: e.desc, path: e.path } : { ...e, version: prev?.version ?? 1 };
    if (existsSync(full)) {
      const sum = sha256File(full);
      if (prev?.sha256 && prev.sha256 !== sum && next.source === 'procedural-original') next.version = (prev.version ?? 1) + 1;
      next.sha256 = sum;
    }
    m.assets[e.id] = next;
  }
  return m;
}
