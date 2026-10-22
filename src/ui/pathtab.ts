// Aba Trilha: lições estilo Duolingo, revisão dos exercícios errados e o player de cada lição.
import { lang, t } from '../i18n';
import { ALL_LESSONS, Exercise, Lesson, UNITS } from '../content/lessons';
import { SETUP_BASE, START } from '../content/setup';
import { lessonText, localizeCode, unitText } from '../content/text';
import type { ExText } from '../content/text/types';
import { runProgram } from '../sim/runner';
import { DEFAULT_CONFIG } from '../sim/world';
import { addMistake, clearMistake, completeLesson, currentStreak, state } from '../store';
import { Viewer } from '../three/viewer';
import { ConsoleView } from './console';
import { buzz, h, icon, iconBtn, segmented } from './dom';
import { CodeEditor } from './editor';
import { PuzzleView } from './puzzles';
import { Stage } from './stage';

/** Chinês e japonês não usam espaço entre frases. */
const cjk = () => lang() === 'zh' || lang() === 'ja';
const sentences = (...xs: string[]) => xs.filter(Boolean).join(cjk() ? '' : ' ');

const HEARTS = 5;
const XP_LESSON = 10;
const XP_PERFECT = 5;
const XP_REVIEW = 2;
const REVIEW_MAX = 8;

