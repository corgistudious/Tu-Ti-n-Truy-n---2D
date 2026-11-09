/** Lỗi nghiệp vụ hiển thị cho người chơi (không phải lỗi hệ thống) */
export class GameError extends Error {
  constructor(message: string, public code = 'GAME_ERROR') { super(message); }
}
export function assert(cond: unknown, message: string, code?: string): asserts cond {
  if (!cond) throw new GameError(message, code);
}
