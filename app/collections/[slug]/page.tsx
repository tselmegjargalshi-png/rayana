import { notFound } from 'next/navigation';
import { Cover } from '@/components/Cover';
import { ShopView } from '@/components/ShopView';
import { parseFilters } from '@/lib/catalog';
import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { loc } from '@/lib/format';
export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params; const c = getDB().collections.find((x) => x.slug === slug); if (!c) notFound();
  const f = { ...parseFilters(await searchParams), collection: c.id }; const lang = await getLang();
  return (
    <>
      <section className="relative mb-10 h-64 overflow-hidden sm:h-80"><Cover cover={c.cover} wide /><div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" /><div className="container-x absolute inset-x-0 bottom-0 pb-8 text-white"><h1 className="text-4xl font-semibold sm:text-5xl">{loc(c.name, lang)}</h1><p className="mt-2 max-w-xl text-white/90">{loc(c.description, lang)}</p></div></section>
      <ShopView lang={lang} base={`/collections/${slug}`} f={f} fixed={['collection']} />
    </>
  );
}
