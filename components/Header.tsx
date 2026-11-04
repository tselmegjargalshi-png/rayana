'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { useApp } from './Providers';

export function Header({ user, demo, freeShip }: { user: { name: string; role: string } | null; demo: boolean; freeShip: string }) {
  const { t, lang, cartCount, wish } = useApp(); const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const router = useRouter();
  const links = [['/shop?isNew=1', 'nav_new'], ['/shop?group=baby', 'nav_baby'], ['/shop?group=girls', 'nav_girls'], ['/shop?group=boys', 'nav_boys'], ['/shop?group=unisex', 'nav_unisex'], ['/shop?group=accessories', 'nav_accessories'], ['/age', 'nav_age'], ['/collections', 'nav_collections'], ['/shop?sale=1', 'nav_sale']] as const;
  const setLang = (l: string) => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; router.refresh(); };
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      {demo && <div className="bg-butter px-4 py-1.5 text-center text-[11px] font-medium text-ink">{t('demo_banner')}</div>}
      <div className="bg-ink px-4 py-1.5 text-center text-xs text-cream">{freeShip}</div>
      <div className="container-x flex h-16 items-center gap-3">
        <button className="rounded-full p-2 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)} aria-expanded={open}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <Link href="/" aria-label="Rayana"><Logo tag={t('brand_tag')} size={34} /></Link>
        <nav className="ml-6 hidden items-center gap-5 lg:flex" aria-label="Main">
          {links.map(([h, k]) => <Link key={h} href={h} className="text-sm font-medium text-ink/80 transition hover:text-clay">{t(k)}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q)}`); setOpen(false); }} className="hidden md:block" role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_ph')} aria-label={t('search')} className="w-44 rounded-full border border-beige bg-white px-4 py-2 text-sm outline-none focus:border-clay" />
          </form>
          <div className="flex rounded-full border border-beige bg-white text-xs font-semibold" role="group" aria-label={t('lang')}>
            {(['mn', 'en'] as const).map((l) => <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-full px-2.5 py-1.5 ${lang === l ? 'bg-ink text-cream' : 'text-muted'}`}>{l === 'mn' ? 'МН' : 'EN'}</button>)}
          </div>
          <Link href="/account?tab=wishlist" className="relative rounded-full p-2 hover:bg-sand" aria-label={t('wishlist')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.4-9-9.2C1.8 7 4 4 7 4c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3 0 5.2 3 4 6.8C19 15.6 12 20 12 20z" /></svg>
            {wish.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">{wish.length}</span>}
          </Link>
          <Link href={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="rounded-full p-2 hover:bg-sand" aria-label={user ? t('account') : t('login')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>
          </Link>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-sand" aria-label={t('cart')} data-testid="cart-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
            {cartCount > 0 && <span data-testid="cart-count" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
          <div className="container-x grid gap-1 py-3">
            <form onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q)}`); setOpen(false); }} className="mb-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_ph')} className="input" aria-label={t('search')} /></form>
            {links.map(([h, k]) => <Link key={h} href={h} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-sand">{t(k)}</Link>)}
            <Link href="/size-guide" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-sand">{t('nav_size')}</Link>
            <Link href="/track" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-sand">{t('track_order')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
