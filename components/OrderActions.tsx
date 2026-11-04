'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from './Providers';
import { money } from '@/lib/format';

export function PaymentPanel({ id, token, method, status, total, number, bank }: { id: string; token: string; method: string; status: string; total: number; number: string; bank: { name: string; account: string; holder: string } }) {
  const { t } = useApp(); const router = useRouter(); const [busy, setBusy] = useState(false);
  async function report() { setBusy(true); await fetch(`/api/orders/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'report_payment', token }) }); setBusy(false); router.refresh(); }
  if (status === 'confirmed') return <p className="rounded-2xl bg-sage/50 p-4 text-sm font-semibold" data-testid="pay-status">✓ {t('pay_confirmed')}</p>;
  if (status === 'cod_due') return <p className="rounded-2xl bg-sand p-4 text-sm font-semibold" data-testid="pay-status">{t('pay_cod_due')}: {money(total)}</p>;
  if (status === 'cod_collected') return <p className="rounded-2xl bg-sage/50 p-4 text-sm font-semibold" data-testid="pay-status">✓ {t('pay_collected')}</p>;
  if (status === 'refunded') return <p className="rounded-2xl bg-sand p-4 text-sm font-semibold" data-testid="pay-status">{t('pay_refunded')}</p>;
  return (
    <div className="rounded-2xl border border-butter bg-butter/30 p-5" data-testid="pay-panel"><p className="text-sm font-bold">{t('demo_pay_notice')}</p>
      {(method === 'qpay' || method === 'socialpay') && <div className="mt-4 flex items-center gap-4"><svg width="96" height="96" viewBox="0 0 8 8" className="rounded-xl bg-white p-2" aria-label={t('qr_demo')}>{Array.from({ length: 49 }, (_, i) => ((i * 7 + number.length * 3 + i * i) % 3 === 0 ? <rect key={i} x={i % 7} y={Math.floor(i / 7)} width=".9" height=".9" fill="#2B2622" /> : null))}</svg><div className="text-sm"><p className="font-semibold">{method === 'qpay' ? 'QPay' : 'SocialPay'} · {money(total)}</p><p className="text-xs text-muted">{t('qr_demo')}</p></div></div>}
      {method === 'bank' && <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"><dt className="text-muted">{t('bank_name')}</dt><dd>{bank.name}</dd><dt className="text-muted">{t('bank_account')}</dt><dd>{bank.account}</dd><dt className="text-muted">{t('bank_holder')}</dt><dd>{bank.holder}</dd><dt className="text-muted">{t('bank_ref')}</dt><dd className="font-semibold">{number}</dd></dl>}
      {status === 'customer_reported' ? <p className="mt-4 text-sm font-semibold" data-testid="pay-waiting">{t('pay_waiting')}</p> : <button className="btn btn-clay mt-4" onClick={report} disabled={busy} data-testid="report-payment">{t('pay_sim_btn')}</button>}
    </div>
  );
}
export function ReturnForm({ id, token }: { id: string; token: string }) {
  const { t } = useApp(); const router = useRouter(); const [reason, setReason] = useState(''); const [msg, setMsg] = useState('');
  async function go(e: React.FormEvent) { e.preventDefault(); const r = await fetch(`/api/orders/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'request_return', token, reason }) }); if (r.ok) { setMsg(t('return_sent')); router.refresh(); } else setMsg(t('err_generic')); }
  return (<form onSubmit={go} className="card mt-6 space-y-3 p-5"><h3 className="font-display text-lg font-semibold">{t('return_request')}</h3><label className="label" htmlFor="rr">{t('return_reason')}</label><textarea id="rr" className="input" required minLength={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} /><button className="btn btn-ghost">{t('submit')}</button>{msg && <p role="status" className="text-sm">{msg}</p>}</form>);
}
