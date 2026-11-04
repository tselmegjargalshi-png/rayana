import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
import { loc, money } from '@/lib/format';
export const metadata = { title: 'Хүргэлтийн мэдээлэл' };
export default async function Delivery() {
  const lang = await getLang(); const S = getDB().settings; const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v);
  return (<div className="container-x max-w-3xl py-14"><h1 className="text-4xl font-semibold">{t('delivery_info')}</h1><p className="mt-3 text-muted">{tr(lang, 'free_ship_strip', { n: money(S.freeDeliveryThreshold) })}</p>
    <div className="card mt-8 divide-y divide-line">{S.zones.filter((z) => z.active).map((z) => <div key={z.id} className="flex flex-wrap items-center justify-between gap-2 p-5"><div><p className="font-semibold">{loc(z.name, lang)}</p><p className="text-sm text-muted">{z.districts.join(', ')}</p></div><div className="text-right"><p className="font-semibold">{money(z.fee)}</p><p className="text-xs text-muted">{loc(z.eta, lang)}</p></div></div>)}</div>
    {S.pickup.enabled && <div className="card mt-4 p-5"><p className="font-semibold">{t('pickup')}: {t('free')}</p><p className="text-sm text-muted">{loc(S.pickup.address, lang)}. {loc(S.pickup.eta, lang)}</p></div>}</div>);
}
