/**
 * Bộ sinh sprite nhân vật chibi pixel art PHÂN LỚP (nguyên bản, tạo trong dự án).
 * Mỗi lớp là một sprite sheet cùng lưới 8 cột × 8 hàng, ô 64×96, gốc ở chân (32, 94), mặt hướng phải.
 * Lớp xám (body/hair/outfit) được client tô màu bằng modulate → tùy biến màu không cần vẽ lại.
 */
import { Canvas, gray, hex, shade, type RGBA } from '../canvas.js';

export const FW = 64, FH = 96, COLS = 8;
export const ANIMS: { name: string; frames: number }[] = [
  { name: 'idle', frames: 4 }, { name: 'run', frames: 6 }, { name: 'jump', frames: 2 }, { name: 'attack', frames: 4 },
  { name: 'hurt', frames: 2 }, { name: 'death', frames: 4 }, { name: 'cast', frames: 4 }, { name: 'meditate', frames: 2 },
];

export interface Pose {
  bob: number; lean: number;
  legF: [number, number]; legB: [number, number]; // (dx, nhấc lên)
  armF: number; armB: number;                      // góc (0 = buông xuống, + = ra trước/lên)
  weapon: number;                                  // góc vũ khí cộng thêm
  rot: number;                                     // xoay toàn thân (chết)
  sit: boolean;
  eyesClosed: boolean;
}

export function pose(anim: string, i: number): Pose {
  const p: Pose = { bob: 0, lean: 0, legF: [0, 0], legB: [0, 0], armF: 0.15, armB: -0.1, weapon: -0.9, rot: 0, sit: false, eyesClosed: false };
  switch (anim) {
    case 'idle': p.bob = [0, 0, 1, 1][i]; p.armF = 0.15 + (i >= 2 ? 0.05 : 0); break;
    case 'run': {
      const t = (i / 6) * Math.PI * 2;
      p.bob = [0, -1, -2, 0, -1, -2][i]; p.lean = 2;
      p.legF = [Math.round(Math.sin(t) * 6), Math.max(0, Math.round(Math.cos(t) * 3))];
      p.legB = [Math.round(-Math.sin(t) * 6), Math.max(0, Math.round(-Math.cos(t) * 3))];
      p.armF = -Math.sin(t) * 0.8 + 0.2; p.armB = Math.sin(t) * 0.8; break;
    }
    case 'jump': if (i === 0) { p.bob = -2; p.legF = [3, 5]; p.legB = [-2, 4]; p.armF = 1.6; p.armB = 1.2; } else { p.bob = 0; p.legF = [2, 1]; p.legB = [-3, 0]; p.armF = 0.9; p.armB = 0.6; } break;
    case 'attack': p.armF = [-1.4, -0.4, 1.4, 0.9][i]; p.lean = [-1, 1, 3, 2][i]; p.legF = [[0, 0], [3, 0], [6, 0], [5, 0]][i] as [number, number]; p.legB = [[0, 0], [-1, 0], [-3, 0], [-2, 0]][i] as [number, number]; p.weapon = [0.2, 0.1, 0, 0][i]; p.armB = -0.4; break;
    case 'hurt': p.lean = -3; p.bob = 1; p.armF = -0.6; p.armB = -0.9; p.eyesClosed = true; break;
    case 'death': p.rot = [-0.15, -0.3, -0.45, -0.6][i]; p.bob = [4, 10, 18, 26][i]; p.legF = [4, 6]; p.legB = [-2, 4]; p.eyesClosed = true; p.armF = -0.5; p.armB = -0.8; break;
    case 'cast': p.weapon = 0; p.armF = [1.0, 1.5, 1.7, 1.4][i]; p.armB = [0.8, 1.2, 1.4, 1.1][i]; p.bob = [0, -1, -1, 0][i]; break;
    case 'meditate': p.sit = true; p.bob = 14 + (i === 1 ? 1 : 0); p.armF = 0.9; p.armB = 0.9; p.eyesClosed = true; break;
  }
  return p;
}

