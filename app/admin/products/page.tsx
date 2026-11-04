import Link from 'next/link';
import { DeleteProduct } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { loc, money, totalStock } from '@/lib/format';
import { getLang } from '@/lib/i18n';
export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams; const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn); const q = (sp.q ?? '').toLowerCase();
  const all = db.products.filter((p) => !q || `${p.name.mn} ${p.name.en} ${p.sku}`.toLowerCase().includes(q)); const page = Math.max(1, Number(sp.page) || 1); const list = all.slice((page - 1) * 25, page * 25); const pages = Math.ceil(all.length / 25);
  return (
    <div><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold">{tr(lang, 'a_products')} <span className="text-base font-normal text-muted">({all.length})</span></h1><Link href="/admin/products/new" className="btn btn-primary" data-testid="new-product">{L('Бүтээгдэхүүн нэмэх', 'Add product')}</Link></div>
      <form className="mt-4"><input name="q" defaultValue={sp.q} placeholder={tr(lang, 'search_ph')} className="input max-w-sm" aria-label={tr(lang, 'search')} /></form>
      <div className="card mt-4 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">SKU</th><th>{L('Нэр', 'Name')}</th><th>{L('Үнэ', 'Price')}</th><th>{L('Нөөц', 'Stock')}</th><th>{L('Төлөв', 'Status')}</th><th /></tr></thead>
        <tbody>{list.map((p) => <tr key={p.id} className="border-t border-line"><td className="p-3 font-mono text-xs">{p.sku}</td><td><Link className="hover:text-clay" href={`/admin/products/${p.id}`}>{loc(p.name, lang)}</Link>{p.demo && <span className="ml-2 rounded-full bg-butter px-2 py-0.5 text-[10px] font-bold">DEMO</span>}</td><td>{money(p.salePrice ?? p.price)}</td><td className={totalStock(p) === 0 ? 'text-red-700' : ''}>{totalStock(p)}</td><td>{p.status}</td><td className="space-x-3 whitespace-nowrap pr-3 text-xs"><Link className="underline" href={`/admin/products/${p.id}`}>{L('Засах', 'Edit')}</Link><DeleteProduct id={p.id} /></td></tr>)}</tbody></table></div>
      {pages > 1 && <div className="mt-4 flex flex-wrap gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} className={`chip ${n === page ? 'chip-on' : ''}`} href={`/admin/products?page=${n}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}>{n}</Link>)}</div>}</div>
  );
}
