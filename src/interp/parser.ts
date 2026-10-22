// Parser recursivo descendente para o subconjunto de Python usado no BatControl.
import { t as tr } from '../i18n';
import { PySyntaxError, Token, tokenize } from './lexer';

export type Node = any;

const KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
  'raise', 'return', 'try', 'while', 'with', 'yield', 'async', 'await',
]);

const AUG = ['+=', '-=', '*=', '/=', '//=', '%=', '**='];

export function parse(src: string): Node {
  return new Parser(tokenize(src)).program();
}

class Parser {
  i = 0;
  constructor(private t: Token[]) {}

  get tok() { return this.t[this.i]; }
  peek(n = 1) { return this.t[this.i + n]; }

  err(msg: string, tok = this.tok): never {
    throw new PySyntaxError(msg, tok.line || this.t[Math.max(0, this.i - 1)].line);
  }

  isOp(v: string) { return this.tok.type === 'op' && this.tok.value === v; }
  isKw(v: string) { return this.tok.type === 'name' && this.tok.value === v; }

  eatOp(v: string) {
    if (!this.isOp(v)) {
      const got = this.describe(this.tok);
      const hint = v === ':' ? ' ' + tr('e.hintColon') : v === ')' ? ' ' + tr('e.hintParen') : '';
      this.err('SyntaxError: ' + tr('e.expectedGot', { v, got }) + hint);
    }
    return this.t[this.i++];
  }
  eatKw(v: string) {
    if (!this.isKw(v)) this.err('SyntaxError: ' + tr('e.expected', { v }));
    return this.t[this.i++];
  }
  describe(tok: Token) {
    if (tok.type === 'newline') return tr('e.tokNewline');
    if (tok.type === 'eof') return tr('e.tokEof');
    if (tok.type === 'indent') return tr('e.tokIndent');
    if (tok.type === 'dedent') return tr('e.tokDedent');
    return `'${tok.value}'`;
  }
  name(): string {
    if (this.tok.type !== 'name' || KEYWORDS.has(this.tok.value)) this.err('SyntaxError: ' + tr('e.expectedName', { got: this.describe(this.tok) }));
    return this.t[this.i++].value;
  }
  endStmt() {
    if (this.isOp(';')) { this.i++; return; }
    if (this.tok.type === 'newline') { this.i++; return; }
    if (this.tok.type === 'eof' || this.tok.type === 'dedent') return;
    this.err('SyntaxError: ' + tr('e.leftover', { got: this.describe(this.tok) }));
  }

  program(): Node {
    const body: Node[] = [];
    while (this.tok.type !== 'eof') {
      if (this.tok.type === 'newline') { this.i++; continue; }
      if (this.tok.type === 'indent') this.err('IndentationError: ' + tr('e.unexpectedIndent'));
      body.push(...this.statement());
    }
    return { type: 'Module', body };
  }

  block(): Node[] {
    this.eatOp(':');
    if (this.tok.type !== 'newline') {
      // Bloco na mesma linha: if x: pass
      return this.simpleStatements();
    }
    this.i++;
    if ((this.tok.type as string) !== 'indent') this.err('IndentationError: ' + tr('e.expectedIndent'));
    this.i++;
    const body: Node[] = [];
    while ((this.tok.type as string) !== 'dedent' && (this.tok.type as string) !== 'eof') {
      if (this.tok.type === 'newline') { this.i++; continue; }
      body.push(...this.statement());
    }
    if ((this.tok.type as string) === 'dedent') this.i++;
    return body;
  }

