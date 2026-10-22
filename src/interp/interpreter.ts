// Interpretador de um subconjunto de Python, com mensagens de erro em português.
import { t as tr } from '../i18n';
import { Node, parse } from './parser';
import { PySyntaxError } from './lexer';

export class PyError extends Error {
  constructor(public pyType: string, public detail: string, public line?: number) {
    super(`${pyType}: ${detail}`);
  }
}

/** Interrupção do programa que não é erro do aluno (tempo esgotado, parada pelo usuário). */
export class StopProgram extends Error {
  constructor(public reason: string) { super(reason); }
}

export type Kwargs = Record<string, any>;

export class NativeFn {
  constructor(public name: string, public fn: (args: any[], kw: Kwargs) => any) {}
}

export class PyFunction {
  constructor(public name: string, public params: { name: string; def?: any }[], public body: Node[], public closure: Scope) {}
}

export class PyList { constructor(public items: any[]) {} }
export class PyTuple { constructor(public items: any[]) {} }
export class PyDict { constructor(public map: Map<any, any> = new Map()) {} }
export class PyRange { constructor(public start: number, public stop: number, public step: number) {} }

/** Objeto nativo (PrimeHub, DriveBase, Motor...). `hints` explica atributos que não existem. */
export class PyObject {
  constructor(public typeName: string, public attrs: Record<string, any> = {}, public hints: Record<string, string> = {}) {}
}

/** Valor de enumeração, como Port.A ou Color.RED. */
export class PyEnum {
  constructor(public typeName: string, public name: string, public extra: Record<string, any> = {}) {}
}

export class PyModule {
  constructor(public name: string, public attrs: Record<string, any>) {}
}

export class Scope {
  vars = new Map<string, any>();
  globalNames = new Set<string>();
  constructor(public parent: Scope | null) {}
  lookup(name: string): any {
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) return s.vars.get(name);
      s = s.parent;
    }
    return undefined;
  }
}

class BreakSig {}
class ContinueSig {}
class ReturnSig { constructor(public value: any) {} }

export interface Hooks {
  /** Chamado antes de cada instrução, com o número da linha. */
  tick(line: number): void;
  print(text: string): void;
  importModule(name: string): PyModule | undefined;
}

export function pyStr(v: any): string {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return fmtNum(v);
  if (typeof v === 'string') return v;
  return pyRepr(v);
}

function fmtNum(v: number): string {
  if (Number.isNaN(v)) return 'nan';
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf';
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toPrecision(12)));
}

export function pyRepr(v: any): string {
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  if (v instanceof PyList) return `[${v.items.map(pyRepr).join(', ')}]`;
  if (v instanceof PyTuple) return v.items.length === 1 ? `(${pyRepr(v.items[0])},)` : `(${v.items.map(pyRepr).join(', ')})`;
  if (v instanceof PyDict) return `{${[...v.map.entries()].map(([k, x]) => `${pyRepr(k)}: ${pyRepr(x)}`).join(', ')}}`;
  if (v instanceof PyRange) return `range(${v.start}, ${v.stop})`;
  if (v instanceof PyEnum) return `${v.typeName}.${v.name}`;
  if (v instanceof PyFunction) return `<function ${v.name}>`;
  if (v instanceof NativeFn) return `<function ${v.name}>`;
  if (v instanceof PyObject) return `<${v.typeName}>`;
  if (v instanceof PyModule) return `<module '${v.name}'>`;
  return pyStr(v);
}

export function typeName(v: any): string {
  if (v === null || v === undefined) return 'NoneType';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  if (typeof v === 'string') return 'str';
  if (v instanceof PyList) return 'list';
  if (v instanceof PyTuple) return 'tuple';
  if (v instanceof PyDict) return 'dict';
  if (v instanceof PyRange) return 'range';
  if (v instanceof PyFunction || v instanceof NativeFn) return 'function';
  if (v instanceof PyEnum) return v.typeName;
  if (v instanceof PyObject) return v.typeName;
  if (v instanceof PyModule) return 'module';
  return 'object';
}

