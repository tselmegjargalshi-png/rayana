import { getDB } from '@/lib/db';
import { tr } from '@/lib/dict';
import { dateFmt, money } from '@/lib/format';
import { getLang } from '@/lib/i18n';
import { adminViewUser } from '@/lib/auth';
import { isSale } from '@/lib/stats';
export default async function Customers() {
  const db = getDB(); const lang = await getLang(); const L = (mn: string, en: string) => (lang === 'en' ? en : mn);
  const rows = db.users.filter((u) => u.role === 'customer').map((u) => ({ ...adminViewUser(u), orders: db.orders.filter((o) => o.userId === u.id), })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div><h1 className="text-3xl font-semibold">{tr(lang, 'a_customers')} <span className="text-base font-normal text-muted">({rows.length})</span></h1><p className="mt-2 text-xs text-muted">{L('Хүүхдийн профайлын мэдээлэл админд харагдахгүй.', 'Child profile details are never shown to admins.')}</p>
      <div className="card mt-4 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-sand text-left text-xs text-muted"><tr><th className="p-3">{L('Нэр', 'Name')}</th><th>{L('Имэйл', 'Email')}</th><th>{L('Утас', 'Phone')}</th><th>{L('Захиалга', 'Orders')}</th><th>{L('Нийт худалдан авалт', 'Total spent')}</th><th>{L('Бүртгүүлсэн', 'Joined')}</th></tr></thead><tbody>{rows.map((u) => <tr key={u.id} className="border-t border-line"><td className="p-3">{u.name}{u.demo && <span className="ml-2 text-[10px] text-muted">DEMO</span>}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.orders.length}</td><td>{money(u.orders.filter(isSale).reduce((s, o) => s + o.total, 0))}</td><td className="text-xs">{dateFmt(u.createdAt)}</td></tr>)}</tbody></table></div>
      <h2 className="mt-8 font-display text-xl font-semibold">{L('Мэдээний захиалагчид', 'Newsletter subscribers')} ({db.subscribers.length})</h2><ul className="mt-2 text-sm text-muted">{db.subscribers.slice(-10).map((s) => <li key={s.email}>{s.email} · {dateFmt(s.at)}</li>)}</ul></div>
  );
}