// ---- toạ độ cơ thể ----
function geom(p: Pose) {
  const ox = 32 + p.lean * 0.5, b = p.bob;
  return {
    head: { x: ox + 1 + p.lean * 0.5, y: 34 + b, rx: 14, ry: 13 },
    torsoTop: 48 + b, torsoBot: 70 + b, torsoX: ox - 7, torsoW: 15,
    shoulderF: { x: ox + 5, y: 52 + b }, shoulderB: { x: ox - 4, y: 52 + b },
    hipF: { x: ox + 3, y: 70 + b }, hipB: { x: ox - 3, y: 70 + b },
    feetY: 93,
  };
}
export function handPos(p: Pose, front: boolean): { x: number; y: number } {
  const g = geom(p);
  const s = front ? g.shoulderF : g.shoulderB;
  const a = front ? p.armF : p.armB;
  const len = 13;
  return { x: s.x + Math.sin(a) * len, y: s.y + Math.cos(a) * len };
}

const G = { base: gray(235), mid: gray(200), dark: gray(150), line: gray(90) };

// ================= LỚP CƠ THỂ (da, xám) =================
function drawBody(c: Canvas, p: Pose): void {
  const g = geom(p);
  // tay sau
  const hb = handPos(p, false);
  c.line(g.shoulderB.x, g.shoulderB.y, hb.x, hb.y, G.mid, 4);
  c.ellipse(hb.x, hb.y, 2.5, 2.5, G.mid);
  // chân (da phần dưới, quần sẽ phủ lên ở lớp trang phục)
  if (!p.sit) {
    c.rect(g.hipB.x - 3 + p.legB[0], g.hipB.y, 5, g.feetY - g.hipB.y - p.legB[1], G.mid);
    c.rect(g.hipF.x - 2 + p.legF[0], g.hipF.y, 5, g.feetY - g.hipF.y - p.legF[1], G.base);
  }
  c.rect(g.torsoX, g.torsoTop, g.torsoW, g.torsoBot - g.torsoTop, G.base);
  // cổ + đầu
  c.rect(g.head.x - 3, g.head.y + 10, 6, 5, G.mid);
  c.ellipse(g.head.x, g.head.y, g.head.rx, g.head.ry, G.base);
  c.ellipse(g.head.x - 2, g.head.y + 4, g.head.rx - 3, g.head.ry - 4, G.base);
  // tai
  c.ellipse(g.head.x - 6, g.head.y + 2, 2.5, 3.5, G.mid);
  // tay trước
  const hf = handPos(p, true);
  c.line(g.shoulderF.x, g.shoulderF.y, hf.x, hf.y, G.base, 4);
  c.ellipse(hf.x, hf.y, 2.5, 2.5, G.base);
}

// ================= LỚP MẶT (màu thật) =================
const EYE_COLORS = ['#2a1a10', '#203a6a', '#5a2a1a', '#1a4a3a'];
function drawFace(c: Canvas, p: Pose, face: number, eyes: number): void {
  const g = geom(p);
  const ex1 = g.head.x + 3, ex2 = g.head.x + 10, ey = g.head.y + 3;
  const iris = hex(EYE_COLORS[eyes % EYE_COLORS.length]);
  if (p.eyesClosed) {
    c.line(ex1 - 2, ey + 1, ex1 + 2, ey + 1, hex('#3a2a20')); c.line(ex2 - 1, ey + 1, ex2 + 2, ey + 1, hex('#3a2a20'));
  } else {
    const big = eyes >= 2 ? 1 : 0;
    for (const [x, w] of [[ex1, 4 + big], [ex2, 3 + big]] as [number, number][]) {
      c.rect(x - 2, ey - 2 - big, w, 5 + big, hex('#ffffff'));
      c.rect(x - 1, ey - 1 - big, w - 1, 4 + big, iris);
      c.px(x - 1, ey - 1 - big, hex('#ffffff'));
      c.px(x, ey - 2 - big, hex('#1a1010'));
    }
  }
  // lông mày theo khuôn mặt
  const brow = hex('#3a2418');
  if (face === 1) { c.line(ex1 - 2, ey - 5, ex1 + 2, ey - 6, brow); c.line(ex2 - 1, ey - 6, ex2 + 2, ey - 5, brow); } // sắc sảo
  else if (face === 2) { c.line(ex1 - 2, ey - 5, ex1 + 2, ey - 5, brow); c.line(ex2 - 1, ey - 5, ex2 + 2, ey - 5, brow); } // hiền
  else if (face === 3) { c.line(ex1 - 2, ey - 6, ex1 + 2, ey - 4, brow); c.line(ex2 - 1, ey - 4, ex2 + 2, ey - 6, brow); } // quyết đoán
  else { c.px(ex1, ey - 5, brow); c.px(ex1 + 1, ey - 5, brow); c.px(ex2, ey - 5, brow); }
  // miệng & má
  const my = g.head.y + 9;
  if (face === 2) c.line(g.head.x + 6, my, g.head.x + 8, my + 1, hex('#a04040'));
  else c.line(g.head.x + 6, my, g.head.x + 8, my, hex('#a04040'));
  c.px(ex1 - 1, ey + 4, hex('#f09090', 160)); c.px(ex2 + 2, ey + 4, hex('#f09090', 160));
}

