import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, rateLimit, startSession } from '@/lib/auth';
import { mutate, uid } from '@/lib/db';
import { hashPassword } from '@/lib/seed';
import { normPhone, phoneOk } from '@/lib/orders';
const S = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(120), password: z.string().min(8).max(100).regex(/[A-Za-zА-Яа-яӨөҮү]/).regex(/\d/), phone: z.string().optional().default('') });
export const POST = api(async (req) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'local'; if (!rateLimit(`reg:${ip}`, 6)) throw new HttpError(429, 'too_many');
  const p = S.safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation:' + p.error.issues.map((i) => i.path.join('.')).join(','));
  const d = p.data; if (d.phone && !phoneOk(d.phone)) throw new HttpError(400, 'validation:phone');
  const id = mutate((db) => {
    if (db.users.some((u) => u.email === d.email.toLowerCase())) throw new HttpError(409, 'email_taken');
    const u = { id: uid('usr'), email: d.email.toLowerCase(), passHash: hashPassword(d.password), name: d.name, phone: d.phone ? normPhone(d.phone) : '', role: 'customer' as const, createdAt: new Date().toISOString(), demo: false, addresses: [], children: [], wishlist: [], notifications: [], lang: 'mn' as const };
    db.users.push(u); return u.id;
  });
  await startSession(id); return { ok: true };
});
