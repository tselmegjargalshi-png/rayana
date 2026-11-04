import Link from 'next/link';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { ORDER_STATUSES } from '@/lib/types';
export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams; const db = getDB(); const lang = await getLang(); const q = (sp.q ?? '').toLowerCase();
  const all = db.orders.filter((o) => (!sp.status || o.status === sp.status) && (!q || `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.email}`.toLowerCase().includes(q)));
  const page = Math.max(1, Number(sp.page) || 1); const list = all.slice((page - 1) * 25, page * 25); const pages = Math.ceil(all.length / 25);
  return (
    <div><h1 className="text-3xl font-semibold">{tr(lang, 'a_orders')} <span className="text-base font-normal text-muted">({all.length})</span></h1>
      <div className="mt-4 flex flex-wrap items-center gap-2"><form><input name="q" defaultValue={sp.q} placeholder={tr(lang, 'search_ph')} className="input !w-56 !py-2" aria-label={tr(lang, 'search')} /></form><Link href="/admin/orders" className={`chip ${!sp.status ? 'chip-on' : ''}`}>{tr(lang, 'all')}</Link>{ORDER_STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`} className={`chip ${sp.status === s ? 'chip-on' : ''}`}>{tr(lang, 'st_' + s)} ({db.orders.filter((o) => o.status === s).length})</Link>)}</div>
      <div className="card mt-4 overflow-x-auto"><table className="w-full text-sm" data-testid="orders-table"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">#</th><th>{tr(lang, 'full_name')}</th><th>{tr(lang, 'phone')}</th><th>{tr(lang, 'total')}</th><th>{tr(lang, 'pay_method')}</th><th>{lang === 'en' ? 'Status' : 'Төлөв'}</th><th>{lang === 'en' ? 'Date' : 'Огноо'}</th></tr></thead>
        <tbody>{list.map((o) => <tr key={o.id} className="border-t border-line hover:bg-cream"><td className="p-3 font-semibold"><Link href={`/admin/orders/${o.id}`} className="hover:text-clay">{o.number}</Link>{o.demo && <span className="ml-2 text-[10px] text-muted">DEMO</span>}</td><td>{o.customer.name}</td><td>{o.customer.phone}</td><td>{money(o.total)}</td><td>{tr(lang, 'pm_' + o.payment.method)} · {tr(lang, 'ps_' + o.payment.status)}</td><td><span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold">{tr(lang, 'st_' + o.status)}</span></td><td className="text-xs">{dateFmt(o.createdAt)}</td></tr>)}</tbody></table></div>
      {pages > 1 && <div className="mt-4 flex flex-wrap gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} className={`chip ${n === page ? 'chip-on' : ''}`} href={`/admin/orders?page=${n}${sp.status ? `&status=${sp.status}` : ''}`}>{n}</Link>)}</div>}</div>
  );
}
