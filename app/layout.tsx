import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/noto-sans/wght.css';
import '@fontsource-variable/noto-serif/wght.css';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { getLang } from '@/lib/i18n';
import { DEMO_MODE, getDB } from '@/lib/db';
import { money } from '@/lib/format';
import { tr } from '@/lib/dict';

export const metadata: Metadata = { title: { default: 'Rayana | Хүүхдийн хувцас', template: '%s | Rayana' }, description: 'Rayana: нярай болон хүүхдийн премиум хувцас. Premium children’s fashion from Ulaanbaatar.', icons: { icon: '/icon.svg' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FBF7F0' };
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, lang] = await Promise.all([getSession(), getLang()]); const db = getDB();
  return (
    <html lang={lang === 'mn' ? 'mn' : 'en'}>
      <body className="min-h-screen">
        <Providers lang={lang} loggedIn={!!user} initialWish={user?.wishlist ?? []}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip</a>
          <Header user={user ? { name: user.name, role: user.role } : null} demo={DEMO_MODE} freeShip={tr(lang, 'free_ship_strip', { n: money(db.settings.freeDeliveryThreshold) })} />
          <main id="main">{children}</main>
          <Footer lang={lang} settings={db.settings} />
        </Providers>
      </body>
    </html>
  );
}
