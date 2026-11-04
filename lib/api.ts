import { NextResponse } from 'next/server';
import { HttpError } from './auth';
export type Ctx<P = Record<string, string>> = { params: Promise<P> };
export function api<P = Record<string, string>>(fn: (req: Request, ctx: Ctx<P>) => Promise<unknown> | unknown) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const o = req.headers.get('origin'); const h = req.headers.get('host');
        if (o && h && new URL(o).host !== h) throw new HttpError(403, 'bad_origin');
      }
      const out = await fn(req, ctx);
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e); return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
  };
}
export async function body<T = Record<string, unknown>>(req: Request): Promise<T> { try { return (await req.json()) as T; } catch { throw new HttpError(400, 'bad_json'); } }
