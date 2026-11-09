/** Sprite quái vật pixel art nguyên bản theo nguyên mẫu (archetype). Lưới 4 cột × 5 hàng: idle, move, attack, hurt, death. */
import { Canvas, hex, shade, type RGBA } from '../canvas.js';

export const MON_ANIMS = [{ name: 'idle', frames: 4 }, { name: 'move', frames: 4 }, { name: 'attack', frames: 4 }, { name: 'hurt', frames: 2 }, { name: 'death', frames: 4 }];
export const ARCHETYPES: Record<string, { size: number; pal: string[] }> = {
  slime: { size: 64, pal: ['#6ad46a', '#3a9a4a', '#d0ffd0'] },
  bird: { size: 64, pal: ['#c87a3a', '#8a4a20', '#f0d070'] },
  fox: { size: 64, pal: ['#f09a3a', '#b0602a', '#fff0d0'] },
  treant: { size: 64, pal: ['#7a5a3a', '#4a3a20', '#5aaa4a'] },
  wolf: { size: 64, pal: ['#4a4a5a', '#2a2a3a', '#d0d0e0'] },
  boar: { size: 64, pal: ['#7a5040', '#4a3020', '#e0d0b0'] },
  golem: { size: 64, pal: ['#8a8a8a', '#5a5a5a', '#60c0ff'] },
  spirit: { size: 64, pal: ['#a0e0ff', '#5a8ac0', '#ffffff'] },
  tiger: { size: 64, pal: ['#e0a040', '#3a2a1a', '#fff0e0'] },
  snake: { size: 64, pal: ['#4aaa6a', '#2a6a3a', '#e0e070'] },
  skeleton: { size: 64, pal: ['#e8e4d0', '#9a9480', '#ff4040'] },
  demon: { size: 64, pal: ['#8a2a4a', '#4a1a2a', '#ffcc40'] },
  dragon: { size: 128, pal: ['#5a3a9a', '#2a1a5a', '#ffd040'] },
};

function frameParams(anim: string, i: number) {
  const t = (i / 4) * Math.PI * 2;
  switch (anim) {
    case 'idle': return { bob: Math.round(Math.sin(t)), step: 0, lunge: 0, squash: Math.sin(t) * 0.05, rot: 0, flash: false };
    case 'move': return { bob: Math.round(Math.abs(Math.sin(t)) * -2), step: Math.sin(t), lunge: 0, squash: 0, rot: 0, flash: false };
    case 'attack': return { bob: 0, step: 0, lunge: [-3, 2, 7, 3][i], squash: [0.1, -0.05, -0.1, 0][i], rot: 0, flash: false };
    case 'hurt': return { bob: 1, step: 0, lunge: -4, squash: 0.08, rot: 0, flash: true };
    default: return { bob: [0, 2, 4, 6][i], step: 0, lunge: 0, squash: 0.15 * i, rot: [0.2, 0.6, 1.1, 1.5][i], flash: false };
  }
}