// ================= LỚP TÓC (xám) =================
export const HAIR_STYLES = 6;
function drawHair(c: Canvas, p: Pose, style: number): void {
  const g = geom(p);
  const { x, y, rx, ry } = g.head;
  // phần sau
  if (style === 1) { // đuôi ngựa
    c.ellipse(x - 12, y + 2, 4, 6, G.mid); c.poly([[x - 14, y - 2], [x - 20, y + 16 + p.bob * 0.3], [x - 16, y + 18], [x - 10, y + 4]], G.mid);
  } else if (style === 3) { // tóc dài
    c.poly([[x - 13, y - 4], [x - 15, y + 26], [x - 3, y + 24], [x - 2, y + 4]], G.mid);
  } else if (style === 4) { // hai búi
    c.ellipse(x - 8, y - 13, 5, 5, G.mid); c.ellipse(x + 6, y - 14, 5, 5, G.mid);
  } else if (style === 2) { // búi tóc võ hiệp
    c.ellipse(x - 2, y - 15, 5, 4, G.mid); c.rect(x - 4, y - 12, 4, 2, G.dark);
  }
  // mũ tóc chính
  c.ellipse(x - 1, y - 7, rx + 1, ry - 4, G.base);
  c.rect(x - rx, y - 6, 7, 13, G.base); // gáy (phía sau đầu khi quay phải)
  // mái
  if (style === 0) { for (let k = 0; k < 4; k++) c.poly([[x - 6 + k * 5, y - 10], [x - 2 + k * 5, y - 18 - (k % 2) * 3], [x + 1 + k * 5, y - 9]], G.base); c.poly([[x + 2, y - 9], [x + 14, y - 7], [x + 13, y - 2]], G.base); }
  else if (style === 5) { c.poly([[x - 2, y - 11], [x + 15, y - 8], [x + 15, y + 4], [x + 12, y - 3]], G.base); c.rect(x - rx, y, 6, 12, G.base); }
  else { c.poly([[x, y - 11], [x + 14, y - 7], [x + 13, y - 3], [x + 8, y - 5], [x + 4, y - 2]], G.base); }
  // ánh tóc
  c.line(x - 6, y - 12, x + 2, y - 14, gray(255));
  c.line(x - rx + 1, y - 2, x - rx + 1, y + 6, G.dark);
}

