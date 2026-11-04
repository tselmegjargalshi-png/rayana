import { api, body } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { quote } from '@/lib/pricing';
export const POST = api(async (req) => {
  const b = await body<{ items?: { productId: string; color: string; size: string; qty: number }[]; code?: string; district?: string; pickup?: boolean; giftWrap?: boolean; email?: string; phone?: string }>(req); const u = await getSession();
  return quote(getDB(), Array.isArray(b.items) ? b.items : [], { code: b.code, district: b.district, pickup: !!b.pickup, giftWrap: !!b.giftWrap, userId: u?.id, email: b.email ?? u?.email, phone: b.phone });
});
