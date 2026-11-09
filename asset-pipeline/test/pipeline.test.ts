import { describe, expect, it } from 'vitest';
import { Canvas } from '../src/canvas.js';
import { renderSheet, FW, FH, ANIMS, COLS } from '../src/gen/characters.js';
import { renderMonsterSheet } from '../src/gen/monsters.js';
import { renderTileset } from '../src/gen/environment.js';
import { validatePng, validateWav, extractFrames, normalizeSheet, importTileset } from '../src/validate.js';
import { requiredAssets } from '../src/manifest.js';
import { promptFor } from '../src/prompts.js';
import { wav, renderBgm } from '../src/gen/audio.js';

const charSpec = { kind: 'sheet' as const, frameW: FW, frameH: FH, cols: COLS, rows: ANIMS.map((a) => `${a.name}(${a.frames})`), w: FW * COLS, h: FH * ANIMS.length, transparent: true, maxColors: 256 };

describe('asset pipeline', () => {
  it('sprite sheet nhân vật đạt chuẩn (kích thước, trong suốt, không khung trống)', () => {
    for (const layer of [{ kind: 'body' } as const, { kind: 'hair', style: 3 } as const, { kind: 'outfit', style: 2 } as const, { kind: 'weapon', look: 'sword', tier: 0 } as const]) {
      const r = validatePng(renderSheet(layer).toPNG(), charSpec);
      expect(r.errors, JSON.stringify(layer)).toEqual([]);
    }
  });
  it('validator bắt lỗi: sai kích thước, thiếu trong suốt, khung trống, không phải PNG', () => {
    expect(validatePng(new Canvas(10, 10).toPNG(), charSpec).ok).toBe(false);
    const opaque = new Canvas(FW * COLS, FH * ANIMS.length); opaque.rect(0, 0, opaque.w, opaque.h, [10, 20, 30, 255]);
    expect(validatePng(opaque.toPNG(), charSpec).errors.join()).toMatch(/trong suốt/);
    const empty = new Canvas(FW * COLS, FH * ANIMS.length);
    expect(validatePng(empty.toPNG(), charSpec).errors.join()).toMatch(/Khung trống/);
    expect(validatePng(Buffer.from('not a png at all'), charSpec).ok).toBe(false);
  });
  it('tách khung và chuẩn hóa sheet ChatGPT kích thước khác về lưới chuẩn', () => {
    const big = renderMonsterSheet('wolf');
    const frames = extractFrames(big, 64, 64);
    expect(frames.length).toBe(5);
    // giả lập ChatGPT trả sheet 128×128/khung
    const up = new Canvas(big.w * 2, big.h * 2);
    for (let y = 0; y < up.h; y++) for (let x = 0; x < up.w; x++) up.px(x, y, big.get(x >> 1, y >> 1));
    const norm = normalizeSheet(up, 128, 128, [{ row: 0, frames: 4 }, { row: 1, frames: 4 }], 64, 64, 4);
    expect(norm.w).toBe(256); expect(norm.h).toBe(128);
    expect(validatePng(norm.toPNG(), { kind: 'image', w: 256, h: 128, transparent: true }).ok).toBe(true);
  });
  it('tilemap importer lấy đúng 8 ô 32×32', () => {
    const ts = importTileset(renderTileset('village'), 32, [0, 1, 2, 3, 4, 5, 6, 7]);
    expect(validatePng(ts.toPNG(), { kind: 'image', w: 256, h: 32, frameW: 32, frameH: 32 }).ok).toBe(true);
  });
  it('manifest bao phủ tài nguyên dữ liệu game + prompt ChatGPT có đặc tả kỹ thuật', () => {
    const a = requiredAssets();
    expect(a.find((x) => x.id === 'CHR_001')).toBeTruthy();
    expect(a.filter((x) => x.category === 'monster').length).toBeGreaterThanOrEqual(13);
    expect(a.filter((x) => x.category === 'tileset').length).toBeGreaterThanOrEqual(20);
    const p = promptFor(a.find((x) => x.id === 'CHR_001')!);
    expect(p).toMatch(/64×96/); expect(p).toMatch(/TRONG SUỐT/); expect(p).toMatch(/Không sao chép/);
  });
  it('âm thanh WAV hợp lệ', () => {
    expect(validateWav(wav(renderBgm('village', 2))).ok).toBe(true);
  });
});
