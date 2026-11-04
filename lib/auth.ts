import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { dataDir, getDB, ready } from './db';
import type { User } from './types';

function secret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) return process.env.SESSION_SECRET;
  const f = path.join(dataDir, '.session_secret');
  try { return fs.readFileSync(f, 'utf8'); } catch { /* create */ }
  const s = randomBytes(32).toString('hex'); try { fs.mkdirSync(dataDir, { recursive: true }); fs.writeFileSync(f, s, { mode: 0o600 }); } catch { /* ephemeral */ } return s;
}
const COOKIE = 'ry_session';
const sign = (p: string) => createHmac('sha256', secret()).update(p).digest('base64url');
export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':'); if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex'); const b = scryptSync(pw, salt, 32); return a.length === b.length && timingSafeEqual(a, b);
}
export async function startSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ u: userId, e: Date.now() + 14 * 86400000 })).toString('base64url');
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 14 * 86400 });
}
export async function endSession() { (await cookies()).delete(COOKIE); }
export async function getSession(): Promise<User | null> {
  await ready();
  const raw = (await cookies()).get(COOKIE)?.value; if (!raw) return null;
  const [payload, sig] = raw.split('.'); if (!payload || !sig) return null;
  const expect = sign(payload); const a = Buffer.from(sig); const b = Buffer.from(expect); if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const { u, e } = JSON.parse(Buffer.from(payload, 'base64url').toString()); if (e < Date.now()) return null; return getDB().users.find((x) => x.id === u) ?? null; } catch { return null; }
}
export async function requireUser(): Promise<User> { const u = await getSession(); if (!u) throw new HttpError(401, 'login_required'); return u; }
export async function requireAdmin(): Promise<User> { const u = await requireUser(); if (u.role !== 'admin') throw new HttpError(403, 'forbidden'); return u; }
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const hits = new Map<string, { n: number; t: number }>();
export function rateLimit(key: string, max = 8, windowMs = 60000): boolean {
  const now = Date.now(); const h = hits.get(key); if (!h || now - h.t > windowMs) { hits.set(key, { n: 1, t: now }); return true; }
  h.n++; return h.n <= max;
}
/** Strip secrets and, for non owners, private child data. */
export function publicUser(u: User) { const { passHash, ...rest } = u; void passHash; return rest; }
export function adminViewUser(u: User) { const { passHash, children, addresses, wishlist, notifications, ...rest } = u; void passHash; return { ...rest, childCount: children.length, addressCount: addresses.length, wishlistCount: wishlist.length, notifications: undefined }; }