  statement(): Node[] {
    const tok = this.tok;
    if (tok.type === 'name') {
      switch (tok.value) {
        case 'if': return [this.ifStmt()];
        case 'while': {
          this.i++;
          const test = this.expr();
          const body = this.block();
          return [{ type: 'While', test, body, line: tok.line }];
        }
        case 'for': {
          this.i++;
          const target = this.targetList();
          this.eatKw('in');
          const iter = this.exprList();
          const body = this.block();
          return [{ type: 'For', target, iter, body, line: tok.line }];
        }
        case 'def': {
          this.i++;
          const name = this.name();
          this.eatOp('(');
          const params: { name: string; def?: Node }[] = [];
          while (!this.isOp(')')) {
            const pname = this.name();
            let def: Node | undefined;
            if (this.isOp(':')) { this.i++; this.expr(); }
            if (this.isOp('=')) { this.i++; def = this.expr(); }
            params.push({ name: pname, def });
            if (!this.isOp(')')) this.eatOp(',');
          }
          this.eatOp(')');
          if (this.isOp('->')) { this.i++; this.expr(); }
          const body = this.block();
          return [{ type: 'FunctionDef', name, params, body, line: tok.line }];
        }
        case 'class':
          this.err(tr('e.noClass'));
        case 'try':
          this.err(tr('e.noFeature', { what: 'try/except' }));
        case 'with':
          this.err(tr('e.noFeature', { what: 'with' }));
        case 'async':
          this.err(tr('e.noFeature', { what: 'async/await' }));
      }
    }
    return this.simpleStatements();
  }

  simpleStatements(): Node[] {
    const out: Node[] = [this.simpleStatement()];
    while (this.isOp(';')) {
      this.i++;
      if (this.tok.type === 'newline') break;
      out.push(this.simpleStatement());
    }
    this.endStmt();
    return out;
  }

  ifStmt(): Node {
    const tok = this.tok;
    this.i++; // if / elif
    const test = this.expr();
    const body = this.block();
    let orelse: Node[] = [];
    if (this.isKw('elif')) orelse = [this.ifStmt()];
    else if (this.isKw('else')) { this.i++; orelse = this.block(); }
    return { type: 'If', test, body, orelse, line: tok.line };
  }

  simpleStatement(): Node {
    const tok = this.tok;
    const line = tok.line;
    if (tok.type === 'name') {
      switch (tok.value) {
        case 'pass': this.i++; return { type: 'Pass', line };
        case 'break': this.i++; return { type: 'Break', line };
        case 'continue': this.i++; return { type: 'Continue', line };
        case 'return': {
          this.i++;
          const value = this.tok.type === 'newline' || this.isOp(';') || this.tok.type === 'eof' ? null : this.exprList();
          return { type: 'Return', value, line };
        }
        case 'global': {
          this.i++;
          const names = [this.name()];
          while (this.isOp(',')) { this.i++; names.push(this.name()); }
          return { type: 'Global', names, line };
        }
        case 'import': {
          this.i++;
          const names: { name: string; as?: string }[] = [];
          do {
            if (this.isOp(',')) this.i++;
            let name = this.name();
            while (this.isOp('.')) { this.i++; name += '.' + this.name(); }
            let as: string | undefined;
            if (this.isKw('as')) { this.i++; as = this.name(); }
            names.push({ name, as });
          } while (this.isOp(','));
          return { type: 'Import', names, line };
        }
        case 'from': {
          this.i++;
          let module = this.name();
          while (this.isOp('.')) { this.i++; module += '.' + this.name(); }
          this.eatKw('import');
          if (this.isOp('*')) { this.i++; return { type: 'ImportFrom', module, names: '*', line }; }
          const paren = this.isOp('(');
          if (paren) this.i++;
          const names: { name: string; as?: string }[] = [];
          do {
            if (this.isOp(',')) this.i++;
            if (paren && this.isOp(')')) break;
            const name = this.name();
            let as: string | undefined;
            if (this.isKw('as')) { this.i++; as = this.name(); }
            names.push({ name, as });
          } while (this.isOp(','));
          if (paren) this.eatOp(')');
          return { type: 'ImportFrom', module, names, line };
        }
        case 'raise': {
          this.i++;
          const value = this.tok.type === 'newline' ? null : this.expr();
          return { type: 'Raise', value, line };
        }
        case 'del':
          this.err(tr('e.noFeature', { what: 'del' }));
      }
    }
    const first = this.exprList();
    if (this.isOp('=')) {
      const targets = [first];
      let value: Node;
      while (true) {
        this.i++;
        value = this.exprList();
        if (this.isOp('=')) targets.push(value); else break;
      }
      for (const t of targets) this.checkTarget(t);
      return { type: 'Assign', targets, value, line };
    }
    if (this.tok.type === 'op' && AUG.includes(this.tok.value)) {
      const op = this.tok.value.slice(0, -1);
      this.i++;
      this.checkTarget(first);
      const value = this.exprList();
      return { type: 'AugAssign', target: first, op, value, line };
    }
    if (this.isOp(':') && first.type === 'Name') {
      // Anotação de tipo: x: int = 3
      this.i++;
      this.expr();
      if (this.isOp('=')) { this.i++; const value = this.exprList(); return { type: 'Assign', targets: [first], value, line }; }
      return { type: 'Pass', line };
    }
    return { type: 'Expr', value: first, line };
  }