function draw(c: Canvas, kind: string, f: ReturnType<typeof frameParams>, pal: RGBA[]): void {
  const [base, dark, acc] = pal;
  const S = c.w / 64;
  const X = (v: number) => v * S, Y = (v: number) => v * S;
  const gy = 60 + f.bob;
  const lx = f.lunge;
  switch (kind) {
    case 'slime': {
      const w = 22 * (1 + f.squash), h = 18 * (1 - f.squash);
      c.ellipse(X(32 + lx), Y(gy - h), X(w), Y(h), base);
      c.ellipse(X(28 + lx), Y(gy - h - 6), X(6), Y(4), acc);
      c.rect(X(36 + lx), Y(gy - h - 4), X(3), Y(4), hex('#1a1a1a')); c.rect(X(44 + lx), Y(gy - h - 4), X(3), Y(4), hex('#1a1a1a'));
      break;
    }
    case 'bird': {
      c.ellipse(X(30 + lx), Y(gy - 22), X(13), Y(10), base);
      c.ellipse(X(42 + lx), Y(gy - 30), X(7), Y(7), base);
      c.poly([[X(48 + lx), Y(gy - 31)], [X(56 + lx), Y(gy - 29)], [X(48 + lx), Y(gy - 27)]], acc);
      const wing = f.step !== 0 ? f.step * 8 : Math.sin(f.bob) * 4;
      c.poly([[X(24 + lx), Y(gy - 26)], [X(14 + lx), Y(gy - 36 - wing)], [X(34 + lx), Y(gy - 24)]], dark);
      c.rect(X(44 + lx), Y(gy - 32), X(2), Y(2), hex('#101010'));
      c.line(X(28), Y(gy - 12), X(26), Y(gy), dark, X(2)); c.line(X(34), Y(gy - 12), X(36), Y(gy), dark, X(2));
      break;
    }
    case 'fox': case 'wolf': case 'tiger': {
      const L = kind === 'tiger' ? 1.15 : 1;
      c.ellipse(X(30 + lx), Y(gy - 18), X(16 * L), Y(9), base);
      c.ellipse(X(47 + lx), Y(gy - 26), X(8), Y(7), base);
      c.poly([[X(44 + lx), Y(gy - 31)], [X(46 + lx), Y(gy - 40)], [X(50 + lx), Y(gy - 31)]], dark);
      c.poly([[X(52 + lx), Y(gy - 26)], [X(58 + lx), Y(gy - 23)], [X(52 + lx), Y(gy - 21)]], kind === 'fox' ? acc : base);
      c.rect(X(49 + lx), Y(gy - 28), X(2), Y(2), kind === 'wolf' ? hex('#ffd040') : hex('#101010'));
      const tail = kind === 'fox' ? [[X(14), Y(gy - 22)], [X(2), Y(gy - 34)], [X(10), Y(gy - 18)]] : [[X(14), Y(gy - 20)], [X(4), Y(gy - 26)], [X(12), Y(gy - 16)]];
      c.poly(tail as [number, number][], kind === 'fox' ? acc : dark);
      for (const [lxp, ph] of [[20, 1], [26, -1], [36, -1], [42, 1]]) c.rect(X(lxp + lx + f.step * 3 * ph), Y(gy - 12), X(4), Y(12), dark);
      if (kind === 'tiger') for (const sx of [24, 30, 36]) c.line(X(sx + lx), Y(gy - 26), X(sx + 2 + lx), Y(gy - 12), dark, X(1.5));
      break;
    }
    case 'boar': {
      c.ellipse(X(30 + lx), Y(gy - 18), X(18), Y(12), base);
      c.ellipse(X(48 + lx), Y(gy - 18), X(9), Y(8), base);
      c.rect(X(54 + lx), Y(gy - 18), X(4), Y(5), shade(base, 1.2));
      c.poly([[X(52 + lx), Y(gy - 14)], [X(58 + lx), Y(gy - 22)], [X(55 + lx), Y(gy - 13)]], acc);
      c.rect(X(48 + lx), Y(gy - 22), X(2), Y(2), hex('#101010'));
      for (const [lxp, ph] of [[18, 1], [26, -1], [36, -1], [42, 1]]) c.rect(X(lxp + lx + f.step * 3 * ph), Y(gy - 10), X(5), Y(10), dark);
      c.line(X(20), Y(gy - 30), X(40), Y(gy - 30), dark, X(2));
      break;
    }
    case 'treant': {
      c.rect(X(24 + lx), Y(gy - 34), X(16), Y(34), base);
      c.ellipse(X(32 + lx), Y(gy - 40), X(18), Y(14), acc);
      c.ellipse(X(24 + lx), Y(gy - 46), X(10), Y(8), shade(acc, 1.1));
      c.rect(X(28 + lx), Y(gy - 26), X(3), Y(3), hex('#ffe060')); c.rect(X(35 + lx), Y(gy - 26), X(3), Y(3), hex('#ffe060'));
      c.line(X(24 + lx), Y(gy - 22), X(12 + lx - f.lunge), Y(gy - 30 - f.lunge), dark, X(3));
      c.line(X(40 + lx), Y(gy - 22), X(52 + lx + f.lunge), Y(gy - 28), dark, X(3));
      c.rect(X(22 + f.step * 2), Y(gy - 4), X(7), Y(4), dark); c.rect(X(35 - f.step * 2), Y(gy - 4), X(7), Y(4), dark);
      break;
    }
    case 'golem': {
      c.rect(X(20 + lx), Y(gy - 38), X(24), Y(26), base);
      c.rect(X(25 + lx), Y(gy - 50), X(14), Y(12), base);
      c.rect(X(30 + lx), Y(gy - 46), X(6), Y(3), acc);
      c.rect(X(12 + lx - f.lunge * 0.5), Y(gy - 36), X(8), Y(20), dark); c.rect(X(44 + lx + f.lunge), Y(gy - 36), X(8), Y(20), dark);
      c.rect(X(22 + f.step * 2), Y(gy - 12), X(8), Y(12), dark); c.rect(X(34 - f.step * 2), Y(gy - 12), X(8), Y(12), dark);
      c.line(X(24 + lx), Y(gy - 30), X(30 + lx), Y(gy - 24), acc);
      break;
    }
    case 'spirit': {
      const a = 200;
      c.ellipse(X(32 + lx), Y(gy - 30), X(13), Y(14), [base[0], base[1], base[2], a]);
      c.poly([[X(20 + lx), Y(gy - 26)], [X(44 + lx), Y(gy - 26)], [X(38 + lx + f.step * 4), Y(gy - 4)], [X(32 + lx), Y(gy - 12)], [X(26 + lx - f.step * 4), Y(gy - 4)]], [dark[0], dark[1], dark[2], a]);
      c.rect(X(34 + lx), Y(gy - 33), X(3), Y(4), acc); c.rect(X(40 + lx), Y(gy - 33), X(3), Y(4), acc);
      break;
    }
    case 'snake': {
      for (let k = 0; k < 6; k++) c.ellipse(X(10 + k * 7 + lx * (k / 5)), Y(gy - 6 - Math.sin(k + f.step * 2) * 3), X(6), Y(5), k % 2 ? base : dark);
      c.ellipse(X(52 + lx), Y(gy - 14), X(7), Y(6), base);
      c.rect(X(54 + lx), Y(gy - 16), X(2), Y(2), acc);
      c.line(X(58 + lx), Y(gy - 12), X(62 + lx), Y(gy - 11), hex('#e03030'));
      break;
    }
    case 'skeleton': {
      c.ellipse(X(34 + lx), Y(gy - 46), X(8), Y(8), base);
      c.rect(X(35 + lx), Y(gy - 47), X(3), Y(3), acc); c.rect(X(39 + lx), Y(gy - 47), X(2), Y(3), acc);
      for (let k = 0; k < 4; k++) c.rect(X(28 + lx), Y(gy - 36 + k * 4), X(12), Y(2), base);
      c.rect(X(33 + lx), Y(gy - 38), X(2), Y(20), dark);
      c.line(X(30 + lx), Y(gy - 36), X(24 + lx), Y(gy - 22), base, X(2)); c.line(X(38 + lx), Y(gy - 36), X(46 + lx + f.lunge), Y(gy - 28), base, X(2));
      c.line(X(46 + lx + f.lunge), Y(gy - 28), X(56 + lx + f.lunge), Y(gy - 46), hex('#a0a0b0'), X(2));
      c.line(X(31), Y(gy - 18), X(28 + f.step * 3), Y(gy), base, X(2)); c.line(X(36), Y(gy - 18), X(39 - f.step * 3), Y(gy), base, X(2));
      break;
    }
    case 'demon': {
      c.ellipse(X(32 + lx), Y(gy - 28), X(13), Y(16), base);
      c.ellipse(X(34 + lx), Y(gy - 48), X(9), Y(9), base);
      c.poly([[X(27 + lx), Y(gy - 54)], [X(22 + lx), Y(gy - 64)], [X(30 + lx), Y(gy - 56)]], acc);
      c.poly([[X(40 + lx), Y(gy - 54)], [X(46 + lx), Y(gy - 64)], [X(38 + lx), Y(gy - 56)]], acc);
      c.rect(X(36 + lx), Y(gy - 50), X(3), Y(2), acc); c.rect(X(41 + lx), Y(gy - 50), X(2), Y(2), acc);
      c.poly([[X(20 + lx), Y(gy - 36)], [X(4 + lx), Y(gy - 50 + f.step * 4)], [X(14 + lx), Y(gy - 26)]], dark);
      c.line(X(44 + lx), Y(gy - 32), X(54 + lx + f.lunge), Y(gy - 26), base, X(3));
      c.rect(X(25 + f.step * 2), Y(gy - 14), X(6), Y(14), dark); c.rect(X(34 - f.step * 2), Y(gy - 14), X(6), Y(14), dark);
      break;
    }
    case 'dragon': {
      for (let k = 0; k < 8; k++) c.ellipse(X(8 + k * 5 + lx * (k / 7)), Y(gy - 18 - Math.sin(k * 0.8 + f.step * 2) * 5 - k * 1.5), X(6 - k * 0.2), Y(6), k % 2 ? base : dark);
      c.ellipse(X(50 + lx), Y(gy - 34), X(9), Y(7), base);
      c.poly([[X(46 + lx), Y(gy - 40)], [X(42 + lx), Y(gy - 50)], [X(50 + lx), Y(gy - 41)]], acc);
      c.poly([[X(56 + lx), Y(gy - 34)], [X(63 + lx), Y(gy - 32)], [X(56 + lx), Y(gy - 30)]], base);
      c.rect(X(52 + lx), Y(gy - 36), X(2), Y(2), acc);
      c.poly([[X(24 + lx), Y(gy - 30)], [X(18 + lx), Y(gy - 54 - f.step * 6)], [X(36 + lx), Y(gy - 32)]], shade(dark, 1.2));
      break;
    }
  }
  if (f.flash) for (let k = 0; k < c.data.length; k += 4) if (c.data[k + 3]) { c.data[k] = Math.min(255, c.data[k] + 90); c.data[k + 1] = Math.min(255, c.data[k + 1] + 60); c.data[k + 2] = Math.min(255, c.data[k + 2] + 60); }
}

export function renderMonsterSheet(kind: string): Canvas {
  const a = ARCHETYPES[kind];
  const pal = a.pal.map((h) => hex(h));
  const sheet = new Canvas(a.size * 4, a.size * MON_ANIMS.length);
  MON_ANIMS.forEach((an, row) => {
    for (let i = 0; i < an.frames; i++) {
      let fr = new Canvas(a.size, a.size);
      const fp = frameParams(an.name, i);
      draw(fr, kind, fp, pal);
      fr.outline(hex('#1a1420'));
      if (fp.rot) fr = fr.rotated(-fp.rot * 0.8, a.size / 2, a.size - 4);
      if (an.name === 'death') fr.fade(1 - i * 0.18);
      sheet.blit(fr, i * a.size, row * a.size);
    }
  });
  return sheet;
}