const TYPE_KEYS = ['int', 'float', 'str', 'bool', 'list', 'tuple', 'dict', 'function'];
const tpt = (v: any) => {
  const n = typeName(v);
  return TYPE_KEYS.includes(n) ? tr('type.' + n) : n;
};

export function truthy(v: any): boolean {
  if (v === null || v === undefined || v === false || v === 0 || v === '') return false;
  if (v instanceof PyList || v instanceof PyTuple) return v.items.length > 0;
  if (v instanceof PyDict) return v.map.size > 0;
  if (v instanceof PyRange) return rangeLen(v) > 0;
  return true;
}

function rangeLen(r: PyRange) {
  return Math.max(0, Math.ceil((r.stop - r.start) / r.step));
}

export function toNumber(v: any, what = tr('e.value')): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  throw new PyError('TypeError', tr('e.needNumber', { what, type: tpt(v), repr: pyRepr(v) }));
}

export function pyEq(a: any, b: any): boolean {
  if (typeof a === 'boolean' && typeof b === 'number') return (a ? 1 : 0) === b;
  if (typeof b === 'boolean' && typeof a === 'number') return (b ? 1 : 0) === a;
  if ((a instanceof PyList && b instanceof PyList) || (a instanceof PyTuple && b instanceof PyTuple)) {
    return a.items.length === b.items.length && a.items.every((x: any, i: number) => pyEq(x, b.items[i]));
  }
  if (a === undefined) a = null;
  if (b === undefined) b = null;
  return a === b;
}

export function iterate(v: any): any[] {
  if (v instanceof PyList || v instanceof PyTuple) return v.items.slice();
  if (v instanceof PyRange) {
    const out: number[] = [];
    if (rangeLen(v) > 1_000_000) throw new PyError('ValueError', tr('e.rangeBig'));
    for (let x = v.start; v.step > 0 ? x < v.stop : x > v.stop; x += v.step) out.push(x);
    return out;
  }
  if (typeof v === 'string') return [...v];
  if (v instanceof PyDict) return [...v.map.keys()];
  throw new PyError('TypeError', tr('e.notIterable', { type: tpt(v) }));
}

const MAX_DEPTH = 150;

export class Interpreter {
  globals = new Scope(null);
  builtins = new Map<string, any>();
  depth = 0;
  line = 0;

  constructor(private hooks: Hooks) {
    this.installBuiltins();
  }

  run(src: string) {
    let tree: Node;
    try {
      tree = parse(src);
    } catch (e) {
      if (e instanceof PySyntaxError) {
        const [type, ...rest] = e.message.split(': ');
        throw new PyError(rest.length ? type : 'SyntaxError', rest.length ? rest.join(': ') : e.message, e.line);
      }
      throw e;
    }
    try {
      this.execBlock(tree.body, this.globals);
    } catch (e) {
      if (e instanceof PyError) {
        if (e.line === undefined) e.line = this.line;
        throw e;
      }
      if (e instanceof BreakSig || e instanceof ContinueSig) throw new PyError('SyntaxError', "'break' ou 'continue' fora de um loop", this.line);
      if (e instanceof ReturnSig) throw new PyError('SyntaxError', "'return' fora de uma função", this.line);
      if (e instanceof RangeError) throw new PyError('RecursionError', tr('e.recursion'), this.line);
      throw e;
    }
  }

