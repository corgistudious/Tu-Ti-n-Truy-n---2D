/**
 * Hằng số dùng chung giữa server (TypeScript) và client (Godot nhận qua /api/data/bundle).
 * Mọi giá trị vật lý ở đây là nguồn sự thật duy nhất — client không tự định nghĩa lại.
 */
export const PROTOCOL_VERSION = 1;
export const TILE = 32;
export const SERVER_TICK_HZ = 20;
export const SNAPSHOT_HZ = 10;
export const CLIENT_INPUT_HZ = 15;

export const PHYSICS = {
  gravity: 1500,          // px/s^2
  runSpeed: 210,          // px/s (trước khi nhân hệ số tốc độ)
  jumpVelocity: 560,      // px/s
  maxFall: 900,           // px/s
  dodgeSpeed: 520,        // px/s
  dodgeTime: 0.22,        // s
  dodgeCooldown: 1.2,     // s
  playerW: 26,            // hitbox người chơi (px)
  playerH: 58,
} as const;

/** Dung sai chống gian lận di chuyển */
export const MOVE_VALIDATION = {
  horizontalSlackPx: 24,
  speedTolerance: 1.3,
  maxAirTimeNoFall: 1.4, // giây ở trên không mà không rơi xuống => nghi bay
  maxReportGap: 1.0,
} as const;

export const AOI = {
  cellWidth: 512,         // px
  viewRadiusCells: 3,     // gửi thực thể trong ±3 ô (≈ 1536px mỗi bên)
} as const;

export const LIMITS = {
  bagSlots: 60,
  storageSlots: 120,
  maxStack: 9999,
  chatMaxLen: 160,
  nameMin: 2,
  nameMax: 14,
  charactersPerAccount: 4,
  partyMax: 5,
  guildBaseMembers: 30,
  hotbarSize: 6,
  maxEnhance: 15,
  maxRefine: 10,
  gemSockets: 3,
  characterDeleteProtectHours: 24,
  marketFeeRate: 0.05,
  tradeFeeRate: 0.02,
  auctionFeeRate: 0.06,
  guildCreateCost: 50000,
  mailExpireDays: 30,
} as const;

export const CURRENCIES = ['gold', 'spirit_stones'] as const;
export type Currency = typeof CURRENCIES[number];

export const EQUIP_SLOTS = ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet', 'artifact', 'fashion', 'mount'] as const;
export type EquipSlot = typeof EQUIP_SLOTS[number];

export const RARITIES = [
  { id: 0, name: 'Phàm Phẩm', color: '#c8c8c8', mult: 1.0 },
  { id: 1, name: 'Tinh Phẩm', color: '#7ee07e', mult: 1.15 },
  { id: 2, name: 'Hiếm', color: '#5aa9ff', mult: 1.32 },
  { id: 3, name: 'Huyền Phẩm', color: '#b06cff', mult: 1.52 },
  { id: 4, name: 'Địa Phẩm', color: '#d9a441', mult: 1.75 },
  { id: 5, name: 'Thiên Phẩm', color: '#ff8a3d', mult: 2.0 },
  { id: 6, name: 'Linh Phẩm', color: '#3de0d0', mult: 2.3 },
  { id: 7, name: 'Tiên Phẩm', color: '#ff5fa2', mult: 2.65 },
  { id: 8, name: 'Thần Phẩm', color: '#ff3b3b', mult: 3.05 },
  { id: 9, name: 'Hỗn Độn Phẩm', color: '#ffffff', mult: 3.5 },
] as const;

export const DEFAULT_KEYBINDS: Record<string, string[]> = {
  move_left: ['A', 'Left'], move_right: ['D', 'Right'], jump: ['Space', 'W', 'Up'],
  // Đặc tả yêu cầu cả "I = kỹ năng 4" và "I = túi đồ": giữ I cho kỹ năng 4, túi đồ mặc định B
  // (người chơi có thể đổi trong Cài đặt > Phím tắt).
  attack: ['J'], skill_1: ['K'], skill_2: ['L'], skill_3: ['U'], skill_4: ['I'],
  skill_5: ['O'], skill_6: ['P'], dodge: ['Shift'], interact: ['E'], pickup: ['F'],
  inventory: ['B'], character: ['C'], map: ['M'], chat: ['Enter'], quests: ['Q'],
  skills: ['N'], cultivate: ['R'],
};
