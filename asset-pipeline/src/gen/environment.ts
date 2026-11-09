/** Tileset 32×32, nền parallax, icon vật phẩm/kỹ năng — nguyên bản, sinh trong dự án. */
import { Canvas, hex, shade, type RGBA } from '../canvas.js';
import { seededRng, type ItemDef, type SkillDef } from '@tt/shared';

export interface ThemePal { top: string; dirt: string; stone: string; plat: string; skyTop: string; skyBot: string; far: string; mid: string; near: string; deco: string; accent: string }
const P = (top: string, dirt: string, stone: string, plat: string, skyTop: string, skyBot: string, far: string, mid: string, near: string, deco: string, accent: string): ThemePal => ({ top, dirt, stone, plat, skyTop, skyBot, far, mid, near, deco, accent });
export const THEMES: Record<string, ThemePal> = {
  village: P('#5cb84a', '#8a5a3a', '#6a6a6a', '#9a6a3a', '#7ec8f0', '#d8f0ff', '#9ab8d8', '#6a9a6a', '#4a7a3a', '#f0e070', '#d04040'),
  bamboo: P('#4aa84a', '#6a4a2a', '#5a6a5a', '#8aa84a', '#a8e0c8', '#e8fff0', '#a8c8b0', '#5a9a5a', '#2a7a3a', '#c8f080', '#ffffff'),
  dark_mountain: P('#4a6a4a', '#4a3a3a', '#3a3a4a', '#6a4a3a', '#3a3a5a', '#7a7a9a', '#4a4a6a', '#3a3a4a', '#2a2a3a', '#8a8aaa', '#c04040'),
  city: P('#9a9a8a', '#7a6a5a', '#8a8a8a', '#a07040', '#f0b880', '#fff0d0', '#c09070', '#a06a4a', '#7a3a2a', '#ffd060', '#e04040'),
  academy: P('#7ac86a', '#8a6a4a', '#9a9a9a', '#b08050', '#f0c0d8', '#fff0f8', '#d0a8c0', '#a08aa0', '#6a5a7a', '#ffb0d0', '#ffffff'),
  villa: P('#6aa86a', '#6a5a4a', '#7a7a8a', '#8a6a4a', '#b0c8e0', '#e8f0f8', '#90a0b8', '#6a7a8a', '#4a5a6a', '#c0d0e0', '#a0c0ff'),
  wild_mountain: P('#5aa04a', '#7a5a3a', '#6a6a5a', '#8a6a3a', '#80b8d8', '#d0e8f0', '#7a9ab0', '#5a7a5a', '#3a5a3a', '#e0c060', '#ffffff'),
  herb_valley: P('#6ac87a', '#6a5a3a', '#5a7a6a', '#7aa060', '#b0f0d0', '#f0fff8', '#a0d0c0', '#6aa080', '#3a7a5a', '#ff90c0', '#a040ff'),
  sect: P('#7ab87a', '#7a6a5a', '#b0b0c0', '#c0a070', '#a0d0ff', '#f0f8ff', '#b0c8e8', '#8aa0c0', '#5a7090', '#ffffff', '#80c0ff'),
  ghost_cave: P('#4a5a6a', '#3a3a4a', '#2a2a3a', '#4a4a5a', '#101020', '#2a2a40', '#1a1a2a', '#2a2a3a', '#1a1a28', '#60ffd0', '#a060ff'),
  battlefield: P('#8a7a4a', '#6a4a3a', '#5a4a4a', '#7a5a3a', '#c07050', '#f0c090', '#a06050', '#7a4a3a', '#4a2a2a', '#ff6030', '#d0d0d0'),
  cloud_land: P('#f0f8ff', '#c0d8f0', '#a0b8d8', '#e0e8ff', '#80c0ff', '#e0f0ff', '#c8e0ff', '#a0c8f0', '#ffffff', '#ffe080', '#80ffff'),
  cult_city: P('#a0a0b0', '#7a6a8a', '#8a8aa0', '#a080c0', '#a080e0', '#f0e0ff', '#a090c0', '#7a6a9a', '#4a3a6a', '#ffd0ff', '#ffd040'),
  pavilion: P('#c0a060', '#8a6a3a', '#a08060', '#d0a050', '#402010', '#a06030', '#603020', '#4a2010', '#2a1008', '#ffd040', '#ff4040'),
  thunder_peak: P('#5a6a8a', '#4a4a6a', '#3a3a5a', '#6a6a9a', '#202040', '#5050a0', '#3a3a70', '#2a2a5a', '#1a1a40', '#c0e0ff', '#ffff60'),
  ancient_ruins: P('#7a9a6a', '#6a6a5a', '#8a8a7a', '#9a8a6a', '#304030', '#6a8a6a', '#4a5a4a', '#3a4a3a', '#2a3a2a', '#d0ffa0', '#40ffa0'),
  demon_realm: P('#6a2a3a', '#4a1a2a', '#3a1a2a', '#5a2a3a', '#300010', '#802030', '#501020', '#3a0a18', '#200008', '#ff4060', '#ffa020'),
  void: P('#4a3a6a', '#2a1a4a', '#1a1a3a', '#5a4a8a', '#000010', '#2a1050', '#1a0a40', '#120830', '#080418', '#c080ff', '#40ffff'),
  ascension: P('#fff8e0', '#e0d0a0', '#d0c090', '#fff0c0', '#ffd890', '#fffff0', '#ffe8c0', '#f0d8a0', '#ffffff', '#ffd040', '#ffffff'),
  immortal_city: P('#f0e8d0', '#c0b090', '#d0c8b0', '#e0c080', '#a0d8ff', '#fffff0', '#e0f0ff', '#c0d8f0', '#ffffff', '#ffd040', '#ff80c0'),
  immortal_mountain: P('#90d8a0', '#8a7a6a', '#a0a0b0', '#c0b080', '#c0e8ff', '#ffffff', '#d0e8f0', '#a0c8c0', '#70a090', '#ffffff', '#ffd040'),
  heaven_palace: P('#e0c870', '#a08040', '#d0c090', '#ffd060', '#ffe0a0', '#fffff0', '#ffe8b0', '#f0c870', '#c09040', '#ff4040', '#ffffff'),
  chaos_sea: P('#3a5a7a', '#2a3a5a', '#1a2a4a', '#4a6a8a', '#0a0a20', '#3a2060', '#201040', '#102040', '#081020', '#40e0ff', '#ff40ff'),
  inner_world: P('#4a4a5a', '#3a3a4a', '#2a2a3a', '#5a5a6a', '#100818', '#402040', '#301830', '#201020', '#100810', '#ff60a0', '#a0a0ff'),
  cave_home: P('#7a9a6a', '#6a5a4a', '#5a5a5a', '#9a7a5a', '#3a3020', '#7a6040', '#5a4830', '#4a3a28', '#2a2018', '#ffd060', '#60ff90'),
  arena: P('#a09080', '#7a6a5a', '#8a7a6a', '#b09070', '#d08050', '#ffe0b0', '#c08060', '#a06040', '#603020', '#ffd040', '#ff4040'),
};

