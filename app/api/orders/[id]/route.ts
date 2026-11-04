import { api, body } from '@/lib/api';
import { HttpError, getSession } from '@/lib/auth';
import { getDB, mutate } from '@/lib/db';
import { canView, customerReportsPayment } from '@/lib/orders';
// POST { action: 'report_payment' | 'request_return', token?, reason? }
export const POST = api<{ id: string }>(async (req, { params }) => {
  const { id } = await params; const b = await body<{ action?: string; token?: string; reason?: string }>(req); const u = await getSession();
  const o = getDB().orders.find((x) => x.id === id); if (!o || !canView(o, u?.id ?? null, b.token, u?.role)) throw new HttpError(404, 'not_found');
  if (b.action === 'report_payment') { customerReportsPayment(id, o.accessToken); return { ok: true }; }
  if (b.action === 'request_return') {
    const reason = String(b.reason ?? '').trim().slice(0, 300); if (reason.length < 3) throw new HttpError(400, 'validation:reason');
    mutate((db) => { const x = db.orders.find((y) => y.id === id)!; if (x.status !== 'delivered') throw new HttpError(409, 'not_delivered'); x.returnRequest = { at: new Date().toISOString(), reason, status: 'requested' }; x.status = 'return_requested'; x.timeline.push({ at: new Date().toISOString(), status: 'return_requested', text: reason }); });
    return { ok: true };
  }
  throw new HttpError(400, 'bad_action');
});
