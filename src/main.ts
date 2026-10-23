import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import './style.css';
import { iconSvg, logoEl } from './ui/logo';
import { browserLang, Lang, setLang, t } from './i18n';
import { START } from './content/setup';
import { topicText } from './content/text';
import { currentStreak, renameOldNames, save, state, storageAvailable } from './store';
import { Viewer } from './three/viewer';
import { decodeShare, addProgram } from './ui/library';
import { h, icon, IconName, iconBtn, openSheet } from './ui/dom';
import { HomeTab } from './ui/hometab';
import { LearnTab } from './ui/learntab';
import { PathTab } from './ui/pathtab';
import { ScoreTab } from './ui/scoretab';
import { SimTab } from './ui/simtab';
import { applyTheme, openSettings } from './ui/settings';
import { pickLanguage, playSplash } from './ui/splash';

type TabId = 'home' | 'sim' | 'learn' | 'path' | 'score';
const TAB_IDS: TabId[] = ['home', 'sim', 'learn', 'path', 'score'];
const TAB_ICONS: Record<TabId, IconName> = { home: 'home', sim: 'robot', learn: 'book', path: 'flag', score: 'trophy' };

const viewer = new Viewer();
let current: TabId = 'home';

interface App {
  home: HomeTab; sim: SimTab; learn: LearnTab; path: PathTab; score: ScoreTab;
  views: Record<TabId, HTMLElement>;
  buttons: HTMLButtonElement[];
  stats: HTMLElement;
  title: HTMLElement;
}
let app: App | null = null;

function matLabels() {
  viewer.setMatLabels({
    base: t('mat.base'), stop: t('mat.stop'), line: t('mat.line'),
    zones: { red: t('zone.red'), blue: t('zone.blue'), yellow: t('zone.yellow'), green: t('zone.green') },
    footer: t('mat.footer'),
  });
}

function renderStats() {
  if (!app) return;
  app.stats.replaceChildren(
    h('span', { class: 'chip', title: t('top.streak') }, icon('flame', 15), h('span', { class: 'mono' }, String(currentStreak()))),
    h('span', { class: 'chip', title: t('top.xp') }, icon('bolt', 15), h('span', { class: 'mono' }, String(state.progress.xp))),
  );
}

function refreshProgress() {
  renderStats();
  app?.home.render();
}

function changeLang(l: Lang) {
  state.prefs.lang = l;
  save();
  setLang(l);
  build();
}

function build() {
  app?.sim.hide();
  const root = document.getElementById('app')!;
  matLabels();

  const sim = new SimTab(viewer);
  const path = new PathTab(viewer, () => refreshProgress());
  const learn = new LearnTab((topic, code) => {
    sim.open(code, topic.start ?? START, topicText(topic.id).title);
    go('sim');
  });
  const score = new ScoreTab();
  const home = new HomeTab({
    lesson: () => { go('path'); const n = path.nextLesson(); if (n) path.start(n); },
    review: () => { go('path'); path.startReview(); },
    puzzles: () => { go('path'); path.openPuzzles(); },
    sim: () => go('sim'),
    score: () => go('score'),
    topic: (id) => { learn.select(id); go('learn'); },
  });
  const views: Record<TabId, HTMLElement> = { home: home.el, sim: sim.el, learn: learn.el, path: path.el, score: score.el };

  const buttons: HTMLButtonElement[] = [];
  const navButtons = (cls: string) => h('nav', { class: cls, 'aria-label': t('nav.label') },
    TAB_IDS.map((id) => {
      const b = h('button', { type: 'button', 'data-tab': id, 'aria-controls': `view-${id}`, onclick: () => go(id) }, icon(TAB_ICONS[id], 20), h('span', {}, t(`nav.${id}`)));
      buttons.push(b);
      return b;
    }));

  const stats = h('div', { class: 'top-stats' });
  const title = h('span', { class: 'top-title' });
  const header = h('header', { class: 'topbar' },
    h('button', { type: 'button', class: 'brand', onclick: () => go('home'), 'aria-label': `BatControl, ${t('nav.home')}` },
      logoEl('logo', iconSvg()),
      h('span', { class: 'brand-text' }, h('span', { class: 'name' }, 'BatControl'), h('span', { class: 'sub' }, t('app.tagline')))),
    title,
    navButtons('tabs top-tabs'),
    h('div', { class: 'top-right' },
      stats,
      iconBtn('settings', t('set.title'), () => openSettings(changeLang, () => { refreshProgress(); syncBackground(); }))));

  const main = h('main', { class: 'views' }, TAB_IDS.map((id) => {
    const v = views[id];
    v.id = `view-${id}`;
    v.classList.add('view');
    return v;
  }));
  const warn = storageAvailable() ? null : h('p', { class: 'storage-warn' }, t('app.noStorage'));

  root.replaceChildren(header, warn ?? '', main, navButtons('tabs bottom-tabs'));
  app = { home, sim, learn, path, score, views, buttons, stats, title };
  renderStats();
  go(current, true);
}

function go(id: TabId, force = false) {
  if (!app) return;
  if (id === current && !force) {
    // Tocar de novo na aba Trilha volta para a lista de lições
    return;
  }
  if (current === 'sim' && id !== 'sim') app.sim.hide();
  if (current === 'path' && id !== 'path') app.path.hide();
  current = id;
  for (const b of app.buttons) {
    const on = b.dataset.tab === id;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  for (const tid of TAB_IDS) app.views[tid].hidden = tid !== id;
  app.title.textContent = t(`nav.${id}`);
  document.body.dataset.tab = id;
  if (id === 'sim') app.sim.show();
  if (id === 'path') app.path.show();
  if (id === 'home') app.home.render();
  try { history.replaceState(null, '', `#${id}`); } catch { /* sem histórico no iframe */ }
  window.scrollTo({ top: 0 });
}

function syncBackground() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--stage-bg').trim() || '#1a1b1e';
  viewer.setBackground(bg);
}

/** Link de programa compartilhado (#p=...): pergunta antes de importar. */
async function handleShareLink() {
  const m = location.hash.match(/^#p=(.+)$/);
  if (!m) return;
  const p = await decodeShare(m[1]);
  try { history.replaceState(null, '', `#${current}`); } catch { /* iframe */ }
  if (!p) return;
  p.code = renameOldNames(p.code);
  const sheet = openSheet(t('share.importTitle'), [
    h('p', {}, t('share.importDesc', { name: p.name })),
    h('pre', { class: 'code-block mono preview' }, p.code.split('\n').slice(0, 14).join('\n') + (p.code.split('\n').length > 14 ? '\n…' : '')),
    h('div', { class: 'dialog-actions' },
      h('button', { type: 'button', class: 'btn ghost', onclick: () => sheet.close() }, t('share.ignore')),
      h('button', { type: 'button', class: 'btn primary', onclick: () => {
        addProgram(p.name, p.code);
        sheet.close();
        app?.sim.openProgram(p.code);
        go('sim');
      } }, icon('download', 16), t('share.import'))),
  ]);
}

function registerSW() {
  if (import.meta.env.VITE_PAGES !== '1' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

async function boot() {
  applyTheme();
  syncBackground();
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => { applyTheme(); syncBackground(); });
  new MutationObserver(syncBackground).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  registerSW();

  setLang(state.prefs.lang ?? browserLang());
  const initial = location.hash.slice(1) as TabId;
  if (TAB_IDS.includes(initial)) current = initial;
  await playSplash();
  if (!state.prefs.lang) {
    state.prefs.lang = await pickLanguage();
    save();
  }
  setLang(state.prefs.lang);
  build();
  void handleShareLink();
}

void boot();