export function renderTileset(theme: string): Canvas {
  const p = THEMES[theme];
  const rng = seededRng(theme.length * 977 + theme.charCodeAt(0));
  const c = new Canvas(32 * 8, 32);
  const top = hex(p.top), dirt = hex(p.dirt), stone = hex(p.stone), plat = hex(p.plat), deco = hex(p.deco), acc = hex(p.accent);
  // 0: mặt đất có cỏ
  c.rect(0, 0, 32, 32, dirt);
  for (let i = 0; i < 18; i++) c.rect(Math.floor(rng() * 30), 8 + Math.floor(rng() * 22), 2, 2, shade(dirt, 0.8 + rng() * 0.3));
  c.rect(0, 0, 32, 7, top); c.rect(0, 7, 32, 2, shade(top, 0.75));
  for (let x = 0; x < 32; x += 3) c.px(x, 9 + (x % 2), shade(top, 0.75));
  c.rect(0, 0, 32, 1, shade(top, 1.25));
  // 1: đất/đá lấp đầy
  c.rect(32, 0, 32, 32, shade(dirt, 0.92));
  for (let i = 0; i < 6; i++) { const x = 32 + Math.floor(rng() * 26), y = Math.floor(rng() * 26); c.ellipse(x + 3, y + 3, 3, 2.5, stone); c.px(x + 2, y + 2, shade(stone, 1.3)); }
  // 2: bục một chiều
  c.rect(64, 0, 32, 6, plat); c.rect(64, 6, 32, 2, shade(plat, 0.6)); c.rect(64, 0, 32, 1, shade(plat, 1.3));
  for (let x = 64; x < 96; x += 8) c.rect(x, 1, 1, 5, shade(plat, 0.7));
  c.rect(66, 8, 3, 5, shade(plat, 0.5)); c.rect(91, 8, 3, 5, shade(plat, 0.5));
  // 3: cụm cỏ trang trí
  for (let k = 0; k < 5; k++) c.line(100 + k * 5, 31, 98 + k * 5 + Math.floor(rng() * 4), 20 + Math.floor(rng() * 6), shade(top, 0.9 + rng() * 0.3));
  // 4: hoa / tinh thể
  for (let k = 0; k < 3; k++) { const x = 132 + k * 9, y = 22 + Math.floor(rng() * 4); c.line(x, 31, x, y, shade(top, 0.8)); c.ellipse(x, y, 2.5, 2.5, k === 1 ? acc : deco); }
  // 5: đá
  c.ellipse(176, 26, 10, 6, stone); c.ellipse(173, 24, 4, 2, shade(stone, 1.3));
  // 6: cột đèn
  c.rect(206, 10, 4, 22, shade(plat, 0.6)); c.rect(202, 4, 12, 8, acc); c.rect(204, 6, 8, 4, deco);
  // 7: trần hang
  c.rect(224, 0, 32, 32, shade(stone, 0.7));
  for (let x = 226; x < 254; x += 7) c.poly([[x, 31], [x + 5, 31], [x + 2, 24 + Math.floor(rng() * 6)]], shade(stone, 0.55));
  return c;
}