  private installBuiltins() {
    const b = this.builtins;
    const def = (name: string, fn: (args: any[], kw: Kwargs) => any) => b.set(name, new NativeFn(name, fn));
    def('print', (args, kw) => {
      const sep = kw.sep !== undefined ? pyStr(kw.sep) : ' ';
      const end = kw.end !== undefined ? pyStr(kw.end) : '\n';
      this.hooks.print(args.map(pyStr).join(sep) + end);
      return null;
    });
    def('range', (args) => {
      const n = args.map((a) => {
        const x = toNumber(a, tr('e.rangeValue'));
        if (!Number.isInteger(x)) throw new PyError('TypeError', tr('e.rangeInt'));
        return x;
      });
      if (n.length === 1) return new PyRange(0, n[0], 1);
      if (n.length === 2) return new PyRange(n[0], n[1], 1);
      if (n.length === 3) {
        if (n[2] === 0) throw new PyError('ValueError', tr('e.rangeStep'));
        return new PyRange(n[0], n[1], n[2]);
      }
      throw new PyError('TypeError', tr('e.rangeArgs'));
    });
    def('len', ([v]) => {
      if (typeof v === 'string') return v.length;
      if (v instanceof PyList || v instanceof PyTuple) return v.items.length;
      if (v instanceof PyDict) return v.map.size;
      if (v instanceof PyRange) return rangeLen(v);
      throw new PyError('TypeError', tr('e.noLen', { type: tpt(v) }));
    });
    def('abs', ([v]) => Math.abs(toNumber(v)));
    const minmax = (name: string, pick: (a: number, b: number) => boolean) => (args: any[]) => {
      const vals = args.length === 1 ? iterate(args[0]) : args;
      if (!vals.length) throw new PyError('ValueError', tr('e.emptySeq', { name }));
      return vals.reduce((a, x) => (pick(toNumber(x), toNumber(a)) ? x : a));
    };
    def('min', minmax('min', (a, b) => a < b));
    def('max', minmax('max', (a, b) => a > b));
    def('sum', ([v]) => iterate(v).reduce((a, x) => a + toNumber(x), 0));
    def('round', ([v, nd]) => {
      const x = toNumber(v);
      if (nd === undefined || nd === null) {
        const r = Math.round(x);
        // Python arredonda .5 para o par mais próximo
        return Math.abs(x % 1) === 0.5 ? 2 * Math.round(x / 2) : r;
      }
      const f = 10 ** toNumber(nd);
      return Math.round(x * f) / f;
    });
    def('int', ([v]) => {
      if (v === undefined) return 0;
      if (typeof v === 'string') {
        const n = Number(v.trim());
        if (!/^[+-]?\d+$/.test(v.trim())) throw new PyError('ValueError', tr('e.toInt', { v }));
        return n;
      }
      return Math.trunc(toNumber(v));
    });
    def('float', ([v]) => {
      if (v === undefined) return 0;
      if (typeof v === 'string') {
        const n = Number(v.trim());
        if (v.trim() === '' || Number.isNaN(n)) throw new PyError('ValueError', tr('e.toFloat', { v }));
        return n;
      }
      return toNumber(v);
    });
    def('str', ([v]) => (v === undefined ? '' : pyStr(v)));
    def('bool', ([v]) => truthy(v));
    def('list', ([v]) => new PyList(v === undefined ? [] : iterate(v)));
    def('tuple', ([v]) => new PyTuple(v === undefined ? [] : iterate(v)));
    def('enumerate', ([v, start]) => new PyList(iterate(v).map((x, i) => new PyTuple([i + (start ?? 0), x]))));
    def('reversed', ([v]) => new PyList(iterate(v).reverse()));
    def('sorted', ([v]) => new PyList(iterate(v).sort((a, c) => (a < c ? -1 : a > c ? 1 : 0))));
    def('type', ([v]) => typeName(v));
    def('input', () => {
      throw new PyError('NotImplementedError', tr('e.noInput'));
    });
  }

  // ---------- Execução ----------

  execBlock(body: Node[], scope: Scope) {
    for (const st of body) this.exec(st, scope);
  }

