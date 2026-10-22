// Executa um programa Pybricks no simulador e devolve a gravação completa.
import { t as tr } from '../i18n';
import { Interpreter, PyError } from '../interp/interpreter';
import { inBase } from './mat';
import { makeModules } from './pybricks';
import { Frame, MATCH_MS, ObjSpec, Pose, RobotConfig, SimEvent, TimeUp, World, WorldOptions } from './world';

export interface RunResult {
  frames: Frame[];
  events: SimEvent[];
  error: { type: string; message: string; line?: number } | null;
  timeUp: boolean;
  final: Frame;
  /** Leituras úteis para corrigir desafios. */
  world: World;
  calls: Set<string>;
}

const MAX_STEPS = 6_000_000;

export function runProgram(code: string, config: RobotConfig, start: Pose, opts: WorldOptions & { timeLimit?: number } = {}): RunResult {
  const world = new World(config, start, opts);
  if (opts.timeLimit !== undefined) world.limit = opts.timeLimit;
  const modules = makeModules(world);
  let steps = 0;
  const interp = new Interpreter({
    tick(line) {
      world.line = line;
      world.tickInstruction();
      if (++steps > MAX_STEPS) throw new PyError('RuntimeError', tr('e.tooMany'));
    },
    print(text) {
      world.log('print', text.replace(/\n$/, ''));
    },
    importModule(name) {
      return modules[name];
    },
  });
  let error: RunResult['error'] = null;
  let timeUp = false;
  try {
    interp.run(code);
  } catch (e) {
    if (e instanceof TimeUp) timeUp = true;
    else if (e instanceof PyError) error = { type: e.pyType, message: e.detail, line: e.line };
    else {
      console.error(e);
      error = { type: tr('e.internal'), message: String((e as Error)?.message ?? e), line: interp.line };
    }
  }
  if (!timeUp) {
    try { world.finish(); } catch { /* fim */ }
  }
  return {
    frames: world.frames,
    events: world.events,
    error,
    timeUp,
    final: world.frames[world.frames.length - 1],
    world,
    calls: new Set(),
  };
}

// ---------- Partida completa (várias saídas da base) ----------

export interface MatchStep {
  name: string;
  code: string;
  config: RobotConfig;
  start: Pose;
}

export interface MatchSegment {
  name: string;
  /** Início e fim da saída no relógio da partida (ms). */
  t0: number;
  t1: number;
  /** Começo da troca de anexo seguinte (robô parado na base). */
  handlingEnd: number;
  endedInBase: boolean;
  error: RunResult['error'];
  config: RobotConfig;
}

export interface MatchResult extends RunResult {
  segments: MatchSegment[];
  tokensLost: number;
  /** Saídas que não couberam nos 2:30. */
  skipped: string[];
}

/**
 * Roda as saídas em sequência, como numa partida: entre uma saída e outra a equipe pega o robô,
 * troca o anexo (tempo `handling`) e solta de novo. Os objetos do tapete continuam onde ficaram.
 * Se o robô terminar fora da base, a equipe perde um Precision Token ao pegá-lo.
 */
export function runMatch(steps: MatchStep[], handling: number, opts: WorldOptions = {}): MatchResult {
  const frames: Frame[] = [];
  const events: SimEvent[] = [];
  const segments: MatchSegment[] = [];
  const skipped: string[] = [];
  let clock = 0;
  let objects: ObjSpec[] | undefined = opts.objects;
  let tokensLost = 0;
  let last: RunResult | null = null;
  let timeUp = false;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (clock >= MATCH_MS) { skipped.push(s.name); continue; }
    const r = runProgram(s.code, s.config, s.start, { ...opts, objects, timeLimit: MATCH_MS - clock, realistic: opts.realistic ? { seed: opts.realistic.seed + i * 7919 } : null });
    last = r;
    for (const f of r.frames) frames.push({ ...f, t: f.t + clock, line: 0 });
    for (const e of r.events) events.push({ ...e, t: e.t + clock, text: `${s.name}: ${e.text}` });
    if (r.error) events.push({ t: clock + r.final.t, kind: 'warn', text: `${s.name}: ${r.error.type}: ${r.error.message}` });
    const t1 = clock + r.final.t;
    const ended = inBase(r.final.x, r.final.y);
    if (!ended && i < steps.length - 1) tokensLost++;
    const handlingEnd = i < steps.length - 1 ? Math.min(MATCH_MS, t1 + handling) : t1;
    segments.push({ name: s.name, t0: clock, t1, handlingEnd, endedInBase: ended, error: r.error, config: s.config });
    objects = r.world.objects.map((o) => ({ id: o.id, x: o.x, y: o.y, size: o.size, color: o.color, rot: o.rot }));
    if (r.timeUp || t1 >= MATCH_MS) { timeUp = true; clock = MATCH_MS; continue; }
    // Robô parado enquanto a equipe troca o anexo: um quadro no fim da troca
    if (i < steps.length - 1) {
      const f = frames[frames.length - 1];
      frames.push({ ...f, t: handlingEnd });
      clock = handlingEnd;
    } else clock = t1;
  }
  const final = frames[frames.length - 1] ?? { t: 0, x: steps[0]?.start.x ?? 0, y: steps[0]?.start.y ?? 0, h: steps[0]?.start.h ?? 0, wl: 0, wr: 0, al: 0, ar: 0, line: 0, light: null };
  return {
    frames, events, error: null, timeUp, final, world: last!.world, calls: new Set(),
    segments, tokensLost, skipped,
  };
}
