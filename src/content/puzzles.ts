// Problemas no estilo chess.com: cada problema é gerado a partir de uma semente, tem uma
// nota (rating) e é conferido no simulador. Toda solução gerada é testada antes de aparecer.
import { t } from '../i18n';
import { MAT_H, MAT_W, ZONES, Zone } from '../sim/mat';
import { runProgram, RunResult } from '../sim/runner';
import { BODY, DEFAULT_CONFIG, Frame, ObjSpec, Pose, SENSOR_POS } from '../sim/world';
import type { Target } from '../three/viewer';
import { program } from './setup';

export type Dir = 'right' | 'up' | 'left' | 'down';

export interface Puzzle {
  /** Gerador e semente: o mesmo id sempre gera o mesmo problema. */
  id: string;
  gen: string;
  rating: number;
  kind: 'code' | 'choice';
  /** Chave do enunciado e parâmetros (o texto vem do idioma atual). */
  prompt: [string, Record<string, string | number>];
  start: Pose;
  targets: Target[];
  objects?: ObjSpec[];
  /** Código mostrado na pergunta (problemas de escolha). */
  code?: string;
  /** Alternativas (a primeira é a correta; a ordem é sorteada na tela). */
  options?: string[];
  starter?: string;
  solution: string;
  check?: (r: RunResult, code: string) => string | null;
}

// ---------- Sorteio com semente ----------