  exec(n: Node, scope: Scope): void {
    this.line = n.line;
    this.hooks.tick(n.line);
    switch (n.type) {
      case 'Expr': this.eval(n.value, scope); return;
      case 'Assign': {
        const v = this.eval(n.value, scope);
        for (const t of n.targets) this.assign(t, v, scope);
        return;
      }
      case 'AugAssign': {
        const cur = this.eval(n.target, scope);
        const v = this.binop(n.op, cur, this.eval(n.value, scope));
        this.assign(n.target, v, scope);
        return;
      }
      case 'If':
        if (truthy(this.eval(n.test, scope))) this.execBlock(n.body, scope);
        else this.execBlock(n.orelse, scope);
        return;
      case 'While':
        while (truthy(this.eval(n.test, scope))) {
          try {
            this.execBlock(n.body, scope);
          } catch (e) {
            if (e instanceof BreakSig) break;
            if (e instanceof ContinueSig) { this.line = n.line; this.hooks.tick(n.line); continue; }
            throw e;
          }
          this.line = n.line;
          this.hooks.tick(n.line);
        }
        return;
      case 'For': {
        const items = iterate(this.eval(n.iter, scope));
        for (const it of items) {
          this.assign(n.target, it, scope);
          try {
            this.execBlock(n.body, scope);
          } catch (e) {
            if (e instanceof BreakSig) break;
            if (e instanceof ContinueSig) continue;
            throw e;
          }
          this.line = n.line;
        }
        return;
      }
      case 'FunctionDef': {
        const params = n.params.map((p: any) => ({ name: p.name, def: p.def ? this.eval(p.def, scope) : undefined }));
        this.setVar(n.name, new PyFunction(n.name, params, n.body, scope), scope);
        return;
      }
      case 'Return': throw new ReturnSig(n.value ? this.eval(n.value, scope) : null);
      case 'Break': throw new BreakSig();
      case 'Continue': throw new ContinueSig();
      case 'Pass': return;
      case 'Global': n.names.forEach((x: string) => scope.globalNames.add(x)); return;
      case 'Raise': {
        const v = n.value ? this.eval(n.value, scope) : null;
        throw new PyError('Exception', v === null ? tr('e.raised') : pyStr(v));
      }
      case 'Import':
        for (const { name, as } of n.names) {
          const mod = this.loadModule(name);
          if (as) this.setVar(as, mod, scope);
          else {
            // import pybricks.tools -> define 'pybricks'
            const top = name.split('.')[0];
            this.setVar(top, name.includes('.') ? this.loadModule(top) : mod, scope);
          }
        }
        return;
      case 'ImportFrom': {
        const mod = this.loadModule(n.module);
        if (n.names === '*') {
          for (const [k, v] of Object.entries(mod.attrs)) this.setVar(k, v, scope);
          return;
        }
        for (const { name, as } of n.names) {
          if (!(name in mod.attrs)) {
            throw new PyError('ImportError', tr('e.importName', { name, module: n.module }) + importHint(n.module, name));
          }
          this.setVar(as ?? name, mod.attrs[name], scope);
        }
        return;
      }
    }
    throw new PyError('SyntaxError', tr('e.stmt', { type: n.type }));
  }

  loadModule(name: string): PyModule {
    const m = this.hooks.importModule(name);
    if (!m) {
      const hint = name === 'math' ? ' ' + tr('e.useUmath') : name === 'time' ? ' ' + tr('e.useWait') : '';
      throw new PyError('ImportError', tr('e.noModule', { name }) + hint);
    }
    return m;
  }

  setVar(name: string, v: any, scope: Scope) {
    if (scope.globalNames.has(name)) this.globals.vars.set(name, v);
    else scope.vars.set(name, v);
  }

  assign(t: Node, v: any, scope: Scope) {
    switch (t.type) {
      case 'Name': this.setVar(t.id, v, scope); return;
      case 'Tuple':
      case 'List': {
        const items = iterate(v);
        if (items.length !== t.elts.length) {
          throw new PyError('ValueError', tr('e.unpack', { n: t.elts.length, m: items.length }));
        }
        t.elts.forEach((e: Node, i: number) => this.assign(e, items[i], scope));
        return;
      }
      case 'Attribute': {
        const obj = this.eval(t.value, scope);
        if (obj instanceof PyObject && obj.attrs[t.attr] instanceof NativeFn) {
          throw new PyError('AttributeError', tr('e.isMethod', { attr: t.attr, type: obj.typeName }));
        }
        if (obj instanceof PyObject) { obj.attrs[t.attr] = v; return; }
        throw new PyError('AttributeError', tr('e.setAttr', { type: tpt(obj) }));
      }
      case 'Subscript': {
        const obj = this.eval(t.value, scope);
        const idx = this.eval(t.index, scope);
        if (obj instanceof PyList) { obj.items[this.index(obj.items.length, idx)] = v; return; }
        if (obj instanceof PyDict) { obj.map.set(idx, v); return; }
        throw new PyError('TypeError', tr('e.setItem', { type: tpt(obj) }));
      }
      case 'Compare':
        throw new PyError('SyntaxError', tr('e.assignCompare'));
    }
    throw new PyError('SyntaxError', tr('e.badTarget'));
  }

