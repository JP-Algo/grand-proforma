import { neon } from '@neondatabase/serverless';

let _sql = null;

/** Lazy connection so a missing DATABASE_URL becomes a clear message, not a crash. */
export function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

/** Writes require the EDIT_KEY; reads are open. Returns true when the caller may write. */
export function canWrite(req) {
  const key = process.env.EDIT_KEY;
  if (!key) return false; // no key configured = read-only site
  const sent = (req.headers && req.headers['x-edit-key']) || '';
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

export function noDb(res) {
  fail(res, 503, 'The site has no DATABASE_URL configured, so saving is off. Add it in the Vercel project settings and redeploy.');
}
