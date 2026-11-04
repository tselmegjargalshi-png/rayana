import type { DB, Product } from './types';
import { totalStock } from './format';
export interface Filters { q?: string; group?: string; cat?: string; age?: string; size?: string; color?: string; collection?: string; isNew?: boolean; sale?: boolean; best?: boolean; featured?: boolean; min?: number; max?: number; inStock?: boolean; sort?: string; page?: number }
export const PAGE_SIZE = 24;
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const s = (k: string) => { const v = sp[k]; return (Array.isArray(v) ? v[0] : v) || undefined; }; const n = (k: string) => { const v = Number(s(k)); return Number.isFinite(v) && v > 0 ? v : undefined; };
  return { q: s('q')?.slice(0, 60), group: s('group'), cat: s('cat'), age: s('age'), size: s('size'), color: s('color'), collection: s('collection'), isNew: s('isNew') === '1', sale: s('sale') === '1', best: s('best') === '1', featured: s('featured') === '1', min: n('min'), max: n('max'), inStock: s('inStock') === '1', sort: s('sort'), page: n('page') ?? 1 };
}
export function filterProducts(db: DB, f: Filters): Product[] {
  const age = f.age ? db.settings.ageGroups.find((a) => a.id === f.age) : undefined; const q = f.q?.toLowerCase().trim();
  let ps = db.products.filter((p) => p.status === 'active');
  if (q) ps = ps.filter((p) => [p.name.mn, p.name.en, p.sku, p.tags.join(' '), db.categories.find((c) => c.id === p.categoryId)?.name.mn, db.categories.find((c) => c.id === p.categoryId)?.name.en].join(' ').toLowerCase().includes(q));
  if (f.group) ps = ps.filter((p) => p.group === f.group);
  if (f.cat) ps = ps.filter((p) => p.categoryId === f.cat);
  if (f.collection) ps = ps.filter((p) => p.collections.includes(f.collection!));
  if (f.isNew) ps = ps.filter((p) => p.isNew);
  if (f.sale) ps = ps.filter((p) => p.salePrice);
  if (f.best) ps = ps.filter((p) => p.isBestseller);
  if (f.featured) ps = ps.filter((p) => p.isFeatured);
  if (f.min) ps = ps.filter((p) => (p.salePrice ?? p.price) >= f.min!);
  if (f.max) ps = ps.filter((p) => (p.salePrice ?? p.price) <= f.max!);
  const needVariant = f.size || f.color || age || f.inStock;
  if (needVariant) ps = ps.filter((p) => p.variants.some((v) => v.stock > 0 && (!f.size || v.size === f.size) && (!f.color || v.color === f.color) && (!age || age.sizes.includes(v.size))));
  switch (f.sort) {
    case 'price_asc': ps = [...ps].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
    case 'price_desc': ps = [...ps].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
    case 'pop': { const sold = new Map<string, number>(); for (const o of db.orders) if (o.status !== 'cancelled') for (const i of o.items) sold.set(i.productId, (sold.get(i.productId) ?? 0) + i.qty); ps = [...ps].sort((a, b) => (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0)); break; }
    default: ps = [...ps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return ps;
}
export const productAgeGroups = (db: DB, p: Product) => db.settings.ageGroups.filter((a) => a.sizes.some((s) => p.sizes.includes(s)));
export { totalStock };
