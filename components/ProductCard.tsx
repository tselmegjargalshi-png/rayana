import Link from 'next/link';
import { discountPct, imgUrl, loc, money, totalStock } from '@/lib/format';
import { tr } from '@/lib/dict';
import type { ColorDef, Lang, Product } from '@/lib/types';
import { WishButton } from './WishButton';

export function ProductCard({ p, lang, colors, priority }: { p: Product; lang: Lang; colors: ColorDef[]; priority?: boolean }) {
  const t = (k: string) => tr(lang, k); const first = colors.find((c) => c.id === p.colors[0]); const stock = totalStock(p); const pct = discountPct(p);
  return (
    <article className="group relative fade-in" data-testid="product-card">
      <Link href={`/product/${p.slug}`} className="block overflow-hidden rounded-3xl bg-sand ring-1 ring-line" aria-label={loc(p.name, lang)}>
        <div className="relative aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl(p, first?.hex ?? 'EBDDBF', 0)} alt={loc(p.name, lang)} loading={priority ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {pct > 0 && <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white">{t('sale_badge')} {pct}%</span>}
            {p.isNew && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold">{t('new_badge')}</span>}
            {stock === 0 && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-cream">{t('sold_out')}</span>}
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3"><WishButton id={p.id} /></div>
      <div className="px-1 pt-3">
        <div className="mb-1.5 flex gap-1.5" aria-label={t('color')}>{p.colors.slice(0, 5).map((c) => <span key={c} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: `#${colors.find((x) => x.id === c)?.hex}` }} />)}</div>
        <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:text-clay">{loc(p.name, lang)}</Link>
        <p className="mt-1 text-sm"><span className="font-semibold">{money(p.salePrice ?? p.price)}</span>{p.salePrice && <span className="ml-2 text-xs text-muted line-through">{money(p.price)}</span>}</p>
      </div>
    </article>
  );
}
