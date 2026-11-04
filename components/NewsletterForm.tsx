'use client';
import { useState } from 'react';
import { useApp } from './Providers';
export function NewsletterForm({ compact }: { compact?: boolean }) {
  const { t } = useApp(); const [email, setEmail] = useState(''); const [state, setState] = useState<'idle' | 'ok' | 'err' | 'busy'>('idle');
  async function submit(e: React.FormEvent) { e.preventDefault(); setState('busy'); const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) }); setState(r.ok ? 'ok' : 'err'); if (r.ok) setEmail(''); }
  return (
    <form onSubmit={submit} className={compact ? '' : 'mx-auto flex max-w-md flex-col gap-3 sm:flex-row'} aria-label={t('newsletter')}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} aria-label={t('email')} className="input" />
      <button className={`btn btn-clay ${compact ? 'mt-2 w-full' : ''}`} disabled={state === 'busy'}>{t('subscribe')}</button>
      {state === 'ok' && <p role="status" className="text-sm text-green-700">{t('subscribed')}</p>}
      {state === 'err' && <p role="alert" className="text-sm text-red-700">{t('err_email')}</p>}
    </form>
  );
}
