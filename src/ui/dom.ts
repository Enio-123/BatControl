// Ajudantes de interface: criação de elementos, ícones, folhas (diálogos), avisos e vibração.
import { t } from '../i18n';
import { state } from '../store';

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export const fmtTime = (ms: number) => {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
};

/** Relógio de partida (m:ss), arredondando para cima como um cronômetro regressivo. */
export const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const PATHS = {
  play: '<path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" stroke="none"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z" fill="currentColor" stroke="none"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.6 3-5.6 3.6-9.3 2.3 1.4 3.4 3.5 3.4 5.3 1-.7 1.6-1.9 1.7-3.1 2 1.6 3.3 4.1 3.3 6.9 0 3.6-2.5 6.4-5.5 6.4z" fill="currentColor" stroke="none"/>',
  robot: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 4v4M8.5 13h.01M15.5 13h.01M9 16.5h6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9.5 17h5"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
  blocks: '<rect x="3" y="4" width="11" height="5" rx="1.2"/><rect x="7" y="10.5" width="13" height="5" rx="1.2"/><rect x="3" y="17" width="9" height="4" rx="1.2"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  ghost: '<path d="M5 20V10a7 7 0 0 1 14 0v10l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z"/><path d="M9.5 10.5h.01M14.5 10.5h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  puzzle: '<path d="M10 3h4v2.5a1.5 1.5 0 0 0 3 0V3h3v6h-2.5a1.5 1.5 0 0 0 0 3H20v6h-6v-2.5a1.5 1.5 0 0 0-3 0V18H4v-6h2.5a1.5 1.5 0 0 0 0-3H4V3h6z"/>',
  review: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5M12 8v4l3 2"/>',
  dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
};
export type IconName = keyof typeof PATHS;

/** Ícones de traço simples (SVG inline). */
export function icon(name: IconName, size = 18) {
  const span = document.createElement('span');
  span.className = 'ico';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
  return span;
}

/** Botão só com ícone, com nome acessível. */
export function iconBtn(name: IconName, label: string, onclick: (e: MouseEvent) => void, cls = 'icon-btn') {
  return h('button', { type: 'button', class: cls, 'aria-label': label, title: label, onclick }, icon(name));
}

// ---------- Vibração ----------

const PATTERNS = { tap: 8, ok: [14, 40, 22], bad: [40, 50, 40], end: [60, 60, 120], warn: [30, 40, 30, 40, 30] } as const;

export function buzz(kind: keyof typeof PATTERNS) {
  if (!state.prefs.haptics) return;
  try { navigator.vibrate?.(PATTERNS[kind] as number | number[]); } catch { /* sem vibração */ }
}

// ---------- Folha (diálogo) ----------

export interface Sheet { el: HTMLDialogElement; body: HTMLElement; close: () => void }

/** Folha modal: sobe de baixo no celular e aparece centralizada no computador. */
export function openSheet(title: string, content: (Node | null)[] | Node, opts: { wide?: boolean; onClose?: () => void } = {}): Sheet {
  const body = h('div', { class: 'sheet-body' });
  const close = () => {
    dlg.classList.add('closing');
    setTimeout(() => { dlg.close(); dlg.remove(); opts.onClose?.(); }, 160);
  };
  const dlg = h('dialog', { class: `sheet${opts.wide ? ' wide' : ''}`, 'aria-label': title },
    h('div', { class: 'sheet-head' },
      h('h2', {}, title),
      iconBtn('close', t('ui.close'), close)),
    body);
  body.append(...(Array.isArray(content) ? content.filter((x): x is Node => !!x) : [content]));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  document.body.append(dlg);
  dlg.showModal();
  return { el: dlg, body, close };
}

// ---------- Aviso rápido ----------

let toastTimer = 0;
export function toast(msg: string, kind: '' | 'ok' | 'err' = '') {
  let el = document.querySelector<HTMLElement>('.toast');
  if (!el) {
    el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = msg;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove('show'), 2600);
}

/** Interruptor acessível (role="switch"). */
export function toggle(label: string, value: boolean, onchange: (v: boolean) => void, desc?: string) {
  const btn = h('button', { type: 'button', role: 'switch', class: 'switch', 'aria-checked': String(value) }, h('span', { class: 'knob' }));
  btn.addEventListener('click', () => {
    const v = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(v));
    buzz('tap');
    onchange(v);
  });
  return h('label', { class: 'toggle-row' }, h('span', { class: 'toggle-text' }, h('strong', {}, label), desc ? h('span', { class: 'muted small' }, desc) : null), btn);
}

/** Controle segmentado. */
export function segmented<T extends string>(options: [T, string][], value: T, onchange: (v: T) => void, label?: string) {
  const wrap = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label });
  const btns = options.map(([v, text]) => {
    const b = h('button', { type: 'button', role: 'radio', class: v === value ? 'on' : '', 'aria-checked': String(v === value) }, text);
    b.addEventListener('click', () => {
      btns.forEach((x, i) => { const on = options[i][0] === v; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
      buzz('tap');
      onchange(v);
    });
    return b;
  });
  wrap.append(...btns);
  return wrap;
}

/** Copia texto para a área de transferência (com reserva para navegadores antigos). */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0' }, text);
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Baixa um arquivo de texto. */
export function download(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Troca os filhos de um elemento, ignorando os vazios (null, false). */
export function fill(el: Element, ...children: (Child | Child[])[]) {
  el.replaceChildren(...children.flat().filter((c): c is Node | string => c !== null && c !== undefined && c !== false));
  return el;
}
