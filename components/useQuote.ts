'use client';
import { useEffect, useState } from 'react';
import type { Quote } from '@/lib/pricing';
import { useApp } from './Providers';
export interface QuoteParams { code?: string; district?: string; pickup?: boolean; giftWrap?: boolean; email?: string; phone?: string }
export function useQuote(params: QuoteParams) {
  const { cart, cartReady } = useApp(); const [q, setQ] = useState<Quote | null>(null); const [loading, setLoading] = useState(true);
  const key = JSON.stringify([cart, params]);
  useEffect(() => {
    if (!cartReady) return; if (cart.length === 0) { setQ(null); setLoading(false); return; }
    let alive = true; setLoading(true);
    const id = setTimeout(() => { fetch('/api/cart/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items: cart, ...params }) }).then((r) => r.json()).then((d) => { if (alive) { setQ(d); setLoading(false); } }).catch(() => alive && setLoading(false)); }, 150);
    return () => { alive = false; clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cartReady]);
  return { quote: q, loading };
}
