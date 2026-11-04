import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, requireUser } from '@/lib/auth';
import { mutate, uid } from '@/lib/db';
const S = z.object({ productId: z.string().max(40), rating: z.number().int().min(1).max(5), title: z.string().trim().min(2).max(80), body: z.string().trim().min(5).max(1200), photos: z.array(z.string().regex(/^\/api\/uploads\/[a-f0-9]{20}\.(png|jpg|webp)$/)).max(3).optional().default([]) });
export const POST = api(async (req) => {
  const u = await requireUser(); const p = S.safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation');
  const d = p.data; const now = new Date().toISOString();
  return mutate((db) => {
    if (!db.products.some((x) => x.id === d.productId)) throw new HttpError(404, 'not_found');
    const verified = db.orders.some((o) => o.userId === u.id && ['delivered', 'return_requested'].includes(o.status) && o.items.some((i) => i.productId === d.productId));
    const ex = db.reviews.find((r) => r.productId === d.productId && r.userId === u.id);
    if (ex) { Object.assign(ex, { rating: d.rating, title: d.title, body: d.body, photos: d.photos, editedAt: now, status: 'pending' as const, verified }); return { id: ex.id, edited: true }; }
    const r = { id: uid('rev'), productId: d.productId, userId: u.id, authorName: u.name.split(' ')[0], rating: d.rating, title: d.title, body: d.body, photos: d.photos, verified, status: 'pending' as const, createdAt: now, demo: false };
    db.reviews.push(r); return { id: r.id };
  });
});