  index(len: number, idx: any): number {
    if (typeof idx !== 'number' || !Number.isInteger(idx)) throw new PyError('TypeError', tr('e.indexInt'));
    const i = idx < 0 ? len + idx : idx;
    if (i < 0 || i >= len) throw new PyError('IndexError', tr('e.indexRange', { i: idx, n: len, last: len - 1 }));
    return i;
  }

  // ---------- Expressões ----------

  eval(n: Node, scope: Scope): any {
    switch (n.type) {
      case 'Num': return n.value;
      case 'Str': return n.value;
      case 'Const': return n.value;
      case 'JoinedStr':
        return n.parts.map((p: Node) => (p.type === 'Str' ? p.value : p.type === 'JoinedStr' ? this.eval(p, scope) : formatSpec(this.eval(p.value, scope), p.spec))).join('');
      case 'Name': {
        const v = scope.lookup(n.id);
        if (v !== undefined) return v;
        if (this.builtins.has(n.id)) return this.builtins.get(n.id);
        throw new PyError('NameError', tr('e.nameUndef', { name: n.id }) + this.nameHint(n.id, scope), n.line);
      }
      case 'List': return new PyList(n.elts.map((e: Node) => this.eval(e, scope)));
      case 'Tuple': return new PyTuple(n.elts.map((e: Node) => this.eval(e, scope)));
      case 'Dict': {
        const d = new PyDict();
        n.keys.forEach((k: Node, i: number) => d.map.set(this.eval(k, scope), this.eval(n.values[i], scope)));
        return d;
      }
      case 'BoolOp': {
        const l = this.eval(n.left, scope);
        if (n.op === 'and') return truthy(l) ? this.eval(n.right, scope) : l;
        return truthy(l) ? l : this.eval(n.right, scope);
      }
      case 'UnaryOp': {
        const v = this.eval(n.operand, scope);
        if (n.op === 'not') return !truthy(v);
        if (n.op === '-') return -toNumber(v, tr('e.negValue'));
        if (n.op === '+') return +toNumber(v);
        if (n.op === '~') return ~toNumber(v);
        break;
      }
      case 'BinOp': return this.binop(n.op, this.eval(n.left, scope), this.eval(n.right, scope));
      case 'Compare': {
        let left = this.eval(n.left, scope);
        for (let i = 0; i < n.ops.length; i++) {
          const right = this.eval(n.comps[i], scope);
          if (!this.compare(n.ops[i], left, right)) return false;
          left = right;
        }
        return true;
      }
      case 'IfExp': return truthy(this.eval(n.test, scope)) ? this.eval(n.body, scope) : this.eval(n.orelse, scope);
      case 'Attribute': return this.getattr(this.eval(n.value, scope), n.attr);
      case 'Subscript': {
        const obj = this.eval(n.value, scope);
        if (n.index.type === 'Slice') {
          const lo = n.index.lower ? toNumber(this.eval(n.index.lower, scope)) : undefined;
          const hi = n.index.upper ? toNumber(this.eval(n.index.upper, scope)) : undefined;
          if (typeof obj === 'string') return obj.slice(lo, hi);
          if (obj instanceof PyList) return new PyList(obj.items.slice(lo, hi));
          if (obj instanceof PyTuple) return new PyTuple(obj.items.slice(lo, hi));
          throw new PyError('TypeError', tr('e.noSlice', { type: tpt(obj) }));
        }
        const idx = this.eval(n.index, scope);
        if (obj instanceof PyList || obj instanceof PyTuple) return obj.items[this.index(obj.items.length, idx)];
        if (typeof obj === 'string') return obj[this.index(obj.length, idx)];
        if (obj instanceof PyDict) {
          if (!obj.map.has(idx)) throw new PyError('KeyError', tr('e.noKey', { k: pyRepr(idx) }));
          return obj.map.get(idx);
        }
        throw new PyError('TypeError', tr('e.getItem', { type: tpt(obj) }));
      }
      case 'Call': {
        const fn = this.eval(n.func, scope);
        const args = n.args.map((a: Node) => this.eval(a, scope));
        const kw: Kwargs = {};
        for (const k of n.kwargs) kw[k.name] = this.eval(k.value, scope);
        const res = this.call(fn, args, kw, n);
        this.line = n.line;
        return res;
      }
    }
    throw new PyError('SyntaxError', tr('e.expr', { type: n.type }));
  }

