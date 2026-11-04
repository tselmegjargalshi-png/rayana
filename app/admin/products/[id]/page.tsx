import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { getLang } from '@/lib/i18n';
import { loc } from '@/lib/format';
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = getDB(); const lang = await getLang(); const p = id === 'new' ? null : db.products.find((x) => x.id === id); if (id !== 'new' && !p) notFound();
  return (<div><h1 className="mb-6 text-3xl font-semibold">{p ? loc(p.name, lang) : lang === 'en' ? 'New product' : 'Шинэ бүтээгдэхүүн'}</h1><ProductForm product={p ?? null} categories={db.categories} settings={db.settings} collections={db.collections} /></div>);
}
