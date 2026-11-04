import { api, body } from '@/lib/api';
import { mutate, uid } from '@/lib/db';
import { quote } from '@/lib/pricing';
import { z } from 'zod';
// Abandoned cart tracking: records the cart of someone who entered an email at checkout but has not ordered.
export const POST = api(async (req) => {
  const b = await body<{ email?: string; items?: { productId: string; color: string; size: string; qty: number }[] }>(req);
  const email = z.string().email().safeParse(b.email); if (!email.success || !Array.isArray(b.items) || !b.items.length) return { ok: false };
  mutate((db) => { const q = quote(db, b.items!); const e = email.data.toLowerCase(); const ex = db.abandoned.find((a) => a.email === e && !a.recovered);
    const rec = { items: q.lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty })), at: new Date().toISOString(), value: q.subtotal };
    if (ex) Object.assign(ex, rec); else db.abandoned.unshift({ id: uid('ab'), email: e, recovered: false, ...rec }); });
  return { ok: true };
});
