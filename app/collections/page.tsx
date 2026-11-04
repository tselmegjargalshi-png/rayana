import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
import { loc } from '@/lib/format';
import { Cover } from '@/components/Cover';
export const metadata = { title: 'Цуглуулгууд' };
export default async function Collections() {
  const db = getDB(); const lang = await getLang();
  return (
    <div className="container-x py-10"><h1 className="text-4xl font-semibold">{tr(lang, 'collections')}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {db.collections.map((c) => <Link key={c.id} href={`/collections/${c.slug}`} className="group overflow-hidden rounded-3xl border border-line bg-white"><div className="aspect-[4/3] overflow-hidden"><Cover cover={c.cover} /></div><div className="p-5"><h2 className="text-xl font-semibold">{loc(c.name, lang)}</h2><p className="mt-1 line-clamp-2 text-sm text-muted">{loc(c.description, lang)}</p><p className="mt-3 text-xs font-semibold text-clay">{tr(lang, 'products_in', { n: db.products.filter((p) => p.collections.includes(c.id) && p.status === 'active').length })}</p></div></Link>)}
      </div></div>
  );
}
