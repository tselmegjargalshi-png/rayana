import { z } from 'zod';
import { api, body } from '@/lib/api';
import { HttpError, rateLimit } from '@/lib/auth';
import { mutate } from '@/lib/db';
export const POST = api(async (req) => {
  if (!rateLimit('nl:' + (req.headers.get('x-forwarded-for') ?? 'local'), 10)) throw new HttpError(429, 'too_many');
  const p = z.object({ email: z.string().trim().email().max(120) }).safeParse(await body(req)); if (!p.success) throw new HttpError(400, 'validation:email');
  mutate((db) => { const e = p.data.email.toLowerCase(); if (!db.subscribers.some((s) => s.email === e)) db.subscribers.push({ email: e, at: new Date().toISOString() }); }); return { ok: true };
});
