// Textos didáticos no idioma atual, com o inglês como reserva.
import { lang, Lang } from '../../i18n';
import type { ContentText, ExText, LessonText, TopicText } from './types';
import { TEXT as pt } from './pt';
import { TEXT as en } from './en';
import { TEXT as es } from './es';
import { TEXT as fr } from './fr';
import { TEXT as de } from './de';
import { TEXT as zh } from './zh';
import { TEXT as ja } from './ja';

const ALL: Record<Lang, ContentText> = { pt, en, es, fr, de, zh, ja };
const cur = () => ALL[lang()];

export const groupName = (id: keyof ContentText['groups']) => cur().groups[id] ?? en.groups[id];
export const topicText = (id: string): TopicText => cur().topics[id] ?? en.topics[id];
export const unitText = (id: string) => cur().units[id] ?? en.units[id];
export function lessonText(id: string): LessonText {
  const l = cur().lessons[id];
  const fallback = en.lessons[id];
  if (!l) return fallback;
  return { ...l, ex: fallback.ex.map((e, i): ExText => l.ex[i] ?? e) };
}

/** Traduz os comentários (# ...) de um programa para o idioma atual. */
export function localizeCode(code: string): string {
  const map = cur().comments;
  if (!Object.keys(map).length) return code;
  return code.replace(/#\s?(.*)$/gm, (m, text: string) => {
    const tr = map[text.trim()];
    return tr ? `# ${tr}` : m;
  });
}

/** Todos os comentários usados no conteúdo, para os testes conferirem as traduções. */
export function commentsIn(code: string): string[] {
  return [...code.matchAll(/#\s?(.*)$/gm)].map((m) => m[1].trim()).filter(Boolean);
}

export { ALL as CONTENT };
