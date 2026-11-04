import Link from 'next/link';
import { PaymentPanel, ReturnForm } from '@/components/OrderActions';
import { PrintButton } from '@/components/PrintButton';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, imgUrl, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { canView, fmtPhone, statusText } from '@/lib/orders';
import { ORDER_STATUSES } from '@/lib/types';

export const metadata = { title: 'Захиалга' };
export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string; new?: string }> }) {
  const { id } = await params; const sp = await searchParams; const lang = await getLang(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v);
  const u = await getSession(); const db = getDB(); const o = db.orders.find((x) => x.id === id);
  if (!o || !canView(o, u?.id ?? null, sp.t, u?.role)) return (<div className="container-x py-24 text-center"><h1 className="text-3xl font-semibold">{t('not_found')}</h1><Link href="/track" className="btn btn-primary mt-6">{t('track_order')}</Link></div>);
  const token = sp.t ?? o.accessToken; const flow = ORDER_STATUSES.filter((s) => !['cancelled', 'return_requested'].includes(s)); const idx = flow.indexOf(o.status as (typeof flow)[number]);
  const payLabel = o.payment.method === 'qpay' ? 'QPay' : o.payment.method === 'socialpay' ? 'SocialPay' : t('pay_' + o.payment.method);
  return (
    <div className="container-x max-w-4xl py-10">
      {sp.new && <div className="mb-8 rounded-4xl bg-sage/50 p-8 text-center" data-testid="confirmation"><p className="text-4xl">✓</p><h1 className="mt-2 text-3xl font-semibold">{t('conf_title')}</h1><p className="mt-2 text-sm">{t('conf_demo')}</p><p className="mt-4 text-sm text-muted">{t('order_no')}</p><p className="font-display text-3xl font-semibold" data-testid="order-number">{o.number}</p><p className="mt-3 text-xs text-muted">{t('save_link')}</p></div>}
      {!sp.new && <h1 className="text-3xl font-semibold">{t('order_no')}: <span data-testid="order-number">{o.number}</span></h1>}
      <div className="mt-6 flex flex-wrap items-center gap-3"><span className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-cream" data-testid="order-status">{t('st_' + o.status)}</span><span className="text-sm text-muted">{dateFmt(o.createdAt, true)}</span>{o.demo && <span className="rounded-full bg-butter px-3 py-1 text-xs font-bold">{t('demo')}</span>}<Link href={`/order/${o.id}/invoice?t=${token}`} className="ml-auto text-sm font-semibold text-clay underline">{t('invoice')}</Link></div>
      {o.status !== 'cancelled' && <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-[11px] sm:grid-cols-7" aria-label={t('timeline')}>{flow.map((s, i) => <li key={s} className={`rounded-xl px-1 py-2 ${i <= idx ? 'bg-clay font-semibold text-white' : 'bg-sand text-muted'}`}>{t('st_' + s)}</li>)}</ol>}
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card divide-y divide-line">{o.items.map((i) => { const p = db.products.find((x) => x.id === i.productId); const hex = db.settings.colors.find((c) => c.id === i.color)?.hex ?? 'EBDDBF'; return <div key={i.sku} className="flex gap-4 p-4"><div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">{p && /* eslint-disable-next-line @next/next/no-img-element */ <img src={imgUrl(p, hex, 0)} alt="" className="h-full w-full object-cover" />}</div><div className="flex-1 text-sm"><p className="font-medium">{loc(i.name, lang)}</p><p className="text-xs text-muted">{loc(i.colorName, lang)} · {i.size} · ×{i.qty} · {i.sku}</p></div><p className="text-sm font-semibold">{money(i.unitPrice * i.qty)}</p></div>; })}</section>
          <section className="card p-5"><h2 className="font-display text-lg font-semibold">{t('timeline')}</h2><ol className="mt-3 space-y-3 border-l-2 border-line pl-4">{o.timeline.map((e, k) => <li key={k} className="relative text-sm"><span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-clay" /><p className="font-semibold">{e.status === 'note' ? '' : loc(statusText[e.status], lang)}</p><p className="text-xs text-muted">{dateFmt(e.at, true)}{e.text && lang === 'mn' ? ` · ${e.text}` : ''}</p></li>)}</ol></section>
          {o.status === 'delivered' && !o.returnRequest && <ReturnForm id={o.id} token={token} />}
          {o.returnRequest && <p className="card p-5 text-sm">{t('return_request')}: {o.returnRequest.reason} ({o.returnRequest.status})</p>}
        </div>
        <aside className="space-y-4">
          <div className="card p-5 text-sm"><dl className="space-y-1.5"><div className="flex justify-between"><dt>{t('subtotal')}</dt><dd>{money(o.subtotal)}</dd></div>{o.discount > 0 && <div className="flex justify-between text-green-700"><dt>{t('discount')} {o.discountCode ?? ''}</dt><dd>−{money(o.discount)}</dd></div>}<div className="flex justify-between"><dt>{t('delivery_fee')}</dt><dd>{o.deliveryFee ? money(o.deliveryFee) : t('free')}</dd></div>{o.giftWrap > 0 && <div className="flex justify-between"><dt>{t('gift_wrap')}</dt><dd>{money(o.giftWrap)}</dd></div>}<div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>{t('total')}</dt><dd>{money(o.total)}</dd></div></dl></div>
          <div className="card p-5 text-sm"><p className="font-semibold">{o.delivery.type === 'pickup' ? t('pickup') : t('home_delivery')}</p><p className="mt-1 text-muted">{o.customer.name} · {fmtPhone(o.customer.phone)}</p><p className="text-muted">{o.delivery.district} {o.delivery.address}</p>{o.delivery.notes && <p className="text-muted">{o.delivery.notes}</p>}<p className="mt-2 text-xs">{t('delivery')}: {o.delivery.eta}</p></div>
          <div className="card p-5 text-sm"><p className="mb-3 font-semibold">{payLabel}</p><PaymentPanel id={o.id} token={token} method={o.payment.method} status={o.payment.status} total={o.total} number={o.number} bank={db.settings.bank} /></div>
          <PrintButton label={t('print')} />
        </aside>
      </div>
    </div>
  );
}