  nameHint(name: string, scope: Scope): string {
    const known = [...this.globals.vars.keys(), ...scope.vars.keys(), ...this.builtins.keys()];
    const low = name.toLowerCase();
    const similar = known.find((k) => k.toLowerCase() === low && k !== name);
    if (similar) return '. ' + tr('e.didYouMean', { s: similar });
    // Nomes antigos do BatControl (robot, left_arm, right_arm) viraram robo, anexo_left, anexo_right
    const renamed: Record<string, string> = { robot: 'robo', left_arm: 'anexo_left', right_arm: 'anexo_right' };
    if (renamed[name] && known.includes(renamed[name])) return '. ' + tr('e.didYouMean', { s: renamed[name] });
    if (['DriveBase', 'Motor', 'ColorSensor', 'PrimeHub', 'Port', 'Direction', 'Color', 'Stop', 'wait', 'StopWatch'].includes(name)) {
      return '. ' + tr('e.missingImport');
    }
    if (name === 'true' || name === 'false') return '. ' + tr('e.capBool', { v: name === 'true' ? 'True' : 'False' });
    return '. ' + tr('e.checkVar');
  }

  getattr(obj: any, attr: string): any {
    if (obj instanceof PyObject) {
      if (attr in obj.attrs) return obj.attrs[attr];
      const hint = obj.hints[attr];
      throw new PyError('AttributeError', tr('e.noAttr', { type: obj.typeName, attr }) + (hint ? '. ' + tr(hint) : ''));
    }
    if (obj instanceof PyModule) {
      if (attr in obj.attrs) return obj.attrs[attr];
      throw new PyError('AttributeError', tr('e.moduleNoAttr', { module: obj.name, attr }));
    }
    if (obj instanceof PyList) {
      const items = obj.items;
      const m: Record<string, (a: any[]) => any> = {
        append: ([x]) => { items.push(x); return null; },
        pop: ([i]) => {
          if (!items.length) throw new PyError('IndexError', tr('e.popEmpty'));
          return i === undefined ? items.pop() : items.splice(this.index(items.length, i), 1)[0];
        },
        insert: ([i, x]) => { items.splice(i, 0, x); return null; },
        remove: ([x]) => {
          const k = items.findIndex((y) => pyEq(y, x));
          if (k < 0) throw new PyError('ValueError', tr('e.notInList', { x: pyRepr(x) }));
          items.splice(k, 1);
          return null;
        },
        index: ([x]) => {
          const k = items.findIndex((y) => pyEq(y, x));
          if (k < 0) throw new PyError('ValueError', tr('e.notInList', { x: pyRepr(x) }));
          return k;
        },
        count: ([x]) => items.filter((y) => pyEq(y, x)).length,
        clear: () => { items.length = 0; return null; },
        reverse: () => { items.reverse(); return null; },
        sort: () => { items.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)); return null; },
      };
      if (m[attr]) return new NativeFn(attr, (a) => m[attr](a));
    }
    if (typeof obj === 'string') {
      const m: Record<string, (a: any[]) => any> = {
        upper: () => obj.toUpperCase(),
        lower: () => obj.toLowerCase(),
        strip: () => obj.trim(),
        split: ([sep]) => new PyList(sep === undefined || sep === null ? obj.trim().split(/\s+/) : obj.split(sep)),
        replace: ([a, b]) => obj.split(a).join(b),
        startswith: ([p]) => obj.startsWith(p),
        endswith: ([p]) => obj.endsWith(p),
        join: ([it]) => iterate(it).map(pyStr).join(obj),
        format: (a) => { let i = 0; return obj.replace(/\{\}/g, () => pyStr(a[i++])); },
      };
      if (m[attr]) return new NativeFn(attr, (a) => m[attr](a));
    }
    if (obj instanceof PyDict) {
      const d = obj.map;
      const m: Record<string, (a: any[]) => any> = {
        get: ([k, def]) => (d.has(k) ? d.get(k) : def ?? null),
        keys: () => new PyList([...d.keys()]),
        values: () => new PyList([...d.values()]),
        items: () => new PyList([...d.entries()].map(([k, v]) => new PyTuple([k, v]))),
      };
      if (m[attr]) return new NativeFn(attr, (a) => m[attr](a));
    }
    if (obj instanceof PyEnum && attr in obj.extra) return obj.extra[attr];
    throw new PyError('AttributeError', tr('e.noAttr', { type: tpt(obj), attr }));
  }

  call(fn: any, args: any[], kw: Kwargs, node?: Node): any {
    if (fn instanceof NativeFn) return fn.fn(args, kw);
    if (fn instanceof PyFunction) {
      if (this.depth > MAX_DEPTH) throw new PyError('RecursionError', tr('e.recursion'));
      const local = new Scope(fn.closure);
      const ps = fn.params;
      if (args.length > ps.length) {
        throw new PyError('TypeError', tr('e.argCount', { f: fn.name, n: ps.length, m: args.length }));
      }
      ps.forEach((p, i) => {
        let v: any;
        if (i < args.length) {
          v = args[i];
          if (p.name in kw) throw new PyError('TypeError', tr('e.argTwice', { f: fn.name, p: p.name }));
        } else if (p.name in kw) v = kw[p.name];
        else if (p.def !== undefined) v = p.def;
        else throw new PyError('TypeError', tr('e.argMissing', { f: fn.name, p: p.name }));
        local.vars.set(p.name, v);
      });
      for (const k of Object.keys(kw)) {
        if (!ps.some((p) => p.name === k)) throw new PyError('TypeError', tr('e.argUnknown', { f: fn.name, p: k }));
      }
      this.depth++;
      try {
        this.execBlock(fn.body, local);
      } catch (e) {
        if (e instanceof ReturnSig) return e.value;
        throw e;
      } finally {
        this.depth--;
      }
      return null;
    }
    if (typeof fn === 'string' && node?.func?.type === 'Name' && fn === node.func.id) {
      throw new PyError('TypeError', tr('e.strNotFn', { s: fn }));
    }
    const what = node?.func?.type === 'Attribute' ? `'${node.func.attr}'` : `${tpt(fn)}`;
    throw new PyError('TypeError', tr('e.notFn', { what }));
  }

  binop(op: string, a: any, b: any): any {
    if (op === '+') {
      if (typeof a === 'string' && typeof b === 'string') return a + b;
      if (a instanceof PyList && b instanceof PyList) return new PyList([...a.items, ...b.items]);
      if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple([...a.items, ...b.items]);
      if (typeof a === 'string' || typeof b === 'string') {
        throw new PyError('TypeError', tr('e.strPlusNum'));
      }
    }
    if (op === '*') {
      if (typeof a === 'string' && typeof b === 'number') return a.repeat(Math.max(0, b));
      if (a instanceof PyList && typeof b === 'number') return new PyList(Array.from({ length: Math.max(0, b) }, () => a.items).flat());
    }
    if (op === '%' && typeof a === 'string') {
      const vals = b instanceof PyTuple ? b.items : [b];
      let i = 0;
      return a.replace(/%(\.\d+)?[sdif]/g, (m, prec) => {
        const v = vals[i++];
        if (m.endsWith('d') || m.endsWith('i')) return String(Math.trunc(toNumber(v)));
        if (m.endsWith('f')) return toNumber(v).toFixed(prec ? Number(prec.slice(1)) : 6);
        return pyStr(v);
      });
    }
    const x = toNumber(a, tr('e.leftOf', { op }));
    const y = toNumber(b, tr('e.rightOf', { op }));
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
      case '/':
        if (y === 0) throw new PyError('ZeroDivisionError', tr('e.div0'));
        return x / y;
      case '//':
        if (y === 0) throw new PyError('ZeroDivisionError', tr('e.floordiv0'));
        return Math.floor(x / y);
      case '%':
        if (y === 0) throw new PyError('ZeroDivisionError', tr('e.mod0'));
        return x - y * Math.floor(x / y);
      case '**': return x ** y;
      case '&': return x & y;
      case '|': return x | y;
      case '^': return x ^ y;
    }
    throw new PyError('SyntaxError', tr('e.op', { op }));
  }

  compare(op: string, a: any, b: any): boolean {
    switch (op) {
      case '==': return pyEq(a, b);
      case '!=': return !pyEq(a, b);
      case 'is': return a === b || (a == null && b == null);
      case 'is not': return !(a === b || (a == null && b == null));
      case 'in':
      case 'not in': {
        let r: boolean;
        if (typeof b === 'string') r = b.includes(pyStr(a));
        else if (b instanceof PyDict) r = b.map.has(a);
        else r = iterate(b).some((x) => pyEq(x, a));
        return op === 'in' ? r : !r;
      }
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
    }
    if (a instanceof PyEnum || b instanceof PyEnum) {
      throw new PyError('TypeError', tr('e.compare', { a: pyRepr(a), b: pyRepr(b), op }));
    }
    const x = toNumber(a, tr('e.compared'));
    const y = toNumber(b, tr('e.compared'));
    return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
}

