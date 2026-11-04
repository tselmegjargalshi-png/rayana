'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from './Providers';
export interface Slide { id: string; title: string; subtitle: string; cta: string; href: string; img: string }
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const { t } = useApp(); const [i, setI] = useState(0);
  useEffect(() => { if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6500); return () => clearInterval(id); }, [slides.length]);
  return (
    <section className="relative overflow-hidden bg-sand" aria-roledescription="carousel" aria-label="Hero">
      <div className="relative h-[68vh] min-h-[460px] max-h-[760px]">
        {slides.map((s, k) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={k !== i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt="" className="h-full w-full object-cover" loading={k === 0 ? 'eager' : 'lazy'} />
            <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/40 to-transparent" />
            <div className="container-x absolute inset-0 flex items-center"><div className="max-w-xl"><h1 className="text-4xl font-semibold leading-tight sm:text-6xl">{s.title}</h1><p className="mt-4 text-lg text-ink/75">{s.subtitle}</p><Link href={s.href} className="btn btn-primary mt-8 !px-8 !py-4">{s.cta || t('shop_now')}</Link></div></div>
          </div>
        ))}
      </div>
      {slides.length > 1 && <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{slides.map((s, k) => <button key={s.id} onClick={() => setI(k)} aria-label={`${k + 1}`} aria-current={k === i} className={`h-2.5 rounded-full transition-all ${k === i ? 'w-8 bg-ink' : 'w-2.5 bg-ink/30'}`} />)}</div>}
    </section>
  );
}
