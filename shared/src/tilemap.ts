import { TILE } from './constants.js';
import { seededRng } from './formulas.js';
import type { MapDef } from './types.js';

/**
 * Lưới va chạm của bản đồ màn hình ngang.
 *  '#' = khối đặc, '=' = bục một chiều (đi xuyên từ dưới lên), '.' = trống
 * Bản đồ được sinh TẤT ĐỊNH từ MapDef (seed) nên server và client luôn có cùng một lưới.
 */
export interface TileGrid {
  w: number;
  h: number;
  rows: string[];
  groundTop: number[]; // hàng ô mặt đất (đầu tiên là khối đặc) cho mỗi cột
}

export function generateGrid(def: MapDef): TileGrid {
  const rng = seededRng(def.seed);
  const w = def.width, h = def.height;
  const cells: string[][] = Array.from({ length: h }, () => Array(w).fill('.'));
  const groundTop: number[] = [];
  const baseGround = h - 4;
  let g = baseGround;
  const amplitude = def.terrain === 'mountain' ? 4 : def.terrain === 'hills' ? 2 : def.terrain === 'cave' ? 2 : def.terrain === 'sky' ? 3 : 0;
  let run = 0;
  for (let x = 0; x < w; x++) {
    if (amplitude > 0 && run <= 0 && x > 6 && x < w - 6) {
      const step = Math.floor(rng() * 3) - 1; // -1, 0, +1 — chỉ bậc 1 ô để luôn nhảy qua được
      g = Math.max(baseGround - amplitude, Math.min(baseGround + 1, g + step));
      run = 4 + Math.floor(rng() * 7);
    }
    run--;
    // vùng đầu/cuối bản đồ & vùng an toàn bằng phẳng để đặt NPC/cổng
    const flat = x < 8 || x > w - 9;
    const gy = flat ? baseGround : g;
    groundTop.push(gy);
    for (let y = gy; y < h; y++) cells[y][x] = '#';
  }
  // trần hang động
  if (def.terrain === 'cave') {
    for (let x = 0; x < w; x++) {
      const ceil = 1 + Math.floor(rng() * 2);
      for (let y = 0; y < ceil; y++) cells[y][x] = '#';
    }
  }
  // bục một chiều
  const nPlat = def.platforms;
  for (let i = 0; i < nPlat; i++) {
    const len = 4 + Math.floor(rng() * 6);
    const px = 10 + Math.floor(rng() * Math.max(1, w - 20 - len));
    const ground = Math.min(...groundTop.slice(px, px + len));
    const py = ground - 3 - Math.floor(rng() * 2) - (i % 3 === 2 ? 3 : 0);
    if (py < 3) continue;
    for (let x = px; x < px + len && x < w - 1; x++) if (cells[py][x] === '.') cells[py][x] = '=';
  }
  // tường hai bên
  for (let y = 0; y < h; y++) { cells[y][0] = '#'; cells[y][w - 1] = '#'; }
  return { w, h, rows: cells.map((r) => r.join('')), groundTop };
}

export function tileAt(grid: TileGrid, tx: number, ty: number): string {
  if (tx < 0 || tx >= grid.w || ty >= grid.h) return '#';
  if (ty < 0) return '.';
  return grid.rows[ty][tx];
}

/** Toạ độ px (chân nhân vật) trên mặt đất tại toạ độ x px */
export function groundYAt(grid: TileGrid, px: number): number {
  const tx = Math.max(0, Math.min(grid.w - 1, Math.floor(px / TILE)));
  return grid.groundTop[tx] * TILE;
}

export interface Body {
  x: number;      // tâm theo trục ngang (px)
  y: number;      // đáy (chân) (px)
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
}

function solidAt(grid: TileGrid, tx: number, ty: number): boolean { return tileAt(grid, tx, ty) === '#'; }

