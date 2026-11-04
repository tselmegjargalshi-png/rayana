import { ReviewActions } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc } from '@/lib/format';
import { getLang } from '@/lib/i18n';
export default async function AdminReviews() {
  const db = getDB(); const lang = await getLang(); const rs = [...db.reviews].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.createdAt.localeCompare(a.createdAt));
  return (<div><h1 className="text-3xl font-semibold">{tr(lang, 'a_reviews')}</h1><div className="mt-6 space-y-3" data-testid="reviews-list">{rs.map((r) => <article key={r.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">{loc(db.products.find((p) => p.id === r.productId)?.name, lang)}</span><span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{r.status}</span></div><p className="mt-1 text-clay">{'★'.repeat(r.rating)}</p><p className="font-semibold">{r.title}</p><p className="text-sm text-ink/80">{r.body}</p><p className="mt-2 text-xs text-muted">{r.authorName} · {dateFmt(r.createdAt)} {r.verified ? `· ✓ ${tr(lang, 'verified')}` : ''} {r.demo ? '· DEMO' : ''}</p><div className="mt-3"><ReviewActions r={r} /></div></article>)}</div></div>);
}
