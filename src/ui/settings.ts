// Ajustes: idioma, tema, vibração, instalar o app, sobre e zerar progresso.
import { LANGS, Lang, lang, t } from '../i18n';
import { resetProgress, save, state, Theme } from '../store';
import { buzz, h, icon, openSheet, segmented, toast, toggle } from './dom';

export const APP_VERSION = '3.0.0';

// ---------- Tema ----------

export function applyTheme() {
  const th = state.prefs.theme;
  if (th === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = th;
  const dark = th === 'dark' || (th === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d0e10' : '#f4f4f1');
}

// ---------- Instalação (PWA) ----------

let installEvent: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
});

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function installBlock(): HTMLElement {
  if (isStandalone()) return h('p', { class: 'muted small' }, icon('check', 14), ' ', t('set.installed'));
  if (installEvent) {
    return h('button', { type: 'button', class: 'btn primary', onclick: async () => {
      installEvent.prompt();
      const r = await installEvent.userChoice.catch(() => null);
      if (r?.outcome === 'accepted') { toast(t('set.installedNow'), 'ok'); buzz('ok'); }
      installEvent = null;
    } }, icon('download', 16), t('set.install'));
  }
  return h('p', { class: 'muted small' }, isIOS() ? t('set.installIOS') : t('set.installOther'));
}

// ---------- Folha ----------

export function openSettings(onLang: (l: Lang) => void, onChange: () => void) {
  const langSel = h('select', { class: 'lang-select', 'aria-label': t('set.language') },
    LANGS.map((l) => h('option', { value: l.id, selected: l.id === lang() }, l.native)));
  langSel.addEventListener('change', () => {
    sheet.close();
    onLang(langSel.value as Lang);
  });

  const resetBtn = h('button', { type: 'button', class: 'btn ghost danger-text' }, icon('trash', 16), t('set.reset'));
  resetBtn.addEventListener('click', () => {
    if (!resetBtn.classList.contains('armed')) {
      resetBtn.classList.add('armed');
      resetBtn.lastChild!.textContent = t('set.resetConfirm');
      setTimeout(() => { resetBtn.classList.remove('armed'); resetBtn.lastChild!.textContent = t('set.reset'); }, 4000);
      return;
    }
    resetProgress();
    onChange();
    toast(t('set.resetDone'));
    sheet.close();
  });

  const sheet = openSheet(t('set.title'), [
    h('section', { class: 'set-sec' },
      h('label', { class: 'field' }, h('span', {}, icon('globe', 16), ' ', t('set.language')), langSel)),
    h('section', { class: 'set-sec' },
      h('h3', {}, t('set.theme')),
      segmented<Theme>([['system', t('set.themeSystem')], ['light', t('set.themeLight')], ['dark', t('set.themeDark')]], state.prefs.theme, (v) => {
        state.prefs.theme = v;
        save();
        applyTheme();
        onChange();
      }, t('set.theme'))),
    h('section', { class: 'set-sec' },
      toggle(t('set.haptics'), state.prefs.haptics, (v) => { state.prefs.haptics = v; save(); if (v) buzz('ok'); }, 'vibrate' in navigator ? t('set.hapticsDesc') : t('set.hapticsNone'))),
    h('section', { class: 'set-sec' },
      h('h3', {}, t('set.app')),
      h('p', { class: 'muted small' }, t('set.appDesc')),
      installBlock()),
    h('section', { class: 'set-sec about' },
      h('h3', {}, t('set.about')),
      h('p', { class: 'small' }, t('set.aboutText')),
      h('p', { class: 'muted small' }, t('set.disclaimer')),
      h('p', { class: 'muted small mono' }, `BatControl ${APP_VERSION}`)),
    h('section', { class: 'set-sec' }, resetBtn),
  ]);
}
