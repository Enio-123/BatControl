// Aba Pontos: calculadora da temporada BIOGLOW, cronômetro de 2:30 e histórico de rodadas.
import { t } from '../i18n';
import { Answers, defaultAnswers, INSPECTION, Item, key, Mission, MISSION_MAX, MISSIONS, missionScore, TOKEN_POINTS, TOTAL_MAX, totalScore } from '../content/bioglow';
import { save, ScoreRun, state, uid } from '../store';
import { buzz, fmtClock, h, icon, iconBtn, toast } from './dom';

const MATCH = 150_000;
/** Avisos do cronômetro (ms restantes). */
const ALERTS = [30_000, 10_000];

export class ScoreTab {
  el: HTMLElement;
  private answers: Answers;
  private gp: number | null;
  private totalEl: HTMLElement;
  private breakdown: HTMLElement;
  private list: HTMLElement;
  private history: HTMLElement;
  private missionEls = new Map<string, { score: HTMLElement; card: HTMLElement }>();
  // Cronômetro
  private clockEl: HTMLElement;
  private clockBtn: HTMLButtonElement;
  private remaining = MATCH;
  private running = false;
  private endAt = 0;
  private timer = 0;
  private wake: any = null;
  private alerted = new Set<number>();

  constructor() {
    const draft = state.scoreDraft;
    this.answers = { ...defaultAnswers(), ...(draft?.answers ?? {}) };
    this.gp = draft?.gp ?? null;

    this.totalEl = h('span', { class: 'score-total mono', 'aria-live': 'polite' });
    this.breakdown = h('span', { class: 'score-break muted small' });
    this.clockEl = h('span', { class: 'clock mono', role: 'timer', 'aria-live': 'off' }, fmtClock(MATCH));
    this.clockBtn = h('button', { type: 'button', class: 'btn primary', onclick: () => this.toggleClock() }, icon('play', 16), t('score.start'));
    this.list = h('div', { class: 'missions' });
    this.history = h('div', { class: 'score-history' });

    const head = h('div', { class: 'score-head' },
      h('div', { class: 'score-sum' },
        h('span', { class: 'eyebrow' }, t('score.total')),
        h('div', { class: 'score-line' }, this.totalEl, h('span', { class: 'muted' }, `/ ${TOTAL_MAX}`)),
        this.breakdown),
      h('div', { class: 'score-clock' },
        this.clockEl,
        h('div', { class: 'row-actions' },
          this.clockBtn,
          iconBtn('restart', t('score.resetClock'), () => this.resetClock()))));

    this.el = h('section', { class: 'score-tab', 'aria-label': t('nav.score') },
      head,
      h('div', { class: 'score-body' },
        h('div', { class: 'score-intro' },
          h('h2', {}, t('score.title')),
          h('p', { class: 'muted' }, t('score.desc', { max: MISSION_MAX }))),
        this.list,
        this.buildExtras(),
        h('div', { class: 'score-actions' },
          h('button', { type: 'button', class: 'btn primary big', onclick: () => this.saveRun() }, icon('check', 18), t('score.save')),
          h('button', { type: 'button', class: 'btn ghost big', onclick: (e: MouseEvent) => this.clearAll(e.currentTarget as HTMLButtonElement) }, icon('trash', 18), t('score.clear'))),
        this.history,
        h('p', { class: 'muted small disclaimer' }, icon('info', 14), ' ', t('score.disclaimer'))));
    this.renderMissions();
    this.renderHistory();
    this.update();
  }

  hide() { /* o cronômetro continua rodando entre abas */ }

  private persist() {
    state.scoreDraft = { answers: this.answers, gp: this.gp };
    save();
  }

  private update() {
    const s = totalScore(this.answers);
    this.totalEl.textContent = String(s.total);
    this.breakdown.textContent = t('score.breakdown', { m: s.missions, i: s.inspection, p: s.tokens });
    for (const m of MISSIONS) {
      const e = this.missionEls.get(m.id);
      if (!e) continue;
      const pts = missionScore(m, this.answers);
      e.score.textContent = String(pts);
      e.card.classList.toggle('scored', pts > 0);
      e.card.classList.toggle('full', pts === m.max);
    }
  }

