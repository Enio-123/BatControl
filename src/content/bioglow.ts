// Pontuação da temporada FIRST LEGO League Founders Edition 2026/27 (BIOGLOW / FIRST CANOPY).
// Fonte: Robot Game Rulebook e folha de pontuação oficiais da temporada. Os nomes das missões ficam
// em inglês (como no material oficial); as condições são traduzidas em src/i18n/ui/<idioma>.ts
// com as chaves "bg.<missão>.<item>".

export type Item =
  | { id: string; kind: 'yes'; points: number }
  | { id: string; kind: 'count'; max: number; each: number }
  | { id: string; kind: 'pick'; options: { id: string; points: number }[] };

export interface Mission { id: string; name: string; items: Item[]; max: number; note?: boolean }

const yes = (id: string, points: number): Item => ({ id, kind: 'yes', points });
const count = (id: string, max: number, each: number): Item => ({ id, kind: 'count', max, each });

export const MISSIONS: Mission[] = [
  { id: 'm01', name: 'Drone Survey', items: [yes('drone', 20), yes('lidar', 10)], max: 30 },
  { id: 'm02', name: 'Exploding Seeds', items: [count('seeds', 3, 10)], max: 30 },
  { id: 'm03', name: 'Flip the Rock', items: [yes('flag', 20), yes('rock', 10)], max: 30 },
  // Sem a esperança (katydid) no habitat, a missão inteira vale 0
  { id: 'm04', name: 'Lucky Leaves', items: [yes('katydid', 0), count('leaves', 2, 0)], max: 30, note: true },
  { id: 'm05', name: 'Reaching Roots', items: [{ id: 'root', kind: 'pick', options: [{ id: 'no', points: 0 }, { id: 'partial', points: 10 }, { id: 'full', points: 20 }] }], max: 20 },
  // Só pontua se a formiga estiver tocando o ninho
  { id: 'm06', name: 'Leafcutter Frenzy', items: [yes('ant', 0), count('fragments', 4, 10)], max: 40, note: true },
  // As conexões dependem do time da mesa ao lado
  { id: 'm07', name: 'Humongous Fungus', items: [yes('mycelium', 20), count('connections', 2, 10)], max: 40, note: true },
  { id: 'm08', name: 'Tangled', items: [yes('vine', 30)], max: 30 },
  { id: 'm09', name: 'Research Platform', items: [yes('platform', 10), yes('camera', 10), yes('seed', 10)], max: 30 },
  { id: 'm10', name: 'Fragile Microhabitats', items: [yes('spider', 10), yes('snail', 10)], max: 20 },
  { id: 'm11', name: 'Window to the Past', items: [yes('cover', 20)], max: 20 },
  { id: 'm12', name: 'Forest Elder', items: [yes('cane', 20), yes('tie', 10)], max: 30 },
  { id: 'm13', name: 'Keystone Species', items: [yes('keystone', 30)], max: 30 },
  { id: 'm14', name: 'Seeds of Renewal', items: [count('station', 4, 5), count('touching', 4, 5)], max: 40, note: true },
  {
    id: 'm15', name: 'Biocentric Architecture',
    items: [yes('canopy', 10), yes('skylight', 10), yes('hatch', 10), { id: 'dock', kind: 'pick', options: [{ id: 'none', points: 0 }, { id: 'mine', points: 10 }, { id: 'city', points: 10 }, { id: 'farm', points: 10 }] }],
    max: 40, note: true,
  },
];

/** Pontos dos Precision Tokens que sobraram (0 a 6). */
export const TOKEN_POINTS = [0, 10, 15, 25, 35, 50, 50];
export const INSPECTION = 20;
export const MISSION_MAX = MISSIONS.reduce((s, m) => s + m.max, 0);
export const TOTAL_MAX = MISSION_MAX + INSPECTION + TOKEN_POINTS[6];

export type Answers = Record<string, number>;

/** Chave de cada resposta: "m01.drone". Respostas sim/não são 0 ou 1; "pick" guarda o índice. */
export const key = (m: Mission | string, item: Item | string) => `${typeof m === 'string' ? m : m.id}.${typeof item === 'string' ? item : item.id}`;

export function defaultAnswers(): Answers {
  const a: Answers = { 'tokens': 6, 'inspection': 0 };
  for (const m of MISSIONS) for (const it of m.items) a[key(m, it)] = 0;
  return a;
}

const v = (a: Answers, k: string) => a[k] ?? 0;

/** Pontos de uma missão, com as regras que ligam os itens entre si. */
export function missionScore(m: Mission, a: Answers): number {
  const g = (id: string) => v(a, key(m, id));
  switch (m.id) {
    case 'm04': {
      if (!g('katydid')) return 0;
      const leaves = g('leaves');
      return (leaves >= 1 ? 10 : 0) + (leaves >= 2 ? 20 : 0);
    }
    case 'm06':
      return g('ant') ? g('fragments') * 10 : 0;
    case 'm14':
      // Semente tocando o tapete só conta se também estiver na estação
      return g('station') * 5 + Math.min(g('touching'), g('station')) * 5;
    case 'm15': {
      const base = g('canopy') * 10 + g('skylight') * 10 + g('hatch') * 10;
      const dock = ['none', 'mine', 'city', 'farm'][g('dock')] ?? 'none';
      const bonus = (dock === 'mine' && g('canopy')) || (dock === 'city' && g('skylight')) || (dock === 'farm' && g('hatch')) ? 10 : 0;
      return base + bonus;
    }
  }
  let s = 0;
  for (const it of m.items) {
    const x = g(it.id);
    if (it.kind === 'yes') s += x ? it.points : 0;
    else if (it.kind === 'count') s += Math.min(x, it.max) * it.each;
    else s += it.options[x]?.points ?? 0;
  }
  return s;
}

export function totalScore(a: Answers) {
  const missions = MISSIONS.reduce((s, m) => s + missionScore(m, a), 0);
  const tokens = TOKEN_POINTS[Math.max(0, Math.min(6, v(a, 'tokens')))];
  const inspection = v(a, 'inspection') ? INSPECTION : 0;
  return { missions, tokens, inspection, total: missions + tokens + inspection };
}
