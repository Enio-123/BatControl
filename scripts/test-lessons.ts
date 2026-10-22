import { UNITS } from '../src/content/lessons';
import { TOPICS } from '../src/content/reference';
import { START } from '../src/content/setup';
import { runProgram } from '../src/sim/runner';
import { DEFAULT_CONFIG } from '../src/sim/world';
let bad = 0;
for (const u of UNITS) for (const l of u.lessons) for (const [i, ex] of l.exercises.entries()) {
  if (ex.kind !== 'code') continue;
  // Mesma configuração que a aba Trilha usa ao rodar o exercício.
  const config = { ...structuredClone(DEFAULT_CONFIG), attachments: ex.attachments ?? { left: 'none' as const, right: 'none' as const } };
  const opts = { objects: ex.objects, realistic: ex.realistic !== undefined ? { seed: ex.realistic } : null };
  const r = runProgram(ex.solution, config, ex.start ?? START, opts);
  const msg = r.error ? `${r.error.type}: ${r.error.message} @${r.error.line}` : ex.check(r, ex.solution);
  const r2 = runProgram(ex.starter, config, ex.start ?? START, opts);
  const msg2 = r2.error ? `${r2.error.type}: ${r2.error.message}` : ex.check(r2, ex.starter);
  console.log(`${l.id}#${i} solution: ${msg ?? 'OK'} (t=${(r.final.t/1000).toFixed(1)}s) | starter: ${msg2 ?? 'PASSES(!)'}`);
  if (msg || !msg2) bad++;
}
for (const t of TOPICS) {
  const r = runProgram(t.example, DEFAULT_CONFIG, t.start ?? START);
  if (r.error || r.events.some(e => e.kind === 'warn')) { console.log('REF', t.id, r.error, r.events.filter(e=>e.kind==='warn')); bad++; }
}
console.log('bad', bad);
declare const process: { exitCode?: number };
process.exitCode = bad ? 1 : 0;
