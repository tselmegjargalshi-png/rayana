'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './Providers';
import type { Review } from '@/lib/types';
export function ReviewForm({ productId, existing }: { productId: string; existing?: Review | null }) {
  const { t } = useApp(); const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 5); const [title, setTitle] = useState(existing?.title ?? ''); const [body, setBody] = useState(existing?.body ?? '');
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function upload(files: FileList | null) {
    if (!files) return; for (const f of Array.from(files).slice(0, 3 - photos.length)) { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/upload', { method: 'POST', body: fd }); if (r.ok) { const d = await r.json(); setPhotos((p) => [...p, d.url]); } else setMsg(t('err_generic')); }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId, rating, title, body, photos }) });
    setBusy(false); if (r.ok) { setMsg(t('review_pending')); router.refresh(); } else setMsg(t('err_generic'));
  }
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" data-testid="review-form"><h3 className="font-display text-xl font-semibold">{existing ? t('edit') : t('write_review')}</h3>
      <div><p className="label">{t('rating')}</p><div className="flex gap-1" role="radiogroup" aria-label={t('rating')}>{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n}`} onClick={() => setRating(n)} className={`text-3xl ${n <= rating ? 'text-clay' : 'text-beige'}`}>★</button>)}</div></div>
      <div><label className="label" htmlFor="rv_t">{t('review_title')}</label><input id="rv_t" className="input" required minLength={2} maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="label" htmlFor="rv_b">{t('review_body')}</label><textarea id="rv_b" className="input min-h-28" required minLength={5} maxLength={1200} value={body} onChange={(e) => setBody(e.target.value)} /></div>
      <div><label className="label" htmlFor="rv_p">{t('add_photos')}</label><input id="rv_p" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => upload(e.target.files)} className="text-sm" />
        <div className="mt-2 flex gap-2">{photos.map((u) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt="" className="h-16 w-16 rounded-xl object-cover" />)}</div></div>
      <button className="btn btn-primary" disabled={busy}>{t('submit')}</button>{msg && <p role="status" className="text-sm text-muted">{msg}</p>}
    </form>
  );
}
