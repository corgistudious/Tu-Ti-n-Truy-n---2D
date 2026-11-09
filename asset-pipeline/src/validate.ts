import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Canvas } from './canvas.js';
import type { Spec } from './manifest.js';

export interface ValidationResult { ok: boolean; errors: string[]; warnings: string[]; info: Record<string, number> }

/** Kiểm tra kỹ thuật PNG: định dạng, kích thước, kênh alpha, khung trống, dấu hiệu khử răng cưa (không phải pixel art) */
export function validatePng(buf: Buffer, spec: Spec): ValidationResult {
  const errors: string[] = [], warnings: string[] = [];
  const info: Record<string, number> = {};
  if (buf.subarray(1, 4).toString() !== 'PNG') return { ok: false, errors: ['Không phải file PNG'], warnings, info };
  let png: PNG;
  try { png = PNG.sync.read(buf); } catch (e) { return { ok: false, errors: [`PNG hỏng: ${(e as Error).message}`], warnings, info }; }
  info.width = png.width; info.height = png.height;
  if (spec.w && png.width !== spec.w) errors.push(`Chiều rộng ${png.width} ≠ ${spec.w}`);
  if (spec.h && png.height !== spec.h) errors.push(`Chiều cao ${png.height} ≠ ${spec.h}`);
  if (spec.frameW && png.width % spec.frameW !== 0) errors.push(`Chiều rộng không chia hết cho khung ${spec.frameW}`);
  if (spec.frameH && png.height % spec.frameH !== 0) errors.push(`Chiều cao không chia hết cho khung ${spec.frameH}`);
  let transparent = 0, semi = 0;
  const colors = new Set<number>();
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3];
    if (a === 0) transparent++;
    else { if (a < 250) semi++; colors.add((png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2]); }
  }
  const total = png.width * png.height;
  info.transparentPct = Math.round((transparent / total) * 1000) / 10;
  info.semiTransparentPct = Math.round((semi / total) * 1000) / 10;
  info.colors = colors.size;
  if (spec.transparent && transparent === 0) errors.push('Thiếu nền trong suốt (không có pixel alpha = 0)');
  if (spec.transparent && semi / Math.max(1, total - transparent) > 0.08) warnings.push('Nhiều pixel bán trong suốt — có thể bị khử răng cưa/nhòe, không đúng phong cách pixel art');
  if (spec.maxColors && colors.size > spec.maxColors) warnings.push(`Quá nhiều màu (${colors.size} > ${spec.maxColors}) — có thể là ảnh mịn thay vì pixel art`);
  if (spec.kind === 'sheet' && spec.frameW && spec.frameH && spec.rows && errors.length === 0) {
    const c = new Canvas(png.width, png.height); c.data = new Uint8Array(png.data);
    spec.rows.forEach((r, row) => {
      const n = Number(/\((\d+)\)/.exec(r)?.[1] ?? 0);
      for (let col = 0; col < n; col++) if (frameEmpty(c, col * spec.frameW!, row * spec.frameH!, spec.frameW!, spec.frameH!)) errors.push(`Khung trống: ${r} #${col}`);
    });
  }
  return { ok: errors.length === 0, errors, warnings, info };
}
function frameEmpty(c: Canvas, x0: number, y0: number, w: number, h: number): boolean {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (c.data[(y * c.w + x) * 4 + 3] > 0) return false;
  return true;
}
export function validateWav(buf: Buffer): ValidationResult {
  const errors: string[] = [];
  if (buf.subarray(0, 4).toString() !== 'RIFF' || buf.subarray(8, 12).toString() !== 'WAVE') errors.push('Không phải WAV');
  const info = { channels: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34) };
  if (info.bits !== 16) errors.push('Cần PCM 16-bit');
  return { ok: errors.length === 0, errors, warnings: [], info };
}
export function validateFile(path: string, spec: Spec): ValidationResult {
  const buf = readFileSync(path);
  return spec.kind === 'audio' ? validateWav(buf) : validatePng(buf, spec);
}

/** Tách khung từ sprite sheet */
export function extractFrames(sheet: Canvas, fw: number, fh: number): Canvas[][] {
  const out: Canvas[][] = [];
  for (let r = 0; r < sheet.h / fh; r++) {
    const row: Canvas[] = [];
    for (let c = 0; c < sheet.w / fw; c++) { const f = new Canvas(fw, fh); for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) f.px(x, y, sheet.get(c * fw + x, r * fh + y)); row.push(f); }
    out.push(row);
  }
  return out;
}

/**
 * Animation importer: chuẩn hóa sheet bất kỳ (vd ChatGPT trả mỗi hàng một animation, khung kích thước khác)
 * về lưới chuẩn của game. layoutIn: [{row, frames}] theo thứ tự animation chuẩn; scale nearest-neighbor; căn chân đáy giữa.
 */
export function normalizeSheet(src: Canvas, inFw: number, inFh: number, layoutIn: { row: number; frames: number }[], outFw: number, outFh: number, outCols: number): Canvas {
  const out = new Canvas(outFw * outCols, outFh * layoutIn.length);
  const scale = Math.min(outFw / inFw, outFh / inFh);
  const sw = Math.floor(inFw * scale), sh = Math.floor(inFh * scale);
  layoutIn.forEach((l, i) => {
    for (let k = 0; k < Math.min(l.frames, outCols); k++) {
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
        const c = src.get(Math.min(src.w - 1, k * inFw + Math.floor(x / scale)), Math.min(src.h - 1, l.row * inFh + Math.floor(y / scale)));
        if (c[3] > 127) out.px(k * outFw + Math.floor((outFw - sw) / 2) + x, i * outFh + (outFh - sh) + y, [c[0], c[1], c[2], 255]);
      }
    }
  });
  return out;
}
/** Tilemap importer: lấy 8 ô 32×32 từ tileset bất kỳ theo danh sách chỉ số ô nguồn */
export function importTileset(src: Canvas, tileSize: number, pick: number[]): Canvas {
  const cols = Math.floor(src.w / tileSize);
  const out = new Canvas(32 * 8, 32);
  pick.slice(0, 8).forEach((idx, i) => {
    const sx = (idx % cols) * tileSize, sy = Math.floor(idx / cols) * tileSize;
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const c = src.get(sx + Math.floor((x * tileSize) / 32), sy + Math.floor((y * tileSize) / 32)); if (c[3]) out.px(i * 32 + x, y, c); }
  });
  return out;
}