  private set(k: string, value: number) {
    this.answers[k] = value;
    this.persist();
    this.update();
  }

  // ---------- Controles ----------

  private yesNo(k: string, label: string, points: number | null) {
    const b = h('button', { type: 'button', role: 'switch', class: 'check-item', 'aria-checked': String(!!this.answers[k]) },
      h('span', { class: 'box' }, icon('check', 16)),
      h('span', { class: 'txt' }, label),
      points ? h('span', { class: 'pts mono' }, `+${points}`) : null);
    b.addEventListener('click', () => {
      const on = !this.answers[k];
      b.setAttribute('aria-checked', String(on));
      buzz(on ? 'ok' : 'tap');
      this.set(k, on ? 1 : 0);
      this.syncDependent();
    });
    return b;
  }

  private counter(k: string, label: string, max: number, each: number | null) {
    const val = h('span', { class: 'mono count-val', 'aria-live': 'polite' }, String(this.answers[k] ?? 0));
    const bump = (d: number) => () => {
      const nv = Math.max(0, Math.min(max, (this.answers[k] ?? 0) + d));
      if (nv === this.answers[k]) return;
      val.textContent = String(nv);
      buzz('tap');
      this.set(k, nv);
      this.syncDependent();
    };
    return h('div', { class: 'count-item' },
      h('span', { class: 'txt' }, label, each ? h('span', { class: 'pts mono' }, ` ${t('score.each', { n: each })}`) : null),
      h('div', { class: 'stepper big' },
        h('button', { type: 'button', 'aria-label': `${label} −1`, onclick: bump(-1) }, icon('minus', 16)),
        val,
        h('span', { class: 'muted small' }, `/ ${max}`),
        h('button', { type: 'button', 'aria-label': `${label} +1`, onclick: bump(1) }, icon('plus', 16))));
  }

  private pick(k: string, label: string, options: { id: string; label: string; points: number }[]) {
    const wrap = h('div', { class: 'seg pick', role: 'radiogroup', 'aria-label': label });
    const btns = options.map((o, i) => {
      const b = h('button', { type: 'button', role: 'radio', class: this.answers[k] === i ? 'on' : '', 'aria-checked': String(this.answers[k] === i) }, o.label, o.points ? h('span', { class: 'pts mono' }, ` +${o.points}`) : null);
      b.addEventListener('click', () => {
        btns.forEach((x, j) => { x.classList.toggle('on', j === i); x.setAttribute('aria-checked', String(j === i)); });
        buzz('tap');
        this.set(k, i);
      });
      return b;
    });
    wrap.append(...btns);
    return h('div', { class: 'pick-item' }, h('span', { class: 'txt' }, label), wrap);
  }

  /** Itens que só valem com outro item marcado ficam esmaecidos. */
  private syncDependent() {
    const dim = (m: string, item: string, req: string) => {
      const el = this.list.querySelector<HTMLElement>(`[data-k="${m}.${item}"]`);
      el?.classList.toggle('dim', !this.answers[`${m}.${req}`]);
    };
    dim('m04', 'leaves', 'katydid');
    dim('m06', 'fragments', 'ant');
  }

  private renderItem(m: Mission, it: Item): HTMLElement {
    const k = key(m, it);
    const label = t(`bg.${m.id}.${it.id}`);
    let el: HTMLElement;
    if (it.kind === 'yes') el = this.yesNo(k, label, it.points || null);
    else if (it.kind === 'count') {
      const each = m.id === 'm04' ? null : it.each;
      el = this.counter(k, label, it.max, each);
    } else el = this.pick(k, label, it.options.map((o) => ({ id: o.id, label: t(`bg.${m.id}.${it.id}.${o.id}`), points: o.points })));
    el.dataset.k = k;
    return el;
  }

