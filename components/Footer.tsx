import Link from 'next/link';
import { Logo } from './Logo';
import { tr } from '@/lib/dict';
import { loc } from '@/lib/format';
import type { Lang, Settings } from '@/lib/types';
import { NewsletterForm } from './NewsletterForm';

export function Footer({ lang, settings }: { lang: Lang; settings: Settings }) {
  const t = (k: string) => tr(lang, k);
  return (
    <footer className="mt-24 border-t border-line bg-sand/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo tag={t('brand_tag')} size={40} />
          <p className="mt-4 max-w-xs text-sm text-muted">{t('fictional_note')}</p>
        </div>
        <div><h3 className="mb-3 font-sans text-sm font-semibold">{t('footer_shop')}</h3><ul className="space-y-2 text-sm text-muted">
          {[['/shop?group=baby', 'nav_baby'], ['/shop?group=girls', 'nav_girls'], ['/shop?group=boys', 'nav_boys'], ['/shop?group=unisex', 'nav_unisex'], ['/shop?group=accessories', 'nav_accessories'], ['/collections', 'nav_collections']].map(([h, k]) => <li key={h}><Link className="hover:text-ink" href={h}>{t(k)}</Link></li>)}</ul></div>
        <div><h3 className="mb-3 font-sans text-sm font-semibold">{t('footer_help')}</h3><ul className="space-y-2 text-sm text-muted">
          <li><Link className="hover:text-ink" href="/size-guide">{t('nav_size')}</Link></li><li><Link className="hover:text-ink" href="/track">{t('track_order')}</Link></li><li><Link className="hover:text-ink" href="/delivery">{t('delivery_info')}</Link></li><li><Link className="hover:text-ink" href="/about">{t('nav_about')}</Link></li></ul></div>
        <div><h3 className="mb-3 font-sans text-sm font-semibold">{t('footer_contact')}</h3><ul className="space-y-2 text-sm text-muted">
          <li>{settings.contact.phone}</li><li>{settings.contact.email}</li><li>{loc(settings.contact.address, lang)}</li><li>{loc(settings.contact.hours, lang)}</li></ul>
          <div className="mt-4"><NewsletterForm compact /></div></div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">© 2026 Rayana. {t('rights')} {t('currency_note')}</div>
    </footer>
  );
}
