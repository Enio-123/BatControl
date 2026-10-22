// Confere se todos os idiomas têm o conteúdo completo: textos das lições e da referência,
// a mesma estrutura do inglês e a tradução de todos os comentários usados nos programas.
// @ts-expect-error: tipos do Node não estão instalados; o script roda com tsx.
import { readFileSync } from 'node:fs';
import { UNITS } from '../src/content/lessons';
import { TOPICS, GROUPS } from '../src/content/reference';
import { CONTENT, commentsIn } from '../src/content/text';

const en = CONTENT.en;
let bad = 0;
const fail = (m: string) => { console.log(m); bad++; };

// Comentários de todos os programas: exercícios, exemplos da referência e o código da aba Simular.
const codes: string[] = [];
for (const u of UNITS) for (const l of u.lessons) for (const ex of l.exercises) {
  if (ex.kind === 'code') codes.push(ex.starter, ex.solution);
  if (ex.kind === 'fill' || (ex.kind === 'choice' && ex.code)) codes.push(ex.code!);
  if (ex.kind === 'order') codes.push(ex.lines.join('\n'));
}
for (const tp of TOPICS) codes.push(tp.example);
const sim = readFileSync(new URL('../src/ui/simtab.ts', import.meta.url), 'utf8');
codes.push(...[...sim.matchAll(/`([^`]*)`/g)].map((m) => m[1]).filter((s) => /robot\.|left_arm|right_arm/.test(s)));
const comments = new Set(codes.flatMap(commentsIn));

for (const [lang, c] of Object.entries(CONTENT)) {
  if (lang === 'en') continue;
  if (c === en) { fail(`${lang}: still uses the English content`); continue; }
  for (const g of GROUPS) if (!c.groups[g]) fail(`${lang}: group ${g}`);
  for (const tp of TOPICS) {
    const a = c.topics[tp.id], b = en.topics[tp.id];
    if (!a) { fail(`${lang}: topic ${tp.id}`); continue; }
    for (const k of ['params', 'tips', 'mistakes', 'returns'] as const)
      if (!!a[k] !== !!b[k] || (Array.isArray(b[k]) && (a[k] as unknown[]).length !== (b[k] as unknown[]).length)) fail(`${lang}: topic ${tp.id}.${k}`);
  }
  for (const u of UNITS) {
    if (!c.units[u.id]) fail(`${lang}: unit ${u.id}`);
    for (const l of u.lessons) {
      const a = c.lessons[l.id], b = en.lessons[l.id];
      if (!a) { fail(`${lang}: lesson ${l.id}`); continue; }
      if (a.ex.length !== l.exercises.length) fail(`${lang}: lesson ${l.id} has ${a.ex.length} exercises`);
      a.ex.forEach((e, i) => {
        const f = b.ex[i];
        if ((e.options?.length ?? 0) !== (f.options?.length ?? 0)) fail(`${lang}: ${l.id}#${i} options`);
        for (const k of ['explain', 'hint'] as const) if (!!e[k] !== !!f[k]) fail(`${lang}: ${l.id}#${i}.${k}`);
      });
    }
  }
  for (const cm of comments) if (!c.comments[cm]) fail(`${lang}: comment "${cm}"`);
  for (const k of Object.keys(c.comments)) if (!comments.has(k)) fail(`${lang}: unused comment "${k}"`);
}
console.log(`${comments.size} comments, bad ${bad}`);
declare const process: { exitCode?: number };
process.exitCode = bad ? 1 : 0;
