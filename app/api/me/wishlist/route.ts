import { api, body } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { mutate } from '@/lib/db';
export const POST = api(async (req) => { const u = await requireUser(); const { productId } = await body<{ productId: string }>(req); mutate((db) => { const x = db.users.find((y) => y.id === u.id)!; x.wishlist = x.wishlist.includes(productId) ? x.wishlist.filter((i) => i !== productId) : [...x.wishlist, productId]; }); return { ok: true }; });
