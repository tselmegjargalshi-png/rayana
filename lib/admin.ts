import { z } from 'zod';
import { HttpError } from './auth';
import { mutate, resetDemo, uid, DEMO_MODE } from './db';
import { adjustStock, confirmPayment, setOrderStatus } from './orders';
import { ORDER_STATUSES, type Product, type Variant } from './types';
import { slugify } from './seed';

const bi = z.object({ mn: z.string().max(2000), en: z.string().max(2000) });
const ProductIn = z.object({
  id: z.string().optional(), name: bi, description: bi, categoryId: z.string(), price: z.number().int().min(0).max(100000000), salePrice: z.number().int().min(0).nullable(),
  images: z.array(z.string().max(300)).max(10), video: z.string().max(300).nullable(), fabric: bi, material: bi, care: bi,
  isNew: z.boolean(), isBestseller: z.boolean(), isFeatured: z.boolean(), status: z.enum(['active', 'draft']), collections: z.array(z.string()), lowStockThreshold: z.number().int().min(0).max(1000),
  garment: z.string().max(20).optional(), sku: z.string().max(30).optional(),
  variants: z.array(z.object({ color: z.string(), size: z.string(), stock: z.number().int().min(0).max(100000) })).max(400),
});
const Code = z.object({ id: z.string().optional(), code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/), kind: z.enum(['percent', 'fixed', 'free_delivery', 'b2g1', 'new_customer']), value: z.number().min(0).max(100000000), minSubtotal: z.number().min(0), active: z.boolean(), expiresAt: z.string().nullable(), usageLimit: z.number().int().min(1).nullable(), description: bi });
const Banner = z.object({ id: z.string().optional(), title: bi, subtitle: bi, cta: bi, href: z.string().max(200).refine((h) => h.startsWith('/')), theme: z.string().max(30), active: z.boolean(), placement: z.enum(['hero', 'strip', 'offer']) });
const Zone = z.object({ id: z.string(), name: bi, districts: z.array(z.string()), fee: z.number().int().min(0), eta: bi, active: z.boolean() });

