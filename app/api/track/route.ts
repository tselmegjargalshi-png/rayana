import { api, body } from '@/lib/api';
import { HttpError, rateLimit } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { normPhone } from '@/lib/orders';
export const POST = api(async (req) => {
  if (!rateLimit('track:' + (req.headers.get('x-forwarded-for') ?? 'local'), 15)) throw new HttpError(429, 'too_many');
  const b = await body<{ number?: string; phone?: string }>(req); const n = String(b.number ?? '').trim().toUpperCase().replace(/\s+/g, ''); const ph = normPhone(String(b.phone ?? ''));
  const o = getDB().orders.find((x) => x.number === n && x.customer.phone === ph); if (!o) throw new HttpError(404, 'not_found');
  return { id: o.id, token: o.accessToken };
});
