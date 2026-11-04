import { api, body } from '@/lib/api';
import { HttpError, rateLimit, startSession, verifyPassword } from '@/lib/auth';
import { getDB } from '@/lib/db';
export const POST = api(async (req) => {
  const b = await body<{ email?: string; password?: string }>(req); const email = String(b.email ?? '').trim().toLowerCase();
  const ip = req.headers.get('x-forwarded-for') ?? 'local'; if (!rateLimit(`login:${ip}:${email}`, 8)) throw new HttpError(429, 'too_many');
  const u = getDB().users.find((x) => x.email === email);
  if (!u || !verifyPassword(String(b.password ?? ''), u.passHash)) throw new HttpError(401, 'bad_login');
  await startSession(u.id); return { ok: true, role: u.role };
});
