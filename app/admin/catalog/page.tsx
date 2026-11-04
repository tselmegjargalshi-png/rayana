import { CatalogEditor } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { getLang } from '@/lib/i18n';
export default async function AdminCatalog() { const lang = await getLang(); const db = getDB(); return (<div><h1 className="mb-6 text-3xl font-semibold">{tr(lang, 'a_catalog')}</h1><CatalogEditor categories={db.categories} settings={db.settings} /></div>); }
