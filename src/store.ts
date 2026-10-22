// Progresso, preferências, programas e pontuações salvos neste navegador.
import { DEFAULT_CONFIG, RobotConfig } from './sim/world';
import type { Lang } from './i18n';

export interface Progress {
  xp: number;
  done: Record<string, { at: string; perfect: boolean }>;
  streak: { last: string | null; count: number };
  /** Exercícios errados, para a revisão ("lessonId:índice"). */
  mistakes: string[];
}

export type Theme = 'system' | 'light' | 'dark';

export interface Prefs {
  lang: Lang | null;
  theme: Theme;
  haptics: boolean;
  /** Mostra o rastro da rodada anterior na simulação. */
  ghost: boolean;
  /** Física com escorregamento das rodas e variação entre rodadas. */
  realistic: boolean;
  /** Tapete usado na aba Simular. */
  mat: 'training' | 'photo';
  /** Preset de objetos de missão na aba Simular. */
  objects: string;
  /** Editor preferido. */
  editor: 'python' | 'blocks';
}

export interface SavedProgram { id: string; name: string; code: string; updated: number }

export interface ScoreRun {
  id: string;
  at: number;
  total: number;
  gp: number | null;
  note: string;
  answers: Record<string, number>;
}

/** Problemas: nota estilo Elo, sequência de acertos e histórico recente. */
export interface PuzzleStats {
  rating: number;
  best: number;
  played: number;
  solved: number;
  streak: number;
  bestStreak: number;
  history: { id: string; rating: number; ok: boolean; delta: number; at: number }[];
}

export interface MatchRun { programId: string; left: 'none' | 'claw'; right: 'none' | 'claw'; base: 1 | 2 }

const KEY = 'batcontrol:v1';
const PHOTO_KEY = 'batcontrol:mat-photo';

interface Saved {
  progress: Progress;
  code: string | null;
  config: RobotConfig;
  start: { x: number; y: number; h: number } | null;
  prefs: Prefs;
  programs: SavedProgram[];
  currentProgram: string | null;
  scores: ScoreRun[];
  scoreDraft: { answers: Record<string, number>; gp: number | null } | null;
  match: { runs: MatchRun[]; handling: number };
  puzzles: PuzzleStats;
}

const DEFAULT_PREFS: Prefs = { lang: null, theme: 'system', haptics: true, ghost: true, realistic: false, mat: 'training', objects: 'none', editor: 'python' };

/** Configuração padrão antiga (rodas de 56 mm, anexos em C e D, sensor em E): troca pelo robô atual da BatLego. */
function oldDefault(c: Partial<RobotConfig> | undefined) {
  const p = c?.ports;
  return !!c && c.wheelDiameter === 56 && c.axleTrack === 140 && p?.leftArm === 'C' && p?.rightArm === 'D' && p?.color === 'E';
}

function load(): Saved {
  const empty: Saved = {
    progress: { xp: 0, done: {}, streak: { last: null, count: 0 }, mistakes: [] },
    code: null,
    config: structuredClone(DEFAULT_CONFIG),
    start: null,
    prefs: { ...DEFAULT_PREFS },
    programs: [],
    currentProgram: null,
    scores: [],
    scoreDraft: null,
    match: { runs: [], handling: 8 },
    puzzles: { rating: 800, best: 800, played: 0, solved: 0, streak: 0, bestStreak: 0, history: [] },
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw);
    return {
      progress: { ...empty.progress, ...s.progress, mistakes: Array.isArray(s.progress?.mistakes) ? s.progress.mistakes : [] },
      code: typeof s.code === 'string' ? s.code : null,
      config: oldDefault(s.config) ? empty.config : { ...empty.config, ...s.config, ports: { ...empty.config.ports, ...(s.config?.ports ?? {}) }, attachments: { ...empty.config.attachments, ...(s.config?.attachments ?? {}) } },
      start: s.start ?? null,
      prefs: { ...DEFAULT_PREFS, ...(s.prefs ?? {}) },
      programs: Array.isArray(s.programs) ? s.programs : [],
      currentProgram: s.currentProgram ?? null,
      scores: Array.isArray(s.scores) ? s.scores : [],
      scoreDraft: s.scoreDraft ?? null,
      match: { ...empty.match, ...(s.match ?? {}) },
      puzzles: { ...empty.puzzles, ...(s.puzzles ?? {}), history: Array.isArray(s.puzzles?.history) ? s.puzzles.history : [] },
    };
  } catch {
    return empty;
  }
}

export const state = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível: o app continua funcionando sem salvar */
  }
}

export function storageAvailable() {
  try {
    localStorage.setItem(KEY + ':t', '1');
    localStorage.removeItem(KEY + ':t');
    return true;
  } catch {
    return false;
  }
}

/** Foto do tapete oficial fica numa chave separada (pode ter algumas centenas de KB). */
export function loadMatPhoto(): string | null {
  try { return localStorage.getItem(PHOTO_KEY); } catch { return null; }
}
export function saveMatPhoto(dataUrl: string | null): boolean {
  try {
    if (dataUrl) localStorage.setItem(PHOTO_KEY, dataUrl);
    else localStorage.removeItem(PHOTO_KEY);
    return true;
  } catch {
    return false;
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Sequência só conta se a última lição foi ontem ou hoje. */
export function currentStreak() {
  const s = state.progress.streak;
  if (!s.last) return 0;
  const diff = Math.round((new Date(today()).getTime() - new Date(s.last).getTime()) / 86400000);
  return diff <= 1 ? s.count : 0;
}

export function practicedToday() {
  return state.progress.streak.last === today();
}

export function completeLesson(id: string, xp: number, perfect: boolean) {
  const p = state.progress;
  p.xp += xp;
  if (!id.startsWith('review')) {
    const prev = p.done[id];
    p.done[id] = { at: today(), perfect: perfect || !!prev?.perfect };
  }
  const t = today();
  if (p.streak.last !== t) {
    p.streak.count = currentStreak() > 0 ? p.streak.count + 1 : 1;
    p.streak.last = t;
  }
  save();
}

export function addMistake(ref: string) {
  if (!state.progress.mistakes.includes(ref)) state.progress.mistakes.push(ref);
  save();
}
export function clearMistake(ref: string) {
  state.progress.mistakes = state.progress.mistakes.filter((m) => m !== ref);
  save();
}

export function resetProgress() {
  state.progress = { xp: 0, done: {}, streak: { last: null, count: 0 }, mistakes: [] };
  state.puzzles = { rating: 800, best: 800, played: 0, solved: 0, streak: 0, bestStreak: 0, history: [] };
  save();
}

/** Registra o resultado da primeira tentativa de um problema (só ela conta para a nota). */
export function recordPuzzle(id: string, rating: number, ok: boolean, delta: number) {
  const p = state.puzzles;
  p.rating = Math.max(100, p.rating + delta);
  p.best = Math.max(p.best, p.rating);
  p.played++;
  if (ok) { p.solved++; p.streak++; p.bestStreak = Math.max(p.bestStreak, p.streak); } else p.streak = 0;
  p.history.unshift({ id, rating, ok, delta, at: Date.now() });
  p.history = p.history.slice(0, 30);
  // Resolver um problema também conta para a sequência de dias
  const t = today();
  if (state.progress.streak.last !== t) {
    state.progress.streak.count = currentStreak() > 0 ? state.progress.streak.count + 1 : 1;
    state.progress.streak.last = t;
  }
  if (ok) state.progress.xp += 3;
  save();
}
