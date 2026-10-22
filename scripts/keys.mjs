// Lista as chaves de tradução usadas no código (estáticas) e compara com cada dicionário.
import fs from 'node:fs';
import path from 'node:path';
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!p.includes('i18n') && !p.includes('content/text')) walk(p); } else if (p.endsWith('.ts')) files.push(p); } };
walk('src');
const used = new Set();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\b(?:t|tr|tpt)\(\s*'([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/'(chk\.[a-zA-Z0-9]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/\['(quick\.[a-zA-Z]+)'/g)) used.add(m[1]);
}
const dict = (l) => { const s = fs.readFileSync(`src/i18n/ui/${l}.ts`, 'utf8'); return new Set([...s.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1])); };
const lang = process.argv[2] || 'pt';
const d = dict(lang);
const missing = [...used].filter((k) => !d.has(k)).sort();
console.log(`used ${used.size}, ${lang} has ${d.size}, missing ${missing.length}`);
if (process.argv[3] === 'list') console.log(missing.join('\n'));
