import fs from 'node:fs';
import path from 'node:path';
import { buildSeed } from './seed';
import type { DB } from './types';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
export const dataDir = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/rayana' : path.join(process.cwd(), '.data'));
const file = path.join(dataDir, 'rayana.json');
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseEnabled = Boolean(SB_URL && SB_KEY);
const g = globalThis as unknown as { __rayanaDB?: DB; __rayanaHydrated?: boolean };

function read(): DB {
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(file)) { try { return JSON.parse(fs.readFileSync(file, 'utf8')) as DB; } catch { fs.renameSync(file, file + '.corrupt.' + Date.now()); } }
  const db = buildSeed(); write(db); return db;
}
function write(db: DB) {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, file);
  if (supabaseEnabled) void fetch(`${SB_URL}/rest/v1/rayana_state?on_conflict=id`, { method: 'POST', headers: { apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ id: 1, state: db, updated_at: new Date().toISOString() }) }).catch(() => {});
}
/** Optional: pull the persisted state from Supabase once per server instance (experimental). */
export async function ready() {
  if (!supabaseEnabled || g.__rayanaHydrated) return; g.__rayanaHydrated = true;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rayana_state?id=eq.1&select=state`, { headers: { apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}` }, cache: 'no-store' });
    const rows = (await r.json()) as { state: DB }[];
    if (rows?.[0]?.state) { g.__rayanaDB = rows[0].state; fs.mkdirSync(dataDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(rows[0].state)); }
  } catch { /* fall back to local state */ }
}
export function getDB(): DB { if (!g.__rayanaDB) g.__rayanaDB = read(); return g.__rayanaDB; }
/** Run a mutation on a cloned copy; commit + persist only if it does not throw. */
export function mutate<T>(fn: (db: DB) => T): T {
  const cur = getDB(); const draft = structuredClone(cur); const out = fn(draft);
  g.__rayanaDB = draft; write(draft); return out;
}
export function resetDemo() { const db = buildSeed(); g.__rayanaDB = db; write(db); return db; }
export const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
