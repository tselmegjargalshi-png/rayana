import { DeliveryEditor } from '@/components/AdminForms';
import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { getLang } from '@/lib/i18n';
export default async function AdminDelivery() { const lang = await getLang(); return (<div><h1 className="mb-6 text-3xl font-semibold">{tr(lang, 'a_delivery')}</h1><DeliveryEditor settings={getDB().settings} /></div>); }
