'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { imgUrl, loc, money } from '@/lib/format';
import { useApp } from './Providers';
import { CodeBox, Summary, usePersisted } from './CartView';
import { useQuote } from './useQuote';
import type { Address, DeliveryZone } from '@/lib/types';

export interface CheckoutProps { user: { name: string; email: string; phone: string; addresses: Address[] } | null; districts: string[]; zones: DeliveryZone[]; pickupEnabled: boolean; pickupAddress: string; demo: boolean }
export function CheckoutView({ user, districts, zones, pickupEnabled, pickupAddress, demo }: CheckoutProps) {
  const { t, lang, cart, cartReady, clearCart } = useApp(); const router = useRouter();
  const [code, setCode] = usePersisted('ry_code', ''); const [gift, setGift] = usePersisted('ry_gift', '0');
  const [f, setF] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', district: '', address: '', notes: '' });
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery'); const [method, setMethod] = useState<'qpay' | 'socialpay' | 'bank' | 'cod'>('qpay');
  const [errs, setErrs] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [serverErr, setServerErr] = useState('');
  const { quote: q } = useQuote({ code, district: f.district, pickup: delivery === 'pickup', giftWrap: gift === '1', email: f.email, phone: f.phone });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  useEffect(() => { if (user?.addresses[0] && !f.district) { const a = user.addresses[0]; setF((s) => ({ ...s, district: a.district, address: a.address, phone: s.phone || a.phone })); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  function trackAbandoned() { if (/^\S+@\S+\.\S+$/.test(f.email) && cart.length) void fetch('/api/cart/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: f.email, items: cart }) }); }
  function validate() {
    const e: Record<string, string> = {}; const ph = f.phone.replace(/\D/g, '').replace(/^976/, '');
    if (f.name.trim().length < 2) e.name = 'err_name'; if (!/^[6-9]\d{7}$/.test(ph)) e.phone = 'err_phone'; if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'err_email';
    if (delivery === 'delivery') { if (!f.district) e.district = 'err_district'; if (f.address.trim().length < 5) e.address = 'err_address'; }
    setErrs(e); return Object.keys(e).length === 0;
  }
  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); setServerErr(''); if (!validate()) return; setBusy(true);
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items: cart, name: f.name, phone: f.phone, email: f.email, delivery, district: f.district, address: f.address, notes: f.notes, method, code: q?.codeApplied ?? (code || null), giftWrap: gift === '1' }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) { setServerErr(d.error === 'stock_changed' ? t('err_stock_changed') : d.error?.startsWith('code_') ? t(d.error) : t('err_generic')); return; }
    clearCart(); try { localStorage.removeItem('ry_code'); localStorage.removeItem('ry_gift'); } catch { /* ignore */ }
    router.push(`/order/${d.id}?t=${d.token}&new=1`);
  }
  if (!cartReady) return <p className="py-20 text-center text-muted">{t('loading')}</p>;
  if (cart.length === 0) return <div className="container-x py-24 text-center"><h1 className="text-3xl font-semibold">{t('cart_empty')}</h1><Link href="/shop" className="btn btn-primary mt-8">{t('continue_shopping')}</Link></div>;
  const err = (k: string) => errs[k] && <p role="alert" className="mt-1 text-xs text-red-700">{t(errs[k])}</p>;
  const methods: { id: typeof method; k: string }[] = [{ id: 'qpay', k: 'pay_qpay' }, { id: 'socialpay', k: 'pay_socialpay' }, { id: 'bank', k: 'pay_bank' }, { id: 'cod', k: 'pay_cod' }];
  const zone = zones.find((z) => z.districts.includes(f.district));
  return (
    <form onSubmit={submit} noValidate className="container-x py-10"><h1 className="text-4xl font-semibold">{t('checkout_title')}</h1>
      {demo && <p className="mt-3 rounded-2xl bg-butter/60 p-3 text-sm">{t('demo_pay_notice')}</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-6"><h2 className="font-display text-xl font-semibold">{t('delivery_method')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">{(['delivery', ...(pickupEnabled ? ['pickup'] : [])] as ('delivery' | 'pickup')[]).map((d) => <label key={d} className={`cursor-pointer rounded-2xl border p-4 text-sm ${delivery === d ? 'border-ink bg-sand' : 'border-beige'}`}><input type="radio" name="dm" className="mr-2 accent-clay" checked={delivery === d} onChange={() => setDelivery(d)} data-testid={`dm-${d}`} />{d === 'delivery' ? t('home_delivery') : t('pickup')}{d === 'pickup' && <span className="mt-1 block text-xs text-muted">{pickupAddress}</span>}</label>)}</div>
          </section>
          <section className="card p-6"><h2 className="font-display text-xl font-semibold">{t('footer_contact')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="c_name">{t('parent_name')}</label><input id="c_name" className="input" value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" data-testid="c-name" />{err('name')}</div>
              <div><label className="label" htmlFor="c_phone">{t('phone')}</label><input id="c_phone" className="input" inputMode="tel" placeholder="9911 2233" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" data-testid="c-phone" /><p className="mt-1 text-xs text-muted">{t('phone_hint')}</p>{err('phone')}</div>
              <div className="sm:col-span-2"><label className="label" htmlFor="c_email">{t('email')}</label><input id="c_email" type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} onBlur={trackAbandoned} autoComplete="email" data-testid="c-email" />{err('email')}</div>
            </div></section>
          {delivery === 'delivery' && <section className="card p-6"><h2 className="font-display text-xl font-semibold">{t('address')}</h2>
            {user && user.addresses.length > 0 && <div className="mt-3 flex flex-wrap gap-2"><span className="text-xs text-muted">{t('use_saved')}:</span>{user.addresses.map((a) => <button type="button" key={a.id} className="chip" onClick={() => setF((s) => ({ ...s, district: a.district, address: a.address, notes: a.notes, phone: a.phone || s.phone }))}>{a.label}</button>)}</div>}
            <div className="mt-4 grid gap-4"><div><label className="label" htmlFor="c_dist">{t('district')}</label><select id="c_dist" className="input" value={f.district} onChange={(e) => set('district', e.target.value)} data-testid="c-district"><option value="">{t('district')}</option>{districts.map((d) => <option key={d}>{d}</option>)}</select>{zone && <p className="mt-1 text-xs text-muted">{money(zone.fee)} · {loc(zone.eta, lang)}</p>}{err('district')}</div>
              <div><label className="label" htmlFor="c_addr">{t('address')}</label><textarea id="c_addr" className="input min-h-20" placeholder={t('address_hint')} value={f.address} onChange={(e) => set('address', e.target.value)} data-testid="c-address" />{err('address')}</div>
              <div><label className="label" htmlFor="c_notes">{t('notes')}</label><textarea id="c_notes" className="input" maxLength={300} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></div></div></section>}
          <section className="card p-6"><h2 className="font-display text-xl font-semibold">{t('pay_method')}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{methods.map((m) => <label key={m.id} className={`cursor-pointer rounded-2xl border p-4 text-sm font-medium ${method === m.id ? 'border-ink bg-sand' : 'border-beige'}`}><input type="radio" name="pm" className="mr-2 accent-clay" checked={method === m.id} onChange={() => setMethod(m.id)} data-testid={`pm-${m.id}`} />{t(m.k)}{m.id !== 'cod' && <span className="ml-2 rounded-full bg-butter px-2 py-0.5 text-[10px] font-bold">{t('demo')}</span>}</label>)}</div>
            <p className="mt-3 text-xs text-muted">{t('demo_pay_notice')}</p></section>
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-36"><h2 className="font-display text-xl font-semibold">{t('order_summary')}</h2>
          <ul className="mt-4 max-h-60 space-y-3 overflow-auto pr-1">{q?.lines.map((l) => <li key={l.productId + l.color + l.size} className="flex gap-3 text-sm"><div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imgUrl({ images: l.images }, l.colorHex, 0)} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="line-clamp-1">{loc(l.name, lang)}</p><p className="text-xs text-muted">{loc(l.colorName, lang)} · {l.size} · ×{l.qty}</p></div><p>{money(l.unitPrice * l.qty)}</p></li>)}</ul>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-sand/70 p-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-clay" checked={gift === '1'} onChange={(e) => setGift(e.target.checked ? '1' : '0')} />{t('gift_wrap')}</label>
          <CodeBox code={code} setCode={setCode} error={q?.codeError ?? null} applied={q?.codeApplied ?? null} t={t} />
          <div className="mt-5">{q && <Summary q={q} t={t} lang={lang} showGift />}</div>
          {serverErr && <p role="alert" className="mt-3 text-sm text-red-700" data-testid="server-error">{serverErr}</p>}
          <button className="btn btn-primary mt-5 w-full !py-4" disabled={busy || !q?.valid} data-testid="place-order">{busy ? t('placing') : t('place_order')}</button>
        </aside>
      </div></form>
  );
}
