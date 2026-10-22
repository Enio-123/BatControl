// Editor de blocos: monta o programa tocando, com botões de + e − para os números.
// Gera Python de verdade e consegue ler de volta o Python que ele mesmo gera (ou parecido).
import { t } from '../i18n';
import { parse } from '../interp/parser';
import { SETUP_FULL } from '../content/setup';
import { buzz, h, icon, IconName, openSheet } from './dom';

type Side = 'left' | 'right';
type ColorName = 'BLACK' | 'WHITE' | 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

export type Block =
  | { k: 'straight'; d: number }
  | { k: 'turn'; a: number }
  | { k: 'curve'; r: number; a: number }
  | { k: 'speed'; v: number }
  | { k: 'gyro'; on: boolean }
  | { k: 'until'; v: number; c: ColorName }
  | { k: 'arm'; side: Side; s: number; a: number; wait: boolean }
  | { k: 'target'; side: Side; s: number; a: number }
  | { k: 'wait'; ms: number }
  | { k: 'beep' }
  | { k: 'repeat'; n: number; body: Block[] };

type Cat = 'move' | 'arm' | 'sensor' | 'control' | 'hub';
const CAT: Record<Block['k'], Cat> = {
  straight: 'move', turn: 'move', curve: 'move', speed: 'move', gyro: 'move',
  until: 'sensor', arm: 'arm', target: 'arm', wait: 'control', beep: 'hub', repeat: 'control',
};
const CAT_ICON: Record<Cat, IconName> = { move: 'robot', arm: 'settings', sensor: 'eye', control: 'restart', hub: 'sparkle' };
const COLORS: ColorName[] = ['BLACK', 'WHITE', 'RED', 'BLUE', 'GREEN', 'YELLOW'];

const fresh = (k: Block['k']): Block => {
  switch (k) {
    case 'straight': return { k, d: 200 };
    case 'turn': return { k, a: 90 };
    case 'curve': return { k, r: 200, a: 90 };
    case 'speed': return { k, v: 300 };
    case 'gyro': return { k, on: true };
    case 'until': return { k, v: 200, c: 'BLACK' };
    case 'arm': return { k, side: 'left', s: 300, a: 90, wait: true };
    case 'target': return { k, side: 'left', s: 300, a: 0 };
    case 'wait': return { k, ms: 500 };
    case 'beep': return { k };
    case 'repeat': return { k, n: 4, body: [] };
  }
};

const fmt = (n: number) => String(Math.round(n * 100) / 100);

// ---------- Blocos → Python ----------

function lines(blocks: Block[], ind: string): string[] {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.k) {
      case 'straight': out.push(`${ind}robot.straight(${fmt(b.d)})`); break;
      case 'turn': out.push(`${ind}robot.turn(${fmt(b.a)})`); break;
      case 'curve': out.push(`${ind}robot.curve(${fmt(b.r)}, ${fmt(b.a)})`); break;
      case 'speed': out.push(`${ind}robot.settings(straight_speed=${fmt(b.v)})`); break;
      case 'gyro': out.push(`${ind}robot.use_gyro(${b.on ? 'True' : 'False'})`); break;
      case 'until':
        out.push(`${ind}robot.drive(${fmt(b.v)}, 0)`, `${ind}while sensor.color() != Color.${b.c}:`, `${ind}    wait(10)`, `${ind}robot.stop()`);
        break;
      case 'arm': out.push(`${ind}${b.side}_arm.run_angle(${fmt(b.s)}, ${fmt(b.a)}${b.wait ? '' : ', wait=False'})`); break;
      case 'target': out.push(`${ind}${b.side}_arm.run_target(${fmt(b.s)}, ${fmt(b.a)})`); break;
      case 'wait': out.push(`${ind}wait(${fmt(b.ms)})`); break;
      case 'beep': out.push(`${ind}hub.speaker.beep()`); break;
      case 'repeat':
        out.push(`${ind}for i in range(${Math.max(0, Math.round(b.n))}):`);
        out.push(...(b.body.length ? lines(b.body, ind + '    ') : [`${ind}    pass`]));
        break;
    }
  }
  return out;
}

const SETUP_RE = /^\s*(from |import |hub\s*=|\w*_motor\s*=|robot\s*=|\w*_arm\s*=|sensor\s*=|$)/;