/** Di chuyển AABB với va chạm theo ô. Trả về body đã cập nhật (thay đổi tại chỗ). */
export function moveBody(grid: TileGrid, b: Body, dt: number, gravity: number, maxFall: number, dropThrough = false, flying = false): Body {
  if (!flying) b.vy = Math.min(maxFall, b.vy + gravity * dt);
  // chia nhỏ bước để không xuyên tường khi vận tốc lớn (mỗi bước tối đa nửa ô)
  const maxStep = TILE / 2 - 1;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b.vx), Math.abs(b.vy)) * dt / maxStep));
  const sdt = dt / steps;
  let grounded = false;
  for (let i = 0; i < steps; i++) { stepBody(grid, b, sdt, dropThrough, flying); if (b.onGround) grounded = true; }
  b.onGround = grounded && b.vy >= 0;
  return b;
}

function stepBody(grid: TileGrid, b: Body, dt: number, dropThrough: boolean, flying: boolean): void {
  // trục X
  let nx = b.x + b.vx * dt;
  const half = b.w / 2;
  const top = b.y - b.h + 1, bottom = b.y - 1;
  const ty0 = Math.floor(top / TILE), ty1 = Math.floor(bottom / TILE);
  if (b.vx > 0) {
    const tx = Math.floor((nx + half) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) if (solidAt(grid, tx, ty)) { nx = tx * TILE - half - 0.01; b.vx = 0; break; }
  } else if (b.vx < 0) {
    const tx = Math.floor((nx - half) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) if (solidAt(grid, tx, ty)) { nx = (tx + 1) * TILE + half + 0.01; b.vx = 0; break; }
  }
  b.x = nx;
  // trục Y
  let ny = b.y + b.vy * dt;
  const tx0 = Math.floor((b.x - half + 1) / TILE), tx1 = Math.floor((b.x + half - 1) / TILE);
  b.onGround = false;
  if (b.vy > 0) {
    const prevTy = Math.floor((b.y - 0.01) / TILE);
    const ty = Math.floor(ny / TILE);
    for (let row = prevTy + 1; row <= ty; row++) {
      let hit = false;
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = tileAt(grid, tx, row);
        if (t === '#' || (t === '=' && !dropThrough)) { hit = true; break; }
      }
      if (hit) { ny = row * TILE; b.vy = 0; b.onGround = true; break; }
    }
  } else if (b.vy < 0) {
    const ty = Math.floor((ny - b.h) / TILE);
    for (let tx = tx0; tx <= tx1; tx++) if (solidAt(grid, tx, ty)) { ny = (ty + 1) * TILE + b.h; b.vy = 0; break; }
  }
  b.y = ny;
  if (!b.onGround && b.vy === 0 && !flying) {
    // kiểm tra đứng yên trên mặt
    const row = Math.floor(b.y / TILE);
    for (let tx = tx0; tx <= tx1; tx++) { const t = tileAt(grid, tx, row); if ((t === '#' || t === '=') && Math.abs(b.y - row * TILE) < 0.5) b.onGround = true; }
  }
}

/** Hộp có nằm trong khối đặc không (dùng để chống xuyên tường / dịch chuyển bất hợp lệ) */
export function overlapsSolid(grid: TileGrid, x: number, y: number, w: number, h: number): boolean {
  const tx0 = Math.floor((x - w / 2 + 2) / TILE), tx1 = Math.floor((x + w / 2 - 2) / TILE);
  const ty0 = Math.floor((y - h + 2) / TILE), ty1 = Math.floor((y - 2) / TILE);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (solidAt(grid, tx, ty)) return true;
  return false;
}

/** Có đứng trên mặt (đặc hoặc bục) không */
export function standingOn(grid: TileGrid, x: number, y: number, w: number): boolean {
  const row = Math.floor((y + 1) / TILE);
  if (Math.abs(y - row * TILE) > 3) return false;
  const tx0 = Math.floor((x - w / 2 + 1) / TILE), tx1 = Math.floor((x + w / 2 - 1) / TILE);
  for (let tx = tx0; tx <= tx1; tx++) { const t = tileAt(grid, tx, row); if (t === '#' || t === '=') return true; }
  return false;
}