export function renderParallax(theme: string, layer: 0 | 1 | 2): Canvas {
  const p = THEMES[theme];
  const W = 640, H = 360;
  const c = new Canvas(W, H);
  const rng = seededRng(theme.length * 31 + layer * 7);
  if (layer === 0) {
    const a = hex(p.skyTop), b = hex(p.skyBot);
    for (let y = 0; y < H; y++) { const t = y / H; c.rect(0, y, W, 1, [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t), 255]); }
    for (let i = 0; i < 6; i++) { const x = rng() * W, y = 30 + rng() * 120; const cl: RGBA = [255, 255, 255, 120]; c.ellipse(x, y, 30 + rng() * 30, 8 + rng() * 6, cl); c.ellipse(x + 20, y - 6, 20, 8, cl); }
    if (['ghost_cave', 'void', 'demon_realm', 'chaos_sea', 'thunder_peak', 'inner_world'].includes(theme)) for (let i = 0; i < 80; i++) c.px(rng() * W, rng() * H * 0.7, [255, 255, 255, 120 + Math.floor(rng() * 120)]);
    return c;
  }
  const col = hex(layer === 1 ? p.far : p.mid);
  const base = layer === 1 ? 200 : 250;
  let y = base;
  for (let x = 0; x <= W; x++) {
    if (x % 8 === 0) y = Math.max(base - 120, Math.min(base + 40, y + (rng() - 0.5) * (layer === 1 ? 26 : 18)));
    // nối đầu-cuối để lặp liền mạch
    const blend = x > W - 80 ? (x - (W - 80)) / 80 : 0;
    const yy = y * (1 - blend) + base * blend;
    c.rect(x, Math.round(yy), 1, H - Math.round(yy), col);
  }
  if (layer === 2) {
    const tree = hex(p.near);
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 70 + rng() * 30, h = 50 + rng() * 50;
      c.rect(x, H - h, 5, h, shade(tree, 0.6));
      if (['bamboo', 'herb_valley'].includes(theme)) { for (let k = 0; k < 4; k++) c.line(x + 2, H - h + k * 12, x + 14 + rng() * 6, H - h + k * 12 - 6, tree, 2); }
      else c.ellipse(x + 2, H - h, 18 + rng() * 10, 14 + rng() * 8, tree);
    }
    if (['city', 'cult_city', 'immortal_city', 'heaven_palace', 'sect', 'academy', 'pavilion'].includes(theme)) {
      for (let i = 0; i < 5; i++) { const x = 60 + i * 120, w = 50, h = 60 + rng() * 40; c.rect(x, H - h, w, h, shade(hex(p.mid), 0.8)); c.poly([[x - 10, H - h], [x + w + 10, H - h], [x + w / 2, H - h - 22]], hex(p.accent)); }
    }
  }
  return c;
}

