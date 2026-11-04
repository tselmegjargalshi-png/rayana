import type { DB, DiscountCode, Order, Product } from './types';

export interface CartLineIn { productId: string; color: string; size: string; qty: number }
export interface QuoteLine extends CartLineIn { name: { mn: string; en: string }; unitPrice: number; listPrice: number; sku: string; stock: number; ok: boolean; issue?: string; colorHex: string; garment: string; colorName: { mn: string; en: string }; images: string[]; sizes: string[]; colors: string[]; slug: string }
export interface QuoteOpts { code?: string | null; district?: string | null; pickup?: boolean; giftWrap?: boolean; userId?: string | null; email?: string | null; phone?: string | null }
export interface Quote {
  lines: QuoteLine[]; subtotal: number; bundleDiscount: number; codeDiscount: number; discount: number; deliveryFee: number; giftWrap: number; total: number;
  freeDeliveryLeft: number; zoneId: string | null; eta: string; codeApplied: string | null; codeError: string | null; bundleNames: string[]; valid: boolean;
}
export const unit = (p: Product) => p.salePrice ?? p.price;
const hasPriorOrder = (db: DB, o: QuoteOpts) => db.orders.some((x) => x.status !== 'cancelled' && ((o.userId && x.userId === o.userId) || (o.email && x.customer.email.toLowerCase() === o.email.toLowerCase()) || (o.phone && x.customer.phone === o.phone)));

export function evalCode(db: DB, raw: string, subtotal: number, o: QuoteOpts, units: number[]): { code: DiscountCode; amount: number; freeShip: boolean } | { error: string } {
  const c = db.codes.find((x) => x.code === raw.trim().toUpperCase());
  if (!c || !c.active) return { error: 'code_invalid' };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) return { error: 'code_expired' };
  if (c.usageLimit !== null && c.used >= c.usageLimit) return { error: 'code_limit' };
  if (subtotal < c.minSubtotal) return { error: 'code_min' };
  if (c.kind === 'new_customer' && hasPriorOrder(db, o)) return { error: 'code_new_only' };
  let amount = 0; let freeShip = false;
  if (c.kind === 'percent' || c.kind === 'new_customer') amount = Math.round((subtotal * c.value) / 100);
  else if (c.kind === 'fixed') amount = Math.min(c.value, subtotal);
  else if (c.kind === 'free_delivery') freeShip = true;
  else if (c.kind === 'b2g1') { const u = [...units].sort((a, b) => b - a); for (let i = 2; i < u.length; i += 3) amount += u[i]; if (!amount) return { error: 'code_b2g1_need' }; }
  return { code: c, amount: Math.min(amount, subtotal), freeShip };
}

export function quote(db: DB, lines: CartLineIn[], o: QuoteOpts = {}): Quote {
  const S = db.settings; const out: QuoteLine[] = [];
  for (const l of lines.slice(0, 50)) {
    const p = db.products.find((x) => x.id === l.productId); const qty = Math.max(1, Math.min(20, Math.floor(l.qty) || 1));
    if (!p || p.status !== 'active') { out.push({ ...l, qty, name: { mn: 'Бүтээгдэхүүн олдсонгүй', en: 'Product unavailable' }, unitPrice: 0, listPrice: 0, sku: '', stock: 0, ok: false, issue: 'unavailable', colorHex: 'CCCCCC', garment: 'tee', colorName: { mn: '', en: '' }, images: [], sizes: [], colors: [], slug: '' }); continue; }
    const v = p.variants.find((x) => x.color === l.color && x.size === l.size); const col = S.colors.find((c) => c.id === l.color);
    const ok = !!v && v.stock >= qty;
    out.push({ ...l, qty, name: p.name, unitPrice: unit(p), listPrice: p.price, sku: v?.sku ?? '', stock: v?.stock ?? 0, ok, issue: !v ? 'unavailable' : v.stock < qty ? (v.stock === 0 ? 'out_of_stock' : 'low_stock') : undefined, colorHex: col?.hex ?? 'CCCCCC', garment: p.garment, colorName: col?.name ?? { mn: l.color, en: l.color }, images: p.images, sizes: p.sizes, colors: p.colors, slug: p.slug });
  }
  const subtotal = out.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  // bundles (auto applied)
  let bundleDiscount = 0; const bundleNames: string[] = [];
  for (const b of db.bundles.filter((x) => x.active)) {
    const ls = b.productIds.map((id) => out.find((l) => l.productId === id)); if (ls.some((l) => !l)) continue;
    const sum = ls.reduce((s, l) => s + l!.unitPrice, 0); if (sum > b.price) { bundleDiscount += sum - b.price; bundleNames.push(b.name.mn + '|' + b.name.en); }
  }
  const afterBundle = subtotal - bundleDiscount; const units: number[] = []; out.forEach((l) => { for (let i = 0; i < l.qty; i++) units.push(l.unitPrice); });
  let codeDiscount = 0; let codeApplied: string | null = null; let codeError: string | null = null; let freeShip = false;
  if (o.code && o.code.trim()) { const r = evalCode(db, o.code, afterBundle, o, units); if ('error' in r) codeError = r.error; else { codeDiscount = r.amount; codeApplied = r.code.code; freeShip = r.freeShip; } }
  const discount = bundleDiscount + codeDiscount; const net = subtotal - discount;
  let fee = 0; let zoneId: string | null = null; let eta = '';
  if (o.pickup && S.pickup.enabled) { eta = S.pickup.eta.mn; }
  else if (o.district) { const z = S.zones.find((x) => x.active && x.districts.includes(o.district!)); if (z) { zoneId = z.id; fee = z.fee; eta = z.eta.mn; } }
  if (net >= S.freeDeliveryThreshold || freeShip) fee = 0;
  const gift = o.giftWrap ? S.giftWrapFee : 0;
  return { lines: out, subtotal, bundleDiscount, codeDiscount, discount, deliveryFee: fee, giftWrap: gift, total: Math.max(0, net + fee + gift), freeDeliveryLeft: Math.max(0, S.freeDeliveryThreshold - net), zoneId, eta, codeApplied, codeError, bundleNames, valid: out.length > 0 && out.every((l) => l.ok) };
}
export type { Order };
