import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { q } from '../db.js';
import { log } from '../log.js';

let transport: nodemailer.Transporter | null = null;
/**
 * Gửi email: luôn ghi vào mail_outbox (để kiểm toán / xem ở môi trường dev qua Admin),
 * nếu có SMTP_URL thì gửi thật qua SMTP.
 */
export async function sendMail(to: string, subject: string, body: string): Promise<void> {
  const [row] = await q<{ id: number }>('INSERT INTO mail_outbox(to_email, subject, body) VALUES ($1,$2,$3) RETURNING id', [to, subject, body]);
  const url = config().SMTP_URL;
  if (!url) return;
  try {
    transport ??= nodemailer.createTransport(url);
    await transport.sendMail({ from: config().MAIL_FROM, to, subject, text: body });
    await q('UPDATE mail_outbox SET sent_at = now() WHERE id = $1', [row.id]);
  } catch (e) {
    log.warn('smtp send failed', { id: row.id, err: (e as Error).message });
    await q('UPDATE mail_outbox SET error = $2 WHERE id = $1', [row.id, (e as Error).message.slice(0, 500)]);
  }
}
