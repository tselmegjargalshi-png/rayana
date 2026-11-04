'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from './Providers';
export function TrackForm() {
  const { t } = useApp(); const router = useRouter(); const [n, setN] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  async function go(e: React.FormEvent) { e.preventDefault(); setErr(''); const r = await fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ number: n, phone: p }) }); const d = await r.json(); if (r.ok) router.push(`/order/${d.id}?t=${d.token}`); else setErr(r.status === 429 ? t('too_many') : t('not_found')); }
  return (<form onSubmit={go} className="card mx-auto mt-8 max-w-md space-y-4 p-6"><div><label className="label" htmlFor="tn">{t('order_no')}</label><input id="tn" className="input" placeholder="RY1041" value={n} onChange={(e) => setN(e.target.value)} required data-testid="track-number" /></div><div><label className="label" htmlFor="tp">{t('phone')}</label><input id="tp" className="input" inputMode="tel" value={p} onChange={(e) => setP(e.target.value)} required data-testid="track-phone" /></div><button className="btn btn-primary w-full" data-testid="track-go">{t('track_btn')}</button>{err && <p role="alert" className="text-sm text-red-700">{err}</p>}</form>);
}
