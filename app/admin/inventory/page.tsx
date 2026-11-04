import Link from 'next/link';
import { StockAdjust } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, loc } from '@/lib/format';
import { getLang } from '@/lib/i18n';
export default async function Inventory({ searchParams }: { searchParams: Promise<{ low?: string; q?: string; page?: string }> }) {
  const sp = await searchParams; const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn); const q = (sp.q ?? '').toLowerCase();
  const rows = db.products.flatMap((p) => p.variants.map((v) => ({ p, v }))).filter(({ p, v }) => (!sp.low || v.stock <= p.lowStockThreshold) && (!q || `${p.name.mn} ${p.name.en} ${v.sku}`.toLowerCase().includes(q)));
  const page = Math.max(1, Number(sp.page) || 1); const list = rows.slice((page - 1) * 30, page * 30); const pages = Math.ceil(rows.length / 30); const cn = (id: string) => loc(db.settings.colors.find((c) => c.id === id)?.name, lang);
  const moves = db.stockMoves.slice(0, 25);
  return (
    <div className="space-y-8"><div><h1 className="text-3xl font-semibold">{tr(lang, 'a_inventory')}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2"><form><input name="q" defaultValue={sp.q} placeholder="SKU" className="input !w-56 !py-2" aria-label="SKU" />{sp.low && <input type="hidden" name="low" value="1" />}</form><Link href="/admin/inventory" className={`chip ${!sp.low ? 'chip-on' : ''}`}>{tr(lang, 'all')}</Link><Link href="/admin/inventory?low=1" className={`chip ${sp.low ? 'chip-on' : ''}`} data-testid="low-filter">{L('Нөөц багатай / дууссан', 'Low or out of stock')}</Link><span className="text-xs text-muted">{rows.length}</span></div>
      <div className="card mt-4 overflow-x-auto"><table className="w-full text-sm" data-testid="inv-table"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">SKU</th><th>{L('Бүтээгдэхүүн', 'Product')}</th><th>{L('Өнгө', 'Color')}</th><th>{L('Размер', 'Size')}</th><th>{L('Нөөц', 'Stock')}</th><th>{L('Тохируулах', 'Adjust')}</th></tr></thead>
        <tbody>{list.map(({ p, v }) => <tr key={v.sku} className="border-t border-line"><td className="p-3 font-mono text-xs">{v.sku}</td><td><Link className="hover:text-clay" href={`/admin/products/${p.id}`}>{loc(p.name, lang)}</Link></td><td>{cn(v.color)}</td><td>{v.size}</td><td className={v.stock === 0 ? 'font-semibold text-red-700' : v.stock <= p.lowStockThreshold ? 'font-semibold text-clay' : ''} data-testid={`stock-${v.sku}`}>{v.stock}{v.stock === 0 ? ` · ${L('Дууссан', 'Out of stock')}` : v.stock <= p.lowStockThreshold ? ` · ${L('Багатай', 'Low')}` : ''}</td><td className="p-2"><StockAdjust sku={v.sku} /></td></tr>)}</tbody></table></div>
      {pages > 1 && <div className="mt-4 flex flex-wrap gap-1">{Array.from({ length: Math.min(pages, 40) }, (_, i) => i + 1).map((n) => <Link key={n} className={`chip ${n === page ? 'chip-on' : ''}`} href={`/admin/inventory?page=${n}${sp.low ? '&low=1' : ''}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}>{n}</Link>)}</div>}</div>
      <section><h2 className="font-display text-xl font-semibold">{L('Нөөцийн хөдөлгөөн', 'Stock movements')}</h2><div className="card mt-3 overflow-x-auto"><table className="w-full text-sm" data-testid="moves"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">{L('Огноо', 'Date')}</th><th>SKU</th><th>{L('Өөрчлөлт', 'Change')}</th><th>{L('Шалтгаан', 'Reason')}</th><th>{L('Лавлагаа', 'Ref')}</th><th>{L('Хэн', 'By')}</th></tr></thead><tbody>{moves.map((m) => <tr key={m.id} className="border-t border-line"><td className="p-3 text-xs">{dateFmt(m.at, true)}</td><td className="font-mono text-xs">{m.sku}</td><td className={m.delta < 0 ? 'text-red-700' : 'text-green-700'}>{m.delta > 0 ? '+' : ''}{m.delta}</td><td>{m.reason}</td><td>{m.ref}</td><td className="text-xs">{m.by}</td></tr>)}</tbody></table></div></section></div>
  );
}
