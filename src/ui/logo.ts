// Logo do BatControl: o morcego da BatLego entre os sinais de código < >.
import emblemUrl from '../assets/batlego-emblem.png';

const WINGS = '<path class="lw" d="M112 168 L136 192 L72 256 L136 320 L112 344 L24 256 Z"/><path class="rw" d="M400 168 L376 192 L440 256 L376 320 L400 344 L488 256 Z"/>';
const emblem = () => `<image class="bat" href="${emblemUrl}" x="142" y="179" width="228" height="151"/>`;

/** Só o desenho (sem fundo). */
export function markSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 164 472 184" aria-hidden="true"><g fill="#f5c518">${WINGS}</g>${emblem()}</svg>`;
}

/** Ícone completo: quadrado escuro arredondado com o desenho. */
export function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="#141517"/><g fill="#f5c518">${WINGS}</g>${emblem()}</svg>`;
}

export function logoEl(cls: string, svg: string) {
  const span = document.createElement('span');
  span.className = cls;
  span.innerHTML = svg;
  return span;
}
