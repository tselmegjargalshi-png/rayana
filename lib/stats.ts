import type { DB, Order } from './types';
export const isSale = (o: Order) => !['new', 'payment_pending', 'cancelled'].includes(o.status) && o.payment.status !== 'refunded';
const ymd = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
export function computeStats(db: DB) {
  const sales = db.orders.filter(isSale); const total = sales.reduce((s, o) => s + o.total, 0); const now = new Date();
  const monthKey = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`; const monthly = sales.filter((o) => ymd(new Date(o.createdAt)).startsWith(monthKey)).reduce((s, o) => s + o.total, 0);
  const sold = new Map<string, { qty: number; rev: number }>(); const byCat = new Map<string, number>();
  for (const o of sales) for (const i of o.items) { const e = sold.get(i.productId) ?? { qty: 0, rev: 0 }; e.qty += i.qty; e.rev += i.qty * i.unitPrice; sold.set(i.productId, e); const cat = db.products.find((p) => p.id === i.productId)?.group ?? 'other'; byCat.set(cat, (byCat.get(cat) ?? 0) + i.qty * i.unitPrice); }
  const top = [...sold.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 8).map(([id, v]) => ({ product: db.products.find((p) => p.id === id), ...v })).filter((x) => x.product);
  const days: { label: string; value: number }[] = []; for (let i = 29; i >= 0; i--) { const d = new Date(now.getTime() - i * 86400000); const k = ymd(d); days.push({ label: k.slice(5), value: sales.filter((o) => ymd(new Date(o.createdAt)) === k).reduce((s, o) => s + o.total, 0) }); }
  const months: { label: string; value: number }[] = []; for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`; months.push({ label: k, value: sales.filter((o) => ymd(new Date(o.createdAt)).startsWith(k)).reduce((s, o) => s + o.total, 0) }); }
  const lowStock = db.products.flatMap((p) => p.variants.filter((v) => v.stock <= p.lowStockThreshold).map((v) => ({ p, v })));
  const statusCount: Record<string, number> = {}; db.orders.forEach((o) => (statusCount[o.status] = (statusCount[o.status] ?? 0) + 1));
  return { total, monthly, orders: db.orders.length, pending: db.orders.filter((o) => ['new', 'payment_pending'].includes(o.status)).length, completed: db.orders.filter((o) => o.status === 'delivered').length, products: db.products.length, lowStock, outOfStock: lowStock.filter((x) => x.v.stock === 0).length, customers: db.users.filter((u) => u.role === 'customer').length, aov: sales.length ? Math.round(total / sales.length) : 0, top, days, months, byCat: [...byCat.entries()], statusCount, salesCount: sales.length };
}