type Rng = () => number;
function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r: Rng, a: number, b: number, step = 1) => a + step * Math.floor(r() * (Math.floor((b - a) / step) + 1));
const pick = <T,>(r: Rng, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

// ---------- Geometria ----------

const rad = (d: number) => (d * Math.PI) / 180;
const norm180 = (a: number) => { let d = ((a % 360) + 360) % 360; if (d > 180) d -= 360; return d; };
const r1 = (x: number) => Math.round(x * 10) / 10;
/** Ponto a "ahead" mm para a frente e "left" mm para a esquerda do robô. */
const rel = (p: Pose, ahead: number, left: number) => ({
  x: p.x + ahead * Math.cos(rad(p.h)) - left * Math.sin(rad(p.h)),
  y: p.y + ahead * Math.sin(rad(p.h)) + left * Math.cos(rad(p.h)),
});
const MARGIN = 190; // espaço para o robô girar sem bater na borda
const inside = (p: { x: number; y: number }, m = MARGIN) => p.x >= m && p.x <= MAT_W - m && p.y >= m && p.y <= MAT_H - m;
const HEADINGS = [0, 90, 180, -90] as const;
export const dirOf = (h: number): Dir => (['right', 'up', 'left', 'down'] as const)[((Math.round(norm180(h) / 90) % 4) + 4) % 4];
const dirName = (h: number) => t(`pz.dir.${dirOf(h)}`);

const randomPose = (r: Rng, m = MARGIN): Pose => ({ x: int(r, m, MAT_W - m, 10), y: int(r, m, MAT_H - m, 10), h: pick(r, HEADINGS) });

const SIDE = 120;
const square = (c: { x: number; y: number }, side = SIDE): Target => ({ kind: 'rect', x: Math.round(c.x - side / 2), y: Math.round(c.y - side / 2), w: side, h: side });
const inTarget = (f: { x: number; y: number }, tg: Target) => f.x >= tg.x && f.x <= tg.x + tg.w && f.y >= tg.y && f.y <= tg.y + tg.h;
const sensorAt = (f: Frame) => rel(f, SENSOR_POS.x, SENSOR_POS.y);
const strip = (code: string) => code.replace(/#.*$/gm, '');
const count = (code: string, re: RegExp) => (strip(code).match(new RegExp(re.source, 'g')) ?? []).length;
const where = (f: Frame) => t('chk.where', { x: Math.round(f.x), y: Math.round(f.y) });
const first = (...xs: (string | null)[]) => xs.find((x) => x) ?? null;

const whereText = (p: Pose) => t('pz.where', { x: Math.round(p.x), y: Math.round(p.y), dir: dirName(p.h) });
const targetText = (c: { x: number; y: number }) => t('pz.target', { x: Math.round(c.x), y: Math.round(c.y) });

const reachCheck = (tg: Target) => (r: RunResult) => (inTarget(r.final, tg) ? null : `${t('pz.chk.target')} ${where(r.final)}`);

const BLANK = '# Write your commands here\n';

// ---------- Geradores ----------

interface Gen { id: string; min: number; max: number; make: (r: Rng) => Omit<Puzzle, 'id' | 'gen'> | null }

/** Alvo à frente (ou atrás) do robô. */
function straightGen(id: string, back: boolean): Gen {
  return {
    id, min: back ? 650 : 500, max: back ? 950 : 800,
    make: (r) => {
      const start = randomPose(r);
      const d = int(r, 250, 1400, back ? 10 : 50) * (back ? -1 : 1);
      const c = rel(start, d, 0);
      if (!inside(c, 140)) return null;
      const tg = square(c);
      return {
        rating: (back ? 700 : 550) + (Math.abs(d) % 100 ? 80 : 0) + (start.h !== 0 ? 60 : 0),
        kind: 'code', prompt: ['pz.reach', { where: whereText(start), target: targetText(c) }],
        start, targets: [tg], starter: program(BLANK), solution: program(`robot.straight(${d})`), check: reachCheck(tg),
      };
    },
  };
}

/** Alvo ao lado (giro de 90°) ou em L. */
function sideGen(id: string, ell: boolean): Gen {
  return {
    id, min: ell ? 850 : 700, max: ell ? 1150 : 1000,
    make: (r) => {
      const start = randomPose(r);
      // Sorteia o alvo dentro do tapete e mede à frente/ao lado no referencial do robô
      const c0 = { x: int(r, 160, MAT_W - 160, 10), y: int(r, 160, MAT_H - 160, 10) };
      const dx = c0.x - start.x, dy = c0.y - start.y;
      const a = ell ? Math.round((dx * Math.cos(rad(start.h)) + dy * Math.sin(rad(start.h))) / 10) * 10 : 0;
      const b = Math.round((-dx * Math.sin(rad(start.h)) + dy * Math.cos(rad(start.h))) / (ell ? 10 : 50)) * (ell ? 10 : 50);
      if ((ell && a < 150) || Math.abs(b) < 200) return null;
      const c = rel(start, a, b);
      if (!inside(c, 160) || !inside(rel(start, a, 0))) return null;
      const tg = square(c);
      const turn = b > 0 ? -90 : 90;
      const lines = [a ? `robot.straight(${a})` : '', `robot.turn(${turn})`, `robot.straight(${Math.abs(b)})`].filter(Boolean);
      return {
        rating: (ell ? 900 : 750) + (Math.abs(b) % 100 ? 60 : 0) + (start.h !== 0 ? 60 : 0),
        kind: 'code', prompt: ['pz.reach', { where: whereText(start), target: targetText(c) }],
        start, targets: [tg], starter: program(BLANK), solution: program(lines.join('\n')), check: reachCheck(tg),
      };
    },
  };
}

/** Diagonal: exatamente um turn() e um straight(). */
const diagGen: Gen = {
  id: 'diag', min: 1100, max: 1500,
  make: (r) => {
    const start = randomPose(r);
    const c0 = { x: int(r, 160, MAT_W - 160, 10), y: int(r, 160, MAT_H - 160, 10) };
    const dx = c0.x - start.x, dy = c0.y - start.y;
    const a = Math.round(dx * Math.cos(rad(start.h)) + dy * Math.sin(rad(start.h)));
    const b = Math.round(-dx * Math.sin(rad(start.h)) + dy * Math.cos(rad(start.h)));
    if (Math.hypot(a, b) < 400 || Math.abs(b) < 120 || Math.abs(a) < 120) return null;
    const c = rel(start, a, b);
    if (!inside(c, 160)) return null;
    const tg = square(c);
    const ang = r1(-(Math.atan2(b, a) * 180) / Math.PI);
    const dist = Math.round(Math.hypot(a, b));
    return {
      rating: 1150 + (Math.abs(ang) % 15 ? 120 : 0) + (start.h !== 0 ? 60 : 0),
      kind: 'code', prompt: ['pz.diag', { where: whereText(start), target: targetText(c) }],
      start, targets: [tg], starter: program(BLANK), solution: program(`robot.turn(${ang})\nrobot.straight(${dist})`),
      check: (res, code) => first(count(code, /\.turn\s*\(/) === 1 && count(code, /\.straight\s*\(/) === 1 ? null : t('chk.oneEach'), reachCheck(tg)(res)),
    };
  },
};

/** Onde o robô termina? (escolha) */
const predictGen: Gen = {
  id: 'predict', min: 700, max: 1300,
  make: (r) => {
    const start = { x: int(r, 500, 1800, 10), y: int(r, 350, 800, 10), h: pick(r, HEADINGS) };
    const n = int(r, 2, 4);
    const moves: string[] = [];
    for (let i = 0; i < n; i++) moves.push(i % 2 === 0 ? `robot.straight(${int(r, 1, 4) * 100 * (r() < 0.2 ? -1 : 1)})` : `robot.turn(${pick(r, [90, -90, 180])})`);
    const body = moves.join('\n');
    const f = simEnd(body, start);
    if (!f) return null;
    const fmt = (p: { x: number; y: number }) => `x = ${Math.round(p.x / 10) * 10}, y = ${Math.round(p.y / 10) * 10}`;
    const right = fmt(f);
    // Distratores: erros comuns (sinal do giro trocado, ignorar o último movimento, centímetros)
    const wrong = [
      body.replace(/turn\((-?)(\d+)\)/g, (_, s, d) => `turn(${s ? '' : '-'}${d})`),
      moves.slice(0, -1).join('\n') || 'robot.straight(0)',
      body.replace(/straight\((-?\d+)\)/g, (_, d) => `straight(${-Number(d)})`),
    ].map((b) => simEnd(b, start)).filter((p): p is Frame => !!p).map(fmt);
    const opts = [...new Set([right, ...wrong])].filter((o, i) => i === 0 || o !== right);
    while (opts.length < 4) {
      const p = { x: f.x + int(r, -4, 4) * 100, y: f.y + int(r, -4, 4) * 100 };
      const s = fmt(p);
      if (!opts.includes(s)) opts.push(s);
    }
    return {
      rating: 700 + (n - 2) * 150 + (start.h !== 0 ? 80 : 0),
      kind: 'choice', prompt: ['pz.predict', { where: whereText(start) }], code: body, options: opts.slice(0, 4),
      start, targets: [], solution: program(body),
    };
  },
};

function simEnd(body: string, start: Pose) {
  const res = runProgram(program(body), DEFAULT_CONFIG, start);
  return res.error || res.events.some((e) => e.kind === 'warn') ? null : res.final;
}

/** Para onde o robô aponta no fim? (escolha) */
const facingGen: Gen = {
  id: 'facing', min: 650, max: 1300,
  make: (r) => {
    const start = { x: 1180, y: 570, h: pick(r, HEADINGS) };
    const n = int(r, 2, 5);
    const turns = Array.from({ length: n }, () => pick(r, [90, -90, 180, -180, 270]));
    const end = turns.reduce((h, a) => h - a, start.h);
    const dirs: Dir[] = ['right', 'up', 'left', 'down'];
    const right = dirOf(end);
    return {
      rating: 650 + n * 90 + (turns.some((a) => Math.abs(a) > 180) ? 100 : 0) + (start.h !== 0 ? 60 : 0),
      kind: 'choice', prompt: ['pz.facing', { where: whereText(start) }],
      code: turns.map((a) => `robot.turn(${a})`).join('\n'),
      options: [right, ...dirs.filter((d) => d !== right)].map((d) => t(`pz.dir.${d}`)),
      start, targets: [], solution: program(turns.map((a) => `robot.turn(${a})`).join('\n')),
    };
  },
};

/** Programa com um erro para consertar. */
const fixGen: Gen = {
  id: 'fix', min: 1000, max: 1400,
  make: (r) => {
    const base = sideGen('x', true).make(r);
    if (!base) return null;
    const lines = base.solution.split('\n');
    const i0 = lines.findIndex((l) => /^robot\./.test(l));
    const body = lines.slice(i0);
    const kind = pick(r, ['sign', 'cm', 'neg'] as const);
    const bad = body.map((l) => l);
    if (kind === 'sign') { const i = bad.findIndex((l) => l.includes('turn(')); bad[i] = bad[i].replace(/turn\((-?)(\d+)\)/, (_, s, d) => `turn(${s ? '' : '-'}${d})`); }
    else if (kind === 'cm') { const i = bad.findIndex((l) => l.includes('straight(')); bad[i] = bad[i].replace(/straight\((-?\d+)\)/, (_, d) => `straight(${Math.round(Number(d) / 10)})`); }
    else { const i = bad.findIndex((l) => l.includes('straight(')); bad[i] = bad[i].replace(/straight\((-?\d+)\)/, (_, d) => `straight(${-Number(d)})`); }
    const starter = program(bad.join('\n'));
    // O código com erro não pode cair no alvo por acaso
    const wrong = runProgram(starter, DEFAULT_CONFIG, base.start);
    if (!wrong.error && base.check!(wrong, starter) === null) return null;
    return { ...base, rating: base.rating + 150 + (kind === 'cm' ? 0 : 50), prompt: ['pz.fix', base.prompt[1]], starter };
  },
};

/** Empurrar a caixa até o alvo. */
const pushGen: Gen = {
  id: 'push', min: 1150, max: 1600,
  make: (r) => {
    const start = { ...randomPose(r), h: pick(r, [0, 180] as const) };
    const gap = int(r, 150, 450, 10);
    const crateC = rel(start, BODY.front + 30 + gap, 0);
    const d = int(r, 200, 700, 10);
    const goal = { x: crateC.x + d * Math.cos(rad(start.h)), y: crateC.y };
    if (!inside(goal, 160) || !inside(crateC, 160)) return null;
    const tg = square(goal, 160);
    const objects: ObjSpec[] = [{ id: 'crate', x: Math.round(crateC.x), y: Math.round(crateC.y), size: 60, color: '#e0662a' }];
    // Calibra a distância com o próprio simulador
    let dist = gap + d;
    for (let k = 0; k < 3; k++) {
      const res = runProgram(program(`robot.straight(${dist})`), DEFAULT_CONFIG, start, { objects });
      const c = res.world.objects[0];
      const err = (goal.x - c.x) * Math.cos(rad(start.h));
      if (Math.abs(err) < 4) break;
      dist = Math.round(dist + err);
    }
    return {
      rating: 1200 + (start.h !== 0 ? 80 : 0) + (gap > 300 ? 60 : 0),
      kind: 'code', prompt: ['pz.push', { where: whereText(start), crate: t('pz.crateAt', { x: Math.round(crateC.x), y: Math.round(crateC.y) }), target: targetText(goal) }],
      start, targets: [tg], objects, starter: program(BLANK), solution: program(`robot.straight(${dist})`),
      check: (res) => (inTarget(res.world.objects[0], tg) ? null : t('pz.chk.crate')),
    };
  },
};

/** Polígono regular com for. */
const polygonGen: Gen = {
  id: 'polygon', min: 1100, max: 1500,
  make: (r) => {
    const n = pick(r, [3, 5, 6, 8] as const);
    const s = int(r, 150, 260, 10);
    const left = r() < 0.5;
    const start = { x: int(r, 800, 1500, 10), y: int(r, 400, 700, 10), h: pick(r, HEADINGS) };
    const turn = r1(360 / n) * (left ? -1 : 1);
    const sol = program(`for i in range(${n}):\n    robot.straight(${s})\n    robot.turn(${turn})`);
    return {
      rating: 1100 + (n === 5 || n === 8 ? 120 : 40) + (left ? 0 : 40),
      kind: 'code', prompt: ['pz.polygon', { n, s, side: t(left ? 'pz.toLeft' : 'pz.toRight') }],
      start, targets: [], starter: program(BLANK), solution: sol,
      check: (res, code) => {
        const base = res.world.bases[0];
        const total = base ? Math.abs(base.turn) : 0;
        return first(
          /\bfor\b/.test(strip(code)) ? null : t('chk.useFor'),
          total >= 340 && Math.hypot(res.final.x - start.x, res.final.y - start.y) <= 25 ? null : t('pz.chk.polygon', { n }),
          res.frames.some((f) => Math.hypot(f.x - start.x, f.y - start.y) > s * 0.8) ? null : t('pz.chk.polygon', { n }));
      },
    };
  },
};

/** Parar com o sensor sobre uma zona colorida. */
const colorGen: Gen = {
  id: 'color', min: 950, max: 1350,
  make: (r) => {
    const z = pick(r, ZONES);
    const zc = { x: z.x + z.w / 2, y: z.y + z.h / 2 };
    const start = { x: int(r, 230, z.x - 260, 10), y: Math.round(zc.y - SENSOR_POS.y), h: 0 };
    if (start.x > z.x - 260) return null;
    const between = ZONES.filter((o) => o !== z && o.x + o.w > start.x + SENSOR_POS.x && o.x < z.x && start.y + SENSOR_POS.y >= o.y && start.y + SENSOR_POS.y <= o.y + o.h).length
      + (z.y < 560 && z.x > 1240 && start.x + SENSOR_POS.x < 1240 ? 1 : 0);
    const color = z.color;
    return {
      rating: 950 + between * 120,
      kind: 'code', prompt: ['pz.color', { zone: t('zone.' + z.id) }],
      start, targets: [zoneTargetOf(z)], starter: program(BLANK),
      solution: program(`robot.drive(200, 0)\nwhile sensor.color() != Color.${color}:\n    wait(10)\nrobot.stop()`),
      check: (res, code) => {
        const s = sensorAt(res.final);
        return first(/\.(color|reflection)\s*\(/.test(strip(code)) ? null : t('chk.useSensor'),
          s.x >= z.x && s.x <= z.x + 70 && s.y >= z.y && s.y <= z.y + z.h ? null : t('pz.chk.color', { zone: t('zone.' + z.id) }));
      },
    };
  },
};
const zoneTargetOf = (z: Zone): Target => ({ kind: 'rect', x: z.x, y: z.y, w: z.w, h: z.h });

/** Chegar ao alvo dentro do tempo. */
const timeGen: Gen = {
  id: 'time', min: 1000, max: 1400,
  make: (r) => {
    const start = { x: 240, y: int(r, 220, 920, 10), h: 0 };
    const d = int(r, 1300, 1850, 10);
    const c = rel(start, d, 0);
    if (!inside(c, 140)) return null;
    const tg = square(c);
    const fast = runProgram(program(`robot.settings(straight_speed=450)\nrobot.straight(${d})`), DEFAULT_CONFIG, start);
    const slow = runProgram(program(`robot.straight(${d})`), DEFAULT_CONFIG, start);
    const limit = Math.ceil((fast.final.t + 700) / 1000);
    if (slow.final.t <= limit * 1000) return null;
    return {
      rating: 1050 + (d % 100 ? 60 : 0),
      kind: 'code', prompt: ['pz.time', { where: whereText(start), target: targetText(c), s: limit }],
      start, targets: [tg], starter: program(BLANK), solution: program(`robot.settings(straight_speed=450)\nrobot.straight(${d})`),
      check: (res) => first(reachCheck(tg)(res), res.final.t <= limit * 1000 ? null : t('chk.tooSlow', { s: (res.final.t / 1000).toFixed(1), max: limit })),
    };
  },
};

/** Linhas de turn() + straight() para ir de uma pose até um ponto; devolve também a nova pose. */
function goTo(from: Pose, to: { x: number; y: number }): [string[], Pose] {
  const want = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  const turn = r1(-norm180(want - from.h));
  const dist = Math.round(Math.hypot(to.x - from.x, to.y - from.y));
  const lines = [Math.abs(turn) >= 0.5 ? `robot.turn(${turn})` : '', `robot.straight(${dist})`].filter(Boolean);
  return [lines, { x: to.x, y: to.y, h: from.h - turn }];
}
const randomPoint = (r: Rng, m = 160) => ({ x: int(r, m, MAT_W - m, 10), y: int(r, m, MAT_H - m, 10) });
const angDiff = (a: number, b: number) => Math.abs(norm180(a - b));

/** Passar por um alvo e terminar no outro. */
const tourGen: Gen = {
  id: 'tour', min: 1350, max: 1700,
  make: (r) => {
    const start = randomPose(r);
    const a = randomPoint(r), b = randomPoint(r);
    if (Math.hypot(a.x - start.x, a.y - start.y) < 400 || Math.hypot(b.x - a.x, b.y - a.y) < 400) return null;
    const ta = square(a), tb = square(b);
    const [l1, p1] = goTo(start, a);
    const [l2] = goTo(p1, b);
    return {
      rating: 1400 + (start.h !== 0 ? 60 : 0) + (l1.length + l2.length > 3 ? 80 : 0),
      kind: 'code', prompt: ['pz.tour', { where: whereText(start), a: targetText(a), b: targetText(b) }],
      start, targets: [ta, tb], starter: program(BLANK), solution: program([...l1, ...l2].join('\n')),
      check: (res) => {
        const i = res.frames.findIndex((f) => inTarget(f, ta));
        return first(i >= 0 ? null : t('pz.chk.first'), reachCheck(tb)(res));
      },
    };
  },
};

/** Chegar ao alvo e terminar virado para um lado. */
const poseGen: Gen = {
  id: 'pose', min: 1200, max: 1550,
  make: (r) => {
    const start = randomPose(r);
    const c = randomPoint(r, 200);
    if (Math.hypot(c.x - start.x, c.y - start.y) < 400) return null;
    const h = pick(r, HEADINGS);
    const tg = square(c);
    const [l1, p1] = goTo(start, c);
    const last = r1(-norm180(h - p1.h));
    const lines = [...l1, Math.abs(last) >= 0.5 ? `robot.turn(${last})` : ''].filter(Boolean);
    if (lines.length < 3) return null;
    return {
      rating: 1250 + (start.h !== 0 ? 60 : 0) + (Math.abs(last) % 90 ? 120 : 40),
      kind: 'code', prompt: ['pz.pose', { where: whereText(start), target: targetText(c), dir: dirName(h) }],
      start, targets: [tg], starter: program(BLANK), solution: program(lines.join('\n')),
      check: (res) => first(reachCheck(tg)(res), angDiff(res.final.h, h) <= 8 ? null : t('pz.chk.facing', { dir: dirName(h) })),
    };
  },
};

export const GENS: Gen[] = [
  straightGen('ahead', false), straightGen('back', true), sideGen('side', false), sideGen('ell', true),
  diagGen, predictGen, facingGen, fixGen, pushGen, polygonGen, colorGen, timeGen, tourGen, poseGen,
];

/** Gera um problema; devolve null se a semente não der um problema válido. */
export function makePuzzle(gen: string, seed: number): Puzzle | null {
  const g = GENS.find((x) => x.id === gen);
  if (!g) return null;
  // A mesma semente sempre dá a mesma sequência de tentativas, então o id continua reproduzível.
  const rng = mulberry32(seed);
  for (let i = 0; i < 12; i++) {
    const p = g.make(rng);
    if (!p) continue;
    const puzzle: Puzzle = { ...p, id: `${gen}:${seed}`, gen, rating: Math.round(p.rating / 10) * 10 };
    if (puzzle.kind === 'code' && !validSolution(puzzle)) continue;
    return puzzle;
  }
  return null;
}

/** A solução precisa passar na própria correção, sem erro e sem encostar na borda. */
export function validSolution(p: Puzzle) {
  const res = runProgram(p.solution, DEFAULT_CONFIG, p.start, { objects: p.objects });
  if (res.error || res.timeUp || res.events.some((e) => e.kind === 'warn')) return false;
  return p.check!(res, p.solution) === null && (!p.starter || p.check!(runProgram(p.starter, DEFAULT_CONFIG, p.start, { objects: p.objects }), p.starter) !== null);
}

/** Escolhe um problema perto da nota do jogador. */
export function nextPuzzle(rating: number, avoid: string[] = [], rnd = Math.random): Puzzle {
  for (let tries = 0; tries < 60; tries++) {
    const near = GENS.filter((g) => rating >= g.min - 250 && rating <= g.max + 250);
    const g = pick(rnd, near.length ? near : GENS);
    const seed = Math.floor(rnd() * 2 ** 31);
    const p = makePuzzle(g.id, seed);
    if (!p || avoid.includes(p.id)) continue;
    if (Math.abs(p.rating - rating) > 350 && tries < 40) continue;
    return p;
  }
  return makePuzzle('ahead', 1)!;
}

/** Elo: quanto a nota muda ao acertar (ou errar) um problema. */
export function eloDelta(player: number, puzzle: number, solved: boolean, played: number) {
  const k = played < 20 ? 40 : 24;
  const expected = 1 / (1 + 10 ** ((puzzle - player) / 400));
  return Math.round(k * ((solved ? 1 : 0) - expected));
}

