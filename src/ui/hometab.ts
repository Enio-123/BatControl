// Aba Hoje: resumo do dia com atalhos para o que a equipe faz mais.
import { t } from '../i18n';
import { ALL_LESSONS } from '../content/lessons';
import { lessonText, topicText } from '../content/text';
import { TOPICS } from '../content/reference';
import { currentStreak, practicedToday, state } from '../store';
import { h, icon, IconName } from './dom';
import { current } from './library';
import { reviewItems } from './pathtab';

export interface HomeActions {
  lesson: () => void;
  review: () => void;
  puzzles: () => void;
  sim: () => void;
  score: () => void;
  topic: (id: string) => void;
}

/** Tópico do dia: muda uma vez por dia, igual para todo mundo. */
function topicOfDay() {
  const d = new Date();
  const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return TOPICS[n % TOPICS.length];
}

export class HomeTab {
  el = h('section', { class: 'home-tab' });

  constructor(private act: HomeActions) {
    this.render();
  }

  render() {
    const done = ALL_LESSONS.filter((l) => state.progress.done[l.id]).length;
    const next = ALL_LESSONS.find((l) => !state.progress.done[l.id]);
    const streak = currentStreak();
    const today = practicedToday();
    const review = reviewItems().length;
    const best = state.scores.reduce((b, r) => Math.max(b, r.total), -1);
    const topic = topicOfDay();
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening';

    const tile = (ic: IconName, title: string, desc: string, onclick: () => void, cls = '') =>
      h('button', { type: 'button', class: `tile-card ${cls}`, onclick },
        h('span', { class: 'tile-ico' }, icon(ic, 22)),
        h('span', { class: 'tile-text' }, h('strong', {}, title), h('span', { class: 'muted small' }, desc)),
        icon('right', 18));

    this.el.replaceChildren(
      h('div', { class: 'home-hero' },
        h('div', {},
          h('p', { class: 'eyebrow' }, t(greet)),
          h('h1', {}, t('home.title')),
          h('p', { class: 'muted' }, today ? t('home.doneToday') : streak ? t('home.keepStreak', { n: streak }) : t('home.startToday'))),
        h('div', { class: 'stats hero-stats' },
          h('div', { class: `stat ${today ? 'lit' : ''}` }, h('span', { class: 'num mono' }, icon('flame', 18), String(streak)), h('span', { class: 'lbl' }, t(streak === 1 ? 'path.day' : 'path.days'))),
          h('div', { class: 'stat' }, h('span', { class: 'num mono' }, icon('bolt', 18), String(state.progress.xp)), h('span', { class: 'lbl' }, 'XP')),
          h('div', { class: 'stat' }, h('span', { class: 'num mono' }, `${done}/${ALL_LESSONS.length}`), h('span', { class: 'lbl' }, t('path.lessons'))))),
      h('div', { class: 'home-grid' },
        next
          ? h('button', { type: 'button', class: 'tile-card primary-card', onclick: this.act.lesson },
              h('span', { class: 'tile-ico' }, icon('flag', 22)),
              h('span', { class: 'tile-text' },
                h('span', { class: 'eyebrow' }, done ? t('home.continue') : t('home.firstLesson')),
                h('strong', {}, lessonText(next.id).title),
                h('span', { class: 'meter thin' }, h('span', { style: `width:${(done / ALL_LESSONS.length) * 100}%` }))),
              icon('right', 18))
          : tile('trophy', t('home.allDone'), t('home.allDoneDesc'), this.act.review),
        review ? tile('review', t('review.title'), t('review.count', { n: review }), this.act.review) : null,
        tile('puzzle', t('pz.title'), t('pz.homeDesc', { n: state.puzzles.rating }), this.act.puzzles),
        tile('robot', t('home.simTitle'), t('home.simDesc', { name: current().name }), this.act.sim),
        tile('trophy', t('home.scoreTitle'), best >= 0 ? t('home.scoreBest', { n: best }) : t('home.scoreDesc'), this.act.score),
        tile('book', t('home.topic'), topicText(topic.id).title, () => this.act.topic(topic.id))),
    );
  }
}