// ================= LỚP TRANG PHỤC (xám) + VIỀN (màu thật) =================
export const OUTFIT_STYLES = 4;
function drawOutfit(c: Canvas, p: Pose, style: number): void {
  const g = geom(p);
  const top = g.torsoTop, bot = g.torsoBot;
  const skirt = style === 2 ? 20 : style === 1 ? 14 : style === 0 ? 7 : 3;
  // tay áo sau
  const hb = handPos(p, false);
  const sleeveW = style === 2 ? 7 : style === 3 ? 4 : 5;
  c.line(g.shoulderB.x, g.shoulderB.y, (g.shoulderB.x * 0.3 + hb.x * 0.7), (g.shoulderB.y * 0.3 + hb.y * 0.7), G.mid, sleeveW);
  // thân áo
  c.rect(g.torsoX - 1, top, g.torsoW + 2, bot - top, G.base);
  // vạt áo
  if (!p.sit) c.poly([[g.torsoX - 1, bot - 2], [g.torsoX + g.torsoW + 1, bot - 2], [g.torsoX + g.torsoW + 3 + p.legF[0] * 0.4, bot + skirt], [g.torsoX - 3 + p.legB[0] * 0.4, bot + skirt]], G.base);
  else c.poly([[g.torsoX - 6, bot - 2], [g.torsoX + g.torsoW + 8, bot - 2], [g.torsoX + g.torsoW + 10, bot + 6], [g.torsoX - 8, bot + 6]], G.base);
  // nếp gấp & cổ áo chéo
  c.line(g.torsoX + 4, top, g.torsoX + 10, top + 10, G.dark);
  c.line(g.torsoX + 2, bot + 1, g.torsoX + 2, bot + skirt - 1, G.mid);
  // tay áo trước
  const hf = handPos(p, true);
  c.line(g.shoulderF.x, g.shoulderF.y, (g.shoulderF.x * 0.3 + hf.x * 0.7), (g.shoulderF.y * 0.3 + hf.y * 0.7), G.base, sleeveW);
  if (style === 2) c.ellipse(g.shoulderF.x * 0.3 + hf.x * 0.7, g.shoulderF.y * 0.3 + hf.y * 0.7 + 2, 4, 3, G.base); // ống tay rộng đạo bào
}
function drawLegs(c: Canvas, p: Pose, style: number): void {
  const g = geom(p);
  const pants = hex('#2a2a3a');
  const shoe = hex(style === 3 ? '#1a1a1a' : '#5a4030');
  if (!p.sit) {
    c.rect(g.hipB.x - 3 + p.legB[0], g.hipB.y + 4, 5, g.feetY - g.hipB.y - 6 - p.legB[1], shade(pants, 0.8));
    c.rect(g.hipF.x - 2 + p.legF[0], g.hipF.y + 4, 5, g.feetY - g.hipF.y - 6 - p.legF[1], pants);
    c.rect(g.hipB.x - 3 + p.legB[0], g.feetY - 3 - p.legB[1], 7, 3, shade(shoe, 0.8));
    c.rect(g.hipF.x - 2 + p.legF[0], g.feetY - 3 - p.legF[1], 7, 3, shoe);
  } else {
    c.rect(g.torsoX - 8, g.torsoBot + 3, g.torsoW + 18, 4, pants);
  }
}
function drawBelt(c: Canvas, p: Pose, style: number): void {
  const g = geom(p);
  const belt = hex(style === 2 ? '#c8a050' : '#7a4a22');
  c.rect(g.torsoX - 1, g.torsoBot - 6, g.torsoW + 2, 3, belt);
  c.px(g.torsoX + g.torsoW - 3, g.torsoBot - 3, belt); c.px(g.torsoX + g.torsoW - 3, g.torsoBot - 2, belt);
  c.line(g.torsoX + 4, g.torsoTop, g.torsoX + 9, g.torsoTop + 6, hex('#f0f0f0'));
}

