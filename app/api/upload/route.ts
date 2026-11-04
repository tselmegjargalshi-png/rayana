import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { api } from '@/lib/api';
import { HttpError, requireUser } from '@/lib/auth';
import { dataDir } from '@/lib/db';
const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
function sniff(b: Buffer): string | null { if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'; if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg'; if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'image/webp'; return null; }
export const POST = api(async (req) => {
  await requireUser(); const fd = await req.formData(); const f = fd.get('file'); if (!(f instanceof File)) throw new HttpError(400, 'no_file');
  if (f.size > 3 * 1024 * 1024) throw new HttpError(413, 'too_large'); const buf = Buffer.from(await f.arrayBuffer()); const mime = sniff(buf);
  if (!mime || !TYPES[mime]) throw new HttpError(415, 'bad_type');
  const name = `${randomBytes(10).toString('hex')}.${TYPES[mime]}`; const dir = path.join(dataDir, 'uploads'); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, name), buf);
  return { url: `/api/uploads/${name}` };
});
