import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, requireUser } from '@/lib/auth';
import { mutate, uid } from '@/lib/db';
import { DISTRICTS } from '@/lib/seed';
import { normPhone, phoneOk } from '@/lib/orders';
const S = z.object({ id: z.string().optional(), label: z.string().trim().min(1).max(30), recipient: z.string().trim().min(2).max(80), phone: z.string().refine(phoneOk), district: z.string().refine((d) => DISTRICTS.includes(d)), address: z.string().trim().min(5).max(300), notes: z.string().trim().max(300).optional().default('') });
export const POST = api(async (req) => {
  const u = await requireUser(); const p = S.safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation');
  mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; const a = { ...p.data, phone: normPhone(p.data.phone), id: p.data.id ?? uid('adr'), notes: p.data.notes }; const i = x.addresses.findIndex((z2) => z2.id === a.id); if (i >= 0) x.addresses[i] = a; else x.addresses.push(a); }); return { ok: true };
});
export const DELETE = api(async (req) => { const u = await requireUser(); const id = new URL(req.url).searchParams.get('id'); mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; x.addresses = x.addresses.filter((a) => a.id !== id); }); return { ok: true }; });
