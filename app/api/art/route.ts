import { coverSvg, productSvg } from '@/lib/art';
export async function GET(req: Request) {
  const u = new URL(req.url); const q = u.searchParams;
  const svg = q.get('cover') ? coverSvg(q.get('cover')!.slice(0, 20), q.get('wide') === '1') : productSvg((q.get('g') ?? 'tee').slice(0, 20), q.get('c') ?? 'EBDDBF', Number(q.get('v') ?? 0) % 3);
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=31536000, immutable' } });
}
