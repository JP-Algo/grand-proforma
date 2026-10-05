/**
 * Builds the claude.ai artifact versions of /deck and /projections into artifacts/.
 * claude.ai wraps a published page in its own doctype/head/body, and its frame cannot
 * print, so the wrapper and the "Save as PDF" button are stripped. The pro forma engine
 * (public/index.html) is embedded in each page as base64 (#study-src) and loaded into the
 * hidden frame with srcdoc, which works inside the artifact sandbox; study.html is also
 * written for publishing alongside. On Vercel the pages fall back to the site's main page.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Bundle the last COMMITTED study, not the working copy: other sessions edit src/page.html and
// public/index.html in this same folder, and half-finished edits must not ship in an artifact.
const study = execFileSync('git', ['show', 'HEAD:public/index.html'], { cwd: new URL('..', import.meta.url), maxBuffer: 64 << 20 });
if (!study.includes('window.G725')) throw new Error('public/index.html has no G725 hook; run npm run build');
const embedded = `<script type="application/octet-stream" id="study-src">${study.toString('base64')}</script>
`;

// The pages take every value from the study's saved scenario named "Deck". Artifacts cannot reach the site's
// database, so the newest "Deck" scenario is fetched here and embedded; rebuild after it is updated.
const SITE = process.env.SITE || 'https://grand-proforma.vercel.app';
const list = await fetch(SITE + '/api/scenarios', { cache: 'no-store' }).then(r => r.json()).then(j => j.scenarios || []);
const deck = list.filter(x => String(x.name || '').trim().toLowerCase() === 'deck' && x.values)
  .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))[0];
if (!deck) throw new Error('No scenario named "Deck" on ' + SITE + '; save one in the study first');
const scenarioTag = `<script type="application/json" id="deck-scenario">${JSON.stringify(deck).replace(/</g, '\u003c')}</script>
`;

const out = new URL('../artifacts/', import.meta.url);
mkdirSync(out, { recursive: true });

function toArtifact(name) {
  let s = readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
  s = s.replace(/^<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '')
       .replace(/<meta charset="utf-8">\s*/i, '')
       .replace(/<meta name="viewport"[^>]*>\s*/i, '')
       .replace(/<\/head>\s*<body>\s*/i, '\n')
       .replace(/\s*<\/body>\s*<\/html>\s*$/i, '\n')
       .replace(/\s*<button id="print"[^>]*>[^<]*<\/button>/, '');
  if (/<html|<body|<\/head>/i.test(s)) throw new Error(`${name}: document wrapper not fully stripped`);
  s = s.replace('<iframe id="engine"', embedded + scenarioTag + '<iframe id="engine"');
  writeFileSync(new URL(name, out), s);
}

toArtifact('deck.html');
toArtifact('projections.html');
writeFileSync(new URL('study.html', out), study);
console.log(`built artifacts/deck.html, artifacts/projections.html, artifacts/study.html (Deck scenario ${deck.id}, saved ${deck.savedAt})`);
