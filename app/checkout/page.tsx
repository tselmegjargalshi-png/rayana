import { CheckoutView } from '@/components/CheckoutView';
import { getSession } from '@/lib/auth';
import { DEMO_MODE, getDB } from '@/lib/db';
import { loc } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { DISTRICTS } from '@/lib/seed';
export const metadata = { title: 'Захиалах' };
export default async function Checkout() {
  const u = await getSession(); const S = getDB().settings; const lang = await getLang();
  return <CheckoutView user={u ? { name: u.name, email: u.email, phone: u.phone, addresses: u.addresses } : null} districts={DISTRICTS} zones={S.zones.filter((z) => z.active)} pickupEnabled={S.pickup.enabled} pickupAddress={loc(S.pickup.address, lang)} demo={DEMO_MODE} />;
}
