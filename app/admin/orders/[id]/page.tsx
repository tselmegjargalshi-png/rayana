import { notFound } from 'next/navigation';
import { OrderControls } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { statusText } from '@/lib/orders';
export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = getDB(); const o = db.orders.find((x) => x.id === id); if (!o) notFound(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn);
  return (
    <div><h1 className="text-3xl font-semibold">{o.number} <span className="ml-2 rounded-full bg-ink px-3 py-1 align-middle text-sm text-cream" data-testid="admin-order-status">{tr(lang, 'st_' + o.status)}</span></h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6">
        <section className="card overflow-x-auto"><table className="w-full text-sm"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">{L('Бараа', 'Item')}</th><th>SKU</th><th>{L('Өнгө', 'Color')}</th><th>{L('Размер', 'Size')}</th><th>{L('Тоо', 'Qty')}</th><th className="pr-3 text-right">{L('Дүн', 'Amount')}</th></tr></thead><tbody>{o.items.map((i) => <tr key={i.sku} className="border-t border-line"><td className="p-3">{loc(i.name, lang)}</td><td className="font-mono text-xs">{i.sku}</td><td>{loc(i.colorName, lang)}</td><td>{i.size}</td><td>{i.qty}</td><td className="pr-3 text-right">{money(i.unitPrice * i.qty)}</td></tr>)}</tbody></table></section>
        <section className="card p-5 text-sm"><dl className="ml-auto max-w-xs space-y-1"><div className="flex justify-between"><dt>{tr(lang, 'subtotal')}</dt><dd>{money(o.subtotal)}</dd></div><div className="flex justify-between"><dt>{tr(lang, 'discount')} {o.discountCode}</dt><dd>−{money(o.discount)}</dd></div><div className="flex justify-between"><dt>{tr(lang, 'delivery_fee')}</dt><dd>{money(o.deliveryFee)}</dd></div><div className="flex justify-between"><dt>{tr(lang, 'gift_wrap')}</dt><dd>{money(o.giftWrap)}</dd></div><div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>{tr(lang, 'total')}</dt><dd>{money(o.total)}</dd></div></dl></section>
        <section className="card p-5 text-sm"><h2 className="font-display text-lg font-semibold">{L('Явц', 'Timeline')}</h2><ol className="mt-3 space-y-2">{o.timeline.map((e, i) => <li key={i} className="flex gap-3"><span className="w-32 shrink-0 text-xs text-muted">{dateFmt(e.at, true)}</span><span>{e.status === 'note' ? '' : loc(statusText[e.status], lang)} {e.text && <span className="text-muted">{e.text}</span>}</span></li>)}</ol></section>
        {o.adminNotes.length > 0 && <section className="card p-5 text-sm"><h2 className="font-display text-lg font-semibold">{L('Админы тэмдэглэл', 'Admin notes')}</h2><ul className="mt-2 space-y-2">{o.adminNotes.map((n, i) => <li key={i}><span className="text-xs text-muted">{dateFmt(n.at, true)} · {n.by}</span><br />{n.text}</li>)}</ul></section>}
      </div>
      <aside className="space-y-4"><div className="card p-5 text-sm"><p className="font-semibold">{o.customer.name}</p><p>{o.customer.phone} · {o.customer.email}</p><p className="mt-2 text-muted">{o.delivery.type === 'pickup' ? tr(lang, 'pickup') : `${o.delivery.district}, ${o.delivery.address}`}</p>{o.delivery.notes && <p className="text-muted">{o.delivery.notes}</p>}<p className="mt-2 text-xs">ETA: {o.delivery.eta}</p></div>
        <div className="card p-5 text-sm"><p className="font-semibold">{tr(lang, 'pay_method')}: {tr(lang, 'pm_' + o.payment.method)}</p><p data-testid="admin-pay-status" data-status={o.payment.status}>{tr(lang, 'ps_' + o.payment.status)} {o.payment.demo && '(DEMO)'}</p><p className="font-mono text-xs">{o.payment.reference}</p><p className="mt-1 text-xs">{L('Нөөц хасагдсан', 'Stock deducted')}: {o.stockDeducted ? '✓' : '✗'}</p></div>
        <div className="card p-5"><OrderControls id={o.id} status={o.status} payStatus={o.payment.status} payMethod={o.payment.method} hasReturn={!!o.returnRequest} returnStatus={o.returnRequest ? `${o.returnRequest.status}: ${o.returnRequest.reason}` : undefined} /></div></aside></div></div>
  );
}
