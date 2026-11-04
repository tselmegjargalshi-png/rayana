import Link from 'next/link';
import { filterProducts, PAGE_SIZE, type Filters } from '@/lib/catalog';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { loc } from '@/lib/format';
import { sizeLabel } from '@/lib/sizing';
import type { Lang } from '@/lib/types';
import { ProductCard } from './ProductCard';

const KEYS: (keyof Filters)[] = ['q', 'group', 'cat', 'age', 'size', 'color', 'collection', 'isNew', 'sale', 'best', 'min', 'max', 'inStock', 'sort'];
export function ShopView({ lang, base, f, fixed = [] }: { lang: Lang; base: string; f: Filters; fixed?: (keyof Filters)[] }) {
  const db = getDB(); const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v); const all = filterProducts(db, f);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE)); const page = Math.min(f.page ?? 1, pages); const list = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (over: Partial<Record<keyof Filters, string | undefined>>, resetPage = true) => {
    const sp = new URLSearchParams(); const merged: Record<string, string | undefined> = {};
    for (const k of KEYS) { const v = f[k]; merged[k] = v === undefined || v === false || v === '' ? undefined : v === true ? '1' : String(v); }
    Object.assign(merged, over); for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    if (!resetPage && page > 1) sp.set('page', String(page)); const s = sp.toString(); return s ? `${base}?${s}` : base;
  };
  const Chip = ({ label, on, to }: { label: string; on: boolean; to: string }) => <Link href={to} scroll={false} className={`chip ${on ? 'chip-on' : ''}`} aria-pressed={on}>{label}</Link>;
  const agesAll = db.settings.ageGroups; const groups = ['baby', 'girls', 'boys', 'unisex', 'accessories'];
  const cats = db.categories.filter((c) => c.parent && (!f.group || c.group === f.group));
  const active = KEYS.filter((k) => !fixed.includes(k) && k !== 'sort' && f[k]).length;
  return (
    <div className="container-x pb-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <details className="group rounded-3xl border border-line bg-white p-5 lg:open:block" open>
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold lg:cursor-default">{t('filters')}{active > 0 && <span className="ml-2 rounded-full bg-clay px-2 text-xs text-white">{active}</span>}<span className="text-xs text-muted lg:hidden">▾</span></summary>
            <div className="mt-4 space-y-5 text-sm">
              <form action={base} className="flex gap-2" role="search">
                {KEYS.filter((k) => k !== 'q' && f[k]).map((k) => <input key={k} type="hidden" name={k} value={f[k] === true ? '1' : String(f[k])} />)}
                <input name="q" defaultValue={f.q} placeholder={t('search_ph')} className="input !py-2" aria-label={t('search')} />
              </form>
              {!fixed.includes('group') && <div><p className="label">{t('gender')}</p><div className="flex flex-wrap gap-1.5"><Chip label={t('all')} on={!f.group} to={href({ group: undefined, cat: undefined })} />{groups.map((g) => <Chip key={g} label={t('nav_' + g)} on={f.group === g} to={href({ group: g, cat: undefined })} />)}</div></div>}
              {!fixed.includes('cat') && <div><p className="label">{t('category')}</p><div className="flex flex-wrap gap-1.5">{cats.map((c) => <Chip key={c.id} label={loc(c.name, lang)} on={f.cat === c.id} to={href({ cat: f.cat === c.id ? undefined : c.id, group: c.group })} />)}</div></div>}
              {!fixed.includes('age') && <div><p className="label">{t('age')}</p><div className="flex flex-wrap gap-1.5">{agesAll.map((a) => <Chip key={a.id} label={loc(a.name, lang).replace(/ \(.*\)/, '')} on={f.age === a.id} to={href({ age: f.age === a.id ? undefined : a.id })} />)}</div></div>}
              <div><p className="label">{t('size')}</p><div className="flex flex-wrap gap-1.5">{db.settings.sizes.map((s) => <Chip key={s} label={s} on={f.size === s} to={href({ size: f.size === s ? undefined : s })} />)}</div></div>
              <div><p className="label">{t('color')}</p><div className="flex flex-wrap gap-2">{db.settings.colors.map((c) => <Link key={c.id} scroll={false} href={href({ color: f.color === c.id ? undefined : c.id })} aria-label={loc(c.name, lang)} aria-pressed={f.color === c.id} title={loc(c.name, lang)} className={`h-8 w-8 rounded-full ring-1 ring-black/15 ring-offset-2 ring-offset-white ${f.color === c.id ? '!ring-2 !ring-ink' : ''}`} style={{ background: `#${c.hex}` }} />)}</div></div>
              <div className="flex flex-wrap gap-1.5"><Chip label={t('on_sale')} on={!!f.sale} to={href({ sale: f.sale ? undefined : '1' })} /><Chip label={t('new_badge')} on={!!f.isNew} to={href({ isNew: f.isNew ? undefined : '1' })} /><Chip label={t('in_stock_only')} on={!!f.inStock} to={href({ inStock: f.inStock ? undefined : '1' })} /></div>
              {active > 0 && <Link href={fixed.length ? href(Object.fromEntries(KEYS.filter((k) => !fixed.includes(k)).map((k) => [k, undefined]))) : base} className="btn btn-ghost w-full !py-2">{t('clear')}</Link>}
            </div>
          </details>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" data-testid="result-count">{t('results', { n: all.length })}{f.size ? ` · ${sizeLabel(f.size, lang)}` : ''}</p>
            <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted">{t('sort')}:</span>
              {[['', 'sort_new'], ['pop', 'sort_pop'], ['price_asc', 'sort_price_asc'], ['price_desc', 'sort_price_desc']].map(([v, k]) => <Chip key={v} label={t(k)} on={(f.sort ?? '') === v} to={href({ sort: v || undefined })} />)}
            </div>
          </div>
          {list.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center"><p className="font-display text-xl">{t('no_results')}</p><p className="mt-2 text-sm text-muted">{t('no_results_sub')}</p><Link href={base} className="btn btn-primary mt-6">{t('clear')}</Link></div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">{list.map((p, i) => <ProductCard key={p.id} p={p} lang={lang} colors={db.settings.colors} priority={i < 4} />)}</div>
          )}
          {pages > 1 && <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pages">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={`${href({}, true)}${href({}, true).includes('?') ? '&' : '?'}page=${n}`} className={`chip ${n === page ? 'chip-on' : ''}`}>{n}</Link>)}</nav>}
        </section>
      </div>
    </div>
  );
}
