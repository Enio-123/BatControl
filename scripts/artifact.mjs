// Gera dist/batcontrol.html sem o esqueleto <html>/<head>/<body> (o Artifact adiciona o dele).
import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('dist/index.html', 'utf8');
s = s
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<\/html>\s*$/i, '')
  .replace(/<head>\s*/i, '')
  .replace(/<\/head>\s*/i, '')
  .replace(/<body>\s*/i, '')
  .replace(/<\/body>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '');
writeFileSync('dist/batcontrol.html', s);
console.log('ok', (s.length / 1024).toFixed(0), 'KB');
