// Idiomas do BatControl. Textos de interface em dicionários planos; conteúdo didático em src/i18n/content.
import { UI as pt } from './ui/pt';
import { UI as en } from './ui/en';
import { UI as es } from './ui/es';
import { UI as fr } from './ui/fr';
import { UI as de } from './ui/de';
import { UI as zh } from './ui/zh';
import { UI as ja } from './ui/ja';

export type Lang = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

export const LANGS: { id: Lang; native: string; html: string }[] = [
  { id: 'pt', native: 'Português', html: 'pt-BR' },
  { id: 'en', native: 'English', html: 'en' },
  { id: 'es', native: 'Español', html: 'es' },
  { id: 'fr', native: 'Français', html: 'fr' },
  { id: 'de', native: 'Deutsch', html: 'de' },
  { id: 'zh', native: '中文', html: 'zh-CN' },
  { id: 'ja', native: '日本語', html: 'ja' },
];

export type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { pt, en, es, fr, de, zh, ja };

let current: Lang = 'pt';

export function setLang(l: Lang) {
  current = l;
  document.documentElement.lang = LANGS.find((x) => x.id === l)!.html;
}
export const lang = () => current;

/** Idioma sugerido pelo navegador (usado só para pré-selecionar na primeira entrada). */
export function browserLang(): Lang {
  const nav = (navigator.languages ?? [navigator.language]).map((x) => x.toLowerCase());
  for (const n of nav) {
    const id = n.slice(0, 2) as Lang;
    if (id in DICTS) return id;
  }
  return 'en';
}

/** Texto traduzido. Parâmetros entram no lugar de {nome}. Cai para inglês e depois português se faltar. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const raw = DICTS[current][key] ?? DICTS.en[key] ?? DICTS.pt[key];
  if (raw === undefined) {
    if (import.meta.env?.DEV) console.warn('i18n: falta a chave', key);
    return key;
  }
  return raw.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/** Formata números no padrão do idioma. */
export const num = (n: number, digits = 0) => n.toLocaleString(LANGS.find((x) => x.id === current)!.html, { maximumFractionDigits: digits, minimumFractionDigits: digits });
