import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetail } from '@/components/ProductDetail';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { ReviewForm } from '@/components/ReviewForm';
import type { ChildLite } from '@/components/SizeRecommender';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const q = getDB().products.find((x) => x.slug === slug); return { title: q ? q.name.mn : 'Rayana' };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const db = getDB(); const p = db.products.find((x) => x.slug === slug && x.status === 'active'); if (!p) notFound();
  const lang = await getLang(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v); const user = await getSession();
  const now = new Date();
  const kids: ChildLite[] = (user?.children ?? []).map((c) => ({ id: c.id, name: c.name, ageMonths: Math.max(0, (now.getFullYear() - c.birthYear) * 12 + now.getMonth() + 1 - c.birthMonth), heightCm: c.heightCm, weightKg: c.weightKg }));
  const related = db.products.filter((x) => x.id !== p.id && x.status === 'active' && (x.categoryId === p.categoryId || x.group === p.group)).sort((a, b) => Number(b.categoryId === p.categoryId) - Number(a.categoryId === p.categoryId)).slice(0, 4);
  const reviews = db.reviews.filter((r) => r.productId === p.id && r.status === 'approved'); const mine = user ? db.reviews.find((r) => r.productId === p.id && r.userId === user.id) : null;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0; const cat = db.categories.find((c) => c.id === p.categoryId);
  const delivery = `${t('delivery_ub')} ${tr(lang, 'free_ship_strip', { n: money(db.settings.freeDeliveryThreshold) })}.`;
  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb"><Link href="/" className="hover:text-ink">{t('home')}</Link> / <Link href={`/shop?group=${p.group}`} className="hover:text-ink">{t('nav_' + p.group)}</Link> / <Link href={`/shop?cat=${p.categoryId}`} className="hover:text-ink">{loc(cat?.name, lang)}</Link></nav>
      <ProductDetail p={p} colors={db.settings.colors} childrenLite={kids} deliveryNote={delivery} />
      <section className="mt-20" id="reviews"><div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-semibold">{t('reviews')} {reviews.length > 0 && <span className="ml-2 text-base font-normal text-muted">★ {avg.toFixed(1)} ({reviews.length})</span>}</h2></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">{reviews.length === 0 && <p className="text-muted">{t('no_reviews')}</p>}{reviews.map((r) => <article key={r.id} className="card p-5" data-testid="review"><div className="flex items-center justify-between"><p className="text-clay" aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}<span className="text-beige">{'★'.repeat(5 - r.rating)}</span></p><p className="text-xs text-muted">{dateFmt(r.createdAt)}{r.editedAt ? ` · ${t('edited')}` : ''}</p></div><h3 className="mt-2 font-sans text-base font-semibold">{r.title}</h3><p className="mt-1 text-sm text-ink/80">{r.body}</p>{r.photos.length > 0 && <div className="mt-3 flex gap-2">{r.photos.map((u) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt="" className="h-20 w-20 rounded-xl object-cover" />)}</div>}<p className="mt-3 text-xs text-muted">{r.authorName}{r.verified && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 font-semibold text-ink">✓ {t('verified')}</span>}{r.demo && <span className="ml-2">({t('demo')})</span>}</p></article>)}</div>
          <div>{user ? <ReviewForm productId={p.id} existing={mine} key={mine?.id ?? 'new'} /> : <p className="card p-6 text-sm"><Link className="font-semibold text-clay underline" href={`/login?next=/product/${p.slug}`}>{t('review_login')}</Link></p>}{mine && mine.status !== 'approved' && <p className="mt-3 text-xs text-muted">{t('review_pending')}</p>}</div>
        </div></section>
      <section className="mt-20"><h2 className="mb-6 text-2xl font-semibold">{t('related')}</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} lang={lang} colors={db.settings.colors} />)}</div></section>
      <RecentlyViewed excludeId={p.id} colors={db.settings.colors} />
    </div>
  );
}
