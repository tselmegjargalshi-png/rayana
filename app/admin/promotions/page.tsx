import { BundleEditor, CodeEditor } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { getLang } from '@/lib/i18n';
export default async function Promotions() {
  const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn);
  return (<div className="space-y-10"><h1 className="text-3xl font-semibold">{tr(lang, 'a_promos')}</h1><section><h2 className="mb-3 font-display text-xl font-semibold">{L('Хөнгөлөлтийн кодууд', 'Discount codes')}</h2><CodeEditor codes={db.codes} /></section><section><h2 className="mb-3 font-display text-xl font-semibold">{L('Багц санал', 'Bundle offers')}</h2><BundleEditor bundles={db.bundles} products={db.products.map((p) => ({ id: p.id, name: p.name }))} /></section>
    <p className="rounded-2xl bg-sand p-4 text-sm">{L('Үнэгүй хүргэлтийн босгыг "Хүргэлт" хэсгээс тохируулна. Хямдралтай үнийг бүтээгдэхүүн бүр дээр оруулна.', 'Set the free delivery threshold under Delivery. Set sale prices on each product.')}</p></div>);
}