  private renderMissions() {
    this.missionEls.clear();
    this.list.replaceChildren(...MISSIONS.map((m) => {
      const score = h('span', { class: 'm-score mono' }, '0');
      const card = h('article', { class: 'mission card' },
        h('header', {},
          h('span', { class: 'm-no mono' }, m.id.toUpperCase().replace('M', 'M')),
          h('h3', {}, m.name),
          h('span', { class: 'm-pts' }, score, h('span', { class: 'muted small' }, `/${m.max}`))),
        h('div', { class: 'm-items' }, m.items.map((it) => this.renderItem(m, it))),
        m.note ? h('p', { class: 'm-note muted small' }, t(`bg.${m.id}.note`)) : null);
      this.missionEls.set(m.id, { score, card });
      return card;
    }));
    this.syncDependent();
  }

  private buildExtras() {
    const tokensVal = h('span', { class: 'mono count-val' }, String(this.answers.tokens));
    const tokensPts = h('span', { class: 'pts mono' });
    const showTokens = () => {
      tokensVal.textContent = String(this.answers.tokens);
      tokensPts.textContent = `= ${TOKEN_POINTS[this.answers.tokens]}`;
    };
    showTokens();
    const bumpTokens = (d: number) => () => {
      const nv = Math.max(0, Math.min(6, this.answers.tokens + d));
      if (nv === this.answers.tokens) return;
      buzz(d < 0 ? 'warn' : 'tap');
      this.set('tokens', nv);
      showTokens();
    };
    const gpOpts: [number | null, string][] = [[null, t('score.gpNone')], [2, t('score.gp2')], [3, t('score.gp3')], [4, t('score.gp4')]];
    const gpSeg = h('div', { class: 'seg pick', role: 'radiogroup', 'aria-label': t('score.gp') });
    const gpBtns = gpOpts.map(([v, label]) => {
      const b = h('button', { type: 'button', role: 'radio', class: this.gp === v ? 'on' : '', 'aria-checked': String(this.gp === v) }, label);
      b.addEventListener('click', () => {
        this.gp = v;
        gpBtns.forEach((x, j) => { const on = gpOpts[j][0] === v; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
        buzz('tap');
        this.persist();
      });
      return b;
    });
    gpSeg.append(...gpBtns);
    return h('div', { class: 'extras' },
      h('article', { class: 'mission card' },
        h('header', {}, h('span', { class: 'm-no mono' }, 'EI'), h('h3', {}, t('score.inspection'))),
        h('div', { class: 'm-items' }, this.yesNo('inspection', t('score.inspectionDesc'), INSPECTION))),
      h('article', { class: 'mission card' },
        h('header', {}, h('span', { class: 'm-no mono' }, 'PT'), h('h3', {}, t('score.tokens'))),
        h('div', { class: 'm-items' },
          h('div', { class: 'count-item' },
            h('span', { class: 'txt' }, t('score.tokensDesc')),
            h('div', { class: 'stepper big' },
              h('button', { type: 'button', 'aria-label': `${t('score.tokens')} −1`, onclick: bumpTokens(-1) }, icon('minus', 16)),
              tokensVal,
              h('span', { class: 'muted small' }, '/ 6'),
              h('button', { type: 'button', 'aria-label': `${t('score.tokens')} +1`, onclick: bumpTokens(1) }, icon('plus', 16)),
              tokensPts)),
          h('p', { class: 'muted small' }, t('score.tokensTable')))),
      h('article', { class: 'mission card' },
        h('header', {}, h('span', { class: 'm-no mono' }, 'GP'), h('h3', {}, t('score.gp'))),
        h('div', { class: 'm-items' }, gpSeg, h('p', { class: 'muted small' }, t('score.gpDesc')))));
  }

  // ---------- Histórico ----------

  private saveRun() {
    const s = totalScore(this.answers);
    const run: ScoreRun = { id: uid(), at: Date.now(), total: s.total, gp: this.gp, note: '', answers: { ...this.answers } };
    state.scores.unshift(run);
    state.scores = state.scores.slice(0, 50);
    save();
    buzz('ok');
    toast(t('score.saved', { n: s.total }), 'ok');
    this.renderHistory();
  }

  private clearAll(btn: HTMLButtonElement) {
    if (!btn.classList.contains('armed')) {
      btn.classList.add('armed');
      toast(t('score.clearConfirm'));
      setTimeout(() => btn.classList.remove('armed'), 3000);
      return;
    }
    btn.classList.remove('armed');
    this.answers = defaultAnswers();
    this.gp = null;
    this.persist();
    this.renderMissions();
    const extras = this.el.querySelector('.extras');
    extras?.replaceWith(this.buildExtras());
    this.update();
    buzz('tap');
  }

  best() {
    return state.scores.reduce<ScoreRun | null>((b, r) => (!b || r.total > b.total ? r : b), null);
  }

  private renderHistory() {
    const runs = state.scores;
    if (!runs.length) { this.history.replaceChildren(); return; }
    const best = this.best()!;
    const avg = Math.round(runs.slice(0, 5).reduce((s, r) => s + r.total, 0) / Math.min(5, runs.length));
    this.history.replaceChildren(
      h('h3', {}, t('score.history')),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(best.total)), h('span', { class: 'lbl' }, t('score.best'))),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(avg)), h('span', { class: 'lbl' }, t('score.avg5'))),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(runs.length)), h('span', { class: 'lbl' }, t('score.runs')))),
      h('ul', { class: 'run-list' }, runs.slice(0, 12).map((r) => h('li', { class: r.id === best.id ? 'best' : '' },
        h('span', { class: 'mono run-total' }, String(r.total)),
        h('span', { class: 'muted small' }, new Date(r.at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })),
        r.gp ? h('span', { class: 'pill quiet' }, `GP ${r.gp}`) : null,
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => this.loadRun(r) }, t('score.load')),
        h('button', { type: 'button', class: 'icon-btn small danger', 'aria-label': t('lib.delete'), onclick: () => { state.scores = state.scores.filter((x) => x.id !== r.id); save(); this.renderHistory(); } }, icon('trash', 14))))));
  }

  private loadRun(r: ScoreRun) {
    this.answers = { ...defaultAnswers(), ...r.answers };
    this.gp = r.gp;
    this.persist();
    this.renderMissions();
    this.el.querySelector('.extras')?.replaceWith(this.buildExtras());
    this.update();
    this.el.scrollTo?.({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Cronômetro ----------

  private toggleClock() {
    if (this.running) this.pauseClock();
    else this.startClock();
  }

  private async startClock() {
    if (this.remaining <= 0) this.resetClock();
    this.running = true;
    this.endAt = performance.now() + this.remaining;
    this.clockBtn.replaceChildren(icon('pause', 16), t('score.pause'));
    buzz('ok');
    try { this.wake = await (navigator as any).wakeLock?.request('screen'); } catch { /* sem bloqueio de tela */ }
    const tick = () => {
      if (!this.running) return;
      this.remaining = Math.max(0, this.endAt - performance.now());
      this.drawClock();
      for (const a of ALERTS) if (this.remaining <= a && !this.alerted.has(a)) { this.alerted.add(a); buzz('warn'); }
      if (this.remaining <= 0) {
        this.running = false;
        buzz('end');
        toast(t('score.timeUp'));
        this.clockBtn.replaceChildren(icon('restart', 16), t('score.again'));
        this.releaseWake();
        return;
      }
      this.timer = requestAnimationFrame(tick);
    };
    this.timer = requestAnimationFrame(tick);
  }

  private pauseClock() {
    this.running = false;
    cancelAnimationFrame(this.timer);
    this.clockBtn.replaceChildren(icon('play', 16), t('score.resume'));
    this.releaseWake();
  }

  private resetClock() {
    this.running = false;
    cancelAnimationFrame(this.timer);
    this.remaining = MATCH;
    this.alerted.clear();
    this.drawClock();
    this.clockBtn.replaceChildren(icon('play', 16), t('score.start'));
    this.releaseWake();
  }

  private releaseWake() {
    try { this.wake?.release(); } catch { /* já liberado */ }
    this.wake = null;
  }

  private drawClock() {
    this.clockEl.textContent = fmtClock(this.remaining);
    this.clockEl.classList.toggle('low', this.remaining <= 30_000 && this.remaining > 0);
    this.clockEl.classList.toggle('over', this.remaining <= 0);
  }
}
