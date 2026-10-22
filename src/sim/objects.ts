// Conjuntos prontos de objetos de missão para a aba Simular.
import type { ObjSpec } from './world';

export const OBJECT_PRESETS: Record<string, ObjSpec[]> = {
  none: [],
  /** Três caixas para empurrar até as zonas. */
  push: [
    { id: 'a', x: 1100, y: 220, size: 60, color: '#e0662a' },
    { id: 'b', x: 700, y: 860, size: 60, color: '#2a8de0' },
    { id: 'c', x: 1820, y: 520, size: 60, color: '#3bb273' },
  ],
  /** Duas caixas alinhadas com as garras esquerda e direita do robô na largada. */
  claw: [
    { id: 'l', x: 800, y: 266, size: 60, color: '#2a8de0' },
    { id: 'r', x: 800, y: 174, size: 60, color: '#e0662a' },
  ],
};

export const presetObjects = (id: string) => (OBJECT_PRESETS[id] ?? []).map((o) => ({ ...o }));
