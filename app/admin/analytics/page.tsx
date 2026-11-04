import { BarChart } from '@/components/BarChart';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { computeStats } from '@/lib/stats';
export default async function Analytics() {
  const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn); const s = computeStats(db); const maxCat = Math.max(1, ...s.byCat.map((c) => c[1]));
  return (
    <div className="space-y-8"><h1 className="text-3xl font-semibold">{tr(lang, 'a_analytics')}</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[[L('Нийт борлуулалт', 'Total sales'), money(s.total)], [L('Борлуулалттай захиалга', 'Sales orders'), String(s.salesCount)], [L('Дундаж захиалга', 'Average order'), money(s.aov)], [L('Энэ сар', 'This month'), money(s.monthly)]].map(([k, v]) => <div key={k} className="card p-5"><p className="text-xs text-muted">{k}</p><p className="mt-1 font-display text-2xl font-semibold" data-testid={`an-${k}`}>{v}</p></div>)}</div>
      <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Сараар', 'Revenue by month')}</h2><div className="mt-4"><BarChart data={s.months} format={money} /></div></section>
      <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Өдрөөр (30 хоног)', 'Revenue by day (30 days)')}</h2><div className="mt-4"><BarChart data={s.days} format={money} /></div></section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Ангиллаар', 'Sales by department')}</h2><ul className="mt-4 space-y-3 text-sm">{s.byCat.sort((a, b) => b[1] - a[1]).map(([g, v]) => <li key={g}><div className="flex justify-between"><span>{tr(lang, 'nav_' + g)}</span><span>{money(v)}</span></div><div className="mt-1 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-clay" style={{ width: `${(v / maxCat) * 100}%` }} /></div></li>)}</ul></section>
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">{L('Захиалгын төлөв', 'Orders by status')}</h2><ul className="mt-4 space-y-2 text-sm">{Object.entries(s.statusCount).map(([k, v]) => <li key={k} className="flex justify-between"><span>{tr(lang, 'st_' + k)}</span><span className="font-semibold">{v}</span></li>)}</ul></section>
        <section className="card p-6 lg:col-span-2"><h2 className="font-display text-lg font-semibold">{L('Шилдэг бүтээгдэхүүн', 'Top products')}</h2><table className="mt-3 w-full text-sm"><thead className="text-left text-xs text-muted"><tr><th className="py-2">{tr(lang, 'a_products')}</th><th>{L('Ширхэг', 'Units')}</th><th className="text-right">{L('Орлого', 'Revenue')}</th></tr></thead><tbody>{s.top.map((x) => <tr key={x.product!.id} className="border-t border-line"><td className="py-2">{loc(x.product!.name, lang)}</td><td>{x.qty}</td><td className="text-right">{money(x.rev)}</td></tr>)}</tbody></table></section>
        <section className="card p-6 lg:col-span-2"><h2 className="font-display text-lg font-semibold">{L('Орхигдсон сагс', 'Abandoned carts')}</h2><ul className="mt-3 divide-y divide-line text-sm">{db.abandoned.length === 0 && <li className="py-3 text-muted">0</li>}{db.abandoned.slice(0, 10).map((a) => <li key={a.id} className="flex justify-between py-2"><span>{a.email}{a.recovered ? ` ✓ ${L('сэргэсэн', 'recovered')}` : ''}</span><span>{money(a.value)}</span></li>)}</ul></section>
      </div></div>
  );
}
