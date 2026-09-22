import { getSql, canWrite, readBody, fail, noDb } from './_db.mjs';

const MAX_ROWS = 300;              // keep a public write path from filling the database
const MAX_BODY = 40 * 1024;        // a scenario is a few hundred values

export default async function handler(req, res) {
  try {
    const sql = getSql();
    if (!sql) return noDb(res);

    if (req.method === 'GET') {
      const rows = await sql`select id, name, data, saved_at from grand725.scenarios order by saved_at desc limit 300`;
      return res.status(200).json({ scenarios: rows.map(r => ({ id: r.id, name: r.name, savedAt: r.saved_at, ...r.data })) });
    }

    const editor = canWrite(req);

    if (req.method === 'POST') {
      const body = readBody(req);
      const name = String(body.name || '').trim().slice(0, 60);
      const { values, scheme, mini } = body;
      if (!name) return fail(res, 400, 'Name the scenario first.');
      if (!values || typeof values !== 'object') return fail(res, 400, 'Missing values.');

      const payload = JSON.stringify({ values, scheme, mini, origin: editor ? 'editor' : 'draft' });
      if (payload.length > MAX_BODY) return fail(res, 413, 'That scenario is too large to save.');

      const wanted = String(body.id || '').trim();
      // Anyone may add a new draft. Changing a saved scenario in place needs the edit key.
      if (wanted && !editor) return fail(res, 401, 'Saving over an existing scenario needs the edit key. Use "Save as new scenario" instead.');

      if (!editor) {
        const [{ count }] = await sql`select count(*)::int as count from grand725.scenarios`;
        if (count >= MAX_ROWS) return fail(res, 507, 'The scenario list is full. Ask the owner to clear out old drafts.');
      }

      const id = wanted || 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      await sql`
        insert into grand725.scenarios (id, name, data, saved_at)
        values (${id}, ${name}, ${payload}::jsonb, now())
        on conflict (id) do update set name = excluded.name, data = excluded.data, saved_at = now()`;
      return res.status(200).json({ id, name, origin: editor ? 'editor' : 'draft' });
    }

    if (req.method === 'DELETE') {
      if (!editor) return fail(res, 401, 'Deleting a scenario needs the edit key.');
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
