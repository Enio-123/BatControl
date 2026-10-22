// Editor de código (CodeMirror 6) com destaque da linha em execução e da linha com erro.
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { python } from '@codemirror/lang-python';
import { codeFolding, foldEffect, foldService, HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, keymap } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { basicSetup } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import { t as tr } from '../i18n';

const setMarks = StateEffect.define<{ run: number | null; error: number | null }>();

const marksField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setMarks)) continue;
      const ranges = [];
      const doc = tr.state.doc;
      const { run, error } = e.value;
      if (run && run <= doc.lines) ranges.push(Decoration.line({ class: 'cm-run-line' }).range(doc.line(run).from));
      if (error && error <= doc.lines) ranges.push(Decoration.line({ class: 'cm-error-line' }).range(doc.line(error).from));
      ranges.sort((a, b) => a.from - b.from);
      deco = Decoration.set(ranges);
    }
    if (tr.docChanged) deco = Decoration.none;
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlight = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--code-kw)', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'var(--code-str)' },
  { tag: t.number, color: 'var(--code-num)' },
  { tag: t.comment, color: 'var(--code-com)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--code-fn)' },
  { tag: [t.className, t.definition(t.variableName)], color: 'var(--code-cls)' },
  { tag: [t.bool, t.null], color: 'var(--code-num)' },
  { tag: t.propertyName, color: 'var(--code-prop)' },
  { tag: t.operator, color: 'var(--code-op)' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px', backgroundColor: 'var(--code-bg)', color: 'var(--code-fg)' },
  '.cm-scroller': { fontFamily: 'var(--font-code)', lineHeight: '1.6' },
  '.cm-content': { caretColor: 'var(--accent-ink)', padding: '10px 0' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'var(--code-gutter)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'var(--code-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--code-active)', color: 'var(--code-fg)' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--code-sel) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--code-fg)' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--accent)', color: '#141414' },
});

const WORDS: [string, string][] = [
  ['straight', 'robo.straight(mm)'], ['turn', 'robo.turn(deg)'], ['curve', 'robo.curve(mm, deg)'],
  ['drive', 'robo.drive(mm/s, deg/s)'], ['stop', 'stop()'], ['settings', 'robo.settings(...)'],
  ['distance', 'robo.distance()'], ['angle', 'angle()'], ['reset', 'robo.reset()'], ['use_gyro', 'robo.use_gyro(True)'],
  ['run_angle', 'motor.run_angle(deg/s, deg)'], ['run_target', 'motor.run_target(deg/s, deg)'], ['run_time', 'motor.run_time(deg/s, ms)'],
  ['run', 'motor.run(deg/s)'], ['reset_angle', 'motor.reset_angle(0)'], ['color', 'sensor.color()'], ['reflection', 'sensor.reflection()'],
  ['wait', 'wait(ms)'], ['StopWatch', 'StopWatch()'], ['DriveBase', 'class'], ['Motor', 'class'], ['ColorSensor', 'class'],
  ['PrimeHub', 'class'], ['Port', 'Port.A … Port.F'], ['Direction', 'CLOCKWISE / COUNTERCLOCKWISE'], ['Color', 'Color.BLACK…'],
  ['COUNTERCLOCKWISE', 'Direction'], ['CLOCKWISE', 'Direction'], ['BLACK', 'Color'], ['WHITE', 'Color'], ['RED', 'Color'],
  ['BLUE', 'Color'], ['GREEN', 'Color'], ['YELLOW', 'Color'], ['heading', 'hub.imu.heading()'], ['reset_heading', 'hub.imu.reset_heading(0)'],
  ['beep', 'hub.speaker.beep()'], ['wheel_diameter', 'mm'], ['axle_track', 'mm'], ['straight_speed', 'mm/s'], ['turn_rate', 'deg/s'],
  ['robo', 'DriveBase'], ['anexo_left', 'Motor C'], ['anexo_right', 'Motor E'], ['sensor', 'ColorSensor'], ['hub', 'PrimeHub'],
];

const SETUP_LINE = /^\s*(from |import |hub\s*=|\w*_motor\s*=|motor_\w*\s*=|robot?\s*=|\w*_arm\s*=|anexo_\w*\s*=|sensor\s*=|$)/;