  checkTarget(t: Node) {
    if (t.type === 'Name' || t.type === 'Attribute' || t.type === 'Subscript') return;
    if (t.type === 'Tuple' || t.type === 'List') { t.elts.forEach((e: Node) => this.checkTarget(e)); return; }
    if (t.type === 'Compare' && t.ops[0] === '==') return;
    this.err('SyntaxError: ' + tr('e.badAssign'));
  }

  targetList(): Node {
    const first = this.bitOr();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.isOp(',')) { this.i++; if (this.isKw('in')) break; elts.push(this.bitOr()); }
    return { type: 'Tuple', elts };
  }

  exprList(): Node {
    const first = this.expr();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.isOp(',')) {
      this.i++;
      if (this.tok.type === 'newline' || this.isOp('=') || this.isOp(')') || this.tok.type === 'eof') break;
      elts.push(this.expr());
    }
    return { type: 'Tuple', elts, line: first.line };
  }

  expr(): Node {
    if (this.isKw('lambda')) this.err(tr('e.noLambda'));
    const body = this.orExpr();
    if (this.isKw('if')) {
      this.i++;
      const test = this.orExpr();
      this.eatKw('else');
      const orelse = this.expr();
      return { type: 'IfExp', test, body, orelse, line: body.line };
    }
    return body;
  }

  orExpr(): Node {
    let left = this.andExpr();
    while (this.isKw('or')) { this.i++; left = { type: 'BoolOp', op: 'or', left, right: this.andExpr(), line: left.line }; }
    return left;
  }
  andExpr(): Node {
    let left = this.notExpr();
    while (this.isKw('and')) { this.i++; left = { type: 'BoolOp', op: 'and', left, right: this.notExpr(), line: left.line }; }
    return left;
  }
  notExpr(): Node {
    if (this.isKw('not')) { const line = this.tok.line; this.i++; return { type: 'UnaryOp', op: 'not', operand: this.notExpr(), line }; }
    return this.comparison();
  }
  comparison(): Node {
    const left = this.bitOr();
    const ops: string[] = [];
    const comps: Node[] = [];
    while (true) {
      const tk = this.tok;
      let op: string | null = null;
      if (tk.type === 'op' && ['<', '>', '==', '!=', '<=', '>='].includes(tk.value)) { op = tk.value; this.i++; }
      else if (this.isKw('in')) { op = 'in'; this.i++; }
      else if (this.isKw('not') && this.peek().type === 'name' && this.peek().value === 'in') { op = 'not in'; this.i += 2; }
      else if (this.isKw('is')) {
        this.i++;
        if (this.isKw('not')) { this.i++; op = 'is not'; } else op = 'is';
      }
      if (!op) break;
      ops.push(op);
      comps.push(this.bitOr());
    }
    if (!ops.length) return left;
    return { type: 'Compare', left, ops, comps, line: left.line };
  }
  bitOr(): Node {
    let left = this.bitXor();
    while (this.isOp('|')) { this.i++; left = { type: 'BinOp', op: '|', left, right: this.bitXor(), line: left.line }; }
    return left;
  }
  bitXor(): Node {
    let left = this.bitAnd();
    while (this.isOp('^')) { this.i++; left = { type: 'BinOp', op: '^', left, right: this.bitAnd(), line: left.line }; }
    return left;
  }
  bitAnd(): Node {
    let left = this.arith();
    while (this.isOp('&')) { this.i++; left = { type: 'BinOp', op: '&', left, right: this.arith(), line: left.line }; }
    return left;
  }
  arith(): Node {
    let left = this.term();
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.t[this.i++].value;
      left = { type: 'BinOp', op, left, right: this.term(), line: left.line };
    }
    return left;
  }
  term(): Node {
    let left = this.factor();
    while (this.isOp('*') || this.isOp('/') || this.isOp('//') || this.isOp('%')) {
      const op = this.t[this.i++].value;
      left = { type: 'BinOp', op, left, right: this.factor(), line: left.line };
    }
    return left;
  }
  factor(): Node {
    if (this.isOp('-') || this.isOp('+') || this.isOp('~')) {
      const tk = this.t[this.i++];
      return { type: 'UnaryOp', op: tk.value, operand: this.factor(), line: tk.line };
    }
    return this.power();
  }
  power(): Node {
    const base = this.postfix();
    if (this.isOp('**')) {
      this.i++;
      return { type: 'BinOp', op: '**', left: base, right: this.factor(), line: base.line };
    }
    return base;
  }
  postfix(): Node {
    let node = this.atom();
    while (true) {
      if (this.isOp('(')) {
        const line = this.tok.line;
        this.i++;
        const args: Node[] = [];
        const kwargs: { name: string; value: Node }[] = [];
        while (!this.isOp(')')) {
          if (this.tok.type === 'name' && this.peek().type === 'op' && this.peek().value === '=') {
            const name = this.name();
            this.i++;
            kwargs.push({ name, value: this.expr() });
          } else {
            if (kwargs.length) this.err('SyntaxError: ' + tr('e.kwOrder'));
            args.push(this.expr());
          }
          if (!this.isOp(')')) this.eatOp(',');
        }
        this.eatOp(')');
        node = { type: 'Call', func: node, args, kwargs, line };
      } else if (this.isOp('.')) {
        this.i++;
        const attr = this.name();
        node = { type: 'Attribute', value: node, attr, line: node.line };
      } else if (this.isOp('[')) {
        this.i++;
        let index: Node;
        if (this.isOp(':') || this.peekSlice()) {
          const lower = this.isOp(':') ? null : this.expr();
          this.eatOp(':');
          const upper = this.isOp(']') ? null : this.expr();
          index = { type: 'Slice', lower, upper };
        } else index = this.exprList();
        this.eatOp(']');
        node = { type: 'Subscript', value: node, index, line: node.line };
      } else break;
    }
    return node;
  }
  peekSlice(): boolean {
    // Procura ':' no mesmo nível antes do ']'
    let d = 0;
    for (let j = this.i; j < this.t.length; j++) {
      const tk = this.t[j];
      if (tk.type !== 'op') { if (tk.type === 'newline' || tk.type === 'eof') return false; continue; }
      if ('([{'.includes(tk.value)) d++;
      else if (')]}'.includes(tk.value)) { if (d === 0) return false; d--; }
      else if (tk.value === ':' && d === 0) return true;
    }
    return false;
  }

  atom(): Node {
    const tk = this.tok;
    const line = tk.line;
    if (tk.type === 'num') {
      this.i++;
      const v = tk.value;
      const value = /^0[xX]/.test(v) ? parseInt(v, 16) : /^0[bB]/.test(v) ? parseInt(v.slice(2), 2) : Number(v);
      return { type: 'Num', value, isFloat: /[.eE]/.test(v) && !/^0[xX]/.test(v), line };
    }
    if (tk.type === 'str' || tk.type === 'fstr') {
      // Concatenação implícita "a" "b"
      const parts: Node[] = [];
      while (this.tok.type === 'str' || this.tok.type === 'fstr') {
        const t = this.t[this.i++];
        parts.push(t.type === 'str' ? { type: 'Str', value: t.value } : this.fstring(t));
      }
      if (parts.length === 1) return { ...parts[0], line };
      return { type: 'JoinedStr', parts, line };
    }
    if (tk.type === 'name') {
      if (tk.value === 'True' || tk.value === 'False') { this.i++; return { type: 'Const', value: tk.value === 'True', line }; }
      if (tk.value === 'None') { this.i++; return { type: 'Const', value: null, line }; }
      if (KEYWORDS.has(tk.value)) this.err('SyntaxError: ' + tr('e.reserved', { w: tk.value }));
      this.i++;
      return { type: 'Name', id: tk.value, line };
    }
    if (tk.type === 'op') {
      if (tk.value === '(') {
        this.i++;
        if (this.isOp(')')) { this.i++; return { type: 'Tuple', elts: [], line }; }
        const first = this.expr();
        if (this.isOp(')')) { this.i++; return first; }
        const elts = [first];
        while (this.isOp(',')) { this.i++; if (this.isOp(')')) break; elts.push(this.expr()); }
        this.eatOp(')');
        return { type: 'Tuple', elts, line };
      }
      if (tk.value === '[') {
        this.i++;
        const elts: Node[] = [];
        while (!this.isOp(']')) {
          elts.push(this.expr());
          if (this.isKw('for')) this.err(tr('e.noComprehension'));
          if (!this.isOp(']')) this.eatOp(',');
        }
        this.i++;
        return { type: 'List', elts, line };
      }
      if (tk.value === '{') {
        this.i++;
        const keys: Node[] = [];
        const values: Node[] = [];
        while (!this.isOp('}')) {
          keys.push(this.expr());
          this.eatOp(':');
          values.push(this.expr());
          if (!this.isOp('}')) this.eatOp(',');
        }
        this.i++;
        return { type: 'Dict', keys, values, line };
      }
    }
    if (tk.type === 'indent') this.err('IndentationError: ' + tr('e.unexpectedIndentShort'));
    this.err('SyntaxError: ' + tr('e.unexpected', { got: this.describe(tk) }));
  }

  fstring(tok: Token): Node {
    const s = tok.value;
    const parts: Node[] = [];
    let buf = '';
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '{' && s[i + 1] === '{') { buf += '{'; i += 2; continue; }
      if (c === '}' && s[i + 1] === '}') { buf += '}'; i += 2; continue; }
      if (c === '{') {
        if (buf) { parts.push({ type: 'Str', value: buf }); buf = ''; }
        let d = 1;
        let j = i + 1;
        while (j < s.length && d > 0) {
          if (s[j] === '{') d++;
          if (s[j] === '}') d--;
          if (d > 0) j++;
        }
        const inner = s.slice(i + 1, j);
        let exprSrc = inner;
        let spec = '';
        const colon = findTopColon(inner);
        if (colon >= 0) { exprSrc = inner.slice(0, colon); spec = inner.slice(colon + 1); }
        const sub = new Parser(tokenize(exprSrc));
        const expr = sub.expr();
        parts.push({ type: 'FormattedValue', value: expr, spec });
        i = j + 1;
        continue;
      }
      buf += c;
      i++;
    }
    if (buf) parts.push({ type: 'Str', value: buf });
    return { type: 'JoinedStr', parts, line: tok.line };
  }
}

function findTopColon(s: string) {
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ('([{'.includes(c)) d++;
    else if (')]}'.includes(c)) d--;
    else if (c === ':' && d === 0) return i;
  }
  return -1;
}
