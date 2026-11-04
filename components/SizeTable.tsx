import { SIZE_GUIDE } from '@/lib/sizing';
import { tr } from '@/lib/dict';
import type { Lang } from '@/lib/types';
export function SizeTable({ lang, highlight }: { lang: Lang; highlight?: string[] }) {
  const t = (k: string) => tr(lang, k);
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm"><caption className="sr-only">{t('sg_title')}</caption>
        <thead className="bg-sand text-left text-xs uppercase tracking-wide text-muted"><tr>{['size', 'sg_age', 'sg_height', 'sg_weight', 'sg_chest', 'sg_waist', 'sg_hip'].map((k) => <th key={k} scope="col" className="px-4 py-3">{t(k)}</th>)}</tr></thead>
        <tbody>{SIZE_GUIDE.map((r) => <tr key={r.size} className={`border-t border-line ${highlight?.includes(r.size) ? 'bg-butter/40' : ''}`}><th scope="row" className="px-4 py-3 font-semibold">{r.size}</th><td className="px-4 py-3">{lang === 'en' ? r.label.replace('сар', 'mo').replace('нас', 'yrs') : r.label}</td><td className="px-4 py-3">{r.hMin} ~ {r.hMax}</td><td className="px-4 py-3">{r.wMin} ~ {r.wMax}</td><td className="px-4 py-3">{r.chest}</td><td className="px-4 py-3">{r.waist}</td><td className="px-4 py-3">{r.hip}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
