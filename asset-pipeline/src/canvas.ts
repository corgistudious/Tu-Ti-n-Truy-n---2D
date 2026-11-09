import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type RGBA = [number, number, number, number];
export function hex(h: string, a = 255): RGBA {
  const v = h.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), a];
}
export function shade(c: RGBA, f: number): RGBA { return [Math.max(0, Math.min(255, Math.round(c[0] * f))), Math.max(0, Math.min(255, Math.round(c[1] * f))), Math.max(0, Math.min(255, Math.round(c[2] * f))), c[3]]; }
export function gray(v: number, a = 255): RGBA { return [v, v, v, a]; }
export const CLEAR: RGBA = [0, 0, 0, 0];

/** Canvas RGBA tối giản cho pixel art (không khử răng cưa) */
export class Canvas {
  data: Uint8Array;
  constructor(readonly w: number, readonly h: number) { this.data = new Uint8Array(w * h * 4); }
  get(x: number, y: number): RGBA { const i = (y * this.w + x) * 4; return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]]; }
  px(x: number, y: number, c: RGBA): void {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || c[3] === 0) return;
    const i = (y * this.w + x) * 4;
    if (c[3] === 255 || this.data[i + 3] === 0) { this.data[i] = c[0]; this.data[i + 1] = c[1]; this.data[i + 2] = c[2]; this.data[i + 3] = c[3]; return; }
    const a = c[3] / 255;
    this.data[i] = Math.round(c[0] * a + this.data[i] * (1 - a));
    this.data[i + 1] = Math.round(c[1] * a + this.data[i + 1] * (1 - a));
    this.data[i + 2] = Math.round(c[2] * a + this.data[i + 2] * (1 - a));
    this.data[i + 3] = Math.max(this.data[i + 3], c[3]);
  }
  rect(x: number, y: number, w: number, h: number, c: RGBA): void { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGBA): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) this.px(x, y, c);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGBA, thick = 1): void {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * (i / n), y = y0 + (y1 - y0) * (i / n);
      if (thick <= 1) this.px(x, y, c); else this.rect(Math.round(x - thick / 2), Math.round(y - thick / 2), thick, thick, c);
    }
  }
  poly(points: [number, number][], c: RGBA): void {
    const ys = points.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const xs: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % points.length];
        if ((y0 <= y + 0.5 && y1 > y + 0.5) || (y1 <= y + 0.5 && y0 > y + 0.5)) xs.push(x0 + ((y + 0.5 - y0) / (y1 - y0)) * (x1 - x0));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.px(x, y, c);
    }
  }
  /** viền ngoài 1px quanh mọi pixel đặc (phong cách pixel art) */
  outline(c: RGBA): void {
    const copy = new Uint8Array(this.data);
    const alpha = (x: number, y: number) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : copy[(y * this.w + x) * 4 + 3]);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (alpha(x, y) > 0) continue;
      if (alpha(x - 1, y) > 128 || alpha(x + 1, y) > 128 || alpha(x, y - 1) > 128 || alpha(x, y + 1) > 128) this.px(x, y, c);
    }
  }
  blit(src: Canvas, dx: number, dy: number, flipX = false): void {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.get(flipX ? src.w - 1 - x : x, y);
      if (c[3]) this.px(dx + x, dy + y, c);
    }
  }
  /** xoay quanh điểm (nearest-neighbor) */
  rotated(angle: number, ox: number, oy: number): Canvas {
    const out = new Canvas(this.w, this.h);
    const cos = Math.cos(-angle), sin = Math.sin(-angle);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const rx = (x - ox) * cos - (y - oy) * sin + ox, ry = (x - ox) * sin + (y - oy) * cos + oy;
      const sx = Math.round(rx), sy = Math.round(ry);
      if (sx >= 0 && sy >= 0 && sx < this.w && sy < this.h) { const c = this.get(sx, sy); if (c[3]) out.px(x, y, c); }
    }
    return out;
  }
  fade(f: number): void { for (let i = 3; i < this.data.length; i += 4) this.data[i] = Math.round(this.data[i] * f); }
  toPNG(): Buffer {
    const png = new PNG({ width: this.w, height: this.h });
    png.data = Buffer.from(this.data);
    return PNG.sync.write(png);
  }
  save(path: string): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, this.toPNG()); }
  static load(path: string): Canvas {
    const png = PNG.sync.read(readFileSync(path));
    const c = new Canvas(png.width, png.height);
    c.data = new Uint8Array(png.data);
    return c;
  }
}
