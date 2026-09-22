import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

/** Writes require the EDIT_KEY; reads are open. Returns true when the caller may write. */
export function canWrite(req) {
  const key = process.env.EDIT_KEY;
  if (!key) return false; // no key configured = read-only site
  const sent = req.headers['x-edit-key'] || '';
  return typeof sent === 'string' && sent.length === key.length && sent === key;
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}

export function fail(res, status, message) {
  res.status(status).json({ error: message });
}
