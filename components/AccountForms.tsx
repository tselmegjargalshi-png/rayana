'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from './Providers';
import { recommendSize } from '@/lib/sizing';
import type { Address, Child } from '@/lib/types';

async function send(url: string, method: string, data?: unknown) { const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: data ? JSON.stringify(data) : undefined }); return r.ok; }
export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const { t } = useApp(); const router = useRouter(); const [f, setF] = useState({ name, phone }); const [msg, setMsg] = useState('');
  return (<form className="card max-w-lg space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); setMsg((await send('/api/me/profile', 'PUT', f)) ? t('saved') : t('err_phone')); router.refresh(); }}>
    <div><label className="label">{t('email')}</label><p className="text-sm">{email}</p></div>
    <div><label className="label" htmlFor="p_n">{t('full_name')}</label><input id="p_n" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
    <div><label className="label" htmlFor="p_p">{t('phone')}</label><input id="p_p" className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
    <button className="btn btn-primary">{t('save')}</button>{msg && <p role="status" className="text-sm text-muted">{msg}</p>}</form>);
}
export function AddressManager({ addresses, districts }: { addresses: Address[]; districts: string[] }) {
  const { t } = useApp(); const router = useRouter(); const empty = { label: '', recipient: '', phone: '', district: '', address: '', notes: '' }; const [f, setF] = useState<Partial<Address>>(empty); const [msg, setMsg] = useState('');
  return (<div className="grid gap-6 md:grid-cols-2"><div className="space-y-3">{addresses.map((a) => <div key={a.id} className="card p-4 text-sm"><p className="font-semibold">{a.label}</p><p>{a.recipient} · {a.phone}</p><p className="text-muted">{a.district}, {a.address}</p><div className="mt-2 flex gap-3 text-xs"><button className="underline" onClick={() => setF(a)}>{t('edit')}</button><button className="underline text-red-700" onClick={async () => { await send(`/api/me/addresses?id=${a.id}`, 'DELETE'); router.refresh(); }}>{t('delete')}</button></div></div>)}{!addresses.length && <p className="text-muted">{t('acc_addresses')}: 0</p>}</div>
    <form className="card space-y-3 p-5" onSubmit={async (e) => { e.preventDefault(); const ok = await send('/api/me/addresses', 'POST', f); setMsg(ok ? t('saved') : t('err_generic')); if (ok) { setF(empty); router.refresh(); } }}>
      {(['label', 'recipient', 'phone'] as const).map((k) => <div key={k}><label className="label" htmlFor={`ad_${k}`}>{t(k === 'phone' ? 'phone' : k)}</label><input id={`ad_${k}`} className="input" required value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
      <div><label className="label" htmlFor="ad_d">{t('district')}</label><select id="ad_d" className="input" required value={f.district ?? ''} onChange={(e) => setF({ ...f, district: e.target.value })}><option value="">{t('district')}</option>{districts.map((d) => <option key={d}>{d}</option>)}</select></div>
      <div><label className="label" htmlFor="ad_a">{t('address')}</label><textarea id="ad_a" className="input" required minLength={5} value={f.address ?? ''} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      <button className="btn btn-primary">{f.id ? t('save') : t('add')}</button>{msg && <p role="status" className="text-sm">{msg}</p>}</form></div>);
}
export function ChildManager({ kids }: { kids: Child[] }) {
  const { t, lang } = useApp(); const router = useRouter(); const empty = { name: '', birthYear: 2022, birthMonth: 1, heightCm: null, weightKg: null } as Partial<Child>; const [f, setF] = useState<Partial<Child>>(empty); const now = new Date();
  const age = (c: Child) => Math.max(0, (now.getFullYear() - c.birthYear) * 12 + now.getMonth() + 1 - c.birthMonth);
  return (<div><p className="mb-5 rounded-2xl bg-sage/40 p-4 text-sm">{t('child_privacy')}</p><div className="grid gap-6 md:grid-cols-2"><div className="space-y-3">{kids.map((c) => { const r = recommendSize(age(c), c.heightCm, c.weightKg); return <div key={c.id} className="card p-4 text-sm"><p className="font-semibold">{c.name}</p><p className="text-muted">{c.birthYear}.{String(c.birthMonth).padStart(2, '0')} · {c.heightCm ?? '?'} {lang === 'mn' ? 'см' : 'cm'}</p>{r && <p className="mt-1">{t('child_size')}: <b>{r.size}</b></p>}<div className="mt-2 flex gap-3 text-xs"><button className="underline" onClick={() => setF(c)}>{t('edit')}</button><button className="underline text-red-700" onClick={async () => { await send(`/api/me/children?id=${c.id}`, 'DELETE'); router.refresh(); }}>{t('delete')}</button></div></div>; })}</div>
    <form className="card space-y-3 p-5" onSubmit={async (e) => { e.preventDefault(); if (await send('/api/me/children', 'POST', f)) { setF(empty); router.refresh(); } }}>
      <div><label className="label" htmlFor="ch_n">{t('child_name')}</label><input id="ch_n" className="input" required value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="ch_y">{t('birth_year')}</label><input id="ch_y" type="number" min={2005} max={2026} className="input" required value={f.birthYear ?? ''} onChange={(e) => setF({ ...f, birthYear: Number(e.target.value) })} /></div><div><label className="label" htmlFor="ch_m">{t('birth_month')}</label><input id="ch_m" type="number" min={1} max={12} className="input" required value={f.birthMonth ?? ''} onChange={(e) => setF({ ...f, birthMonth: Number(e.target.value) })} /></div>
      <div><label className="label" htmlFor="ch_h">{t('height_cm')}</label><input id="ch_h" type="number" className="input" value={f.heightCm ?? ''} onChange={(e) => setF({ ...f, heightCm: e.target.value ? Number(e.target.value) : null })} /></div><div><label className="label" htmlFor="ch_w">{t('weight_kg')}</label><input id="ch_w" type="number" step="0.1" className="input" value={f.weightKg ?? ''} onChange={(e) => setF({ ...f, weightKg: e.target.value ? Number(e.target.value) : null })} /></div></div>
      <button className="btn btn-primary">{f.id ? t('save') : t('add')}</button></form></div></div>);
}
export function MarkRead() { const { t } = useApp(); const router = useRouter(); return <button className="btn btn-ghost !py-2" onClick={async () => { await send('/api/me/notifications', 'POST'); router.refresh(); }}>{t('mark_read')}</button>; }
export function LogoutButton() { const { t } = useApp(); return <button className="btn btn-ghost" onClick={async () => { await send('/api/auth/logout', 'POST'); window.location.href = '/'; }} data-testid="logout">{t('logout')}</button>; }
