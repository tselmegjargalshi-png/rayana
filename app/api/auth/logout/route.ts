import { api } from '@/lib/api';
import { endSession } from '@/lib/auth';
export const POST = api(async () => { await endSession(); return { ok: true }; });