/** Separa o cabeçalho de configuração (imports e dispositivos) do corpo do programa. */
export function splitSetup(code: string): { head: string; body: string } {
  const ls = code.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  let last = -1;
  while (i < ls.length && SETUP_RE.test(ls[i])) { if (ls[i].trim()) last = i; i++; }
  if (last < 0 || !/^(from |import )/.test(ls[0])) return { head: '', body: code };
  return { head: ls.slice(0, last + 1).join('\n'), body: ls.slice(last + 1).join('\n') };
}

export function toPython(blocks: Block[], head = SETUP_FULL) {
  return `${head}\n\n${lines(blocks, '').join('\n')}\n`;
}

// ---------- Python → blocos ----------

const num = (n: any): number | null => {
  if (!n) return null;
  if (n.type === 'Num') return n.value;
  if (n.type === 'UnaryOp' && n.op === '-' && n.operand.type === 'Num') return -n.operand.value;
  return null;
};
const isCall = (st: any, obj: string | null, name: string) => {
  if (st?.type !== 'Expr' || st.value.type !== 'Call') return null;
  const f = st.value.func;
  if (obj === null) return f.type === 'Name' && f.id === name ? st.value : null;
  return f.type === 'Attribute' && f.attr === name && f.value.type === 'Name' && f.value.id === obj ? st.value : null;
};
const nums = (call: any, n: number) => {
  if (call.args.length !== n) return null;
  const v = call.args.map(num);
  return v.some((x: number | null) => x === null) ? null : (v as number[]);
};

function fromStmts(body: any[]): Block[] | null {
  const out: Block[] = [];
  for (let i = 0; i < body.length; i++) {
    const st = body[i];
    if (st.type === 'Pass') continue;
    let c;
    if ((c = isCall(st, 'robot', 'straight')) && !c.kwargs.length) { const v = nums(c, 1); if (!v) return null; out.push({ k: 'straight', d: v[0] }); continue; }
    if ((c = isCall(st, 'robot', 'turn')) && !c.kwargs.length) { const v = nums(c, 1); if (!v) return null; out.push({ k: 'turn', a: v[0] }); continue; }
    if ((c = isCall(st, 'robot', 'curve')) && !c.kwargs.length) { const v = nums(c, 2); if (!v) return null; out.push({ k: 'curve', r: v[0], a: v[1] }); continue; }
    if ((c = isCall(st, 'robot', 'settings'))) {
      if (c.args.length || c.kwargs.length !== 1 || c.kwargs[0].name !== 'straight_speed') return null;
      const v = num(c.kwargs[0].value);
      if (v === null) return null;
      out.push({ k: 'speed', v });
      continue;
    }
    if ((c = isCall(st, 'robot', 'use_gyro'))) {
      const a = c.args[0];
      if (c.args.length !== 1 || a.type !== 'Const' || typeof a.value !== 'boolean') return null;
      out.push({ k: 'gyro', on: a.value });
      continue;
    }
    if ((c = isCall(st, 'robot', 'drive'))) {
      const v = nums(c, 2);
      const w = body[i + 1];
      const stop = isCall(body[i + 2], 'robot', 'stop');
      const test = w?.type === 'While' ? w.test : null;
      const okTest = test && test.type === 'Compare' && test.ops.length === 1 && test.ops[0] === '!='
        && test.left.type === 'Call' && test.left.func.type === 'Attribute' && test.left.func.attr === 'color'
        && test.left.func.value.type === 'Name' && test.left.func.value.id === 'sensor'
        && test.comps[0].type === 'Attribute' && test.comps[0].value.id === 'Color' && COLORS.includes(test.comps[0].attr);
      const okBody = w?.body?.length === 1 && isCall(w.body[0], null, 'wait');
      if (!v || v[1] !== 0 || !okTest || !okBody || !stop) return null;
      out.push({ k: 'until', v: v[0], c: test.comps[0].attr });
      i += 2;
      continue;
    }
    let side: Side | null = null;
    for (const s of ['left', 'right'] as const) if (isCall(st, `${s}_arm`, 'run_angle') || isCall(st, `${s}_arm`, 'run_target')) side = s;
    if (side) {
      const call = st.value;
      const v = nums(call, 2);
      if (!v) return null;
      if (call.func.attr === 'run_target') {
        if (call.kwargs.length) return null;
        out.push({ k: 'target', side, s: v[0], a: v[1] });
      } else {
        let wait = true;
        for (const kw of call.kwargs) {
          if (kw.name !== 'wait' || kw.value.type !== 'Const') return null;
          wait = !!kw.value.value;
        }
        out.push({ k: 'arm', side, s: v[0], a: v[1], wait });
      }
      continue;
    }
    if ((c = isCall(st, null, 'wait'))) { const v = nums(c, 1); if (!v) return null; out.push({ k: 'wait', ms: v[0] }); continue; }
    if (st.type === 'Expr' && st.value.type === 'Call' && st.value.func.type === 'Attribute' && st.value.func.attr === 'beep'
      && st.value.func.value.type === 'Attribute' && st.value.func.value.attr === 'speaker' && !st.value.args.length) { out.push({ k: 'beep' }); continue; }
    if (st.type === 'For' && st.target.type === 'Name' && st.iter.type === 'Call' && st.iter.func.type === 'Name' && st.iter.func.id === 'range') {
      const v = nums(st.iter, 1);
      const inner = fromStmts(st.body);
      if (!v || !inner) return null;
      out.push({ k: 'repeat', n: v[0], body: inner });
      continue;
    }
    return null;
  }
  return out;
}

