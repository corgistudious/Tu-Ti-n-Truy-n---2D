import type { AssetEntry } from './manifest.js';
import { STYLE_GUIDE } from './manifest.js';

/** Sinh prompt cho ChatGPT (Manual Mode) hoặc OpenAI Images API (API Mode) theo đặc tả kỹ thuật của từng tài nguyên */
export function promptFor(a: AssetEntry): string {
  const s = a.spec;
  const tech: string[] = [];
  if (s.kind === 'sheet') tech.push(`Sprite sheet ${s.w}×${s.h}px, lưới ${s.cols} cột, mỗi khung ${s.frameW}×${s.frameH}px, các hàng theo thứ tự: ${s.rows!.join(', ')}. Khung thừa để trống trong suốt. Chân nhân vật chạm đáy khung, căn giữa.`);
  if (s.kind === 'image') tech.push(`Ảnh ${s.w}×${s.h}px${s.frameW ? `, chia ô ${s.frameW}×${s.frameH}` : ''}.`);
  if (s.kind === 'atlas') tech.push(`Atlas lưới ${s.cols} cột, ô ${s.frameW}×${s.frameH}px, mỗi ô một biểu tượng theo đúng thứ tự trong assets/icons/*.json.`);
  if (s.kind === 'audio') return `[ÂM THANH] ${a.desc}. Yêu cầu: WAV PCM 16-bit, chỉ dùng âm thanh tự tạo hoặc có giấy phép thương mại rõ ràng; ghi lại nguồn/giấy phép. (ChatGPT không tạo âm thanh — dùng công cụ được cấp phép rồi nhập qua asset-pipeline.)`;
  if (s.transparent) tech.push('Nền trong suốt PNG RGBA, không bóng đổ nền, không chữ, không watermark.');
  if (a.category === 'character' && /xám/.test(a.desc)) tech.push('Vẽ lớp này bằng THANG XÁM (trắng = màu gốc) để game tô màu bằng modulate; giữ đúng vị trí/khung với các lớp khác.');
  if (a.id === 'CHR_001') tech.push('Giữ nguyên thiết kế nhân vật giống hệt nhau giữa MỌI khung hình và animation.');
  return `${STYLE_GUIDE}\n\nTài nguyên: ${a.id} — ${a.desc}\n${tech.join('\n')}\nĐầu ra: một file PNG duy nhất đúng kích thước trên.`;
}
