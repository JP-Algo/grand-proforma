# 725 Grand Street — Proposed New Development

Zoning feasibility, massing studies A–D, floor plans, zoning deduction plans, parametric façade,
furnished interiors and the pro forma (sell-out, costs, 70% LTC returns, investor and developer)
for 725 Grand Street, Brooklyn — Block 2783 Lot 43, C4-4A, former Greenpoint/Williamsburg
Inclusionary Housing designated area — including a zoning lot merger with 727 Grand Street and
Inclusionary Housing certificates.

## Layout
- `src/page.html` — the page as authored (artifact content: no doctype/html/head wrapper).
- `public/index.html` — built by `npm run build`, which wraps `src/page.html` in a real HTML document.
  Serving the raw artifact source would put browsers in quirks mode and break sticky positioning.
- `api/` — Vercel serverless functions: `scenarios` (list/save/delete), `state` (autosaved inputs), `auth` (edit-key check).
- `scripts/init_db.mjs` — creates the `grand725` schema in Neon. Safe to re-run.

## Where values are saved
The page picks a backend at load:
1. **claude.ai artifact** — the artifact's own database (what the shared link uses).
2. **This site** — Neon Postgres through `/api`. Reads are public; writing needs the `x-edit-key` header, which the page asks for once and remembers.
3. **Anywhere else** (opening `public/index.html` from disk) — the browser's local storage.

## Environment variables (set in Vercel)
| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string (same project as the CRM; separate `grand725` schema) |
| `EDIT_KEY` | Shared secret needed to save scenarios. Without it the site is read-only. |

## Setup
```bash
npm install
node scripts/init_db.mjs ../CRM/.env   # create the grand725 schema
```
Deploy: push to Bitbucket, import the repo in Vercel (no build step; output is `public/`), add the two
environment variables.

## Iterations
Milestones are git tags (`git tag -l`); restore one with `git checkout <tag> -- public/index.html`.
The live working copy with comments is the claude.ai artifact: https://claude.ai/artifact/XEjoY4B3jVJkknZkYKCph7