// ---------- icon ----------
const TYPE_COLORS: Record<string, string> = { weapon: '#c8ccd8', armor: '#6a8ac0', helmet: '#8a9ab0', boots: '#8a6a4a', ring: '#e0c050', amulet: '#50c0a0', artifact: '#c070e0', pill: '#e05050', herb: '#50c050', ore: '#9090a0', manual: '#c0a060', talisman: '#f0d060', material: '#a08a6a', quest: '#ffd040', fashion: '#f080b0', mount: '#c09060', pet_egg: '#f0f0e0', event: '#ff6040', gem: '#40a0ff', seed: '#8a6a3a', tool: '#a08060', furniture: '#a07040', pet_gear: '#d0a040' };
export const RARITY_COLORS = ['#c8c8c8', '#7ee07e', '#5aa9ff', '#b06cff', '#d9a441', '#ff8a3d', '#3de0d0', '#ff5fa2', '#ff3b3b', '#ffffff'];
function iconGlyph(c: Canvas, ox: number, oy: number, key: string, type: string, col: RGBA): void {
  const k = key + type;
  const d = shade(col, 0.6);
  if (type === 'weapon') { c.line(ox + 8, oy + 24, ox + 24, oy + 8, col, 3); c.line(ox + 6, oy + 18, ox + 14, oy + 26, d, 2); c.line(ox + 5, oy + 27, ox + 9, oy + 23, hex('#6a4a2a'), 2); }
  else if (type === 'armor') { c.poly([[ox + 8, oy + 8], [ox + 24, oy + 8], [ox + 26, oy + 26], [ox + 6, oy + 26]], col); c.line(ox + 16, oy + 9, ox + 16, oy + 25, d); }
  else if (type === 'helmet') { c.ellipse(ox + 16, oy + 17, 10, 8, col); c.rect(ox + 6, oy + 19, 20, 4, d); }
  else if (type === 'boots') { c.rect(ox + 10, oy + 8, 7, 14, col); c.rect(ox + 10, oy + 20, 14, 6, d); }
  else if (type === 'ring') { c.ellipse(ox + 16, oy + 18, 8, 8, col); c.ellipse(ox + 16, oy + 18, 5, 5, [0, 0, 0, 0]); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const dx = x - 16, dy = y - 18; if (dx * dx + dy * dy < 25) c.data[((oy + y) * c.w + ox + x) * 4 + 3] = 0; } c.ellipse(ox + 16, oy + 10, 3, 3, hex('#ff4060')); }
  else if (type === 'pill') { c.ellipse(ox + 16, oy + 17, 8, 8, col); c.ellipse(ox + 13, oy + 14, 3, 2, shade(col, 1.5)); }
  else if (type === 'herb' || type === 'seed') { c.line(ox + 16, oy + 28, ox + 16, oy + 12, hex('#3a8a3a'), 2); c.ellipse(ox + 11, oy + 14, 5, 3, col); c.ellipse(ox + 21, oy + 11, 5, 3, col); c.ellipse(ox + 16, oy + 8, 3, 3, shade(col, 1.4)); }
  else if (type === 'ore' || type === 'gem') { c.poly([[ox + 16, oy + 5], [ox + 26, oy + 14], [ox + 21, oy + 27], [ox + 11, oy + 27], [ox + 6, oy + 14]], col); c.line(ox + 16, oy + 6, ox + 16, oy + 26, shade(col, 1.3)); }
  else if (type === 'manual') { c.rect(ox + 7, oy + 7, 18, 20, col); c.rect(ox + 9, oy + 9, 14, 16, hex('#f0e8d0')); for (let i = 0; i < 4; i++) c.line(ox + 11, oy + 12 + i * 3, ox + 20, oy + 12 + i * 3, hex('#5a4a3a')); }
  else if (type === 'talisman') { c.rect(ox + 10, oy + 5, 12, 22, col); c.line(ox + 13, oy + 9, ox + 19, oy + 22, hex('#c02020'), 2); c.line(ox + 19, oy + 9, ox + 13, oy + 22, hex('#c02020')); }
  else if (type === 'tool') { c.line(ox + 8, oy + 26, ox + 22, oy + 10, hex('#7a5030'), 3); c.poly([[ox + 16, oy + 6], [ox + 28, oy + 8], [ox + 24, oy + 14]], col); }
  else { const r = seededRng(k.length * 13 + k.charCodeAt(k.length - 1)); c.ellipse(ox + 16, oy + 17, 7 + r() * 4, 7 + r() * 4, col); c.ellipse(ox + 13, oy + 13, 3, 2, shade(col, 1.4)); }
}
/** Tạo atlas icon vật phẩm 32×32 (16 cột), trả về chỉ mục key->index */
export function renderItemIcons(items: ItemDef[]): { atlas: Canvas; index: Record<string, number> } {
  const keys = new Map<string, ItemDef>();
  for (const it of items) if (!keys.has(it.icon)) keys.set(it.icon, it);
  const list = [...keys.entries()];
  const rows = Math.ceil(list.length / 16);
  const atlas = new Canvas(16 * 32, rows * 32);
  const index: Record<string, number> = {};
  list.forEach(([key, it], i) => {
    const ox = (i % 16) * 32, oy = Math.floor(i / 16) * 32;
    const tc = hex(TYPE_COLORS[it.type] ?? '#a0a0a0');
    const hueShift = (key.length * 37) % 60 - 30;
    const col: RGBA = [Math.max(0, Math.min(255, tc[0] + hueShift)), tc[1], Math.max(0, Math.min(255, tc[2] - hueShift)), 255];
    const cell = new Canvas(32, 32);
    iconGlyph(cell, 0, 0, key, it.type, col);
    cell.outline(hex('#141018'));
    atlas.blit(cell, ox, oy);
    index[key] = i;
  });
  return { atlas, index };
}
const PATH_COLORS: Record<string, string> = { kiem: '#c0e0ff', dao: '#ff9060', quyen: '#ffd060', the: '#d0a060', phap: '#80ff80', loi: '#a080ff', hoa: '#ff5030', bang: '#60e0ff', doc: '#80d040', phu: '#f0e070', tran: '#40c0a0', ngu_thu: '#e09050', co_ban: '#c0c0c0' };
export function renderSkillIcons(skills: SkillDef[]): { atlas: Canvas; index: Record<string, number> } {
  const atlas = new Canvas(8 * 64, Math.ceil(skills.length / 8) * 64);
  const index: Record<string, number> = {};
  skills.forEach((s, i) => {
    const ox = (i % 8) * 64, oy = Math.floor(i / 8) * 64;
    const col = hex(PATH_COLORS[s.path] ?? '#cccccc');
    const cell = new Canvas(64, 64);
    cell.rect(2, 2, 60, 60, shade(col, 0.25)); cell.rect(4, 4, 56, 56, shade(col, 0.4));
    switch (s.shape.type) {
      case 'melee': cell.line(14, 50, 50, 14, col, 5); cell.line(10, 40, 24, 54, shade(col, 0.7), 3); break;
      case 'projectile': cell.ellipse(40, 24, 10, 10, col); cell.line(14, 50, 32, 32, shade(col, 0.8), 4); break;
      case 'aoe': cell.ellipse(32, 36, 22, 14, shade(col, 0.8)); cell.ellipse(32, 36, 14, 8, col); break;
      case 'self': cell.ellipse(32, 32, 20, 20, shade(col, 0.7)); cell.ellipse(32, 32, 12, 12, col); break;
      case 'dash': for (let k = 0; k < 3; k++) cell.line(10 + k * 6, 20 + k * 12, 50, 20 + k * 12, col, 3); break;
      case 'zone': for (let k = 0; k < 3; k++) cell.ellipse(32, 40, 24 - k * 7, 10 - k * 3, k % 2 ? shade(col, 0.6) : col); cell.line(32, 12, 32, 40, col, 2); break;
      case 'summon': cell.ellipse(30, 36, 14, 10, col); cell.ellipse(44, 26, 7, 6, col); cell.poly([[40, 21], [42, 14], [46, 21]], col); break;
    }
    const lvl = Math.min(5, Math.floor(s.reqRealm / 4) + 1);
    for (let k = 0; k < lvl; k++) cell.rect(8 + k * 6, 54, 4, 4, hex('#ffffff'));
    cell.outline(hex('#000000'));
    atlas.blit(cell, ox, oy);
    index[s.id] = i;
  });
  return { atlas, index };
}
