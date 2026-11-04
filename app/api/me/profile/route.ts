import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, publicUser, requireUser } from '@/lib/auth';
import { mutate } from '@/lib/db';
import { normPhone, phoneOk } from '@/lib/orders';
export const GET = api(async () => publicUser(await requireUser()));
export const PUT = api(async (req) => {
  const u = await requireUser(); const p = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().refine((s) => s === '' || phoneOk(s)) }).safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation');
  mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; x.name = p.data.name; x.phone = p.data.phone ? normPhone(p.data.phone) : ''; }); return { ok: true };
});
