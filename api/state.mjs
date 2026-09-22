import { getSql, canWrite, readBody, fail, noDb } from './_db.mjs';

/** The autosaved working set of inputs — one row, shared by everyone who can edit. */
export default async function handler(req, res) {
  try {
    const sql = getSql();
    if (!sql) return noDb(res);
    if (req.method === 'GET') {
      const rows = await sql`select data, updated_at from grand725.working_state where id = 'default'`;
      if (!rows.length) return res.status(200).json({ state: null });
      return res.status(200).json({ state: rows[0].data, updatedAt: rows[0].updated_at });
    }

    if (!canWrite(req)) return fail(res, 401, 'An edit key is required to save.');

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = readBody(req);
      if (!body.values || typeof body.values !== 'object') return fail(res, 400, 'Missing values.');
      await sql`
        insert into grand725.working_state (id, data, updated_at)
        values ('default', ${JSON.stringify(body)}::jsonb, now())
        on conflict (id) do update set data = excluded.data, updated_at = now()`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, POST');
    return fail(res, 405, 'Method not allowed.');
  } catch (e) {
    return fail(res, 500, e.message || 'Database error.');
  }
}
