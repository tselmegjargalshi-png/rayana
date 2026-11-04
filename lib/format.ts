import type { Bi, Lang, Product } from './types';
export const money = (n: number) => `${Math.round(n).toLocaleString('en-US')}₮`;
export const loc = (b: Bi | undefined, lang: Lang) => (b ? (lang === 'en' ? b.en || b.mn : b.mn || b.en) : '');
export const dateFmt = (iso: string, withTime = false) => { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}${withTime ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''}`; };
export function imgUrl(p: Pick<Product, 'images'>, colorHex: string, i = 0): string {
  const raw = p.images[i] ?? p.images[0]; if (!raw) return '/api/art?g=tee&c=EBDDBF&v=0';
  if (raw.startsWith('art:')) { const [, g, v] = raw.split(':'); return `/api/art?g=${g}&c=${colorHex}&v=${v}`; }
  return raw;
}
export const imgCount = (p: Pick<Product, 'images'>) => p.images.length;
export const discountPct = (p: Pick<Product, 'price' | 'salePrice'>) => (p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0);
export const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
