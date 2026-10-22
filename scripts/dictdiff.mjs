// Confere se cada dicionário tem exatamente as chaves do português e os mesmos {parâmetros}.
import fs from 'node:fs';
const read = (l) => {
  const s = fs.readFileSync(`src/i18n/ui/${l}.ts`, 'utf8');
  return new Map([...s.matchAll(/^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => [m[1], m[2]]));
};
const pt = read('pt');
let bad = 0;
for (const l of process.argv.slice(2)) {
  const d = read(l);
  const missing = [...pt.keys()].filter((k) => !d.has(k));
  const extra = [...d.keys()].filter((k) => !pt.has(k));
  const params = [...pt.keys()].filter((k) => d.has(k)).filter((k) => {
    const p = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    return p(pt.get(k)) !== p(d.get(k));
  });
  bad += missing.length + extra.length + params.length;
  console.log(l, d.size, 'missing', missing, 'extra', extra, 'params', params);
}
process.exit(bad ? 1 : 0);
