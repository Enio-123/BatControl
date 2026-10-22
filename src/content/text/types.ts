// Formato dos textos didáticos de cada idioma.
import type { GroupId } from '../reference';

export interface TopicText {
  title: string;
  summary: string;
  /** Unidade e descrição de cada parâmetro, na ordem de RefTopic.params. */
  params?: [string, string][];
  returns?: string;
  tips?: string[];
  mistakes?: string[];
}

export interface ExText {
  prompt: string;
  /** Alternativas da múltipla escolha: a primeira é sempre a correta (a ordem é sorteada na tela). */
  options?: string[];
  explain?: string;
  hint?: string;
}

export interface LessonText { title: string; intro: string; ex: ExText[] }

export interface ContentText {
  groups: Record<GroupId, string>;
  topics: Record<string, TopicText>;
  units: Record<string, { title: string; desc: string }>;
  lessons: Record<string, LessonText>;
  /** Tradução dos comentários dos programas (o código-fonte usa comentários em inglês). */
  comments: Record<string, string>;
}
