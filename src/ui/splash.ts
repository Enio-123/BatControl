// Abertura com a logo do BatControl e escolha de idioma na primeira entrada.
import { browserLang, LANGS, Lang, setLang, t } from '../i18n';
import { h } from './dom';
import { iconSvg, logoEl, markSvg } from './logo';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Os sinais < > chegam dos lados, o morcego sobe no meio, depois o nome do app. Toque para pular. */
export function playSplash(): Promise<void> {
  return new Promise((resolve) => {
    const el = h('div', { class: `splash${reduced() ? ' reduced' : ''}`, role: 'img', 'aria-label': 'BatControl' },
      logoEl('splash-logo', markSvg()),
      h('div', { class: 'splash-name' }, h('span', {}, 'Bat'), h('span', {}, 'Control')),
      h('div', { class: 'splash-sub' }, 'Pybricks · FIRST LEGO League'),
      h('div', { class: 'splash-by' }, t('app.by')));
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.add('out');
      setTimeout(() => { el.remove(); resolve(); }, reduced() ? 150 : 420);
    };
    el.addEventListener('click', finish);
    document.body.append(el);
    setTimeout(finish, reduced() ? 600 : 2100);
  });
}

/** Tela de idioma (só na primeira vez). */
export function pickLanguage(): Promise<Lang> {
  return new Promise((resolve) => {
    let chosen = browserLang();
    setLang(chosen);
    const title = h('h1', {});
    const sub = h('p', { class: 'muted' });
    const go = h('button', { type: 'button', class: 'btn primary big' });
    const paint = () => {
      title.textContent = t('lang.title');
      sub.textContent = t('lang.sub');
      go.textContent = t('lang.continue');
    };
    const btns = LANGS.map((l) => {
      const b = h('button', { type: 'button', role: 'radio', class: 'lang-opt', 'aria-checked': String(l.id === chosen), lang: l.html }, h('strong', {}, l.native), h('span', { class: 'muted small' }, l.id.toUpperCase()));
      b.addEventListener('click', () => {
        chosen = l.id;
        setLang(chosen);
        btns.forEach((x, i) => x.setAttribute('aria-checked', String(LANGS[i].id === chosen)));
        paint();
      });
      return b;
    });
    const el = h('div', { class: 'lang-screen' },
      h('div', { class: 'lang-card' },
        logoEl('lang-logo', iconSvg()),
        title, sub,
        h('div', { class: 'lang-grid', role: 'radiogroup', 'aria-label': 'Language' }, btns),
        go));
    go.addEventListener('click', () => {
      el.classList.add('out');
      setTimeout(() => { el.remove(); resolve(chosen); }, 250);
    });
    paint();
    document.body.append(el);
    btns.find((b) => b.getAttribute('aria-checked') === 'true')?.focus();
  });
}
