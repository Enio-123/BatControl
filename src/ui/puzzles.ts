// Problemas estilo chess.com: um atrás do outro, com nota (rating) que sobe ao acertar de primeira.
import { t } from '../i18n';
import { eloDelta, nextPuzzle, Puzzle } from '../content/puzzles';
import { localizeCode } from '../content/text';
import { runProgram, RunResult } from '../sim/runner';
import { DEFAULT_CONFIG } from '../sim/world';
import { recordPuzzle, state } from '../store';
import { Viewer } from '../three/viewer';
import { ConsoleView } from './console';
import { buzz, h, icon, iconBtn } from './dom';
import { CodeEditor } from './editor';
import { Stage } from './stage';

const fmtDelta = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '±0');

function shuffled<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export class PuzzleView {
  constructor(
    private stage: Stage,
    private viewer: Viewer,
    private lobbyEl: HTMLElement,
    private player: HTMLElement,
    private onEnter: () => void,
    private onExit: () => void,
    private onProgress: () => void,
  ) {}

  /** Cartão de entrada: nota, sequência e últimos problemas. */
  renderLobby() {
    const p = state.puzzles;
    const stat = (num: string, lbl: string) => h('div', { class: 'stat' }, h('span', { class: 'num mono' }, num), h('span', { class: 'lbl' }, lbl));
    const recent = p.history.slice(0, 10);
    this.lobbyEl.replaceChildren(
      h('div', { class: 'card pz-lobby' },
        h('div', { class: 'pz-head' },
          h('span', { class: 'pz-ico' }, icon('puzzle', 26)),
          h('div', {}, h('h2', {}, t('pz.title')), h('p', { class: 'muted' }, t('pz.desc')))),
        h('div', { class: 'pz-rating' },
          h('span', { class: 'lbl' }, t('pz.rating')),
          h('span', { class: 'num mono' }, String(p.rating))),
        h('div', { class: 'stats' },
          stat(String(p.best), t('pz.best')),
          stat(String(p.streak), t('pz.streak')),
          stat(`${p.solved}/${p.played}`, t('pz.solved'))),
        h('button', { type: 'button', class: 'btn primary big wide', onclick: () => this.play() }, icon('play', 18), ' ', t(p.played ? 'pz.next' : 'pz.start'))),
      h('section', { class: 'card pz-recent' },
        h('h3', {}, t('pz.recent')),
        recent.length
          ? h('ol', { class: 'pz-list' }, recent.map((x) =>
              h('li', { class: x.ok ? 'ok' : 'bad' },
                h('span', { class: 'pz-mark' }, icon(x.ok ? 'check' : 'close', 16)),
                h('span', {}, t('pz.puzzleRating', { n: x.rating })),
                h('span', { class: 'mono delta' }, fmtDelta(x.delta)))))
          : h('p', { class: 'muted' }, t('pz.none'))),
    );
  }

  play(p?: Puzzle) {
    const recent = state.puzzles.history.slice(0, 20).map((x) => x.id);
    const puzzle = p ?? nextPuzzle(state.puzzles.rating, recent);
    this.render(puzzle);
  }

  private render(pz: Puzzle) {
    const self = this;
    let recorded = false; // só a primeira tentativa conta para a nota
    const ratingChip = h('span', { class: 'pz-chip mono' });
    const drawChip = () => ratingChip.replaceChildren(icon('puzzle', 16), ` ${state.puzzles.rating}`);
    drawChip();
    const body = h('div', { class: 'player-body' });
    const foot = h('div', { class: 'player-foot' });
    const close = () => {
      this.stage.pause();
      this.player.hidden = true;
      this.onExit();
    };
    this.player.replaceChildren(
      h('div', { class: 'player-top' }, iconBtn('close', t('pz.exit'), close), h('span', { class: 'pz-top-title' }, t('pz.puzzleRating', { n: pz.rating })), ratingChip),
      body, foot);
    this.onEnter();
    this.player.hidden = false;
    window.scrollTo({ top: 0 });

    const record = (ok: boolean) => {
      if (recorded) return 0;
      recorded = true;
      const d = eloDelta(state.puzzles.rating, pz.rating, ok, state.puzzles.played);
      recordPuzzle(pz.id, pz.rating, ok, d);
      drawChip();
      this.onProgress();
      return d;
    };

    const footer = (o: { label: string; onClick: () => void; state?: 'ok' | 'bad' | null; title?: string; text?: string; extra?: HTMLElement | null; disabled?: boolean }) => {
      const btn = h('button', { type: 'button', class: 'btn primary big', disabled: o.disabled, onclick: o.onClick }, o.label);
      foot.className = `player-foot ${o.state ?? ''}`;
      foot.replaceChildren(
        h('div', { class: 'feedback', role: o.state ? 'status' : undefined },
          o.state ? h('span', { class: 'fb-icon' }, icon(o.state === 'ok' ? 'check' : 'close', 20)) : null,
          h('div', {}, o.title ? h('strong', {}, o.title) : null, o.text ? h('p', {}, o.text) : null)),
        h('div', { class: 'foot-actions' }, o.extra ?? null, btn));
      return btn;
    };
    const nextBtn = () => h('button', { type: 'button', class: 'btn ghost', onclick: () => self.play() }, t('pz.next'));

    const [key, params] = pz.prompt;
    const lines = t(key, params).split('\n');
    const head = [h('h2', {}, lines[0]), ...lines.slice(1).map((l) => h('p', { class: 'pz-data mono' }, l))];
    this.viewer.setAttachments({ left: 'none', right: 'none' });
    this.viewer.setGhost(null);

    if (pz.kind === 'choice') {
      const order = shuffled(pz.options!.map((_, i) => i));
      let picked: number | null = null;
      const btns = order.map((i, k) => {
        const b = h('button', { type: 'button', class: 'option', role: 'radio', 'aria-checked': 'false' }, h('span', { class: 'key mono' }, String(k + 1)), h('span', {}, pz.options![i]));
        b.addEventListener('click', () => {
          picked = i;
          buzz('tap');
          btns.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
          check.disabled = false;
        });
        return b;
      });
      body.replaceChildren(h('div', { class: 'card code-card enter' },
        h('p', { class: 'eyebrow' }, t('player.choose')), ...head,
        h('div', { class: 'code-split' },
          h('div', { class: 'code-col' },
            h('pre', { class: 'code-block mono' }, pz.code ?? ''),
            h('div', { class: 'options', role: 'radiogroup' }, btns)),
          h('div', { class: 'stage-col' }, this.stage.el))));
      this.stage.setScene(pz.start, pz.targets, pz.objects ?? []);
      this.stage.mount();
      const check = footer({
        label: t('player.check'), disabled: true,
        onClick: () => {
          const ok = picked === 0;
          btns.forEach((b, k) => {
            b.disabled = true;
            if (order[k] === 0) b.classList.add('right');
            else if (order[k] === picked) b.classList.add('wrong');
          });
          const d = record(ok);
          buzz(ok ? 'ok' : 'bad');
          body.querySelector('.card')?.classList.add(ok ? 'pop' : 'shake');
          // Mostra o que o programa faz de verdade
          const res = runProgram(pz.solution, DEFAULT_CONFIG, pz.start);
          this.stage.load(res);
          this.stage.onFrame = () => {};
          this.stage.onEnd = () => {};
          this.stage.play();
          footer({ label: t('pz.next'), onClick: () => self.play(), state: ok ? 'ok' : 'bad', title: ok ? t('pz.solvedTitle') : t('player.notYet'), text: ok ? t('pz.solvedFirst', { d: fmtDelta(d) }) : t('pz.failedChoice', { d: fmtDelta(d) }) });
        },
      });
      return;
    }

    // Problema de programar
    const edHost = h('div', { class: 'editor-host' });
    const cons = new ConsoleView();
    cons.clear(t('player.runToSee'));
    const firstLine = localizeCode(pz.solution).split('\n').filter((l) => /^\S/.test(l) && !/^(from|import|hub|left_|right_|anexo_|robo =|sensor =)/.test(l))[0] ?? '';
    const hintEl = h('p', { class: 'hint', hidden: true }, h('b', {}, `${t('player.hint')}: `), t('pz.hintText', { code: firstLine }));
    body.replaceChildren(h('div', { class: 'card code-card enter' },
      h('p', { class: 'eyebrow' }, t('player.program')), ...head, hintEl,
      h('div', { class: 'code-split' },
        h('div', { class: 'code-col' }, edHost, cons.el),
        h('div', { class: 'stage-col' }, this.stage.el))));
    const editor = new CodeEditor(edHost, localizeCode(pz.starter ?? ''), { onChange: () => editor.mark(null) });
    editor.foldSetup();
    this.stage.setScene(pz.start, pz.targets, pz.objects ?? []);
    this.stage.mount();
    let solved = false;
    let fails = 0;

    const showHint = () => {
      hintEl.hidden = false;
      if (!recorded) {
        const d = record(false);
        hintEl.append(h('span', { class: 'muted small' }, ` ${t('pz.hintCost', { d: fmtDelta(d) })}`));
      }
    };
    const helpBtn = () => h('button', { type: 'button', class: 'btn ghost', onclick: showHint }, t('player.showHint'));

    let last: RunResult | null = null;
    let code = '';
    const evaluate = () => {
      const r = last!;
      cons.update(this.stage.time, true);
      editor.mark(null, r.error?.line ?? null);
      const msg = r.error ? t('player.stopped', { type: r.error.type, line: r.error.line ?? '?', msg: r.error.message }) : r.timeUp ? t('sim.timeUp') : pz.check!(r, code);
      if (!msg) {
        const firstTry = !recorded;
        const d = record(true);
        solved = true;
        buzz('ok');
        body.querySelector('.card')?.classList.add('pop');
        footer({ label: t('pz.next'), onClick: () => self.play(), state: 'ok', title: t('pz.solvedTitle'), text: firstTry ? t('pz.solvedFirst', { d: fmtDelta(d) }) : t('pz.solvedLate') });
        return;
      }
      fails++;
      const d = record(false);
      buzz('bad');
      body.querySelector('.card')?.classList.add('shake');
      const extra = h('div', { class: 'row-actions' },
        hintEl.hidden ? helpBtn() : null,
        fails >= 2 ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { editor.code = localizeCode(pz.solution); editor.foldSetup(); } }, t('player.showSolution')) : null,
        nextBtn());
      footer({ label: t('player.runAgain'), onClick: run, state: 'bad', title: t('player.notYet'), text: d ? `${msg} ${t('pz.ratingChange', { d: fmtDelta(d) })}` : msg, extra });
    };
    const run = () => {
      if (solved) return;
      code = editor.code;
      last = runProgram(code, DEFAULT_CONFIG, pz.start, { objects: pz.objects });
      this.stage.setScene(pz.start, pz.targets, pz.objects ?? []);
      this.stage.load(last);
      cons.load(last);
      this.stage.onFrame = (f) => { if (this.stage.time > 0) editor.mark(f.line || null); cons.update(this.stage.time); };
      this.stage.onEnd = evaluate;
      footer({ label: t('player.skip'), onClick: () => this.stage.skipToEnd() });
      if (last.final.t === 0) { evaluate(); return; }
      this.stage.play();
    };
    footer({ label: t('player.runCheck'), onClick: run, extra: h('div', { class: 'row-actions' }, helpBtn()) });
  }
}
