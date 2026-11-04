import { SizeRecommender, type ChildLite } from '@/components/SizeRecommender';
import { SizeTable } from '@/components/SizeTable';
import { getSession } from '@/lib/auth';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
export const metadata = { title: 'Размерын хүснэгт' };
export default async function SizeGuide() {
  const lang = await getLang(); const u = await getSession(); const now = new Date();
  const kids: ChildLite[] = (u?.children ?? []).map((c) => ({ id: c.id, name: c.name, ageMonths: Math.max(0, (now.getFullYear() - c.birthYear) * 12 + now.getMonth() + 1 - c.birthMonth), heightCm: c.heightCm, weightKg: c.weightKg }));
  return (
    <div className="container-x py-10"><h1 className="text-4xl font-semibold">{tr(lang, 'sg_title')}</h1>
      <p className="mt-3 max-w-2xl rounded-2xl bg-butter/50 p-4 text-sm">{tr(lang, 'sg_disclaimer')}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]"><SizeTable lang={lang} /><SizeRecommender childrenLite={kids} /></div></div>
  );
}
