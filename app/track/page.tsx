import { TrackForm } from '@/components/TrackForm';
import { getLang } from '@/lib/i18n';
import { tr } from '@/lib/dict';
export const metadata = { title: 'Захиалга хянах' };
export default async function Track() { const lang = await getLang(); return <div className="container-x py-14 text-center"><h1 className="text-4xl font-semibold">{tr(lang, 'track_title')}</h1><p className="mt-2 text-muted">{tr(lang, 'track_sub')}</p><TrackForm /></div>; }
