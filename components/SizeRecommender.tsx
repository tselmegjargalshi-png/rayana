'use client';
import { useState } from 'react';
import { recommendSize, sizeLabel } from '@/lib/sizing';
import { useApp } from './Providers';

export interface ChildLite { id: string; name: string; ageMonths: number; heightCm: number | null; weightKg: number | null }
export function SizeRecommender({ childrenLite = [], onPick, available }: { childrenLite?: ChildLite[]; onPick?: (size: string) => void; available?: string[] }) {
  const { t, lang } = useApp(); const [years, setYears] = useState(''); const [months, setMonths] = useState(''); const [h, setH] = useState(''); const [w, setW] = useState('');
  const [res, setRes] = useState<ReturnType<typeof recommendSize> | 'need'>(null);
  function go(e: React.FormEvent) {
    e.preventDefault(); const am = (years || months) ? (Number(years || 0) * 12 + Number(months || 0)) : null; const hh = h ? Number(h) : null; const ww = w ? Number(w) : null;
    const r = recommendSize(am, hh, ww); setRes(r ?? 'need');
  }
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <h3 className="font-display text-xl font-semibold">{t('sg_tool')}</h3>
      {childrenLite.length > 0 && <div className="mt-3 flex flex-wrap gap-2"><span className="text-xs text-muted">{t('sg_use_child')}:</span>{childrenLite.map((c) => <button key={c.id} type="button" className="chip" onClick={() => { setYears(String(Math.floor(c.ageMonths / 12))); setMonths(String(c.ageMonths % 12)); setH(c.heightCm ? String(c.heightCm) : ''); setW(c.weightKg ? String(c.weightKg) : ''); }}>{c.name}</button>)}</div>}
      <form onSubmit={go} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div><label className="label" htmlFor="sr_y">{t('sg_child_age')} ({t('sg_years')})</label><input id="sr_y" className="input" inputMode="numeric" min={0} max={16} type="number" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><label className="label" htmlFor="sr_m">{t('sg_months')}</label><input id="sr_m" className="input" inputMode="numeric" min={0} max={11} type="number" value={months} onChange={(e) => setMonths(e.target.value)} /></div>
        <div><label className="label" htmlFor="sr_h">{t('sg_child_height')}</label><input id="sr_h" className="input" inputMode="decimal" min={40} max={190} type="number" value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div><label className="label" htmlFor="sr_w">{t('sg_child_weight')}</label><input id="sr_w" className="input" inputMode="decimal" min={2} max={90} type="number" step="0.1" value={w} onChange={(e) => setW(e.target.value)} /></div>
        <button className="btn btn-primary col-span-2 sm:col-span-4" data-testid="sr-go">{t('sg_go')}</button>
      </form>
      <div aria-live="polite" className="mt-4">
        {res === 'need' && <p className="text-sm text-red-700">{t('sg_need')}</p>}
        {res && res !== 'need' && (
          <div className="rounded-2xl bg-sage/40 p-4" data-testid="sr-result">
            <p className="text-sm text-muted">{t('sg_result')}</p>
            <p className="font-display text-3xl font-semibold">{res.size} <span className="text-base font-normal text-muted">({sizeLabel(res.size, lang)})</span></p>
            {res.alt && <p className="mt-1 text-sm">{t('sg_alt', { s: res.alt })}</p>}
            {res.weightNote && <p className="mt-1 text-sm">{t('sg_weight_note')}</p>}
            {onPick && (!available || available.includes(res.size)) && <button className="btn btn-clay mt-3 !py-2" onClick={() => onPick(res.size)}>{t('select_size')}: {res.size}</button>}
            {onPick && available && !available.includes(res.size) && <p className="mt-2 text-sm text-red-700">{t('unavailable_combo')}</p>}
          </div>
        )}
        <p className="mt-3 text-xs text-muted">{t('sg_disclaimer')}</p>
      </div>
    </div>
  );
}
