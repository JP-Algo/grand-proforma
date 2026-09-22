import { canWrite } from './_db.mjs';

/** Lets the page check an edit key without writing anything. */
export default function handler(req, res) {
  res.status(200).json({ canWrite: canWrite(req), keyConfigured: Boolean(process.env.EDIT_KEY) });
}
