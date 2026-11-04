import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { mutate, uid } from './db';
import { quote } from './pricing';
import { HttpError } from './auth';
import type { DB, Order, OrderStatus, PayMethod } from './types';
import { DISTRICTS } from './seed';

export const normPhone = (s: string) => s.replace(/[^\d]/g, '').replace(/^976/, '');
export const phoneOk = (s: string) => /^[6-9]\d{7}$/.test(normPhone(s));
export const fmtPhone = (s: string) => { const n = normPhone(s); return n.length === 8 ? `${n.slice(0, 4)} ${n.slice(4)}` : s; };

export const CheckoutSchema = z.object({
  items: z.array(z.object({ productId: z.string().max(40), color: z.string().max(30), size: z.string().max(10), qty: z.number().int().min(1).max(20) })).min(1).max(50),
  name: z.string().trim().min(2).max(80), phone: z.string().refine(phoneOk, 'phone'), email: z.string().trim().email().max(120),
  delivery: z.enum(['delivery', 'pickup']), district: z.string().max(40).optional().default(''), address: z.string().trim().max(300).optional().default(''), notes: z.string().trim().max(300).optional().default(''),
  method: z.enum(['qpay', 'socialpay', 'bank', 'cod']), code: z.string().max(30).optional().nullable(), giftWrap: z.boolean().optional().default(false),
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;

const STATUS_TEXT: Record<OrderStatus, { mn: string; en: string }> = {
  new: { mn: 'Захиалга хүлээн авлаа', en: 'Order received' }, payment_pending: { mn: 'Төлбөр хүлээгдэж байна', en: 'Awaiting payment' },
  payment_confirmed: { mn: 'Төлбөр баталгаажлаа', en: 'Payment confirmed' }, preparing: { mn: 'Захиалгыг бэлдэж байна', en: 'Preparing your order' },
  packed: { mn: 'Захиалга савлагдлаа', en: 'Order packed' }, shipped: { mn: 'Хүргэлтэд гарлаа', en: 'Out for delivery' }, delivered: { mn: 'Хүргэгдлээ', en: 'Delivered' },
  cancelled: { mn: 'Захиалга цуцлагдлаа', en: 'Order cancelled' }, return_requested: { mn: 'Буцаалтын хүсэлт', en: 'Return requested' },
};
export const statusText = STATUS_TEXT;
const iso = () => new Date().toISOString();

function notify(db: DB, o: Order, st: OrderStatus) {
  const u = o.userId ? db.users.find((x) => x.id === o.userId) : null; if (!u) return;
  u.notifications.unshift({ id: uid('ntf'), at: iso(), text: { mn: `${o.number}: ${STATUS_TEXT[st].mn}`, en: `${o.number}: ${STATUS_TEXT[st].en}` }, read: false, orderId: o.id });
}
export function createOrder(input: unknown, userId: string | null): Order {
  const p = CheckoutSchema.safeParse(input); if (!p.success) throw new HttpError(400, 'validation:' + p.error.issues.map((i) => i.path.join('.')).join(','));
  const d = p.data;
  if (d.delivery === 'delivery') { if (!DISTRICTS.includes(d.district)) throw new HttpError(400, 'validation:district'); if (d.address.length < 5) throw new HttpError(400, 'validation:address'); }
  return mutate((db) => {
    if (d.delivery === 'pickup' && !db.settings.pickup.enabled) throw new HttpError(400, 'pickup_disabled');
    const q = quote(db, d.items, { code: d.code, district: d.district, pickup: d.delivery === 'pickup', giftWrap: d.giftWrap, userId, email: d.email, phone: d.phone });
    if (d.delivery === 'delivery' && !q.zoneId) throw new HttpError(400, 'no_zone');
    if (!q.valid) throw new HttpError(409, 'stock_changed');
    if (d.code && q.codeError) throw new HttpError(400, q.codeError);
    db.orderSeq++; const number = `RY${db.orderSeq}`; const now = iso();
    const method: PayMethod = d.method; const cod = method === 'cod';
    const order: Order = {
      id: `ord_${db.orderSeq}`, number, userId, accessToken: randomBytes(12).toString('hex'), customer: { name: d.name, phone: normPhone(d.phone), email: d.email.toLowerCase() },
      items: q.lines.map((l) => ({ productId: l.productId, sku: l.sku, name: l.name, color: l.color, colorName: l.colorName, size: l.size, qty: l.qty, unitPrice: l.unitPrice, listPrice: l.listPrice })),
      subtotal: q.subtotal, discount: q.discount, deliveryFee: q.deliveryFee, giftWrap: q.giftWrap, total: q.total, discountCode: q.codeApplied,
      delivery: { type: d.delivery, district: d.delivery === 'pickup' ? '' : d.district, address: d.delivery === 'pickup' ? db.settings.pickup.address.mn : d.address, notes: d.notes, zoneId: q.zoneId, eta: q.eta },
      payment: { method, status: cod ? 'cod_due' : 'pending', demo: true, reference: `DEMO${db.orderSeq}` }, status: cod ? 'new' : 'payment_pending',
      timeline: [{ at: now, status: 'new', text: 'Захиалга үүсгэсэн (DEMO)' }], adminNotes: [], giftWrapOn: d.giftWrap, stockDeducted: false, returnRequest: null, createdAt: now, demo: true,
    };
    if (!cod) order.timeline.push({ at: now, status: 'payment_pending', text: 'DEMO төлбөр хүлээгдэж байна' });
    db.orders.unshift(order);
    if (q.codeApplied) { const c = db.codes.find((x) => x.code === q.codeApplied); if (c) c.used++; }
    if (userId) { const u = db.users.find((x) => x.id === userId); if (u) notify(db, order, order.status); }
    for (const a of db.abandoned) if (a.email === order.customer.email) a.recovered = true;
    return order;
  });
}
function deduct(db: DB, o: Order, by: string) {
  for (const it of o.items) { const p = db.products.find((x) => x.id === it.productId); const v = p?.variants.find((x) => x.sku === it.sku); if (!v || v.stock < it.qty) throw new HttpError(409, `insufficient_stock:${it.sku}`); }
  for (const it of o.items) {
    const p = db.products.find((x) => x.id === it.productId)!; const v = p.variants.find((x) => x.sku === it.sku)!; v.stock -= it.qty;
    db.stockMoves.unshift({ id: uid('mv'), at: iso(), sku: it.sku, productId: p.id, delta: -it.qty, reason: 'order_confirmed', ref: o.number, by, note: '' });
  }
  o.stockDeducted = true;
}
function restock(db: DB, o: Order, by: string, reason: 'order_cancelled' | 'return_restock') {
  for (const it of o.items) { const p = db.products.find((x) => x.id === it.productId); const v = p?.variants.find((x) => x.sku === it.sku); if (!p || !v) continue; v.stock += it.qty; db.stockMoves.unshift({ id: uid('mv'), at: iso(), sku: it.sku, productId: p.id, delta: it.qty, reason, ref: o.number, by, note: '' }); }
  o.stockDeducted = false;
}
const RANK: Record<OrderStatus, number> = { new: 0, payment_pending: 1, payment_confirmed: 2, preparing: 3, packed: 4, shipped: 5, delivered: 6, cancelled: -1, return_requested: 7 };
export function setOrderStatus(orderId: string, status: OrderStatus, by: string, note = ''): Order {
  return mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId); if (!o) throw new HttpError(404, 'not_found');
    if (o.status === status) return o;
    if (o.status === 'cancelled') throw new HttpError(409, 'order_cancelled');
    if (status === 'cancelled') { if (o.stockDeducted) restock(db, o, by, 'order_cancelled'); if (o.payment.status === 'confirmed') o.payment.status = 'refunded'; }
    else if (status === 'return_requested') { if (o.status !== 'delivered') throw new HttpError(409, 'not_delivered'); o.returnRequest = o.returnRequest ?? { at: iso(), reason: note || 'admin', status: 'requested' }; }
    else if (RANK[status] >= RANK.payment_confirmed) {
      const cod = o.payment.method === 'cod';
      if (!cod && o.payment.status !== 'confirmed') throw new HttpError(409, 'confirm_payment_first');
      if (!o.stockDeducted) deduct(db, o, by);
      if (cod && status === 'delivered') o.payment.status = 'cod_collected';
      if (o.payment.status !== 'confirmed' && !cod) o.payment.status = 'confirmed';
    }
    o.status = status; o.timeline.push({ at: iso(), status, text: note }); notify(db, o, status); return o;
  });
}
export function confirmPayment(orderId: string, by: string): Order {
  return mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId); if (!o) throw new HttpError(404, 'not_found');
    if (o.status === 'cancelled') throw new HttpError(409, 'order_cancelled');
    if (o.stockDeducted || o.payment.status === 'confirmed' || o.payment.status === 'cod_collected') throw new HttpError(409, 'already_confirmed');
    deduct(db, o, by);
    o.payment.status = o.payment.method === 'cod' ? 'cod_due' : 'confirmed'; o.payment.confirmedAt = iso();
    o.status = 'payment_confirmed'; o.timeline.push({ at: iso(), status: 'payment_confirmed', text: 'Төлбөр баталгаажсан (DEMO, жинхэнэ гүйлгээ биш)' }); notify(db, o, 'payment_confirmed'); return o;
  });
}
export function customerReportsPayment(orderId: string, token: string): Order {
  return mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId); if (!o || o.accessToken !== token) throw new HttpError(404, 'not_found');
    if (o.payment.status === 'pending') { o.payment.status = 'customer_reported'; o.timeline.push({ at: iso(), status: 'payment_pending', text: 'Хэрэглэгч DEMO төлбөр хийснээ мэдэгдсэн' }); }
    return o;
  });
}
export function adjustStock(sku: string, delta: number, by: string, note: string) {
  return mutate((db) => {
    for (const p of db.products) { const v = p.variants.find((x) => x.sku === sku); if (v) { if (v.stock + delta < 0) throw new HttpError(400, 'negative_stock'); v.stock += delta; db.stockMoves.unshift({ id: uid('mv'), at: iso(), sku, productId: p.id, delta, reason: 'manual_adjust', ref: 'admin', by, note: note.slice(0, 200) }); return v; } }
    throw new HttpError(404, 'sku_not_found');
  });
}
export function canView(o: Order, userId: string | null, token?: string | null, role?: string) { return role === 'admin' || (userId && o.userId === userId) || (!!token && token === o.accessToken); }
