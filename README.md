# 725 Grand Street — Proposed New Development

Zoning feasibility, massing studies, floor plans, parametric façade, interiors and pro forma for
725 Grand Street, Brooklyn (Block 2783 Lot 43, C4-4A, former IH designated area), including a
zoning lot merger with 727 Grand Street and IH certificates.

- `site/index.html` — the whole presentation (single file; three.js from cdnjs).
- Live working copy (with comments + saved scenarios): https://claude.ai/artifact/XEjoY4B3jVJkknZkYKCph7
- Saved scenarios / autosave only work inside claude.ai (artifact db). Opened locally or on another
  host the page shows "Saving unavailable" — plan: browser storage or Neon + Vercel function.

## Iterations
Each milestone is a git tag (`git tag -l`). Restore one with `git checkout <tag> -- site/index.html`.

## Later
- Bitbucket repo (id3d-team) + static Vercel deploy (`vercel.json` → `site/`), same as st-nicks-ih-map.
- Shared scenarios on Neon Postgres.
