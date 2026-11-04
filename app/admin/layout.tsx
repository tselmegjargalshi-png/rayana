import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
import { DEMO_MODE } from '@/lib/db';
export const metadata = { title: 'Админ', robots: { index: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await getSession(); if (!u || u.role !== 'admin') redirect('/login?next=/admin'); const lang = await getLang();
  const nav = [['/admin', 'a_dashboard'], ['/admin/products', 'a_products'], ['/admin/inventory', 'a_inventory'], ['/admin/orders', 'a_orders'], ['/admin/customers', 'a_customers'], ['/admin/reviews', 'a_reviews'], ['/admin/promotions', 'a_promos'], ['/admin/content', 'a_content'], ['/admin/delivery', 'a_delivery'], ['/admin/catalog', 'a_catalog'], ['/admin/analytics', 'a_analytics']];
  return (
    <div className="container-x grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-36 lg:self-start"><nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">{nav.map(([h, k]) => <Link key={h} href={h} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium hover:bg-sand">{tr(lang, k)}</Link>)}</nav>{DEMO_MODE && <p className="mt-4 hidden rounded-2xl bg-butter/50 p-3 text-xs lg:block">{tr(lang, 'demo_banner')}</p>}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