/** Converte Python em blocos. Retorna null se o programa usa algo que os blocos não têm. */
export function fromPython(code: string): { head: string; blocks: Block[] } | null {
  const { head, body } = splitSetup(code);
  if (!head) return null;
  // Comentários e linhas vazias não atrapalham, mas os blocos não guardam comentários
  try {
    const m = parse(body.replace(/#.*$/gm, ''));
    const blocks = fromStmts(m.body);
    return blocks ? { head, blocks } : null;
  } catch {
    return null;
  }
}

// ---------- Interface ----------

export class BlocksEditor {
  el: HTMLElement;
  private list: HTMLElement;
  private blocks: Block[] = [];
  private head = SETUP_FULL;
  onChange: (code: string) => void = () => {};

  constructor() {
    this.list = h('div', { class: 'blocks-list' });
    this.el = h('div', { class: 'blocks' },
      this.list,
      h('button', { type: 'button', class: 'btn add-block', onclick: () => this.palette(this.blocks) }, icon('plus', 16), t('blocks.add')));
  }

  /** Carrega um programa; retorna false se ele não puder virar blocos. */
  load(code: string): boolean {
    const r = fromPython(code);
    if (!r) return false;
    this.head = r.head;
    this.blocks = r.blocks;
    this.render();
    return true;
  }

  get code() { return toPython(this.blocks, this.head); }

  private changed() {
    this.render();
    this.onChange(this.code);
  }

  private palette(target: Block[]) {
    const kinds: Block['k'][] = ['straight', 'turn', 'curve', 'speed', 'gyro', 'arm', 'target', 'until', 'wait', 'repeat', 'beep'];
    const sheet = openSheet(t('blocks.add'), h('div', { class: 'palette' }, kinds.map((k) =>
      h('button', { type: 'button', class: `pal-item cat-${CAT[k]}`, onclick: () => { target.push(fresh(k)); buzz('tap'); sheet.close(); this.changed(); } },
        icon(CAT_ICON[CAT[k]], 18),
        h('span', {}, h('strong', {}, t(`blocks.${k}`)), h('span', { class: 'muted small mono' }, lines([fresh(k)], '')[0]))))));
  }

  private render() {
    this.list.replaceChildren(...(this.blocks.length ? this.renderList(this.blocks) : [h('p', { class: 'muted small blocks-empty' }, t('blocks.empty'))]));
  }

  private renderList(list: Block[]): HTMLElement[] {
    return list.map((b, i) => this.renderBlock(b, list, i));
  }

  private stepper(value: number, step: number, set: (v: number) => void, unit: string, label: string, min = -99999, max = 99999) {
    const clamp = (v: number) => Math.max(min, Math.min(max, v));
    const input = h('input', { type: 'number', inputmode: 'decimal', value: fmt(value), step: String(step), 'aria-label': label, class: 'mono' });
    input.addEventListener('change', () => {
      const v = Number(input.value);
      if (Number.isFinite(v)) { set(clamp(v)); this.onChange(this.code); }
      else input.value = fmt(value);
    });
    const bump = (d: number) => () => { set(clamp(Math.round((Number(input.value) + d) * 100) / 100)); buzz('tap'); this.changed(); };
    return h('span', { class: 'stepper' },
      h('button', { type: 'button', 'aria-label': `${label} −${step}`, onclick: bump(-step) }, icon('minus', 14)),
      input,
      h('button', { type: 'button', 'aria-label': `${label} +${step}`, onclick: bump(step) }, icon('plus', 14)),
      unit ? h('em', {}, unit) : null);
  }

  private choice<T extends string>(opts: [T, string][], value: T, set: (v: T) => void, label: string) {
    const sel = h('select', { 'aria-label': label }, opts.map(([v, text]) => h('option', { value: v, selected: v === value }, text)));
    sel.addEventListener('change', () => { set(sel.value as T); this.changed(); });
    return sel;
  }

  private renderBlock(b: Block, list: Block[], i: number): HTMLElement {
    const sideOpts: [Side, string][] = [['left', t('blocks.leftArm')], ['right', t('blocks.rightArm')]];
    let fields: (HTMLElement | string)[] = [];
    switch (b.k) {
      case 'straight': fields = [this.stepper(b.d, 50, (v) => (b.d = v), 'mm', t('blocks.distance'), -3000, 3000)]; break;
      case 'turn': fields = [this.stepper(b.a, 15, (v) => (b.a = v), '°', t('blocks.angle'), -720, 720)]; break;
      case 'curve': fields = [this.stepper(b.r, 50, (v) => (b.r = v), 'mm', t('blocks.radius'), -2000, 2000), this.stepper(b.a, 15, (v) => (b.a = v), '°', t('blocks.angle'), -720, 720)]; break;
      case 'speed': fields = [this.stepper(b.v, 50, (v) => (b.v = v), 'mm/s', t('blocks.speed'), 10, 1000)]; break;
      case 'gyro': fields = [this.choice([['on', t('blocks.on')], ['off', t('blocks.off')]], b.on ? 'on' : 'off', (v) => (b.on = v === 'on'), t('blocks.gyro'))]; break;
      case 'until': fields = [this.choice(COLORS.map((c) => [c, t('color.' + c)] as [ColorName, string]), b.c, (v) => (b.c = v), t('blocks.color')), this.stepper(b.v, 50, (v) => (b.v = v), 'mm/s', t('blocks.speed'), -1000, 1000)]; break;
      case 'arm':
        fields = [
          this.choice(sideOpts, b.side, (v) => (b.side = v), t('blocks.arm')),
          this.stepper(b.a, 15, (v) => (b.a = v), '°', t('blocks.angle'), -3600, 3600),
          this.stepper(b.s, 100, (v) => (b.s = v), '°/s', t('blocks.speed'), 10, 1000),
          this.choice([['wait', t('blocks.waitYes')], ['go', t('blocks.waitNo')]], b.wait ? 'wait' : 'go', (v) => (b.wait = v === 'wait'), t('blocks.waitLabel')),
        ];
        break;
      case 'target':
        fields = [this.choice(sideOpts, b.side, (v) => (b.side = v), t('blocks.arm')), this.stepper(b.a, 15, (v) => (b.a = v), '°', t('blocks.target'), -3600, 3600), this.stepper(b.s, 100, (v) => (b.s = v), '°/s', t('blocks.speed'), 10, 1000)];
        break;
      case 'wait': fields = [this.stepper(b.ms, 250, (v) => (b.ms = v), 'ms', t('blocks.time'), 0, 150000)]; break;
      case 'beep': fields = []; break;
      case 'repeat': fields = [this.stepper(b.n, 1, (v) => (b.n = Math.round(v)), '×', t('blocks.times'), 0, 100)]; break;
    }
    const move = (d: number) => () => {
      const j = i + d;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      buzz('tap');
      this.changed();
    };
    const actions = h('div', { class: 'blk-actions' },
      h('button', { type: 'button', 'aria-label': t('blocks.up'), disabled: i === 0, onclick: move(-1) }, icon('up', 16)),
      h('button', { type: 'button', 'aria-label': t('blocks.down'), disabled: i === list.length - 1, onclick: move(1) }, icon('down', 16)),
      h('button', { type: 'button', 'aria-label': t('blocks.duplicate'), onclick: () => { list.splice(i + 1, 0, structuredClone(b)); this.changed(); } }, icon('copy', 16)),
      h('button', { type: 'button', 'aria-label': t('blocks.delete'), onclick: () => { list.splice(i, 1); buzz('tap'); this.changed(); } }, icon('trash', 16)));
    const el = h('div', { class: `blk cat-${CAT[b.k]}` },
      h('div', { class: 'blk-head' }, h('span', { class: 'blk-title' }, icon(CAT_ICON[CAT[b.k]], 15), t(`blocks.${b.k}`)), actions),
      fields.length ? h('div', { class: 'blk-fields' }, fields) : null);
    if (b.k === 'repeat') {
      el.append(h('div', { class: 'blk-body' },
        ...this.renderList(b.body),
        h('button', { type: 'button', class: 'btn ghost small add-inner', onclick: () => this.palette(b.body) }, icon('plus', 14), t('blocks.addInside'))));
    }
    return el;
  }
}
