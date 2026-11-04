import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { mutate } from '@/lib/db';
export const POST = api(async () => { const u = await requireUser(); mutate((db) => { db.users.find((y) => y.id === u.id)!.notifications.forEach((n) => (n.read = true)); }); return { ok: true }; });
