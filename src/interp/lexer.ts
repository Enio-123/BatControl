// Tokenizador de um subconjunto de Python (o suficiente para programas Pybricks).
import { t as tr } from '../i18n';

export type TokType = 'name' | 'num' | 'str' | 'fstr' | 'op' | 'newline' | 'indent' | 'dedent' | 'eof';

export interface Token {
  type: TokType;
  value: string;
  line: number;
  col: number;
}

export class PySyntaxError extends Error {
  constructor(message: string, public line: number) {
    super(message);
  }
}

const OPS = [
  '**=', '//=', '>>=', '<<=',
  '**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '->', '<<', '>>',
  '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', '[', ']', '{', '}', ',', ':', '.', ';', '&', '|', '^', '~', '@',
];

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const lines = src.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  const indents = [0];
  let depth = 0; // dentro de ( [ {
  let i = 0;
  // Junta tudo numa string só para lidar com strings de várias linhas.
  const text = lines.join('\n') + '\n';
  let line = 1;
  let lineStart = 0;
  let atLineStart = true;

  const push = (type: TokType, value: string, col: number) => tokens.push({ type, value, line, col });

  while (i < text.length) {
    if (atLineStart && depth === 0) {
      // Mede a indentação.
      let j = i;
      let width = 0;
      while (text[j] === ' ') { width++; j++; }
      if (text[j] === '\n' || text[j] === '#') {
        // Linha vazia ou só comentário: ignora.
        while (text[j] !== '\n') j++;
        i = j + 1;
        line++;
        lineStart = i;
        continue;
      }
      if (j >= text.length) break;
      const cur = indents[indents.length - 1];
      if (width > cur) {
        indents.push(width);
        push('indent', '', 0);
      } else if (width < cur) {
        while (indents.length && width < indents[indents.length - 1]) {
          indents.pop();
          push('dedent', '', 0);
        }
        if (indents[indents.length - 1] !== width) {
          throw new PySyntaxError('IndentationError: ' + tr('e.dedentMismatch'), line);
        }
      }
      i = j;
      atLineStart = false;
    }
    const c = text[i];
    const col = i - lineStart + 1;
    if (c === '\n') {
      if (depth === 0) {
        push('newline', '', col);
        atLineStart = true;
      }
      i++;
      line++;
      lineStart = i;
      continue;
    }
    if (c === ' ') { i++; continue; }
    if (c === '\\' && text[i + 1] === '\n') { i += 2; line++; lineStart = i; continue; }
    if (c === '#') {
      while (text[i] !== '\n') i++;
      continue;
    }
    // Números
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(text[i + 1]))) {
      const m = /^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|(\d[\d_]*)?\.?\d[\d_]*([eE][+-]?\d+)?)/.exec(text.slice(i));
      const raw = m![0];
      push('num', raw.replace(/_/g, ''), col);
      i += raw.length;
      continue;
    }
    // Strings (com prefixos f, r, b)
    const sm = /^([fFrRbB]{0,2})('''|"""|'|")/.exec(text.slice(i));
    if (sm) {
      const prefix = sm[1].toLowerCase();
      const quote = sm[2];
      let j = i + sm[0].length;
      let out = '';
      const startLine = line;
      while (true) {
        if (j >= text.length) throw new PySyntaxError('SyntaxError: ' + tr('e.strOpen'), startLine);
        if (text.startsWith(quote, j)) { j += quote.length; break; }
        const ch = text[j];
        if (ch === '\n') {
          if (quote.length === 1) throw new PySyntaxError('SyntaxError: ' + tr('e.strQuote'), startLine);
          line++;
          lineStart = j + 1;
        }
        if (ch === '\\' && !prefix.includes('r')) {
          const n = text[j + 1];
          const map: Record<string, string> = { n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"', '\n': '' };
          if (n in map) { out += map[n]; j += 2; continue; }
        }
        out += ch;
        j++;
      }
      push(prefix.includes('f') ? 'fstr' : 'str', out, col);
      tokens[tokens.length - 1].line = startLine;
      i = j;
      continue;
    }
    if (/[A-Za-z_À-ɏ]/.test(c)) {
      const m = /^[A-Za-z_À-ɏ][A-Za-z0-9_À-ɏ]*/.exec(text.slice(i))!;
      push('name', m[0], col);
      i += m[0].length;
      continue;
    }
    const op = OPS.find((o) => text.startsWith(o, i));
    if (op) {
      if (op === '(' || op === '[' || op === '{') depth++;
      if (op === ')' || op === ']' || op === '}') depth = Math.max(0, depth - 1);
      push('op', op, col);
      i += op.length;
      continue;
    }
    throw new PySyntaxError('SyntaxError: ' + tr('e.badChar', { c }), line);
  }
  if (tokens.length && tokens[tokens.length - 1].type !== 'newline') push('newline', '', 0);
  while (indents.length > 1) { indents.pop(); push('dedent', '', 0); }
  push('eof', '', 0);
  return tokens;
}