export function adminAction(action: string, d: Record<string, unknown>, by: string): unknown {
  switch (action) {
    case 'product.save': {
      const p = ProductIn.safeParse(d.product); if (!p.success) throw new HttpError(400, 'validation:' + p.error.issues.map((i) => i.path.join('.')).join(','));
      const x = p.data;
      return mutate((db) => {
        const cat = db.categories.find((c) => c.id === x.categoryId); if (!cat) throw new HttpError(400, 'validation:categoryId');
        if (x.salePrice !== null && x.salePrice >= x.price) throw new HttpError(400, 'validation:salePrice');
        const ex = x.id ? db.products.find((q) => q.id === x.id) : undefined; if (x.id && !ex) throw new HttpError(404, 'not_found');
        const n = db.products.length + 1; const sku = (x.sku || ex?.sku || `RY${cat.group.slice(0, 2).toUpperCase()}${String(Date.now()).slice(-5)}`).toUpperCase();
        if (db.products.some((q) => q.sku === sku && q.id !== ex?.id)) throw new HttpError(409, 'sku_taken');
        const colors = [...new Set(x.variants.map((v) => v.color))]; const sizes = [...new Set(x.variants.map((v) => v.size))];
        const seen = new Set<string>(); const variants: Variant[] = [];
        for (const v of x.variants) { const key = v.color + v.size; if (seen.has(key)) throw new HttpError(400, 'validation:duplicate_variant'); seen.add(key); if (!db.settings.colors.some((c) => c.id === v.color) || !db.settings.sizes.includes(v.size)) throw new HttpError(400, 'validation:variant'); variants.push({ sku: `${sku}${v.color.slice(0, 2).toUpperCase()}${v.size}`, color: v.color, size: v.size, stock: v.stock }); }
        const base = { name: x.name, description: x.description, categoryId: x.categoryId, group: cat.group, price: x.price, salePrice: x.salePrice, images: x.images.length ? x.images : [`art:${x.garment || cat.garment}:0`, `art:${x.garment || cat.garment}:1`, `art:${x.garment || cat.garment}:2`], video: x.video, fabric: x.fabric, material: x.material, care: x.care, isNew: x.isNew, isBestseller: x.isBestseller, isFeatured: x.isFeatured, status: x.status, collections: x.collections, lowStockThreshold: x.lowStockThreshold, garment: x.garment || cat.garment, colors, sizes, variants, sku };
        if (ex) {
          for (const v of variants) { const old = ex.variants.find((o) => o.color === v.color && o.size === v.size); const delta = v.stock - (old?.stock ?? 0); if (delta !== 0) db.stockMoves.unshift({ id: uid('mv'), at: new Date().toISOString(), sku: v.sku, productId: ex.id, delta, reason: old ? 'manual_adjust' : 'initial', ref: 'admin', by, note: 'product form' }); }
          Object.assign(ex, base); return { id: ex.id, slug: ex.slug };
        }
        const id = `prd_${Date.now().toString(36)}${n}`; const prod: Product = { id, slug: `${slugify(x.name.en || x.name.mn || 'product')}_${n}${Date.now().toString(36).slice(-3)}`, tags: [], demo: false, createdAt: new Date().toISOString(), ...base };
        db.products.push(prod); for (const v of variants) if (v.stock) db.stockMoves.unshift({ id: uid('mv'), at: prod.createdAt, sku: v.sku, productId: id, delta: v.stock, reason: 'initial', ref: 'admin', by, note: '' });
        return { id, slug: prod.slug };
      });
    }
    case 'product.delete': return mutate((db) => { db.products = db.products.filter((p) => p.id !== d.id); for (const c of db.bundles) c.productIds = c.productIds.filter((i) => i !== d.id); db.users.forEach((u) => (u.wishlist = u.wishlist.filter((i) => i !== d.id))); db.reviews = db.reviews.filter((r) => r.productId !== d.id); return { ok: true }; });
    case 'stock.adjust': { const delta = Math.trunc(Number(d.delta)); if (!delta || Math.abs(delta) > 100000) throw new HttpError(400, 'validation:delta'); adjustStock(String(d.sku), delta, by, String(d.note ?? '')); return { ok: true }; }
    case 'order.status': { if (!ORDER_STATUSES.includes(d.status as never)) throw new HttpError(400, 'bad_status'); setOrderStatus(String(d.id), d.status as never, by, String(d.note ?? '').slice(0, 200)); return { ok: true }; }
    case 'order.confirmPayment': confirmPayment(String(d.id), by); return { ok: true };
    case 'order.note': return mutate((db) => { const o = db.orders.find((x) => x.id === d.id); if (!o) throw new HttpError(404, 'not_found'); const text = String(d.text ?? '').trim().slice(0, 500); if (!text) throw new HttpError(400, 'validation:text'); o.adminNotes.push({ at: new Date().toISOString(), by, text }); return { ok: true }; });
    case 'order.return': return mutate((db) => {
      const o = db.orders.find((x) => x.id === d.id); if (!o?.returnRequest) throw new HttpError(404, 'not_found'); const st = String(d.status) as 'approved' | 'rejected' | 'received'; if (!['approved', 'rejected', 'received'].includes(st)) throw new HttpError(400, 'bad_status');
      if (st === 'received' && o.stockDeducted) { for (const it of o.items) { const p = db.products.find((q) => q.id === it.productId); const v = p?.variants.find((q) => q.sku === it.sku); if (p && v) { v.stock += it.qty; db.stockMoves.unshift({ id: uid('mv'), at: new Date().toISOString(), sku: it.sku, productId: p.id, delta: it.qty, reason: 'return_restock', ref: o.number, by, note: '' }); } } o.stockDeducted = false; if (o.payment.status === 'confirmed' || o.payment.status === 'cod_collected') o.payment.status = 'refunded'; }
      o.returnRequest.status = st; o.timeline.push({ at: new Date().toISOString(), status: 'note', text: `Return ${st}` }); return { ok: true };
    });
    case 'review.moderate': return mutate((db) => { const r = db.reviews.find((x) => x.id === d.id); if (!r) throw new HttpError(404, 'not_found'); if (!['approved', 'hidden', 'pending'].includes(String(d.status))) throw new HttpError(400, 'bad_status'); r.status = d.status as never; return { ok: true }; });
    case 'review.delete': return mutate((db) => { db.reviews = db.reviews.filter((r) => r.id !== d.id); return { ok: true }; });
    case 'code.save': { const p = Code.safeParse(d.code); if (!p.success) throw new HttpError(400, 'validation:code'); return mutate((db) => { const x = p.data; const ex = x.id ? db.codes.find((c) => c.id === x.id) : undefined; if (db.codes.some((c) => c.code === x.code && c.id !== ex?.id)) throw new HttpError(409, 'code_taken'); if (ex) Object.assign(ex, x); else db.codes.push({ ...x, id: uid('cd'), used: 0, demo: false }); return { ok: true }; }); }
    case 'code.delete': return mutate((db) => { db.codes = db.codes.filter((c) => c.id !== d.id); return { ok: true }; });
    case 'bundle.save': { const b = z.object({ id: z.string().optional(), name: bi, productIds: z.array(z.string()).min(2).max(6), price: z.number().int().min(0), active: z.boolean() }).safeParse(d.bundle); if (!b.success) throw new HttpError(400, 'validation:bundle'); return mutate((db) => { const x = b.data; const ex = x.id ? db.bundles.find((c) => c.id === x.id) : undefined; if (ex) Object.assign(ex, x); else db.bundles.push({ ...x, id: uid('bn') }); return { ok: true }; }); }
    case 'bundle.delete': return mutate((db) => { db.bundles = db.bundles.filter((c) => c.id !== d.id); return { ok: true }; });
    case 'banner.save': { const b = Banner.safeParse(d.banner); if (!b.success) throw new HttpError(400, 'validation:banner'); return mutate((db) => { const x = b.data; const ex = x.id ? db.banners.find((c) => c.id === x.id) : undefined; if (ex) Object.assign(ex, x); else db.banners.push({ ...x, id: uid('bnr') }); return { ok: true }; }); }
    case 'banner.delete': return mutate((db) => { db.banners = db.banners.filter((c) => c.id !== d.id); db.settings.home.heroBannerIds = db.settings.home.heroBannerIds.filter((i) => i !== d.id); return { ok: true }; });
    case 'home.save': { const h = z.object({ heroBannerIds: z.array(z.string()), showSections: z.record(z.boolean()), storyTitle: bi, storyBody: bi }).safeParse(d.home); if (!h.success) throw new HttpError(400, 'validation'); return mutate((db) => { Object.assign(db.settings.home, h.data); return { ok: true }; }); }
    case 'collection.save': { const c = z.object({ id: z.string().optional(), name: bi, description: bi, theme: z.string().max(20), cover: z.string().max(300), season: z.boolean() }).safeParse(d.collection); if (!c.success) throw new HttpError(400, 'validation'); return mutate((db) => { const x = c.data; const ex = x.id ? db.collections.find((q) => q.id === x.id) : undefined; if (ex) Object.assign(ex, x); else { const id = slugify(x.name.en || x.name.mn) || uid('col'); db.collections.push({ ...x, id, slug: id, demo: false }); } return { ok: true }; }); }
    case 'collection.delete': return mutate((db) => { db.collections = db.collections.filter((c) => c.id !== d.id); db.products.forEach((p) => (p.collections = p.collections.filter((i) => i !== d.id))); return { ok: true }; });
    case 'delivery.save': { const s = z.object({ freeDeliveryThreshold: z.number().int().min(0), giftWrapFee: z.number().int().min(0), zones: z.array(Zone).max(20), pickup: z.object({ enabled: z.boolean(), address: bi, eta: bi }) }).safeParse(d.delivery); if (!s.success) throw new HttpError(400, 'validation'); return mutate((db) => { Object.assign(db.settings, s.data); return { ok: true }; }); }
    case 'category.save': { const c = z.object({ id: z.string().optional(), name: bi, group: z.enum(['baby', 'girls', 'boys', 'unisex', 'accessories']), garment: z.string().max(20) }).safeParse(d.category); if (!c.success) throw new HttpError(400, 'validation'); return mutate((db) => { const x = c.data; const ex = x.id ? db.categories.find((q) => q.id === x.id) : undefined; if (ex) { ex.name = x.name; ex.garment = x.garment; if (ex.parent) { ex.group = x.group; ex.parent = x.group; db.products.filter((p) => p.categoryId === ex.id).forEach((p) => (p.group = x.group)); } } else { const id = slugify(x.name.en || x.name.mn) || uid('cat'); if (db.categories.some((q) => q.id === id)) throw new HttpError(409, 'exists'); db.categories.push({ id, slug: id, group: x.group, parent: x.group, name: x.name, garment: x.garment, sortOrder: 100 + db.categories.length }); } return { ok: true }; }); }
    case 'category.delete': return mutate((db) => { const c = db.categories.find((q) => q.id === d.id); if (!c || !c.parent) throw new HttpError(400, 'cannot_delete'); if (db.products.some((p) => p.categoryId === c.id)) throw new HttpError(409, 'category_in_use'); db.categories = db.categories.filter((q) => q.id !== c.id); return { ok: true }; });
    case 'color.save': { const c = z.object({ id: z.string().regex(/^[a-z0-9]{2,20}$/), name: bi, hex: z.string().regex(/^[0-9A-Fa-f]{6}$/) }).safeParse(d.color); if (!c.success) throw new HttpError(400, 'validation'); return mutate((db) => { const ex = db.settings.colors.find((q) => q.id === c.data.id); if (ex) Object.assign(ex, c.data); else db.settings.colors.push(c.data); return { ok: true }; }); }
    case 'color.delete': return mutate((db) => { if (db.products.some((p) => p.colors.includes(String(d.id)))) throw new HttpError(409, 'in_use'); db.settings.colors = db.settings.colors.filter((c) => c.id !== d.id); return { ok: true }; });
    case 'size.add': { const s = String(d.size ?? '').trim().toUpperCase(); if (!/^[A-Z0-9]{1,6}$/.test(s)) throw new HttpError(400, 'validation'); return mutate((db) => { if (!db.settings.sizes.includes(s)) db.settings.sizes.push(s); return { ok: true }; }); }
    case 'size.delete': return mutate((db) => { if (db.products.some((p) => p.sizes.includes(String(d.size)))) throw new HttpError(409, 'in_use'); db.settings.sizes = db.settings.sizes.filter((s) => s !== d.size); db.settings.ageGroups.forEach((a) => (a.sizes = a.sizes.filter((s) => s !== d.size))); return { ok: true }; });
    case 'age.save': { const a = z.object({ id: z.string(), name: bi, sizes: z.array(z.string()) }).safeParse(d.age); if (!a.success) throw new HttpError(400, 'validation'); return mutate((db) => { const ex = db.settings.ageGroups.find((q) => q.id === a.data.id); if (!ex) throw new HttpError(404, 'not_found'); ex.name = a.data.name; ex.sizes = a.data.sizes; return { ok: true }; }); }
    case 'demo.reset': if (!DEMO_MODE) throw new HttpError(403, 'not_demo'); resetDemo(); return { ok: true };
    default: throw new HttpError(400, 'unknown_action');
  }
}
