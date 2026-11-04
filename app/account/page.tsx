import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AddressManager, ChildManager, LogoutButton, MarkRead, ProfileForm } from '@/components/AccountForms';
import { ProductCard } from '@/components/ProductCard';
import { ReviewForm } from '@/components/ReviewForm';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { DISTRICTS } from '@/lib/seed';
export const metadata = { title: 'Миний бүртгэл' };
const TABS = ['orders', 'profile', 'addresses', 'children', 'wishlist', 'notifications', 'returns', 'reviews'] as const;
export default async function Account({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const u = await getSession(); if (!u) redirect('/login?next=/account'); const lang = await getLang(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v); const db = getDB();
  const tab = (TABS as readonly string[]).includes((await searchParams).tab ?? '') ? (await searchParams).tab! : 'orders'; const orders = db.orders.filter((o) => o.userId === u.id);
  const unread = u.notifications.filter((n) => !n.read).length;
  return (
    <div className="container-x py-10"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-4xl font-semibold">{u.name}</h1><LogoutButton /></div>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label={t('account')}>{TABS.map((k) => <Link key={k} href={`/account?tab=${k}`} className={`chip ${tab === k ? 'chip-on' : ''}`}>{t('acc_' + k)}{k === 'notifications' && unread > 0 ? ` (${unread})` : ''}</Link>)}</nav>
      <div className="mt-8">
        {tab === 'orders' && (orders.length === 0 ? <p className="card p-8 text-center text-muted">{t('no_orders')}</p> : <div className="space-y-3">{orders.map((o) => <Link key={o.id} href={`/order/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-5 transition hover:shadow-soft" data-testid="my-order"><div><p className="font-semibold">{o.number}</p><p className="text-xs text-muted">{dateFmt(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} {t('items')}</p></div><span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{t('st_' + o.status)}</span><p className="font-semibold">{money(o.total)}</p></Link>)}</div>)}
        {tab === 'profile' && <ProfileForm name={u.name} phone={u.phone} email={u.email} />}
        {tab === 'addresses' && <AddressManager addresses={u.addresses} districts={DISTRICTS} />}
        {tab === 'children' && <ChildManager kids={u.children} />}
        {tab === 'wishlist' && (u.wishlist.length === 0 ? <p className="card p-8 text-center text-muted">{t('no_wish')}</p> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{u.wishlist.map((id) => db.products.find((p) => p.id === id)).filter(Boolean).map((p) => <ProductCard key={p!.id} p={p!} lang={lang} colors={db.settings.colors} />)}</div>)}
        {tab === 'notifications' && <div>{u.notifications.length > 0 && <MarkRead />}<ul className="mt-4 space-y-2">{u.notifications.length === 0 && <p className="card p-8 text-center text-muted">{t('no_notif')}</p>}{u.notifications.map((n) => <li key={n.id} className={`card flex items-center justify-between p-4 text-sm ${n.read ? 'opacity-60' : ''}`}><span>{loc(n.text, lang)}</span><span className="text-xs text-muted">{dateFmt(n.at, true)}</span></li>)}</ul></div>}
        {tab === 'returns' && <div className="space-y-3">{orders.filter((o) => o.returnRequest || o.status === 'delivered').map((o) => <Link key={o.id} href={`/order/${o.id}`} className="card flex justify-between p-5 text-sm"><span>{o.number}</span><span>{o.returnRequest ? `${t('return_request')}: ${o.returnRequest.status}` : t('return_request')}</span></Link>)}{!orders.some((o) => o.returnRequest || o.status === 'delivered') && <p className="card p-8 text-center text-muted">{t('return_only_delivered')}</p>}</div>}
        {tab === 'reviews' && <div className="grid gap-4 md:grid-cols-2">{db.reviews.filter((r) => r.userId === u.id).map((r) => <div key={r.id}><p className="mb-2 text-sm font-semibold">{loc(db.products.find((p) => p.id === r.productId)?.name, lang)} ({r.status})</p><ReviewForm productId={r.productId} existing={r} /></div>)}{!db.reviews.some((r) => r.userId === u.id) && <p className="card p-8 text-center text-muted">{t('no_reviews')}</p>}</div>}
      </div></div>
  );
}
