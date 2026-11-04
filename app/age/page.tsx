import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
import { loc } from '@/lib/format';
import { filterProducts } from '@/lib/catalog';
export const metadata = { title: 'Насаар сонгох' };
export default async function Ages() {
  const db = getDB(); const lang = await getLang(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v);
  const tones = ['bg-blush', 'bg-sage', 'bg-sky', 'bg-butter'];
  return (
    <div className="container-x py-10"><h1 className="text-4xl font-semibold">{t('shop_by_age')}</h1><p className="mt-2 text-muted">{t('sg_disclaimer')}</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {db.settings.ageGroups.map((a, i) => <Link key={a.id} href={`/age/${a.id}`} className={`${tones[i % 4]} group rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-soft`}><p className="font-display text-2xl font-semibold">{loc(a.name, lang).replace(/ \(.*\)/, '')}</p><p className="mt-1 text-xs text-ink/60">{a.sizes.join(' / ')}</p><p className="mt-6 text-sm font-semibold">{t('results', { n: filterProducts(db, { age: a.id }).length })} →</p></Link>)}
      </div></div>
  );
}
