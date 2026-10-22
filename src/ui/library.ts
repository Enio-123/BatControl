// Biblioteca de programas: vários programas salvos, renomear, duplicar, apagar e compartilhar
// por código, link ou QR code. O link carrega o programa compactado no próprio endereço.
import qrcode from 'qrcode-generator';
import { t } from '../i18n';
import { program } from '../content/setup';
import { localizeCode } from '../content/text';
import { SavedProgram, save, state, uid } from '../store';
import { buzz, copyText, download, h, icon, openSheet, toast } from './dom';

/** Endereço público do app (usado nos links). No GitHub Pages é o próprio endereço da página. */
export const PUBLIC_URL = (import.meta.env?.VITE_PUBLIC_URL as string | undefined) || '';

export function ensureLibrary(defaultCode: () => string) {
  if (!state.programs.length) {
    state.programs.push({ id: uid(), name: t('lib.firstName'), code: state.code ?? defaultCode(), updated: Date.now() });
  }
  if (!state.programs.some((p) => p.id === state.currentProgram)) state.currentProgram = state.programs[0].id;
  save();
}

export const current = () => state.programs.find((p) => p.id === state.currentProgram)!;
export const byId = (id: string) => state.programs.find((p) => p.id === id);

export function updateCurrent(code: string) {
  const p = current();
  if (!p || p.code === code) return;
  p.code = code;
  p.updated = Date.now();
  state.code = code;
  save();
}

export function addProgram(name: string, code: string): SavedProgram {
  const p = { id: uid(), name: uniqueName(name), code, updated: Date.now() };
  state.programs.unshift(p);
  state.currentProgram = p.id;
  save();
  return p;
}

function uniqueName(base: string) {
  const names = new Set(state.programs.map((p) => p.name));
  if (!names.has(base)) return base;
  for (let i = 2; ; i++) if (!names.has(`${base} (${i})`)) return `${base} (${i})`;
}

// ---------- Compartilhar por link ----------

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** Gera o trecho do link: "z" + deflate (se o navegador tiver) ou "r" + texto puro. */
export async function encodeShare(name: string, code: string): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ n: name, c: code }));
  if (typeof CompressionStream !== 'undefined') {
    try { return 'z' + b64url(await pipe(json, new CompressionStream('deflate-raw'))); } catch { /* sem compressão */ }
  }
  return 'r' + b64url(json);
}

export async function decodeShare(s: string): Promise<{ name: string; code: string } | null> {
  try {
    let bytes = fromB64url(s.slice(1));
    if (s[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    else if (s[0] !== 'r') return null;
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof o.c !== 'string' || o.c.length > 100_000) return null;
    return { name: String(o.n ?? t('lib.shared')).slice(0, 80), code: o.c };
  } catch {
    return null;
  }
}

function baseUrl() {
  if (PUBLIC_URL) return PUBLIC_URL.replace(/#.*$/, '');
  return location.href.replace(/#.*$/, '');
}

export async function shareLink(p: SavedProgram) {
  return `${baseUrl()}#p=${await encodeShare(p.name, p.code)}`;
}

const safeFile = (name: string) => (name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '') || 'program') + '.py';

export async function openShare(p: SavedProgram) {
  const link = await shareLink(p);
  let qr: HTMLElement;
  try {
    const q = qrcode(0, 'L');
    q.addData(link);
    q.make();
    qr = h('div', { class: 'qr', html: q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }) });
    qr.querySelector('svg')?.setAttribute('aria-label', t('share.qrLabel'));
  } catch {
    qr = h('p', { class: 'muted small' }, t('share.tooLong'));
  }
  const canNative = typeof navigator.share === 'function';
  openSheet(t('share.title', { name: p.name }), [
    h('p', { class: 'muted small' }, t('share.desc')),
    qr,
    h('div', { class: 'share-actions' },
      h('button', { type: 'button', class: 'btn', onclick: async () => { toast((await copyText(link)) ? t('share.linkCopied') : t('share.copyFail'), 'ok'); buzz('ok'); } }, icon('link', 16), t('share.copyLink')),
      h('button', { type: 'button', class: 'btn', onclick: async () => { toast((await copyText(p.code)) ? t('share.codeCopied') : t('share.copyFail'), 'ok'); buzz('ok'); } }, icon('copy', 16), t('share.copyCode')),
      h('button', { type: 'button', class: 'btn', onclick: () => download(safeFile(p.name), p.code, 'text/x-python') }, icon('download', 16), t('share.download')),
      canNative ? h('button', { type: 'button', class: 'btn', onclick: () => navigator.share({ title: `BatControl: ${p.name}`, url: link }).catch(() => {}) }, icon('share', 16), t('share.native')) : null),
    h('p', { class: 'muted small' }, t('share.pybricksTip')),
  ]);
}

