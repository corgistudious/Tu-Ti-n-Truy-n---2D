import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { accountFromToken, bearer } from './auth.js';
import { adminLog } from '../services/audit.js';

/**
 * Chế độ API của Asset Pipeline: backend gọi OpenAI Images API bằng khóa trong biến môi trường
 * (KHÔNG bao giờ nhúng khóa vào client). Chỉ admin dùng; ảnh trả về phải qua validator + duyệt.
 */
export function assetRoutes(app: FastifyInstance): void {
  app.post('/api/admin/assets/generate', async (req, reply) => {
    const acc = await accountFromToken(bearer(req));
    if (!acc || acc.role !== 'admin') return reply.code(403).send({ error: 'Không đủ quyền' });
    if (config().ASSET_API_ENABLED !== 'true' || !config().OPENAI_API_KEY) return reply.code(501).send({ error: 'API Mode chưa bật (ASSET_API_ENABLED=true và OPENAI_API_KEY)' });
    const b = z.object({ assetId: z.string().max(80), prompt: z.string().min(10).max(4000), size: z.enum(['1024x1024', '1536x1024', '1024x1536']).default('1024x1024') }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config().OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: b.data.prompt, size: b.data.size, background: 'transparent', n: 1 }),
    });
    const data = await res.json() as { data?: { b64_json?: string }[]; error?: { message: string } };
    await adminLog(acc.id, 'asset_generate', 'asset', b.data.assetId, { status: res.status }, req.ip);
    if (!res.ok || !data.data?.[0]?.b64_json) return reply.code(502).send({ error: data.error?.message ?? 'Sinh ảnh thất bại' });
    // trả về ảnh để đưa vào asset-pipeline/inbox — KHÔNG tự động đưa vào game khi chưa qua validator + phê duyệt
    return { assetId: b.data.assetId, pngBase64: data.data[0].b64_json, status: 'pending_validation' };
  });
}
