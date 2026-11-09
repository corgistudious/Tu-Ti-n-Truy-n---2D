/** Bộ lọc nội dung cơ bản (tên nhân vật, chat). Danh sách có thể mở rộng qua cấu hình. */
const BANNED = ['dit', 'đụ', 'địt', 'lồn', 'buồi', 'cặc', 'đéo', 'vãi lồn', 'fuck', 'shit', 'admin', 'gm ', 'moderator'];
const NAME_RESERVED = ['admin', 'gm', 'system', 'hệ thống', 'quản trị', 'moderator'];
export function normalize(s: string): string { return s.normalize('NFC').toLowerCase(); }
export function maskProfanity(text: string): string {
  let out = text;
  for (const w of BANNED.filter((b) => !['admin', 'gm ', 'moderator'].includes(b))) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
    out = out.replace(re, (m) => '*'.repeat(m.length));
  }
  return out;
}
export function validateCharacterName(name: string): string | null {
  const n = name.normalize('NFC');
  if (n.length < 2 || n.length > 14) return 'Tên dài 2–14 ký tự';
  if (!/^[\p{L}\p{N}]+( [\p{L}\p{N}]+)*$/u.test(n)) return 'Tên chỉ gồm chữ, số và một khoảng trắng giữa các từ';
  const low = normalize(n);
  if (NAME_RESERVED.some((r) => low.includes(r))) return 'Tên chứa từ bị cấm';
  if (BANNED.some((b) => low.includes(b.trim()))) return 'Tên không phù hợp';
  return null;
}
export function sanitizeText(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  // loại bỏ ký tự điều khiển & BBCode/markup để client không render nội dung độc hại
  return s.normalize('NFC').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e]/g, '').replace(/[\[\]<>]/g, '').trim().slice(0, max);
}
