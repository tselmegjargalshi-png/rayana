'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useApp } from './Providers';
export function AuthForm({ mode, demo, demoLogins }: { mode: 'login' | 'register'; demo: boolean; demoLogins: { admin: { email: string; password: string }; customer: { email: string; password: string } } }) {
  const { t } = useApp(); const router = useRouter(); const sp = useSearchParams(); const [f, setF] = useState({ name: '', email: '', password: '', phone: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) }); const d = await r.json(); setBusy(false);
    if (!r.ok) { setErr(d.error === 'email_taken' ? t('email_taken') : d.error === 'too_many' ? t('too_many') : mode === 'login' ? t('bad_login') : t('pw_hint')); return; }
    const next = sp.get('next'); window.location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : d.role === 'admin' ? '/admin' : '/account'; void router;
  }
  return (
    <div className="container-x max-w-md py-14"><h1 className="text-center text-4xl font-semibold">{mode === 'login' ? t('login_title') : t('register_title')}</h1>
      <form onSubmit={go} className="card mt-8 space-y-4 p-6">
        {mode === 'register' && <div><label className="label" htmlFor="a_name">{t('full_name')}</label><input id="a_name" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" data-testid="reg-name" /></div>}
        <div><label className="label" htmlFor="a_email">{t('email')}</label><input id="a_email" type="email" className="input" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" data-testid="auth-email" /></div>
        <div><label className="label" htmlFor="a_pw">{t('password')}</label><input id="a_pw" type="password" className="input" required minLength={mode === 'register' ? 8 : 1} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} data-testid="auth-password" />{mode === 'register' && <p className="mt-1 text-xs text-muted">{t('pw_hint')}</p>}</div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy} data-testid="auth-submit">{mode === 'login' ? t('login') : t('register')}</button>
        <p className="text-center text-sm text-muted">{mode === 'login' ? t('no_account') : t('have_account')} <Link className="font-semibold text-clay underline" href={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? t('register') : t('login')}</Link></p>
      </form>
      {demo && mode === 'login' && <div className="mt-6 rounded-3xl bg-butter/50 p-5 text-sm"><p className="font-semibold">{t('demo_logins')}</p>{(['admin', 'customer'] as const).map((k) => <div key={k} className="mt-2 flex items-center justify-between gap-2"><span><b>{t('demo_' + k)}:</b> {demoLogins[k].email} / {demoLogins[k].password}</span><button type="button" className="chip" onClick={() => setF({ ...f, email: demoLogins[k].email, password: demoLogins[k].password })} data-testid={`fill-${k}`}>{t('use_this')}</button></div>)}</div>}
    </div>
  );
}
