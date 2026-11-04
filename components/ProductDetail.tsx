'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { discountPct, imgUrl, loc, money } from '@/lib/format';
import { SizeRecommender, type ChildLite } from './SizeRecommender';
import { SizeTable } from './SizeTable';
import { useApp } from './Providers';
import { WishButton } from './WishButton';
import { sizeLabel } from '@/lib/sizing';
import type { ColorDef, Product } from '@/lib/types';

export function ProductDetail({ p, colors, childrenLite, deliveryNote }: { p: Product; colors: ColorDef[]; childrenLite: ChildLite[]; deliveryNote: string }) {
  const { t, lang, addToCart, toast } = useApp();
  const firstStocked = p.colors.find((c) => p.variants.some((v) => v.color === c && v.stock > 0)) ?? p.colors[0];
  const [color, setColor] = useState(firstStocked); const [size, setSize] = useState<string | null>(null); const [qty, setQty] = useState(1); const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false); const [guide, setGuide] = useState(false); const [err, setErr] = useState('');
  const [pos, setPos] = useState({ x: 50, y: 50 }); const [hover, setHover] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const hex = colors.find((c) => c.id === color)?.hex ?? 'EBDDBF'; const pct = discountPct(p);
  const stockFor = (s: string) => p.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const sel = size ? p.variants.find((v) => v.color === color && v.size === size) : null; const avail = sel?.stock ?? 0;
  const imgs = useMemo(() => p.images.map((_, i) => imgUrl(p, hex, i)), [p, hex]);
  const items = [...imgs.map((u) => ({ type: 'img' as const, u })), ...(p.video ? [{ type: 'video' as const, u: p.video }] : [])];
  const cur = items[Math.min(idx, items.length - 1)];
  useEffect(() => { if (size && stockFor(size) === 0) setSize(null); setQty(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [color]);
  useEffect(() => { try { const k = 'ry_recent_v1'; const a: string[] = JSON.parse(localStorage.getItem(k) || '[]'); localStorage.setItem(k, JSON.stringify([p.id, ...a.filter((x) => x !== p.id)].slice(0, 12))); } catch { /* ignore */ } }, [p.id]);
  useEffect(() => { if (!zoom && !guide) return; const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setZoom(false); setGuide(false); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [zoom, guide]);
  function add() {
    if (!size) { setErr(t('select_size')); return; } if (avail < 1) { setErr(t('unavailable_combo')); return; }
    setErr(''); addToCart({ productId: p.id, color, size, qty: Math.min(qty, avail) }); toast(t('added'));
  }
  const colorName = loc(colors.find((c) => c.id === color)?.name, lang);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div>
        <div ref={ref} className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-4xl bg-sand ring-1 ring-line"
          onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => cur.type === 'img' && setZoom(true)}>
          {cur.type === 'img' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.u} alt={`${loc(p.name, lang)} ${colorName}`} data-testid="main-image" className="h-full w-full object-cover transition-transform duration-200" style={hover ? { transform: 'scale(1.8)', transformOrigin: `${pos.x}% ${pos.y}%` } : undefined} />
          ) : (<video src={cur.u} controls playsInline muted loop autoPlay className="h-full w-full object-cover" aria-label={t('video')} />)}
          {pct > 0 && <span className="absolute left-4 top-4 rounded-full bg-clay px-3 py-1 text-xs font-bold text-white">{t('sale_badge')} {pct}%</span>}
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-[11px] text-muted">{cur.type === 'video' ? t('demo_video_note') : t('zoom_hint')}</span>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto" role="tablist">
          {items.map((it, i) => <button key={i} role="tab" aria-selected={i === idx} aria-label={`${i + 1}`} onClick={() => setIdx(i)} className={`h-24 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ${i === idx ? 'ring-ink' : 'ring-transparent'} bg-sand`}>
            {it.type === 'img' ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.u} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs font-semibold">▶ {t('video')}</span>}</button>)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-clay">{p.sku}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{loc(p.name, lang)}</h1>
        <p className="mt-3 text-2xl"><span className="font-semibold" data-testid="price">{money(p.salePrice ?? p.price)}</span>{p.salePrice && <span className="ml-3 text-base text-muted line-through">{money(p.price)}</span>}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">{loc(p.description, lang)}</p>
        <div className="mt-6"><p className="label">{t('color')}: <span className="normal-case text-ink">{colorName}</span></p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t('color')}>{p.colors.map((c) => { const d = colors.find((x) => x.id === c)!; const any = p.variants.some((v) => v.color === c && v.stock > 0); return <button key={c} role="radio" aria-checked={color === c} aria-label={loc(d.name, lang)} title={loc(d.name, lang)} onClick={() => setColor(c)} data-testid={`color-${c}`} className={`h-10 w-10 rounded-full ring-1 ring-black/15 ring-offset-2 ring-offset-cream transition ${color === c ? '!ring-2 !ring-ink' : ''} ${any ? '' : 'opacity-40'}`} style={{ background: `#${d.hex}` }} />; })}</div></div>
        <div className="mt-6"><div className="flex items-center justify-between"><p className="label !mb-0">{t('size')}</p><button className="text-xs font-semibold text-clay underline underline-offset-4" onClick={() => setGuide(true)} data-testid="open-size-guide">{t('open_size_guide')}</button></div>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t('size')}>{p.sizes.map((s) => { const st = stockFor(s); return <button key={s} role="radio" aria-checked={size === s} disabled={st === 0} onClick={() => { setSize(s); setErr(''); setQty(1); }} data-testid={`size-${s}`} title={sizeLabel(s, lang)} className={`min-w-14 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${size === s ? 'border-ink bg-ink text-cream' : 'border-beige bg-white hover:bg-sand'} ${st === 0 ? 'cursor-not-allowed text-muted/50 line-through opacity-50' : ''}`}>{s}</button>; })}</div></div>
        <p className="mt-4 text-sm" data-testid="stock-line" aria-live="polite">{!size ? <span className="text-muted">{t('select_size')}</span> : avail === 0 ? <span className="text-red-700">{t('out_of_stock')}</span> : avail <= 5 ? <span className="text-clay">{t('only_left', { n: avail })}</span> : <span className="text-green-700">● {t('in_stock')}</span>}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-beige bg-white" role="group" aria-label={t('qty')}><button className="h-12 w-12 text-lg" aria-label="minus" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-8 text-center font-semibold" data-testid="qty">{qty}</span><button className="h-12 w-12 text-lg" aria-label="plus" onClick={() => setQty(Math.min(Math.max(1, avail || 20), qty + 1))}>+</button></div>
          <button className="btn btn-primary flex-1 !py-4" onClick={add} data-testid="add-to-cart">{t('add_to_cart')}</button><WishButton id={p.id} large />
        </div>
        {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}
        <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white text-sm">
          {[[t('fabric'), loc(p.fabric, lang)], [t('material'), loc(p.material, lang)], [t('care'), loc(p.care, lang)], [t('delivery'), deliveryNote]].map(([k, v]) => <details key={k} className="group px-5 py-4" open={k === t('fabric')}><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">{k}<span className="text-muted group-open:rotate-45">+</span></summary><p className="mt-2 text-ink/75">{v}</p></details>)}
        </div>
        <p className="mt-4 text-xs text-muted">{t('sample_data')}: <Link href="/delivery" className="underline">{t('delivery_info')}</Link></p>
      </div>
      {zoom && cur.type === 'img' && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" onClick={() => setZoom(false)}><button className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold" onClick={() => setZoom(false)}>{t('close')}</button>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cur.u} alt="" className="max-h-full max-w-full rounded-3xl object-contain" /></div>}
      {guide && <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={t('size_guide')}><div className="my-6 w-full max-w-3xl rounded-4xl bg-cream p-5 sm:p-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-semibold">{t('size_guide')}</h2><button className="btn btn-ghost !py-2" onClick={() => setGuide(false)} data-testid="close-size-guide">{t('close')}</button></div><SizeTable lang={lang} highlight={p.sizes} /><div className="mt-5"><SizeRecommender childrenLite={childrenLite} available={p.sizes} onPick={(s) => { setSize(s); setGuide(false); }} /></div></div></div>}
    </div>
  );
}
