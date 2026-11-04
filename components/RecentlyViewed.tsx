'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { imgUrl, loc, money } from '@/lib/format';
import { useApp } from './Providers';
import type { Product } from '@/lib/types';
export function RecentlyViewed({ excludeId, colors }: { excludeId: string; colors: { id: string; hex: string }[] }) {
  const { t, lang } = useApp(); const [items, setItems] = useState<Product[]>([]);
  useEffect(() => { let ids: string[] = []; try { ids = JSON.parse(localStorage.getItem('ry_recent_v1') || '[]'); } catch { /* ignore */ } ids = ids.filter((i) => i !== excludeId).slice(0, 6); if (!ids.length) return; fetch(`/api/products?ids=${ids.join(',')}`).then((r) => r.json()).then((d) => setItems(d.products ?? [])).catch(() => {}); }, [excludeId]);
  if (!items.length) return null;
  return (
    <section className="mt-20" aria-label={t('recently')}><h2 className="mb-6 text-2xl font-semibold">{t('recently')}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6" data-testid="recent">{items.map((p) => <Link key={p.id} href={`/product/${p.slug}`} className="block"><div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imgUrl(p, colors.find((c) => c.id === p.colors[0])?.hex ?? 'EBDDBF', 0)} alt="" className="h-full w-full object-cover" /></div><p className="mt-2 line-clamp-1 text-xs">{loc(p.name, lang)}</p><p className="text-xs font-semibold">{money(p.salePrice ?? p.price)}</p></Link>)}</div></section>
  );
}
