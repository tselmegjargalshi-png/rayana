import { notFound } from 'next/navigation';
import { ShopView } from '@/components/ShopView';
import { parseFilters } from '@/lib/catalog';
import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { loc } from '@/lib/format';
export default async function AgePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params; const a = getDB().settings.ageGroups.find((x) => x.id === id); if (!a) notFound();
  const f = { ...parseFilters(await searchParams), age: id }; const lang = await getLang();
  return (<><div className="container-x py-10"><h1 className="text-4xl font-semibold">{loc(a.name, lang)}</h1></div><ShopView lang={lang} base={`/age/${id}`} f={f} fixed={['age']} /></>);
}
