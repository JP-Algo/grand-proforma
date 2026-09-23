/**
 * The page is authored as artifact content (no <!doctype>, <html>, <head> or <body>),
 * because claude.ai wraps it at publish time. Served raw on the web that means quirks
 * mode, which breaks sticky positioning among other things. This wraps it for the site.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/page.html', import.meta.url), 'utf8');
const title = (src.match(/<title>([^<]*)<\/title>/) || [, '725 Grand Street'])[1];
const head = src.slice(0, src.indexOf('<div class="wrap">'));
const body = src.slice(src.indexOf('<div class="wrap">'));

writeFileSync(new URL('../public/index.html', import.meta.url), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Zoning analysis, massing studies and pro forma for 725 Grand Street, Brooklyn.">
${head.trim()}
<style>
  /* the pieces claude.ai's wrapper supplies */
  html,body{margin:0}
  body{color-scheme:light dark;font:14px system-ui,sans-serif}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
${body}
</body>
</html>
`);
console.log(`built public/index.html — ${title}`);
