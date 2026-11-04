import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
import { loc } from '@/lib/format';
import { Logo } from '@/components/Logo';
export const metadata = { title: 'Брэндийн түүх' };
export default async function About() {
  const lang = await getLang(); const H = getDB().settings.home; const t = (k: string) => tr(lang, k);
  return (<div className="container-x max-w-3xl py-14"><Logo tag={t('brand_tag')} size={56} /><h1 className="mt-8 text-4xl font-semibold">{loc(H.storyTitle, lang)}</h1><div className="mt-6 space-y-4 leading-relaxed text-ink/80"><p>{t('about_p1')}</p><p>{loc(H.storyBody, lang)}</p><p>{t('about_p2')}</p><p className="rounded-2xl bg-butter/50 p-4 text-sm">{t('fictional_note')}</p></div></div>);
}
