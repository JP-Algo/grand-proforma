import { getSql, canWrite, readBody, fail, noDb } from './_db.mjs';

export default async function handler(req, res) {
  try {
    const sql = getSql();
    if (!sql) return noDb(res);
    if (req.method === 'GET') {
      const rows = await sql`select id, name, data, saved_at from grand725.scenarios order by saved_at desc limit 200`;
      return res.status(200).json({ scenarios: rows.map(r => ({ id: r.id, name: r.name, savedAt: r.saved_at, ...r.data })) });
    }

    if (!canWrite(req)) return fail(res, 401, 'An edit key is required to change scenarios.');

    if (req.method === 'POST') {
      const body = readBody(req);
      const name = String(body.name || '').trim().slice(0, 60);
      if (!name) return fail(res, 400, 'Name the scenario first.');
      const id = String(body.id || '').trim() || 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const { values, scheme, mini } = body;
      if (!values || typeof values !== 'object') return fail(res, 400, 'Missing values.');
      await sql`
        insert into grand725.scenarios (id, name, data, saved_at)
        values (${id}, ${name}, ${JSON.stringify({ values, scheme, mini })}::jsonb, now())
        on conflict (id) do update set name = excluded.name, data = excluded.data, saved_at = now()`;
      return res.status(200).json({ id, name });
    }

    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || readBody(req).id || '');
      if (!id) return fail(res, 400, 'Missing id.');
      await sql`delete from grand725.scenarios where id = ${id}`;
      return res.status(200).json({ id });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return fail(res, 405, 'Method not allowed.');
  } catch (e) {
    return fail(res, 500, e.message || 'Database error.');
  }
}