/** Intervalo do cabeçalho (imports e criação dos dispositivos) no começo do programa. */
function setupRange(state: EditorState): { from: number; to: number } | null {
  const doc = state.doc;
  if (!/^from |^import /.test(doc.line(1).text)) return null;
  let last = 1;
  for (let i = 1; i <= doc.lines && SETUP_LINE.test(doc.line(i).text); i++) if (doc.line(i).text.trim()) last = i;
  if (last < 3) return null;
  return { from: doc.line(1).from, to: doc.line(last).to };
}

const setupFold = foldService.of((state, lineStart) => {
  const r = setupRange(state);
  return r && lineStart === r.from ? r : null;
});

const folding = codeFolding({
  preparePlaceholder: (state, range) => {
    const lines = state.doc.lineAt(range.to).number - state.doc.lineAt(range.from).number + 1;
    const r = setupRange(state);
    return r && r.from === range.from ? tr('editor.fold', { n: lines }) : tr('editor.lines', { n: lines });
  },
  placeholderDOM: (_view, onclick, prepared) => {
    const el = document.createElement('span');
    el.className = 'cm-fold-chip';
    el.textContent = String(prepared ?? '…');
    el.onclick = onclick;
    return el;
  },
});

function pybricksCompletions(ctx: CompletionContext) {
  const word = ctx.matchBefore(/\w+/);
  if (!word || (word.from === word.to && !ctx.explicit)) return null;
  return { from: word.from, options: WORDS.map(([label, detail]) => ({ label, detail, type: 'function' })) };
}

export class CodeEditor {
  view: EditorView;
  constructor(parent: HTMLElement, doc: string, opts: { onChange?: (code: string) => void; readOnly?: boolean; label?: string } = {}) {
    this.view = new EditorView({
      parent,
      state: EditorState.create({
        doc,
        extensions: [
          folding,
          setupFold,
          basicSetup,
          python(),
          indentUnit.of('    '),
          keymap.of([indentWithTab]),
          syntaxHighlighting(highlight),
          theme,
          EditorView.lineWrapping,
          marksField,
          autocompletion({ override: [pybricksCompletions] }),
          EditorState.readOnly.of(!!opts.readOnly),
          EditorView.editable.of(!opts.readOnly),
          EditorView.contentAttributes.of({ 'aria-label': opts.label ?? tr('editor.label') }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) opts.onChange?.(u.state.doc.toString());
          }),
        ],
      }),
    });
  }
  /** Recolhe o cabeçalho de configuração para o programa ficar mais simples de ler. */
  foldSetup() {
    const r = setupRange(this.view.state);
    if (r) this.view.dispatch({ effects: foldEffect.of(r) });
  }

  get code() { return this.view.state.doc.toString(); }
  set code(v: string) {
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: v } });
  }
  /** Insere uma linha de código abaixo do cursor (ou na linha vazia atual) e seleciona o primeiro número. */
  insertLine(text: string) {
    const st = this.view.state;
    const line = st.doc.lineAt(st.selection.main.head);
    const indent = /^\s*/.exec(line.text)![0] + (/:\s*$/.test(line.text) ? '    ' : '');
    let from: number;
    let insert: string;
    if (line.text.trim() === '') {
      from = line.from;
      insert = indent + text;
      this.view.dispatch({ changes: { from: line.from, to: line.to, insert } });
    } else {
      from = line.to + 1;
      insert = indent + text;
      this.view.dispatch({ changes: { from: line.to, insert: '\n' + insert } });
    }
    const m = /-?\d+/.exec(insert);
    const anchor = m ? from + m.index : from + insert.length;
    const head = m ? anchor + m[0].length : anchor;
    this.view.dispatch({ selection: { anchor, head }, scrollIntoView: true });
  }

  mark(run: number | null, error: number | null = null) {
    this.view.dispatch({ effects: setMarks.of({ run, error }) });
    const line = error ?? run;
    if (line && line <= this.view.state.doc.lines) {
      this.view.dispatch({ effects: EditorView.scrollIntoView(this.view.state.doc.line(line).from, { y: 'nearest' }) });
    }
  }
  destroy() { this.view.destroy(); }
}
