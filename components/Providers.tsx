'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { tr } from '@/lib/dict';
import type { Lang } from '@/lib/types';

export interface CartLine { productId: string; color: string; size: string; qty: number }
interface Ctx {
  lang: Lang; t: (k: string, v?: Record<string, string | number>) => string; loggedIn: boolean;
  cart: CartLine[]; cartCount: number; addToCart: (l: CartLine) => void; setQty: (i: number, q: number) => void; updateLine: (i: number, patch: Partial<CartLine>) => void; removeLine: (i: number) => void; clearCart: () => void; cartReady: boolean;
  wish: string[]; toggleWish: (id: string) => void; toast: (msg: string) => void;
}
const C = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(C); if (!c) throw new Error('no provider'); return c; };
const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function Providers({ lang, loggedIn, initialWish, children }: { lang: Lang; loggedIn: boolean; initialWish: string[]; children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]); const [cartReady, setReady] = useState(false);
  const [wish, setWish] = useState<string[]>(initialWish); const [msg, setMsg] = useState<string | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { try { const raw = safeGet('ry_cart_v1'); if (raw) setCart(JSON.parse(raw)); } catch { /* ignore */ } setReady(true);
    if (!loggedIn) { try { const w = safeGet('ry_wish_v1'); if (w) setWish(JSON.parse(w)); } catch { /* ignore */ } } }, [loggedIn]);
  useEffect(() => { if (cartReady) safeSet('ry_cart_v1', JSON.stringify(cart)); }, [cart, cartReady]);
  const toast = useCallback((m: string) => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 2600); }, []);
  const t = useCallback((k: string, v?: Record<string, string | number>) => tr(lang, k, v), [lang]);
  const addToCart = useCallback((l: CartLine) => setCart((c) => { const i = c.findIndex((x) => x.productId === l.productId && x.color === l.color && x.size === l.size); if (i >= 0) { const n = [...c]; n[i] = { ...n[i], qty: Math.min(20, n[i].qty + l.qty) }; return n; } return [...c, l]; }), []);
  const setQty = useCallback((i: number, q: number) => setCart((c) => c.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Math.min(20, q)) } : x))), []);
  const updateLine = useCallback((i: number, patch: Partial<CartLine>) => setCart((c) => {
    const n = c.map((x, j) => (j === i ? { ...x, ...patch } : x)); const t2 = n[i]; const dup = n.findIndex((x, j) => j !== i && x.productId === t2.productId && x.color === t2.color && x.size === t2.size);
    if (dup >= 0) { n[dup] = { ...n[dup], qty: Math.min(20, n[dup].qty + t2.qty) }; n.splice(i, 1); } return n; }), []);
  const removeLine = useCallback((i: number) => setCart((c) => c.filter((_, j) => j !== i)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWish = useCallback((id: string) => {
    setWish((w) => { const next = w.includes(id) ? w.filter((x) => x !== id) : [...w, id]; if (loggedIn) void fetch('/api/me/wishlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId: id }) }); else safeSet('ry_wish_v1', JSON.stringify(next)); return next; });
  }, [loggedIn]);
  const value = useMemo(() => ({ lang, t, loggedIn, cart, cartCount: cart.reduce((s, l) => s + l.qty, 0), addToCart, setQty, updateLine, removeLine, clearCart, cartReady, wish, toggleWish, toast }), [lang, t, loggedIn, cart, addToCart, setQty, updateLine, removeLine, clearCart, cartReady, wish, toggleWish, toast]);
  return (
    <C.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
        {msg && <div className="fade-in pointer-events-auto rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream shadow-soft">{msg}</div>}
      </div>
    </C.Provider>
  );
}
