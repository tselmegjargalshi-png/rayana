import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, requireUser } from '@/lib/auth';
import { mutate, uid } from '@/lib/db';
const num = z.preprocess((v) => (v === '' || v === null || v === undefined ? null : Number(v)), z.number().min(1).max(250).nullable());
const S = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(40), birthYear: z.coerce.number().int().min(2005).max(2026), birthMonth: z.coerce.number().int().min(1).max(12), heightCm: num, weightKg: num });
export const POST = api(async (req) => {
  const u = await requireUser(); const p = S.safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation');
  mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; const c = { ...p.data, id: p.data.id ?? uid('chd') }; const i = x.children.findIndex((z2) => z2.id === c.id); if (i >= 0) x.children[i] = c; else x.children.push(c); }); return { ok: true };
});
export const DELETE = api(async (req) => { const u = await requireUser(); const id = new URL(req.url).searchParams.get('id'); mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; x.children = x.children.filter((a) => a.id !== id); }); return { ok: true }; });
