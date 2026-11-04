import { api, body } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { adminAction } from '@/lib/admin';
export const POST = api(async (req) => { const a = await requireAdmin(); const b = await body<Record<string, unknown>>(req); return adminAction(String(b.action), b, a.email); });
