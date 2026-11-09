import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ITEMS, SKILLS } from '@tt/shared';
import { Canvas } from './canvas.js';
import { ANIMS, FW, FH, COLS, HAIR_STYLES, OUTFIT_STYLES, WEAPON_LOOKS, compositeCharacter, renderSheet } from './gen/characters.js';
import { ARCHETYPES, renderMonsterSheet } from './gen/monsters.js';
import { THEMES, renderItemIcons, renderParallax, renderSkillIcons, renderTileset } from './gen/environment.js';
import { BGM_MAP, BGM_THEMES, SFX, renderBgm, save as saveWav } from './gen/audio.js';
import { CLIENT, ROOT, loadManifest, saveManifest, sha256File, syncManifest } from './manifest.js';
import { promptFor } from './prompts.js';
import { validateFile } from './validate.js';
import { seededRng } from '@tt/shared';

const A = (p: string) => join(CLIENT, 'assets', p);

export function generateAll(): number {
  let n = 0;
  const w = (c: Canvas, p: string) => { c.save(A(p)); n++; };
  // nhân vật (thân dùng chung cho nam/nữ; nữ khác ở tóc/trang phục — 2 file để có thể thay riêng)
  const body = renderSheet({ kind: 'body' });
  w(body, 'characters/body_male.png'); w(body, 'characters/body_female.png');
  for (let f = 0; f < 4; f++) for (let e = 0; e < 4; e++) w(renderSheet({ kind: 'face', face: f, eyes: e }), `characters/face_${f}_${e}.png`);
  for (let h = 0; h < HAIR_STYLES; h++) w(renderSheet({ kind: 'hair', style: h }), `characters/hair_${h}.png`);
  for (let o = 0; o < OUTFIT_STYLES; o++) { w(renderSheet({ kind: 'outfit', style: o }), `characters/outfit_${o}.png`); w(renderSheet({ kind: 'legs', style: o }), `characters/legs_${o}.png`); w(renderSheet({ kind: 'belt', style: o }), `characters/belt_${o}.png`); }
  for (const look of WEAPON_LOOKS) for (let t = 0; t < 5; t++) w(renderSheet({ kind: 'weapon', look, tier: t }), `weapons/wpn_${look}_${t}.png`);
  // CHR_001 — Thiếu Niên Nhập Đạo
  const prev = new Canvas(FW * COLS, FH * ANIMS.length);
  ANIMS.forEach((a, r) => { for (let i = 0; i < a.frames; i++) prev.blit(compositeCharacter({ skin: '#f2c9a0', hair: 2, hairColor: '#1a1a1a', face: 1, eyes: 1, outfit: 0, outfitColor: '#3a6aaa', weapon: { look: 'sword', tier: 0 } }, a.name, i), i * FW, r * FH); });
  w(prev, 'characters/CHR_001_preview.png');
  // biểu tượng ứng dụng: CHR_001 phóng to 2x trên nền tối
  const icon = new Canvas(128, 128);
  icon.rect(0, 0, 128, 128, [26, 20, 34, 255]);
  const f0 = compositeCharacter({ skin: '#f2c9a0', hair: 2, hairColor: '#1a1a1a', face: 1, eyes: 1, outfit: 0, outfitColor: '#3a6aaa', weapon: { look: 'sword', tier: 0 } }, 'idle', 0);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const c = f0.get(x, y + 14); if (c[3]) icon.rect(x * 2, y * 2, 2, 2, c); }
  icon.save(join(CLIENT, 'icon.png')); n++;
  for (const k of Object.keys(ARCHETYPES)) w(renderMonsterSheet(k), `monsters/${k}.png`);
  for (const t of Object.keys(THEMES)) { w(renderTileset(t), `tiles/${t}.png`); for (const l of [0, 1, 2] as const) w(renderParallax(t, l), `parallax/${t}_${l}.png`); }
  const icons = renderItemIcons(Object.values(ITEMS));
  w(icons.atlas, 'icons/items.png'); writeFileSync(A('icons/items.json'), JSON.stringify(icons.index));
  const sk = renderSkillIcons(Object.values(SKILLS));
  w(sk.atlas, 'icons/skills.png'); writeFileSync(A('icons/skills.json'), JSON.stringify(sk.index));
  for (const t of Object.keys(BGM_THEMES)) { saveWav(A(`audio/bgm_${t}.wav`), renderBgm(t)); n++; }
  for (const [k, fn] of Object.entries(SFX)) { saveWav(A(`audio/sfx_${k}.wav`), fn(seededRng(k.length * 7))); n++; }
  writeFileSync(A('audio/bgm_map.json'), JSON.stringify(BGM_MAP));
  return n;
}

