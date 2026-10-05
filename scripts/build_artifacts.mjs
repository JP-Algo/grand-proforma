/**
 * Builds the claude.ai artifact versions of /deck and /projections into artifacts/.
 * claude.ai wraps a published page in its own doctype/head/body, and its frame cannot
 * print, so the wrapper and the "Save as PDF" button are stripped. The pro forma engine
 * ships next to each page as study.html (a copy of public/index.html); the pages use it
 * when present and fall back to the site's main page on Vercel.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

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
  writeFileSync(new URL(name, out), s);
}

toArtifact('deck.html');
toArtifact('projections.html');
copyFileSync(new URL('../public/index.html', import.meta.url), new URL('study.html', out));
console.log('built artifacts/deck.html, artifacts/projections.html, artifacts/study.html');