// ================= VŨ KHÍ (màu thật) =================
export const WEAPON_LOOKS = ['sword', 'saber', 'staff'] as const;
const TIER_COLORS = [['#b08850', '#7a5a30'], ['#c8ccd8', '#8a8fa0'], ['#a8d8ff', '#5a8ac0'], ['#ffd870', '#c09030'], ['#ff9ad8', '#b04a90']];
function drawWeapon(c: Canvas, p: Pose, look: string, tier: number): void {
  const h = handPos(p, true);
  const a = p.armF + p.weapon + (look === 'staff' ? 0 : 1.35);
  const dirx = Math.sin(a), diry = Math.cos(a);
  const [blade, dark] = TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)].map((x) => hex(x));
  const hilt = hex('#5a3a20');
  if (look === 'staff') {
    c.line(h.x - dirx * 12, h.y - diry * 12, h.x + dirx * 22, h.y + diry * 22, hex('#7a5030'), 2);
    c.ellipse(h.x - dirx * 13, h.y - diry * 13, 3, 3, blade);
    return;
  }
  const len = look === 'saber' ? 24 : 26;
  c.line(h.x - dirx * 3, h.y - diry * 3, h.x + dirx * 3, h.y + diry * 3, hilt, 2);
  // chắn kiếm
  c.line(h.x + dirx * 3 - diry * 3, h.y + diry * 3 + dirx * 3, h.x + dirx * 3 + diry * 3, h.y + diry * 3 - dirx * 3, dark, 1);
  c.line(h.x + dirx * 4, h.y + diry * 4, h.x + dirx * len, h.y + diry * len, blade, look === 'saber' ? 3 : 2);
  c.line(h.x + dirx * 5 + diry * 0.5, h.y + diry * 5, h.x + dirx * (len - 2), h.y + diry * (len - 2), shade(blade, 1.2), 1);
}

// ================= GHÉP SHEET =================
export type Layer = { kind: 'body' } | { kind: 'face'; face: number; eyes: number } | { kind: 'hair'; style: number } | { kind: 'outfit'; style: number } | { kind: 'legs'; style: number } | { kind: 'belt'; style: number } | { kind: 'weapon'; look: string; tier: number };

export function renderFrame(layer: Layer, anim: string, i: number): Canvas {
  const p = pose(anim, i);
  const c = new Canvas(FW, FH);
  switch (layer.kind) {
    case 'body': drawBody(c, p); c.outline(gray(70)); break;
    case 'face': drawFace(c, p, layer.face, layer.eyes); break;
    case 'hair': drawHair(c, p, layer.style); c.outline(gray(70)); break;
    case 'outfit': drawOutfit(c, p, layer.style); c.outline(gray(80)); break;
    case 'legs': drawLegs(c, p, layer.style); break;
    case 'belt': drawBelt(c, p, layer.style); break;
    case 'weapon': drawWeapon(c, p, layer.look, layer.tier); c.outline(hex('#202020')); break;
  }
  if (p.rot) return c.rotated(p.rot, 32, 93);
  return c;
}
export function renderSheet(layer: Layer): Canvas {
  const sheet = new Canvas(FW * COLS, FH * ANIMS.length);
  ANIMS.forEach((a, row) => { for (let i = 0; i < a.frames; i++) sheet.blit(renderFrame(layer, a.name, i), i * FW, row * FH); });
  return sheet;
}

/** Ảnh xem trước nhân vật đã tô màu (dùng cho tài liệu / CHR_001) */
export function compositeCharacter(opts: { skin: string; hair: number; hairColor: string; face: number; eyes: number; outfit: number; outfitColor: string; weapon?: { look: string; tier: number } }, anim: string, i: number): Canvas {
  const out = new Canvas(FW, FH);
  const tint = (src: Canvas, col: string) => { const t = hex(col); for (let k = 0; k < src.data.length; k += 4) { src.data[k] = src.data[k] * t[0] / 255; src.data[k + 1] = src.data[k + 1] * t[1] / 255; src.data[k + 2] = src.data[k + 2] * t[2] / 255; } return src; };
  out.blit(tint(renderFrame({ kind: 'body' }, anim, i), opts.skin), 0, 0);
  out.blit(renderFrame({ kind: 'legs', style: opts.outfit }, anim, i), 0, 0);
  out.blit(tint(renderFrame({ kind: 'outfit', style: opts.outfit }, anim, i), opts.outfitColor), 0, 0);
  out.blit(renderFrame({ kind: 'belt', style: opts.outfit }, anim, i), 0, 0);
  out.blit(renderFrame({ kind: 'face', face: opts.face, eyes: opts.eyes }, anim, i), 0, 0);
  out.blit(tint(renderFrame({ kind: 'hair', style: opts.hair }, anim, i), opts.hairColor), 0, 0);
  if (opts.weapon) out.blit(renderFrame({ kind: 'weapon', ...opts.weapon }, anim, i), 0, 0);
  return out;
}
export type { RGBA };
