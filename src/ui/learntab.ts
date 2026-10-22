// Aba Aprender: referência de cada função, com exemplo que abre no simulador.
import { t } from '../i18n';
import { GROUPS, RefTopic, TOPICS } from '../content/reference';
import { groupName, localizeCode, topicText } from '../content/text';
import { fill, h, icon } from './dom';
import { CodeEditor } from './editor';

export class LearnTab {
  el: HTMLElement;
  private nav: HTMLElement;
  private article: HTMLElement;
  current = TOPICS[0].id;
  private exampleEditor: CodeEditor | null = null;
  private search: HTMLInputElement;

  constructor(private openInSim: (topic: RefTopic, code: string) => void) {
    this.search = h('input', { type: 'search', placeholder: t('learn.search'), 'aria-label': t('learn.searchLabel'), id: 'learn-search', class: 'search' });
    this.search.addEventListener('input', () => this.renderNav());
    this.nav = h('nav', { class: 'learn-nav', 'aria-label': t('learn.topics') });
    this.article = h('article', { class: 'learn-article' });
    this.el = h('section', { class: 'learn-tab', 'aria-label': t('nav.learn') },
      h('aside', { class: 'learn-side' }, this.search, this.nav),
      this.article,
    );
    this.renderNav();
    this.renderArticle();
  }

  select(id: string) {
    this.current = id;
    this.renderNav();
    this.renderArticle();
    this.article.scrollTop = 0;
    if (window.matchMedia('(max-width: 860px)').matches) this.article.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  private renderNav() {
    const q = this.search.value.trim().toLowerCase();
    const match = (x: RefTopic) => {
      if (!q) return true;
      const tx = topicText(x.id);
      return [tx.title, tx.summary, x.signature ?? '', x.id, groupName(x.group)].join(' ').toLowerCase().includes(q);
    };
    const groups = GROUPS.map((g) => {
      const items = TOPICS.filter((x) => x.group === g && match(x));
      if (!items.length) return null;
      return h('div', { class: 'nav-group' },
        h('h3', {}, groupName(g)),
        h('ul', {}, items.map((x) => h('li', {},
          h('button', { type: 'button', class: x.id === this.current ? 'on' : '', 'aria-current': x.id === this.current ? 'page' : undefined, onclick: () => this.select(x.id) }, topicText(x.id).title)))));
    }).filter((x) => !!x);
    fill(this.nav, ...(groups.length ? groups : [h('p', { class: 'muted small' }, t('learn.nothing'))]));
  }

  private renderArticle() {
    const topic = TOPICS.find((x) => x.id === this.current)!;
    const tx = topicText(topic.id);
    const code = localizeCode(topic.example).trim();
    this.exampleEditor?.destroy();
    const exHost = h('div', { class: 'example-code' });
    const idx = TOPICS.indexOf(topic);
    const prev = TOPICS[idx - 1];
    const next = TOPICS[idx + 1];
    fill(this.article,
      h('p', { class: 'eyebrow' }, groupName(topic.group)),
      h('h2', {}, tx.title),
      topic.signature ? h('pre', { class: 'signature mono' }, topic.signature) : null,
      h('p', { class: 'lead' }, tx.summary),
      topic.params?.length && tx.params?.length
        ? h('div', { class: 'table-wrap' }, h('table', { class: 'params' },
            h('thead', {}, h('tr', {}, h('th', {}, t('learn.param')), h('th', {}, t('learn.unit')), h('th', {}, t('learn.what')))),
            h('tbody', {}, topic.params.map((n, i) => h('tr', {}, h('td', { class: 'mono' }, n), h('td', {}, tx.params![i]?.[0] ?? ''), h('td', {}, tx.params![i]?.[1] ?? ''))))))
        : null,
      tx.returns ? h('p', {}, h('b', {}, `${t('learn.returns')} `), tx.returns) : null,
      h('div', { class: 'example-head' },
        h('h3', {}, t('learn.example')),
        h('button', { type: 'button', class: 'btn primary', onclick: () => this.openInSim(topic, code) }, icon('play', 16), t('learn.openSim'))),
      exHost,
      tx.tips?.length ? h('div', { class: 'note tip' }, h('h4', {}, t('learn.tips')), h('ul', {}, tx.tips.map((x) => h('li', {}, x)))) : null,
      tx.mistakes?.length ? h('div', { class: 'note warn' }, h('h4', {}, t('learn.mistakes')), h('ul', {}, tx.mistakes.map((x) => h('li', {}, x)))) : null,
      h('div', { class: 'article-nav' },
        prev ? h('button', { type: 'button', class: 'btn ghost', onclick: () => this.select(prev.id) }, icon('left', 16), topicText(prev.id).title) : h('span'),
        next ? h('button', { type: 'button', class: 'btn ghost', onclick: () => this.select(next.id) }, topicText(next.id).title, icon('right', 16)) : null),
    );
    this.exampleEditor = new CodeEditor(exHost, code, { readOnly: true, label: `${t('learn.example')}: ${tx.title}` });
  }
}
