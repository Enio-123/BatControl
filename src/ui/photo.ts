// Foto do tapete oficial: a equipe escolhe uma imagem, ela é esticada para o tamanho do tapete
// e passa a ser o que o sensor de cor enxerga na aba Simular.
import { MAT_H, MAT_W, MatSurface, surfaceFromImage } from '../sim/mat';
import { loadMatPhoto, saveMatPhoto } from '../store';

/** Resolução guardada: metade de 1 px/mm (2 mm por pixel), suficiente para linhas de 10 mm. */
const W = Math.round(MAT_W / 2);
const H = Math.round(MAT_H / 2);

export interface MatPhoto { canvas: HTMLCanvasElement; surface: MatSurface }

function fromImage(img: CanvasImageSource): MatPhoto {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  return { canvas, surface: surfaceFromImage(g.getImageData(0, 0, W, H)) };
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}

let cached: MatPhoto | null = null;

/** Foto salva neste navegador (ou null). */
export async function savedPhoto(): Promise<MatPhoto | null> {
  if (cached) return cached;
  const url = loadMatPhoto();
  if (!url) return null;
  try {
    cached = fromImage(await loadImg(url));
    return cached;
  } catch {
    return null;
  }
}

/** Lê o arquivo escolhido, guarda uma cópia em JPEG e devolve a superfície. */
export async function importPhoto(file: File): Promise<{ photo: MatPhoto; stored: boolean }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImg(url);
    const photo = fromImage(img);
    cached = photo;
    const stored = saveMatPhoto(photo.canvas.toDataURL('image/jpeg', 0.85));
    return { photo, stored };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function removePhoto() {
  cached = null;
  saveMatPhoto(null);
}
