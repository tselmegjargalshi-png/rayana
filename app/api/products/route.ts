import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get('ids') ?? '').split(',').slice(0, 12); const db = getDB();
  const products = ids.map((id) => db.products.find((p) => p.id === id && p.status === 'active')).filter(Boolean).map((p) => ({ id: p!.id, slug: p!.slug, name: p!.name, price: p!.price, salePrice: p!.salePrice, images: p!.images, colors: p!.colors }));
  return NextResponse.json({ products });
}