// ---------- Folha da biblioteca ----------

export function openLibrary(onOpen: (p: SavedProgram) => void) {
  const listEl = h('ul', { class: 'lib-list' });
  const sheet = openSheet(t('lib.title'), [
    h('div', { class: 'lib-top' },
      h('button', { type: 'button', class: 'btn primary', onclick: () => {
        const p = addProgram(t('lib.newName'), localizeCode(program('# Write your commands here\n')));
        sheet.close();
        onOpen(p);
      } }, icon('plus', 16), t('lib.new')),
      h('label', { class: 'btn ghost file-btn' }, icon('upload', 16), t('lib.importFile'),
        h('input', { type: 'file', accept: '.py,text/x-python,text/plain', onchange: async (e: Event) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          if (file.size > 200_000) { toast(t('lib.fileTooBig'), 'err'); return; }
          const p = addProgram(file.name.replace(/\.py$/i, ''), await file.text());
          sheet.close();
          onOpen(p);
        } }))),
    listEl,
  ]);
  const render = () => {
    const sorted = [...state.programs].sort((a, b) => b.updated - a.updated);
    listEl.replaceChildren(...sorted.map((p) => {
      const isCur = p.id === state.currentProgram;
      const lines = p.code.split('\n').length;
      return h('li', { class: isCur ? 'cur' : '' },
        h('button', { type: 'button', class: 'lib-open', onclick: () => { state.currentProgram = p.id; save(); sheet.close(); onOpen(p); } },
          h('strong', {}, p.name),
          h('span', { class: 'muted small' }, `${t('lib.lines', { n: lines })} · ${new Date(p.updated).toLocaleDateString()}`, isCur ? ` · ${t('lib.open')}` : '')),
        h('div', { class: 'lib-actions' },
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('lib.rename'), title: t('lib.rename'), onclick: (e: MouseEvent) => {
            const li = (e.currentTarget as HTMLElement).closest('li')!;
            const input = h('input', { type: 'text', value: p.name, maxlength: '80', 'aria-label': t('lib.renamePrompt'), class: 'lib-rename' });
            const done = () => { const v = input.value.trim(); if (v) { p.name = v; save(); } render(); };
            input.addEventListener('keydown', (k) => { if (k.key === 'Enter') done(); if (k.key === 'Escape') render(); });
            input.addEventListener('blur', done);
            li.querySelector('.lib-open')!.replaceWith(input);
            input.focus();
            input.select();
          } }, icon('edit', 16)),
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('lib.duplicate'), title: t('lib.duplicate'), onclick: () => {
            state.programs.unshift({ id: uid(), name: uniqueName(p.name), code: p.code, updated: Date.now() });
            save(); render();
          } }, icon('copy', 16)),
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('share.short'), title: t('share.short'), onclick: () => openShare(p) }, icon('share', 16)),
          h('button', { type: 'button', class: 'icon-btn danger', 'aria-label': t('lib.delete'), title: t('lib.delete'), disabled: state.programs.length === 1, onclick: (e: MouseEvent) => {
            const b = e.currentTarget as HTMLButtonElement;
            if (!b.classList.contains('armed')) {
              b.classList.add('armed');
              b.setAttribute('aria-label', t('lib.deleteConfirm', { name: p.name }));
              toast(t('lib.deleteConfirm', { name: p.name }));
              setTimeout(() => b.classList.remove('armed'), 3000);
              return;
            }
            state.programs = state.programs.filter((x) => x.id !== p.id);
            if (state.currentProgram === p.id) { state.currentProgram = state.programs[0].id; onOpen(state.programs[0]); }
            save(); render();
          } }, icon('trash', 16))));
    }));
  };
  render();
}
