import { PrintButton } from '@/components/PrintButton';
import { Logo } from '@/components/Logo';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { canView, fmtPhone } from '@/lib/orders';
export const metadata = { title: 'Нэхэмжлэх' };
export default async function Invoice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params; const sp = await searchParams; const lang = await getLang(); const t = (k: string) => tr(lang, k); const u = await getSession(); const o = getDB().orders.find((x) => x.id === id);
  if (!o || !canView(o, u?.id ?? null, sp.t, u?.role)) return <div className="container-x py-24 text-center">{t('not_found')}</div>;
  return (
    <div className="container-x max-w-3xl py-10"><div className="card p-8"><div className="flex items-start justify-between"><Logo size={44} /><div className="text-right text-sm"><p className="font-display text-2xl font-semibold">{t('invoice')}</p><p>{o.number}</p><p className="text-muted">{dateFmt(o.createdAt)}</p></div></div>
      {o.demo && <p className="mt-4 rounded-xl bg-butter/60 p-3 text-xs font-semibold">{t('conf_demo')}</p>}
      <p className="mt-6 text-sm">{o.customer.name}<br />{fmtPhone(o.customer.phone)} · {o.customer.email}<br />{o.delivery.district} {o.delivery.address}</p>
      <table className="mt-6 w-full text-sm"><thead className="border-b border-line text-left text-xs uppercase text-muted"><tr><th className="py-2">{t('items')}</th><th>{t('qty')}</th><th className="text-right">{t('price')}</th></tr></thead><tbody>{o.items.map((i) => <tr key={i.sku} className="border-b border-line"><td className="py-2">{loc(i.name, lang)}<br /><span className="text-xs text-muted">{loc(i.colorName, lang)} · {i.size} · {i.sku}</span></td><td>{i.qty}</td><td className="text-right">{money(i.unitPrice * i.qty)}</td></tr>)}</tbody></table>
      <dl className="mt-4 ml-auto w-64 space-y-1 text-sm"><div className="flex justify-between"><dt>{t('subtotal')}</dt><dd>{money(o.subtotal)}</dd></div><div className="flex justify-between"><dt>{t('discount')}</dt><dd>−{money(o.discount)}</dd></div><div className="flex justify-between"><dt>{t('delivery_fee')}</dt><dd>{money(o.deliveryFee)}</dd></div><div className="flex justify-between"><dt>{t('gift_wrap')}</dt><dd>{money(o.giftWrap)}</dd></div><div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>{t('total')}</dt><dd>{money(o.total)}</dd></div></dl></div>
      <div className="mt-4 max-w-xs"><PrintButton label={t('print')} /></div></div>
  );
}