function writePrompts(): void {
  const m = syncManifest();
  const dir = join(ROOT, 'asset-pipeline', 'prompts');
  mkdirSync(dir, { recursive: true });
  const lines = ['# Danh sách tài nguyên yêu cầu ChatGPT (Manual Mode)', '', 'Quy trình: copy prompt → ChatGPT → tải PNG → đặt vào `asset-pipeline/inbox/<ID>.png` → `npm run import -w asset-pipeline` → kiểm tra trong game → `npm run approve -w asset-pipeline -- <ID> --license "<giấy phép>" --reviewer "<tên>"`.', ''];
  const byCat: Record<string, typeof m.assets[string][]> = {};
  for (const a of Object.values(m.assets)) (byCat[a.category] ??= []).push(a);
  for (const [cat, list] of Object.entries(byCat)) {
    lines.push(`## ${cat} (${list.length})`, '');
    for (const a of list) {
      const p = promptFor(a);
      writeFileSync(join(dir, `${a.id}.txt`), p + '\n');
      lines.push(`### ${a.id} — trạng thái: ${a.status}`, '', '```', p, '```', '');
    }
  }
  writeFileSync(join(ROOT, 'docs', 'CHATGPT_ASSET_REQUESTS.md'), lines.join('\n'));
  saveManifest(m);
}

function validateAll(): boolean {
  const m = syncManifest();
  let ok = true, count = 0;
  for (const a of Object.values(m.assets)) {
    const p = join(CLIENT, a.path);
    if (!existsSync(p)) { if (a.category !== 'portrait') { console.log(`THIẾU ${a.id} (${a.path})`); ok = false; } continue; }
    const r = validateFile(p, a.spec);
    count++;
    if (!r.ok) { ok = false; console.log(`LỖI ${a.id}: ${r.errors.join('; ')}`); }
    for (const w of r.warnings) console.log(`CẢNH BÁO ${a.id}: ${w}`);
  }
  saveManifest(m);
  console.log(`Đã kiểm tra ${count} tài nguyên: ${ok ? 'ĐẠT' : 'CÓ LỖI'}`);
  return ok;
}

/** Nhập tài nguyên từ inbox (ChatGPT Manual Mode hoặc API Mode): kiểm tra kỹ thuật → thay thế → chờ duyệt */
function importInbox(source: 'chatgpt-manual' | 'openai-api' | 'licensed-third-party' = 'chatgpt-manual'): void {
  const m = syncManifest();
  const inbox = join(ROOT, 'asset-pipeline', 'inbox');
  for (const f of existsSync(inbox) ? readdirSync(inbox) : []) {
    const id = f.replace(/\.(png|wav)$/, '');
    const a = m.assets[id];
    if (!a) { console.log(`Bỏ qua ${f}: không có trong manifest`); continue; }
    const r = validateFile(join(inbox, f), a.spec);
    if (!r.ok) { console.log(`TỪ CHỐI ${id}: ${r.errors.join('; ')}`); continue; }
    const dest = join(CLIENT, a.path);
    const archive = join(ROOT, 'asset-pipeline', 'archive', `${id}.v${a.version}${f.slice(f.lastIndexOf('.'))}`);
    mkdirSync(join(ROOT, 'asset-pipeline', 'archive'), { recursive: true });
    if (existsSync(dest)) copyFileSync(dest, archive);
    copyFileSync(join(inbox, f), dest);
    m.assets[id] = { ...a, source, status: 'pending_review', license: 'CHƯA XÁC NHẬN — cần duyệt quyền sử dụng', version: a.version + 1, sha256: sha256File(dest), updatedAt: new Date().toISOString() };
    console.log(`Đã nhập ${id} v${a.version + 1} (chờ duyệt)${r.warnings.length ? ' — cảnh báo: ' + r.warnings.join('; ') : ''}`);
  }
  saveManifest(m);
}
function approve(id: string, license: string, reviewer: string, reject = false): void {
  const m = loadManifest();
  const a = m.assets[id];
  if (!a) throw new Error('Không có ' + id);
  if (!reject && (!license || license.length < 5)) throw new Error('Phải ghi rõ giấy phép/quyền sử dụng (--license)');
  m.assets[id] = { ...a, status: reject ? 'rejected' : 'approved', license: reject ? a.license : license, reviewer, updatedAt: new Date().toISOString() };
  saveManifest(m);
  console.log(`${reject ? 'Từ chối' : 'Đã duyệt'} ${id}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const opt = (k: string) => { const i = rest.indexOf(`--${k}`); return i >= 0 ? rest[i + 1] : ''; };
if (cmd === 'generate') { const n = generateAll(); const m = syncManifest(); saveManifest(m); console.log(`Đã sinh ${n} file, manifest ${Object.keys(m.assets).length} mục`); }
else if (cmd === 'manifest') { saveManifest(syncManifest()); }
else if (cmd === 'prompts') writePrompts();
else if (cmd === 'validate') process.exit(validateAll() ? 0 : 1);
else if (cmd === 'import') importInbox((opt('source') || 'chatgpt-manual') as never);
else if (cmd === 'approve') approve(rest[0], opt('license'), opt('reviewer') || 'unknown');
else if (cmd === 'reject') approve(rest[0], '', opt('reviewer') || 'unknown', true);
else if (cmd) { console.error('Lệnh: generate | manifest | prompts | validate | import [--source] | approve <id> --license .. --reviewer .. | reject <id>'); process.exit(1); }
export const _r = readFileSync;
