import Link from 'next/link';
import { BarChart } from '@/components/BarChart';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { computeStats } from '@/lib/stats';
import { ResetDemo } from '@/components/AdminForms';
import { DEMO_MODE } from '@/lib/db';
export default async function Dashboard() {
  const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn); const s = computeStats(db);
  const tiles: [string, string][] = [[L('Нийт борлуулалт', 'Total sales'), money(s.total)], [L('Энэ сарын орлого', 'Monthly revenue'), money(s.monthly)], [L('Нийт захиалга', 'Total orders'), String(s.orders)], [L('Хүлээгдэж буй', 'Pending orders'), String(s.pending)], [L('Хүргэгдсэн', 'Completed orders'), String(s.completed)], [L('Нийт бүтээгдэхүүн', 'Total products'), String(s.products)], [L('Нөөц багатай', 'Low stock variants'), String(s.lowStock.length)], [L('Хэрэглэгч', 'Customers'), String(s.customers)], [L('Дундаж захиалга', 'Average order value'), money(s.aov)]];
  return (
    <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold">{tr(lang, 'a_dashboard')}</h1>{DEMO_MODE && <ResetDemo />}</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3" data-testid="stat-tiles">{tiles.map(([k, v]) => <div key={k} className="card p-5"><p className="text-xs text-muted">{k}</p><p className="mt-1 font-display text-2xl font-semibold" data-testid={`stat-${k}`}>{v}</p></div>)}</div>
      <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Сүүлийн 30 өдрийн борлуулалт', 'Sales, last 30 days')}</h2><div className="mt-4"><BarChart data={s.days} format={money} /></div></section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Шинэ захиалгууд', 'Recent orders')}</h2><ul className="mt-3 divide-y divide-line text-sm">{db.orders.slice(0, 6).map((o) => <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2.5 hover:text-clay"><span>{o.number} · {o.customer.name}</span><span className="text-xs">{tr(lang, 'st_' + o.status)} · {money(o.total)}</span></Link></li>)}</ul></section>
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Хамгийн их зарагдсан', 'Best selling products')}</h2><ol className="mt-3 divide-y divide-line text-sm">{s.top.slice(0, 6).map((x) => <li key={x.product!.id} className="flex justify-between py-2.5"><Link className="hover:text-clay" href={`/admin/products/${x.product!.id}`}>{loc(x.product!.name, lang)}</Link><span>{x.qty}</span></li>)}</ol></section>
        <section className="card p-6 lg:col-span-2"><h2 className="font-display text-lg font-semibold">{L('Нөөц багатай', 'Low stock alerts')} <Link className="ml-2 text-xs text-clay underline" href="/admin/inventory?low=1">{tr(lang, 'view_all')}</Link></h2><ul className="mt-3 grid gap-x-8 text-sm md:grid-cols-2">{s.lowStock.slice(0, 8).map(({ p, v }) => <li key={v.sku} className="flex justify-between border-b border-line py-2"><span className="truncate">{loc(p.name, lang)} · {v.color} · {v.size}</span><span className={v.stock === 0 ? 'font-semibold text-red-700' : 'text-clay'}>{v.stock === 0 ? L('Дууссан', 'Out') : v.stock}</span></li>)}</ul></section>
      </div>
      <p className="text-xs text-muted">{dateFmt(new Date().toISOString(), true)}</p></div>
  );
}
