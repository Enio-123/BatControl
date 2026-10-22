// Saída do programa (print, bipes, avisos e erros), revelada no ritmo da reprodução.
import { t } from '../i18n';
import { RunResult } from '../sim/runner';
import { fmtTime, h } from './dom';

export class ConsoleView {
  el = h('div', { class: 'console', role: 'log', 'aria-label': t('console.label') });
  private result: RunResult | null = null;
  private shown = -1;
  private errorShown = false;

  clear(message = t('console.empty')) {
    this.result = null;
    this.shown = -1;
    this.errorShown = false;
    this.el.replaceChildren(h('p', { class: 'console-empty' }, message));
  }

  load(r: RunResult) {
    this.result = r;
    this.shown = -1;
    this.errorShown = false;
    this.el.replaceChildren();
    // Erro sem nenhum movimento (ex.: sintaxe) aparece direto
    if (r.error && r.final.t === 0) this.update(0, true);
  }

  /** Linha avulsa (ex.: saída do hub real pelo Bluetooth). */
  append(text: string, kind: 'out' | 'info' | 'warn' | 'err' = 'out') {
    this.el.querySelector('.console-empty')?.remove();
    this.el.append(h('div', { class: `line ${kind}` }, h('span', { class: 'msg' }, text)));
    this.el.scrollTop = this.el.scrollHeight;
  }

  update(time: number, end = false) {
    const r = this.result;
    if (!r) return;
    const evs = r.events;
    let i = this.shown + 1;
    // Voltou no tempo: redesenha
    if (i > 0 && evs[this.shown] && evs[this.shown].t > time) {
      this.el.replaceChildren();
      this.shown = -1;
      this.errorShown = false;
      i = 0;
    }
    for (; i < evs.length && (evs[i].t <= time || end); i++) {
      const e = evs[i];
      const cls = e.kind === 'warn' ? 'warn' : e.kind === 'print' ? 'out' : 'info';
      const label = e.kind === 'beep' ? t('console.sound') : e.kind === 'display' ? t('console.display') : e.kind === 'warn' ? t('console.warn') : '';
      this.el.append(h('div', { class: `line ${cls}` }, h('span', { class: 't mono' }, fmtTime(e.t)), label ? h('span', { class: 'tag' }, label) : null, h('span', { class: 'msg' }, e.text)));
      this.shown = i;
    }
    if (end && !this.errorShown) {
      this.errorShown = true;
      if (r.error) {
        this.el.append(
          h('div', { class: 'line err' },
            h('span', { class: 't mono' }, r.error.line ? t('console.line', { n: r.error.line }) : ''),
            h('span', { class: 'msg' }, h('b', {}, r.error.type + ': '), r.error.message)),
        );
      } else if (r.timeUp) {
        this.el.append(h('div', { class: 'line warn' }, h('span', { class: 't mono' }, '2:30.0'), h('span', { class: 'msg' }, t('console.timeUp'))));
      } else {
        this.el.append(h('div', { class: 'line done' }, h('span', { class: 't mono' }, fmtTime(r.final.t)), h('span', { class: 'msg' }, t('console.done'))));
      }
    }
    this.el.scrollTop = this.el.scrollHeight;
  }
}
