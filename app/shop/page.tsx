import { ShopView } from '@/components/ShopView';
import { parseFilters } from '@/lib/catalog';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
export const metadata = { title: 'Дэлгүүр' };
export default async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const f = parseFilters(await searchParams); const lang = await getLang();
  const title = f.sale ? tr(lang, 'nav_sale') : f.isNew ? tr(lang, 'new_arrivals') : f.group ? tr(lang, 'nav_' + f.group) : f.q ? `“${f.q}”` : tr(lang, 'shop_by_cat');
  return (<><div className="container-x py-10"><h1 className="text-4xl font-semibold">{title}</h1></div><ShopView lang={lang} base="/shop" f={f} /></>);
}
