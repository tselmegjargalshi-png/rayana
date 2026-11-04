import Link from 'next/link';
import { Cover } from '@/components/Cover';
import { HeroSlider } from '@/components/HeroSlider';
import { NewsletterForm } from '@/components/NewsletterForm';
import { ProductCard } from '@/components/ProductCard';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { imgUrl, loc } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { imgOf } from '@/lib/cover';
import { filterProducts } from '@/lib/catalog';
import type { Lang } from '@/lib/types';

function Section({ title, href, linkLabel, children, tone }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; tone?: string }) {
  return (<section className={`${tone ?? ''} py-14`}><div className="container-x"><div className="mb-7 flex items-end justify-between gap-4"><h2 className="text-3xl font-semibold">{title}</h2>{href && <Link href={href} className="text-sm font-semibold text-clay underline underline-offset-4">{linkLabel}</Link>}</div>{children}</div></section>);
}
export default async function Home() {
  const db = getDB(); const lang: Lang = await getLang(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v); const H = db.settings.home; const on = (k: string) => H.showSections[k] !== false;
  const grid = (ps: typeof db.products) => <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{ps.map((p) => <ProductCard key={p.id} p={p} lang={lang} colors={db.settings.colors} />)}</div>;
  const slides = H.heroBannerIds.map((id) => db.banners.find((b) => b.id === id && b.active)).filter(Boolean).map((b) => ({ id: b!.id, title: loc(b!.title, lang), subtitle: loc(b!.subtitle, lang), cta: loc(b!.cta, lang), href: b!.href, img: imgOf(`art:cover:${b!.theme}`, true) }));
  const active = db.products.filter((p) => p.status === 'active');
  const newest = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((p) => p.isNew).slice(0, 8); const best = active.filter((p) => p.isBestseller).slice(0, 8);
  const essentials = active.filter((p) => p.categoryId === 'unisex_essentials' || p.categoryId === 'baby_bodysuits').slice(0, 4);
  const premium = active.filter((p) => p.name.en.startsWith('Premium')).slice(0, 4); const sale = active.filter((p) => p.salePrice).slice(0, 4);
  const offers = db.banners.filter((b) => b.placement === 'offer' && b.active); const reviews = db.reviews.filter((r) => r.status === 'approved').slice(0, 6);
  const groups = [['baby', 'bodysuit', 'F0BFC6'], ['girls', 'dress', 'D3C6E8'], ['boys', 'hoodie', 'B5D0E4'], ['unisex', 'tracksuit', 'BCD3B3'], ['accessories', 'hat', 'F4DB92']] as const;
  const tones = ['bg-blush', 'bg-sage', 'bg-sky', 'bg-butter'];
  return (
    <>
      {slides.length > 0 && <HeroSlider slides={slides} />}
      {on('newArrivals') && <Section title={t('new_arrivals')} href="/shop?isNew=1" linkLabel={t('view_all')}>{grid(newest)}</Section>}
      {on('byAge') && <Section title={t('shop_by_age')} href="/age" linkLabel={t('view_all')} tone="bg-sand/60"><div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{db.settings.ageGroups.map((a, i) => <Link key={a.id} href={`/age/${a.id}`} data-testid={`age-${a.id}`} className={`${tones[i % 4]} rounded-3xl p-4 text-center transition hover:-translate-y-0.5 hover:shadow-soft`}><p className="font-display text-lg font-semibold">{loc(a.name, lang).replace(/ \(.*\)/, '')}</p></Link>)}</div></Section>}
      {on('bestSellers') && <Section title={t('best_sellers')} href="/shop?best=1" linkLabel={t('view_all')}>{grid(best)}</Section>}
      {on('byCategory') && <Section title={t('shop_by_cat')}><div className="grid grid-cols-2 gap-4 md:grid-cols-5">{groups.map(([g, garment, hex]) => <Link key={g} href={`/shop?group=${g}`} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-line"><div className="aspect-[4/5] overflow-hidden bg-sand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/art?g=${garment}&c=${hex}&v=0`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div><p className="p-4 text-center font-display text-lg font-semibold">{t('nav_' + g)}</p></Link>)}</div></Section>}
      {on('collections') && <Section title={t('featured_collections')} href="/collections" linkLabel={t('view_all')} tone="bg-sand/60"><div className="grid gap-5 md:grid-cols-4">{db.collections.slice(0, 4).map((c) => <Link key={c.id} href={`/collections/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl"><Cover cover={c.cover} /><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /><p className="absolute bottom-4 left-4 right-4 font-display text-xl font-semibold text-white">{loc(c.name, lang)}</p></Link>)}</div></Section>}
      {on('essentials') && <Section title={t('essentials')} href="/shop?cat=unisex_essentials" linkLabel={t('view_all')}>{grid(essentials)}</Section>}
      {on('premium') && premium.length > 0 && <Section title={t('premium')} href="/shop?q=Premium" linkLabel={t('view_all')} tone="bg-sand/60">{grid(premium)}</Section>}
      {on('offers') && <Section title={t('offers')} href="/shop?sale=1" linkLabel={t('view_all')}><div className="mb-8 grid gap-4 md:grid-cols-2">{offers.map((b, i) => <Link key={b.id} href={b.href} className={`${i % 2 ? 'bg-sky' : 'bg-blush'} rounded-3xl p-8 transition hover:shadow-soft`}><h3 className="text-2xl font-semibold">{loc(b.title, lang)}</h3><p className="mt-2 text-ink/70">{loc(b.subtitle, lang)}</p><p className="mt-5 text-sm font-semibold">{loc(b.cta, lang)} →</p></Link>)}</div>{grid(sale)}</Section>}
      {on('lookbook') && <section className="py-14"><div className="container-x"><div className="relative overflow-hidden rounded-4xl"><div className="aspect-[4/3] sm:aspect-[16/8]"><Cover cover="art:cover:autumn" wide /></div><div className="absolute inset-0 flex items-center bg-gradient-to-r from-cream/90 to-transparent p-8 sm:p-14"><div className="max-w-md"><p className="text-xs font-semibold uppercase tracking-widest text-clay">{t('lookbook')}</p><h2 className="mt-2 text-4xl font-semibold">{loc(db.collections.find((c) => c.id === 'autumn')!.name, lang)}</h2><Link href="/collections/autumn" className="btn btn-primary mt-6">{t('shop_now')}</Link></div></div></div></div></section>}
      {on('reviews') && reviews.length > 0 && <Section title={t('reviews_title')} tone="bg-sand/60"><div className="grid gap-4 md:grid-cols-3">{reviews.slice(0, 3).map((r) => <figure key={r.id} className="card p-6"><p className="text-clay">{'★'.repeat(r.rating)}</p><blockquote className="mt-3 text-sm leading-relaxed">“{r.body}”</blockquote><figcaption className="mt-4 text-xs text-muted">{r.authorName} · {t('verified')} ({t('demo')})</figcaption></figure>)}</div></Section>}
      {on('gallery') && <Section title={t('gallery')}><div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">{active.filter((p) => p.isFeatured || p.isBestseller).slice(0, 6).map((p, i) => <Link key={p.id} href={`/product/${p.slug}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-sand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imgUrl(p, db.settings.colors.find((c) => c.id === p.colors[0])?.hex ?? 'EBDDBF', (i % 2) + 1)} alt={loc(p.name, lang)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></Link>)}</div><p className="mt-3 text-xs text-muted">{t('gallery_note')}</p></Section>}
      {on('story') && <section className="py-16"><div className="container-x grid items-center gap-10 md:grid-cols-2"><div className="aspect-[4/3] overflow-hidden rounded-4xl"><Cover cover="art:cover:newborn" wide /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-clay">{t('story')}</p><h2 className="mt-2 text-4xl font-semibold">{loc(H.storyTitle, lang)}</h2><p className="mt-4 leading-relaxed text-ink/80">{loc(H.storyBody, lang)}</p><Link href="/about" className="btn btn-ghost mt-6">{t('nav_about')}</Link></div></div></section>}
      {on('newsletter') && <section className="bg-blush/50 py-16 text-center"><div className="container-x"><h2 className="text-3xl font-semibold">{t('newsletter')}</h2><p className="mx-auto mt-2 mb-6 max-w-md text-ink/70">{t('newsletter_sub')}</p><NewsletterForm /></div></section>}
    </>
  );
}
void filterProducts;
