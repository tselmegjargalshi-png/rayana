'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { imgUrl, loc, money } from '@/lib/format';
import { useApp } from './Providers';
import { useQuote } from './useQuote';

export function Summary({ q, t, lang, showGift }: { q: NonNullable<ReturnType<typeof useQuote>['quote']>; t: (k: string, v?: Record<string, string | number>) => string; lang: 'mn' | 'en'; showGift?: boolean }) {
  return (
    <dl className="space-y-2 text-sm" data-testid="summary">
      <div className="flex justify-between"><dt>{t('subtotal')}</dt><dd>{money(q.subtotal)}</dd></div>
      {q.bundleDiscount > 0 && <div className="flex justify-between text-green-700"><dt>{t('bundle_disc')}</dt><dd>−{money(q.bundleDiscount)}</dd></div>}
      {q.codeDiscount > 0 && <div className="flex justify-between text-green-700"><dt>{t('discount')} ({q.codeApplied})</dt><dd data-testid="code-discount">−{money(q.codeDiscount)}</dd></div>}
      <div className="flex justify-between"><dt>{t('delivery_fee')}</dt><dd>{q.deliveryFee === 0 ? t('free') : money(q.deliveryFee)}</dd></div>
      {(showGift || q.giftWrap > 0) && <div className="flex justify-between"><dt>{t('gift_wrap')}</dt><dd>{q.giftWrap ? money(q.giftWrap) : '0₮'}</dd></div>}
      <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>{t('total')}</dt><dd data-testid="total">{money(q.total)}</dd></div>
      {q.freeDeliveryLeft > 0 && q.deliveryFee > 0 && <p className="text-xs text-clay">{t('free_left', { n: money(q.freeDeliveryLeft) })}</p>}
      {q.freeDeliveryLeft === 0 && <p className="text-xs text-green-700">{t('free_reached')}</p>}
      <span className="hidden">{lang}</span>
    </dl>
  );
}
export function CodeBox({ code, setCode, error, applied, t }: { code: string; setCode: (c: string) => void; error: string | null; applied: string | null; t: (k: string) => string }) {
  const [draft, setDraft] = useState(code);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setCode(draft.trim().toUpperCase()); }} className="mt-4"><label className="label" htmlFor="promo">{t('promo_code')}</label>
      <div className="flex gap-2"><input id="promo" className="input uppercase" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="RAYANA10" data-testid="promo-input" autoComplete="off" /><button className="btn btn-ghost" data-testid="promo-apply">{t('apply_code')}</button></div>
      {applied && <p className="mt-2 text-sm text-green-700" role="status">✓ {t('code_applied')}: {applied}</p>}{error && <p className="mt-2 text-sm text-red-700" role="alert">{t(error)}</p>}</form>
  );
}
export function usePersisted(key: string, init: string) {
  const [v, setV] = useState(init); useEffect(() => { try { const s = localStorage.getItem(key); if (s !== null) setV(s); } catch { /* ignore */ } }, [key]);
  const set = (n: string) => { setV(n); try { localStorage.setItem(key, n); } catch { /* ignore */ } }; return [v, set] as const;
}
export function CartView() {
  const { t, lang, cart, cartReady, setQty, removeLine, updateLine } = useApp();
  const [code, setCode] = usePersisted('ry_code', ''); const [gift, setGift] = usePersisted('ry_gift', '0');
  const { quote: q, loading } = useQuote({ code, giftWrap: gift === '1' });
  if (!cartReady) return <p className="py-20 text-center text-muted">{t('loading')}</p>;
  if (cart.length === 0) return (<div className="container-x py-24 text-center" data-testid="cart-empty"><h1 className="text-3xl font-semibold">{t('cart_empty')}</h1><p className="mt-2 text-muted">{t('cart_empty_sub')}</p><Link href="/shop" className="btn btn-primary mt-8">{t('continue_shopping')}</Link></div>);
  return (
    <div className="container-x py-10"><h1 className="text-4xl font-semibold">{t('cart_title')}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4" aria-busy={loading}>
          {(q?.lines ?? cart.map((l) => ({ ...l, name: { mn: '', en: '' }, unitPrice: 0, ok: true, issue: undefined, stock: 99, colorHex: 'EBDDBF', garment: 'tee', colorName: { mn: '', en: '' }, images: [], sizes: [l.size], colors: [l.color], slug: '', listPrice: 0, sku: '' }))).map((l, i) => (
            <li key={`${l.productId}${l.color}${l.size}`} className={`card flex gap-4 p-4 ${l.ok ? '' : 'ring-2 ring-red-300'}`} data-testid="cart-line">
              <Link href={`/product/${l.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={l.images.length ? imgUrl({ images: l.images }, l.colorHex, 0) : `/api/art?g=${l.garment}&c=${l.colorHex}&v=0`} alt="" className="h-full w-full object-cover" /></Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${l.slug}`} className="line-clamp-2 font-medium hover:text-clay">{loc(l.name, lang)}</Link>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <label className="sr-only" htmlFor={`sz${i}`}>{t('size')}</label><select id={`sz${i}`} className="rounded-full border border-beige bg-white px-3 py-1.5" value={l.size} onChange={(e) => updateLine(i, { size: e.target.value })}>{l.sizes.map((s) => <option key={s}>{s}</option>)}</select>
                  <label className="sr-only" htmlFor={`cl${i}`}>{t('color')}</label><select id={`cl${i}`} className="rounded-full border border-beige bg-white px-3 py-1.5" value={l.color} onChange={(e) => updateLine(i, { color: e.target.value })}>{l.colors.map((c) => <option key={c} value={c}>{loc(q?.lines.find((x) => x.color === c && x.productId === l.productId)?.colorName ?? { mn: c, en: c }, lang)}</option>)}</select>
                </div>
                {!l.ok && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{l.issue === 'out_of_stock' ? t('out_of_stock') : l.issue === 'low_stock' ? t('only_left', { n: l.stock }) : t('unavailable_combo')}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-beige"><button className="h-9 w-9" aria-label="minus" onClick={() => setQty(i, l.qty - 1)}>−</button><span className="w-7 text-center text-sm font-semibold" data-testid="line-qty">{l.qty}</span><button className="h-9 w-9" aria-label="plus" onClick={() => setQty(i, l.qty + 1)}>+</button></div>
                  <p className="font-semibold">{money(l.unitPrice * l.qty)}</p>
                </div>
                <button className="mt-2 text-xs text-muted underline" onClick={() => removeLine(i)} data-testid="remove-line">{t('remove')}</button>
              </div>
            </li>))}
        </ul>
        <aside className="card h-fit p-6 lg:sticky lg:top-36">
          <h2 className="font-display text-xl font-semibold">{t('order_summary')}</h2>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-sand/70 p-3 text-sm"><input type="checkbox" checked={gift === '1'} onChange={(e) => setGift(e.target.checked ? '1' : '0')} className="h-4 w-4 accent-clay" data-testid="gift-toggle" /><span>{t('gift_wrap')} {q ? `(+${money(q.giftWrap || 5000)})` : ''}</span></label>
          <CodeBox code={code} setCode={setCode} error={q?.codeError ?? null} applied={q?.codeApplied ?? null} t={t} />
          <div className="mt-5">{q ? <Summary q={q} t={t} lang={lang} /> : <p className="text-sm text-muted">{t('loading')}</p>}</div>
          {q && !q.valid && <p role="alert" className="mt-3 text-sm text-red-700">{t('stock_issue')}</p>}
          <Link href="/checkout" aria-disabled={!q?.valid} className={`btn btn-primary mt-5 w-full !py-4 ${q?.valid ? '' : 'pointer-events-none opacity-50'}`} data-testid="go-checkout">{t('checkout')}</Link>
          <Link href="/shop" className="mt-3 block text-center text-sm text-muted underline">{t('continue_shopping')}</Link>
        </aside>
      </div></div>
  );
}