const norm = (s: string) => s.replace(/\s+/g, '').replace(/["']/g, "'");

function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Nunca começa já na ordem certa
  if (a.length > 1 && a.every((x, i) => x === xs[i])) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

/** Um exercício com o texto no idioma atual e a referência usada na revisão. */
interface Item { ex: Exercise; text: ExText; ref: string }

const itemsOf = (l: Lesson): Item[] => {
  const tx = lessonText(l.id);
  return l.exercises.map((ex, i) => ({ ex, text: tx.ex[i], ref: `${l.id}:${i}` }));
};

/** Exercícios errados que ainda existem no conteúdo (o conteúdo pode mudar entre versões). */
export function reviewItems(): Item[] {
  const out: Item[] = [];
  for (const ref of state.progress.mistakes) {
    const [id, idx] = ref.split(':');
    const l = ALL_LESSONS.find((x) => x.id === id);
    const ex = l?.exercises[Number(idx)];
    if (!l || !ex) continue;
    out.push({ ex, text: lessonText(l.id).ex[Number(idx)], ref });
  }
  return out;
}

export class PathTab {
  el: HTMLElement;
  private pathEl: HTMLElement;
  private player: HTMLElement;
  private stage: Stage;
  private onProgress: () => void;
  /** Trilha de lições ou problemas avulsos (estilo chess.com). */
  private mode: 'lessons' | 'puzzles' = 'lessons';
  private puzzles: PuzzleView;
  private lobby = h('div', { class: 'pz-host' });

  constructor(private viewer: Viewer, onProgress: () => void) {
    this.onProgress = onProgress;
    this.stage = new Stage(viewer, { compact: true });
    this.pathEl = h('div', { class: 'path' });
    this.player = h('div', { class: 'player', hidden: true });
    this.el = h('section', { class: 'path-tab', 'aria-label': t('nav.path') }, this.pathEl, this.player);
    this.puzzles = new PuzzleView(this.stage, viewer, this.lobby, this.player, () => { this.pathEl.hidden = true; }, () => { this.pathEl.hidden = false; this.renderPath(); this.onProgress(); }, () => this.onProgress());
    this.renderPath();
  }

  /** Abre a lista de problemas (atalho da tela Hoje). */
  openPuzzles(play = false) {
    this.mode = 'puzzles';
    this.renderPath();
    if (play) this.puzzles.play();
  }

  private switcher() {
    return h('div', { class: 'path-switch' }, segmented<'lessons' | 'puzzles'>([['lessons', t('path.lessonsTab')], ['puzzles', t('pz.tab')]], this.mode, (v) => { this.mode = v; this.renderPath(); }, t('nav.path')));
  }

  get inLesson() { return !this.player.hidden; }

  show() {
    if (!this.player.hidden) this.stage.mount();
    else this.renderPath();
  }

  hide() {
    this.stage.pause();
  }

  isUnlocked(id: string) {
    const i = ALL_LESSONS.findIndex((l) => l.id === id);
    return i === 0 || !!state.progress.done[ALL_LESSONS[i - 1].id];
  }

  nextLesson() {
    return ALL_LESSONS.find((l) => !state.progress.done[l.id]) ?? null;
  }

  renderPath() {
    if (this.mode === 'puzzles') {
      this.puzzles.renderLobby();
      this.pathEl.replaceChildren(this.switcher(), this.lobby);
      return;
    }
    const done = Object.keys(state.progress.done).filter((id) => ALL_LESSONS.some((l) => l.id === id)).length;
    const total = ALL_LESSONS.length;
    const next = this.nextLesson();
    const streak = currentStreak();
    const review = reviewItems();
    const summary = h('div', { class: 'path-summary card' },
      h('div', {},
        h('h2', {}, t('path.title')),
        h('p', { class: 'muted' }, t('path.desc'))),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, `${done}/${total}`), h('span', { class: 'lbl' }, t('path.lessons'))),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(state.progress.xp)), h('span', { class: 'lbl' }, 'XP')),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(streak)), h('span', { class: 'lbl' }, t(streak === 1 ? 'path.day' : 'path.days')))),
      h('div', { class: 'meter', role: 'progressbar', 'aria-label': t('path.lessons'), 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done) }, h('span', { style: `width:${(done / total) * 100}%` })),
      review.length
        ? h('button', { type: 'button', class: 'review-btn', onclick: () => this.startReview() },
            icon('review', 20),
            h('span', {}, h('strong', {}, t('review.title')), h('span', { class: 'muted small' }, t('review.count', { n: review.length }))),
            icon('right', 18))
        : null,
    );
    const units = UNITS.map((u, ui) => {
      const ut = unitText(u.id);
      return h('section', { class: 'unit' },
        h('header', {}, h('span', { class: 'unit-no mono' }, t('path.unit', { n: ui + 1 })), h('h3', {}, ut.title), h('p', { class: 'muted' }, ut.desc)),
        h('ol', { class: 'nodes' }, u.lessons.map((l, li) => {
          const isDone = !!state.progress.done[l.id];
          const open = this.isUnlocked(l.id);
          const isNext = next?.id === l.id;
          const title = lessonText(l.id).title;
          const cls = ['node', isDone ? 'done' : open ? 'open' : 'locked', isNext ? 'next' : '', `off${(ui + li) % 4}`].join(' ');
          return h('li', { class: cls },
            h('button', { type: 'button', disabled: !open, onclick: () => this.start(l), 'aria-label': `${title}${isDone ? `, ${t('path.doneLabel')}` : open ? '' : `, ${t('path.lockedLabel')}`}` },
              h('span', { class: 'disc' }, isDone ? icon('check', 22) : open ? h('span', { class: 'mono' }, String(li + 1)) : icon('lock', 18)),
              h('span', { class: 'node-title' }, title),
              isNext ? h('span', { class: 'pill' }, t('path.start')) : isDone && state.progress.done[l.id].perfect ? h('span', { class: 'pill quiet' }, t('path.perfect')) : null));
        })));
    });
    this.pathEl.replaceChildren(this.switcher(), summary, ...units, h('footer', { class: 'path-foot' }, h('p', { class: 'muted small' }, t('path.saved'))));
  }

  // ---------- Player ----------

  start(lesson: Lesson) {
    const tx = lessonText(lesson.id);
    this.play(itemsOf(lesson), { id: lesson.id, title: tx.title, intro: tx.intro, review: false });
  }

  startReview() {
    const items = shuffle(reviewItems()).slice(0, REVIEW_MAX);
    if (!items.length) return;
    this.play(items, { id: 'review', title: t('review.title'), intro: t('review.intro'), review: true });
  }

  private play(items: Item[], meta: { id: string; title: string; intro: string; review: boolean }) {
    const queue: Item[] = [...items];
    let hearts = HEARTS;
    let mistakes = 0;
    let doneCount = 0;
    const total = items.length;
    const self = this;
    const missed = new Set<string>();

    const bar = h('div', { class: 'meter thin' }, h('span', { style: 'width:0%' }));
    const heartsEl = h('span', { class: 'hearts' });
    const body = h('div', { class: 'player-body' });
    const foot = h('div', { class: 'player-foot' });
    const close = () => {
      this.stage.pause();
      this.player.hidden = true;
      this.pathEl.hidden = false;
      this.renderPath();
      this.onProgress();
    };
    this.player.replaceChildren(
      h('div', { class: 'player-top' }, iconBtn('close', t('player.exit'), close), bar, heartsEl),
      body, foot,
    );
    this.pathEl.hidden = true;
    this.player.hidden = false;
    window.scrollTo({ top: 0 });

    const setProgress = () => {
      (bar.firstElementChild as HTMLElement).style.width = `${(doneCount / total) * 100}%`;
      heartsEl.replaceChildren(icon('heart', 18), h('span', { class: 'mono' }, String(hearts)));
      heartsEl.setAttribute('aria-label', t('player.hearts', { n: hearts }));
    };

    const card = (...children: (Node | null)[]) => h('div', { class: 'card enter' }, ...children);

    const footer = (opts: { label: string; onClick: () => void; disabled?: boolean; state?: 'ok' | 'bad' | null; title?: string; text?: string; extra?: HTMLElement | null }) => {
      const btn = h('button', { type: 'button', class: 'btn primary big', disabled: opts.disabled, onclick: opts.onClick }, opts.label);
      foot.className = `player-foot ${opts.state ?? ''}`;
      foot.replaceChildren(
        h('div', { class: 'feedback', role: opts.state ? 'status' : undefined },
          opts.state ? h('span', { class: 'fb-icon' }, icon(opts.state === 'ok' ? 'check' : 'close', 20)) : null,
          h('div', {},
            opts.title ? h('strong', {}, opts.title) : null,
            opts.text ? h('p', {}, opts.text) : null)),
        h('div', { class: 'foot-actions' }, opts.extra ?? null, btn),
      );
      return btn;
    };

    const intro = () => {
      body.replaceChildren(card(
        h('p', { class: 'eyebrow' }, meta.review ? t('review.eyebrow') : t('player.before')),
        h('h2', {}, meta.title),
        ...meta.intro.split('\n\n').map((p) => h('p', {}, p))));
      footer({ label: t('player.gotIt'), onClick: next });
    };

    const finish = () => {
      const perfect = mistakes === 0;
      const xp = meta.review ? XP_REVIEW * (total - missed.size) : XP_LESSON + (perfect ? XP_PERFECT : 0);
      completeLesson(meta.id, xp, perfect);
      self.onProgress();
      buzz('end');
      const idx = ALL_LESSONS.findIndex((l) => l.id === meta.id);
      const following = meta.review ? null : ALL_LESSONS[idx + 1];
      const left = reviewItems().length;
      body.replaceChildren(
        h('div', { class: 'card done-card enter' },
          h('span', { class: 'big-check' }, icon('check', 40)),
          h('h2', {}, meta.review ? t('review.done') : t('player.done')),
          h('p', { class: 'lead' }, perfect ? t('player.perfect') : t(mistakes === 1 ? 'player.mistake' : 'player.mistakes', { n: mistakes })),
          meta.review && left ? h('p', { class: 'muted' }, t('review.left', { n: left })) : null,
          h('div', { class: 'stats' },
            h('div', { class: 'stat' }, h('span', { class: 'num mono' }, `+${xp}`), h('span', { class: 'lbl' }, 'XP')),
            h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(currentStreak())), h('span', { class: 'lbl' }, t(currentStreak() === 1 ? 'path.day' : 'path.days'))))),
      );
      setProgress();
      footer({
        label: following && self.isUnlocked(following.id) ? t('player.next') : t('player.back'),
        onClick: () => (following && self.isUnlocked(following.id) ? self.start(following) : close()),
        extra: following ? h('button', { type: 'button', class: 'btn ghost big', onclick: close }, t('player.back')) : null,
      });
    };

    const outOfHearts = () => {
      buzz('end');
      body.replaceChildren(card(
        h('h2', {}, t('player.noHearts')),
        h('p', { class: 'lead' }, t('player.noHeartsDesc'))));
      footer({ label: t('player.restart'), onClick: () => self.play(items, meta), extra: h('button', { type: 'button', class: 'btn ghost big', onclick: close }, t('player.back')) });
    };

    function next() {
      setProgress();
      const it = queue.shift();
      if (!it) return finish();
      render(it);
    }

    const markWrong = (it: Item, costHeart: boolean) => {
      mistakes++;
      missed.add(it.ref);
      addMistake(it.ref);
      buzz('bad');
      body.querySelector('.card')?.classList.add('shake');
      if (costHeart) {
        hearts--;
        setProgress();
        queue.push(it); // volta no fim, como no Duolingo
      }
    };

    const markRight = (it: Item) => {
      doneCount++;
      buzz('ok');
      body.querySelector('.card')?.classList.add('pop');
      // Na revisão, acertar de primeira tira o exercício da lista
      if (meta.review && !missed.has(it.ref)) clearMistake(it.ref);
    };

    function render(it: Item) {
      self.stage.pause();
      const ex = it.ex;
      if (ex.kind === 'choice') renderChoice(it, ex);
      else if (ex.kind === 'fill') renderFill(it, ex);
      else if (ex.kind === 'order') renderOrder(it, ex);
      else renderCode(it, ex);
    }

    const afterAnswer = (ok: boolean, explain: string, it: Item) => {
      if (ok) {
        markRight(it);
        footer({ label: t('player.continue'), onClick: next, state: 'ok', title: t('player.correct'), text: explain });
      } else {
        markWrong(it, true);
        if (hearts <= 0) { footer({ label: t('player.continue'), onClick: outOfHearts, state: 'bad', title: t('player.wrong'), text: explain }); return; }
        footer({ label: t('player.continue'), onClick: next, state: 'bad', title: t('player.wrong'), text: sentences(explain, t('player.again')) });
      }
    };

    function renderChoice(it: Item, ex: Extract<Exercise, { kind: 'choice' }>) {
      const opts = it.text.options ?? [];
      const order = shuffle(opts.map((_, i) => i));
      let picked: number | null = null;
      const btns = order.map((i, k) => {
        const b = h('button', { type: 'button', class: 'option', role: 'radio', 'aria-checked': 'false' }, h('span', { class: 'key mono' }, String(k + 1)), h('span', {}, opts[i]));
        b.addEventListener('click', () => {
          picked = i;
          buzz('tap');
          btns.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
          check.disabled = false;
        });
        return b;
      });
      body.replaceChildren(card(
        h('p', { class: 'eyebrow' }, t('player.choose')),
        h('h2', {}, it.text.prompt),
        ex.code ? h('pre', { class: 'code-block mono' }, localizeCode(ex.code)) : null,
        h('div', { class: 'options', role: 'radiogroup', 'aria-label': it.text.prompt }, btns)));
      const check = footer({
        label: t('player.check'), disabled: true,
        onClick: () => {
          const ok = picked === ex.answer;
          btns.forEach((b, k) => {
            b.disabled = true;
            if (order[k] === ex.answer) b.classList.add('right');
            else if (order[k] === picked) b.classList.add('wrong');
          });
          afterAnswer(ok, it.text.explain ?? '', it);
        },
      });
    }

    function renderFill(it: Item, ex: Extract<Exercise, { kind: 'fill' }>) {
      const parts = ex.code.split('___');
      const inputs: HTMLInputElement[] = [];
      const pre = h('pre', { class: 'code-block mono fill' });
      parts.forEach((p, i) => {
        pre.append(p);
        if (i < parts.length - 1) {
          const longest = Math.max(...ex.answers[i].map((a) => a.length));
          const inp = h('input', { type: 'text', class: 'blank mono', size: String(Math.max(3, longest + 1)), spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': t('player.blank', { n: i + 1 }) });
          inp.addEventListener('input', () => (check.disabled = inputs.some((x) => !x.value.trim())));
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !check.disabled) check.click(); });
          inputs.push(inp);
          pre.append(inp);
        }
      });
      body.replaceChildren(card(h('p', { class: 'eyebrow' }, t('player.fill')), h('h2', {}, it.text.prompt), pre));
      const check = footer({
        label: t('player.check'), disabled: true,
        onClick: () => {
          const ok = inputs.every((inp, i) => ex.answers[i].some((a) => norm(a) === norm(inp.value)));
          inputs.forEach((inp, i) => {
            inp.disabled = true;
            const good = ex.answers[i].some((a) => norm(a) === norm(inp.value));
            inp.classList.add(good ? 'right' : 'wrong');
            if (!good) inp.value = ex.answers[i][0];
          });
          afterAnswer(ok, it.text.explain ?? '', it);
        },
      });
      setTimeout(() => inputs[0]?.focus(), 50);
    }

    function renderOrder(it: Item, ex: Extract<Exercise, { kind: 'order' }>) {
      const pool = shuffle(ex.lines.map((_, i) => i));
      const chosen: number[] = [];
      const answerEl = h('div', { class: 'order-answer', 'aria-label': t('player.yourOrder') });
      const poolEl = h('div', { class: 'order-pool', 'aria-label': t('player.lines') });
      const draw = () => {
        answerEl.replaceChildren(...(chosen.length ? chosen.map((i) => h('button', { type: 'button', class: 'tile mono', onclick: () => { chosen.splice(chosen.indexOf(i), 1); buzz('tap'); draw(); } }, ex.lines[i])) : [h('p', { class: 'muted small' }, t('player.orderHelp'))]));
        poolEl.replaceChildren(...pool.map((i) => h('button', { type: 'button', class: 'tile mono', disabled: chosen.includes(i), onclick: () => { chosen.push(i); buzz('tap'); draw(); } }, ex.lines[i])));
        check.disabled = chosen.length !== ex.lines.length;
      };
      body.replaceChildren(card(h('p', { class: 'eyebrow' }, t('player.order')), h('h2', {}, it.text.prompt), answerEl, poolEl));
      const check = footer({
        label: t('player.check'), disabled: true,
        onClick: () => {
          // Linhas iguais podem trocar de lugar entre si
          const ok = chosen.every((i, k) => ex.lines[i] === ex.lines[k]);
          answerEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
          poolEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
          answerEl.classList.add(ok ? 'right' : 'wrong');
          const explain = it.text.explain ?? '';
          afterAnswer(ok, ok ? explain : sentences(`${t('player.rightOrder')}${cjk() ? '' : ' '}${ex.lines.join('  →  ')}${cjk() ? '。' : '.'}`, explain), it);
        },
      });
      draw();
    }

    function renderCode(it: Item, ex: Extract<Exercise, { kind: 'code' }>) {
      let fails = 0;
      let failedOnce = false;
      const start = ex.start ?? START;
      const attachments = ex.attachments ?? { left: 'none' as const, right: 'none' as const };
      const config = { ...structuredClone(DEFAULT_CONFIG), attachments };
      const edHost = h('div', { class: 'editor-host' });
      const cons = new ConsoleView();
      cons.clear(t('player.runToSee'));
      const hintEl = h('p', { class: 'hint', hidden: true }, h('b', {}, `${t('player.hint')}: `), it.text.hint ?? '');
      body.replaceChildren(
        h('div', { class: 'card code-card enter' },
          h('p', { class: 'eyebrow' }, t('player.program')),
          h('h2', {}, it.text.prompt),
          ex.realistic !== undefined ? h('p', { class: 'muted small' }, icon('info', 14), ' ', t('player.realistic')) : null,
          hintEl,
          h('div', { class: 'code-split' },
            h('div', { class: 'code-col' }, edHost, cons.el),
            h('div', { class: 'stage-col' }, self.stage.el))),
      );
      const starter = localizeCode(ex.starter);
      const editor = new CodeEditor(edHost, starter, { onChange: () => editor.mark(null) });
      // Recolhe o cabeçalho só quando ele é o padrão (no desafio de consertar os motores ele precisa aparecer)
      if (ex.starter.includes(SETUP_BASE)) editor.foldSetup();
      self.stage.setScene(start, ex.targets ?? [], ex.objects ?? []);
      self.viewer.setAttachments(attachments);
      self.viewer.setGhost(null);
      self.stage.mount();
      let lastResult: ReturnType<typeof runProgram> | null = null;
      let code = '';

      const evaluate = () => {
        const r = lastResult!;
        cons.update(self.stage.time, true);
        editor.mark(null, r.error?.line ?? null);
        let msg: string | null;
        if (r.error) msg = t('player.stopped', { type: r.error.type, line: r.error.line ?? '?', msg: r.error.message });
        else if (r.timeUp) msg = t('sim.timeUp');
        else msg = ex.check(r, code);
        if (!msg) {
          markRight(it);
          footer({ label: t('player.continue'), onClick: next, state: 'ok', title: t('player.mission'), text: t('player.missionDesc') });
          return;
        }
        fails++;
        if (!failedOnce) { failedOnce = true; markWrong(it, false); } else buzz('bad');
        const extra = h('div', { class: 'row-actions' },
          h('button', { type: 'button', class: 'btn ghost', onclick: () => { hintEl.hidden = false; } }, t('player.showHint')),
          fails >= 2 ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { editor.code = localizeCode(ex.solution); editor.foldSetup(); hintEl.hidden = false; } }, t('player.showSolution')) : null);
        footer({ label: t('player.runAgain'), onClick: run, state: 'bad', title: t('player.notYet'), text: msg, extra });
      };

      const run = () => {
        code = editor.code;
        lastResult = runProgram(code, config, start, { objects: ex.objects, realistic: ex.realistic !== undefined ? { seed: ex.realistic } : null });
        self.stage.setScene(start, ex.targets ?? [], ex.objects ?? []);
        self.stage.load(lastResult);
        cons.load(lastResult);
        self.stage.onFrame = (f) => {
          if (self.stage.time > 0) editor.mark(f.line || null);
          cons.update(self.stage.time);
        };
        self.stage.onEnd = evaluate;
        footer({ label: t('player.skip'), onClick: () => self.stage.skipToEnd() });
        if (lastResult.final.t === 0) { evaluate(); return; }
        self.stage.play();
      };
      footer({ label: t('player.runCheck'), onClick: run, extra: h('button', { type: 'button', class: 'btn ghost', onclick: () => { hintEl.hidden = false; } }, t('player.showHint')) });
    }

    setProgress();
    intro();
  }
}
