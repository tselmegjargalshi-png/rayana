import fs from 'node:fs';
import path from 'node:path';
import { dataDir } from '@/lib/db';
const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params; if (!/^[a-f0-9]{20}\.(png|jpg|webp)$/.test(name)) return new Response('Not found', { status: 404 });
  try { const b = fs.readFileSync(path.join(dataDir, 'uploads', name)); return new Response(new Uint8Array(b), { headers: { 'content-type': MIME[name.split('.')[1]], 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } }); } catch { return new Response('Not found', { status: 404 }); }
}
