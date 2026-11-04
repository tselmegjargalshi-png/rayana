import { api, body } from '@/lib/api';
import { getSession, rateLimit, HttpError } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
export const POST = api(async (req) => {
  if (!rateLimit('order:' + (req.headers.get('x-forwarded-for') ?? 'local'), 20)) throw new HttpError(429, 'too_many');
  const u = await getSession(); const o = createOrder(await body(req), u?.id ?? null);
  return { id: o.id, number: o.number, token: o.accessToken };
});
