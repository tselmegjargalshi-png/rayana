import { BannerEditor, CollectionEditor, HomeEditor } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { getLang } from '@/lib/i18n';
export default async function Content() {
  const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn);
  return (<div className="space-y-10"><h1 className="text-3xl font-semibold">{tr(lang, 'a_content')}</h1><HomeEditor settings={db.settings} banners={db.banners} /><section><h2 className="mb-3 font-display text-xl font-semibold">{L('Баннерууд', 'Promotional banners')}</h2><BannerEditor banners={db.banners} /></section><section><h2 className="mb-3 font-display text-xl font-semibold">{tr(lang, 'a_collections')}</h2><CollectionEditor collections={db.collections} /></section></div>);
}
