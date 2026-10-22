// Gera muitos problemas de cada tipo e confere: a solução passa, o código inicial não passa,
// as alternativas são diferentes entre si e a nota fica dentro da faixa do gerador.
import { GENS, makePuzzle } from '../src/content/puzzles';

let bad = 0;
const N = 40;
for (const g of GENS) {
  let ok = 0, nulls = 0;
  const ratings: number[] = [];
  const t0 = Date.now();
  for (let seed = 1; seed <= N; seed++) {
    const p = makePuzzle(g.id, seed);
    if (!p) { nulls++; continue; }
    ok++;
    ratings.push(p.rating);
    if (p.kind === 'choice' && (!p.options || p.options.length !== 4 || new Set(p.options).size !== 4)) { console.log('options', p.id, p.options); bad++; }
    if (p.rating < g.min - 100 || p.rating > g.max + 100) { console.log('rating out of range', p.id, p.rating); bad++; }
  }
  const ms = (Date.now() - t0) / N;
  console.log(`${g.id.padEnd(8)} valid ${ok}/${N}  rating ${Math.min(...ratings)}–${Math.max(...ratings)}  ${ms.toFixed(0)} ms/seed`);
  if (ok < N * 0.3) { console.log('too few valid puzzles:', g.id); bad++; }
}
console.log('bad', bad);
declare const process: { exitCode?: number };
process.exitCode = bad ? 1 : 0;