function formatSpec(v: any, spec: string): string {
  if (!spec) return pyStr(v);
  const m = /^([<>^]?)(\d*)(?:\.(\d+))?([fdi%]?)$/.exec(spec);
  if (!m) return pyStr(v);
  const [, align, width, prec, kind] = m;
  let s: string;
  if (kind === 'f') s = toNumber(v).toFixed(prec ? Number(prec) : 6);
  else if (kind === 'd' || kind === 'i') s = String(Math.round(toNumber(v)));
  else if (kind === '%') s = (toNumber(v) * 100).toFixed(prec ? Number(prec) : 6) + '%';
  else if (prec) s = toNumber(v).toFixed(Number(prec));
  else s = pyStr(v);
  const w = Number(width || 0);
  if (s.length < w) {
    const pad = ' '.repeat(w - s.length);
    s = align === '<' ? s + pad : align === '^' ? pad.slice(0, pad.length >> 1) + s + pad.slice(pad.length >> 1) : pad + s;
  }
  return s;
}

function importHint(module: string, name: string): string {
  const where: Record<string, string> = {
    DriveBase: 'pybricks.robotics',
    Motor: 'pybricks.pupdevices',
    ColorSensor: 'pybricks.pupdevices',
    UltrasonicSensor: 'pybricks.pupdevices',
    ForceSensor: 'pybricks.pupdevices',
    PrimeHub: 'pybricks.hubs',
    Port: 'pybricks.parameters',
    Direction: 'pybricks.parameters',
    Stop: 'pybricks.parameters',
    Color: 'pybricks.parameters',
    Button: 'pybricks.parameters',
    wait: 'pybricks.tools',
    StopWatch: 'pybricks.tools',
  };
  if (where[name] && where[name] !== module) return '. ' + tr('e.livesIn', { name, module: where[name] });
  return '';
}
