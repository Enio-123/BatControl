// Tapete de treino do BatControl. As mesmas formas servem para desenhar o tapete
// e para o sensor de cor "enxergar" o chão, então o que se vê é o que o sensor lê.

export const MAT_W = 2362; // mm (tamanho real da mesa da FLL)
export const MAT_H = 1143;

export type MatColor = 'WHITE' | 'BLACK' | 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

export interface Zone {
  id: 'red' | 'blue' | 'yellow' | 'green';
  color: MatColor;
  x: number; y: number; w: number; h: number; // canto inferior esquerdo
}

export const PRINT: Record<MatColor, string> = {
  WHITE: '#f3f3ee',
  BLACK: '#141414',
  RED: '#d23a2c',
  BLUE: '#2366c9',
  GREEN: '#2d9a52',
  YELLOW: '#efbf22',
};

/** Refletância aproximada (0 a 100) que o sensor mede em cada cor. */
export const REFLECTION: Record<MatColor, number> = {
  WHITE: 96, BLACK: 7, RED: 58, BLUE: 21, GREEN: 24, YELLOW: 83,
};

export const ZONES: Zone[] = [
  { id: 'red', color: 'RED', x: 820, y: 120, w: 200, h: 200 },
  { id: 'blue', color: 'BLUE', x: 1500, y: 120, w: 200, h: 200 },
  { id: 'yellow', color: 'YELLOW', x: 820, y: 760, w: 200, h: 200 },
  { id: 'green', color: 'GREEN', x: 2050, y: 760, w: 200, h: 200 },
];

export const BASE = { x: 0, y: 0, w: 400, h: 560 };
/** Segunda área de lançamento, no lado direito (como na mesa da FLL). */
export const BASE2 = { x: MAT_W - 400, y: 0, w: 400, h: 560 };
export const inBase = (x: number, y: number) => [BASE, BASE2].some((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);

/** Faixa preta de parada (vertical). */
export const STOP_LINE = { x: 1240, y: 60, w: 20, h: 340 };

/** Linha preta para seguidor de linha: reta + quarto de círculo + reta. */
export const TRACK = {
  width: 20,
  a: { x: 500, y: 640 },
  b: { x: 1300, y: 640 },
  arc: { cx: 1300, cy: 890, r: 250 }, // de -90° até 0°
  c: { x: 1550, y: 890 },
  d: { x: 1550, y: 1080 },
};

export function zoneById(id: Zone['id']) {
  return ZONES.find((z) => z.id === id)!;
}

function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function distSeg(px: number, py: number, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

/** Cor do tapete no ponto (x, y) em mm. Fora da mesa retorna null. */
export function colorAt(x: number, y: number): MatColor | null {
  if (x < 0 || y < 0 || x > MAT_W || y > MAT_H) return null;
  const hw = TRACK.width / 2;
  if (distSeg(x, y, TRACK.a, TRACK.b) <= hw) return 'BLACK';
  if (distSeg(x, y, TRACK.c, TRACK.d) <= hw) return 'BLACK';
  const { cx, cy, r } = TRACK.arc;
  if (x >= cx - hw && y <= cy + hw && Math.abs(Math.hypot(x - cx, y - cy) - r) <= hw) return 'BLACK';
  if (inRect(x, y, STOP_LINE)) return 'BLACK';
  for (const z of ZONES) if (inRect(x, y, z)) return z.color;
  return 'WHITE';
}

const DEFAULT_LABELS = {
  base: 'BASE', stop: 'STOP', line: 'LINE',
  zones: { red: 'red', blue: 'blue', yellow: 'yellow', green: 'green' } as Record<Zone['id'], string>,
  footer: 'BatControl  ·  training mat  ·  2362 × 1143 mm',
};

/** O que o sensor de cor enxerga: o tapete de treino desenhado aqui ou a foto de um tapete oficial. */
export interface MatSurface {
  color(x: number, y: number): MatColor | null;
  reflection(x: number, y: number): number;
}

export const TRAINING: MatSurface = {
  color: colorAt,
  reflection: (x, y) => {
    const c = colorAt(x, y);
    return c ? REFLECTION[c] : 0;
  },
};

/** Converte uma cor RGB (0 a 255) na cor que o sensor do SPIKE reportaria. */
export function classifyRGB(r: number, g: number, b: number): MatColor {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max / 255;
  const s = max === 0 ? 0 : (max - min) / max;
  if (v < 0.22) return 'BLACK';
  if (s < 0.22) return v > 0.55 ? 'WHITE' : 'BLACK';
  let h = 0;
  const d = max - min;
  if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  if (h < 20 || h >= 330) return 'RED';
  if (h < 75) return 'YELLOW';
  if (h < 170) return 'GREEN';
  if (h < 270) return 'BLUE';
  return 'RED';
}

/** Superfície a partir de uma imagem já esticada para o tamanho do tapete. */
export function surfaceFromImage(data: ImageData): MatSurface {
  const { width, height } = data;
  const px = (x: number, y: number) => {
    if (x < 0 || y < 0 || x > MAT_W || y > MAT_H) return null;
    const ix = Math.min(width - 1, Math.floor((x / MAT_W) * width));
    const iy = Math.min(height - 1, Math.floor(((MAT_H - y) / MAT_H) * height));
    const k = (iy * width + ix) * 4;
    return [data.data[k], data.data[k + 1], data.data[k + 2]];
  };
  return {
    color(x, y) {
      const p = px(x, y);
      return p ? classifyRGB(p[0], p[1], p[2]) : null;
    },
    reflection(x, y) {
      const p = px(x, y);
      if (!p) return 0;
      // Luminância relativa, ajustada para a faixa do sensor (preto ~7, branco ~96)
      const lum = (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
      return Math.round(5 + lum * 92);
    },
  };
}

/** Desenha o tapete num canvas com escala px/mm. */
export function drawMat(scale = 1, labels: { base: string; stop: string; line: string; zones: Record<Zone['id'], string>; footer: string } = DEFAULT_LABELS): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.round(MAT_W * scale);
  cv.height = Math.round(MAT_H * scale);
  const g = cv.getContext('2d')!;
  g.scale(scale, scale);
  // y para cima: inverte o eixo
  g.translate(0, MAT_H);
  g.scale(1, -1);

  g.fillStyle = PRINT.WHITE;
  g.fillRect(0, 0, MAT_W, MAT_H);

  // Grade de 100 mm, bem clara (o sensor continua lendo branco)
  g.strokeStyle = 'rgba(20,20,20,0.07)';
  g.lineWidth = 1.5;
  for (let x = 100; x < MAT_W; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, MAT_H); g.stroke(); }
  for (let y = 100; y < MAT_H; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(MAT_W, y); g.stroke(); }

  // Zonas coloridas
  for (const z of ZONES) {
    g.fillStyle = PRINT[z.color];
    g.fillRect(z.x, z.y, z.w, z.h);
  }

  // Base: área levemente sombreada com contorno tracejado (o sensor lê como branco)
  g.fillStyle = 'rgba(20,20,20,0.05)';
  g.fillRect(0, 0, BASE.w, BASE.h);
  g.strokeStyle = 'rgba(20,20,20,0.35)';
  g.lineWidth = 3;
  g.setLineDash([18, 12]);
  g.strokeRect(-2, -2, BASE.w + 2, BASE.h + 2);
  g.fillStyle = 'rgba(20,20,20,0.05)';
  g.fillRect(BASE2.x, BASE2.y, BASE2.w, BASE2.h);
  g.strokeRect(BASE2.x, -2, BASE2.w + 2, BASE2.h + 2);
  g.setLineDash([]);

  // Faixa de parada
  g.fillStyle = PRINT.BLACK;
  g.fillRect(STOP_LINE.x, STOP_LINE.y, STOP_LINE.w, STOP_LINE.h);

  // Linha do seguidor
  g.strokeStyle = PRINT.BLACK;
  g.lineWidth = TRACK.width;
  g.lineCap = 'butt';
  g.beginPath();
  g.moveTo(TRACK.a.x, TRACK.a.y);
  g.lineTo(TRACK.b.x, TRACK.b.y);
  g.arc(TRACK.arc.cx, TRACK.arc.cy, TRACK.arc.r, -Math.PI / 2, 0);
  g.lineTo(TRACK.d.x, TRACK.d.y);
  g.stroke();

  // Régua nas bordas (a cada 100 mm, número a cada 200 mm)
  g.fillStyle = 'rgba(20,20,20,0.55)';
  for (let x = 0; x <= MAT_W; x += 100) g.fillRect(x - 1, 0, 2, x % 500 === 0 ? 22 : 12);
  for (let y = 0; y <= MAT_H; y += 100) g.fillRect(MAT_W - (y % 500 === 0 ? 22 : 12), y - 1, 22, 2);

  // Textos (desfaz o espelhamento)
  const text = (s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') => {
    g.save();
    g.translate(x, y);
    g.scale(1, -1);
    g.fillStyle = color;
    g.font = `600 ${size}px "IBM Plex Sans", system-ui, sans-serif`;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillText(s, 0, 0);
    g.restore();
  };
  for (let x = 200; x < MAT_W; x += 200) text(String(x), x, 36, 18, 'rgba(20,20,20,0.5)');
  for (let y = 200; y < MAT_H; y += 200) text(String(y), MAT_W - 34, y, 18, 'rgba(20,20,20,0.5)', 'right');
  text(`${labels.base} 1`, 200, 500, 30, 'rgba(20,20,20,0.45)');
  text(`${labels.base} 2`, BASE2.x + 200, 500, 30, 'rgba(20,20,20,0.45)');
  for (const z of ZONES) text(labels.zones[z.id].toUpperCase(), z.x + z.w / 2, z.y + z.h / 2, 22, z.color === 'YELLOW' ? 'rgba(20,20,20,0.6)' : 'rgba(255,255,255,0.85)');
  text(labels.stop.toUpperCase(), STOP_LINE.x + 10, STOP_LINE.y + STOP_LINE.h + 24, 18, 'rgba(20,20,20,0.5)');
  text(labels.line.toUpperCase(), TRACK.a.x + 60, TRACK.a.y + 34, 18, 'rgba(20,20,20,0.5)');
  text(labels.footer, MAT_W / 2, MAT_H - 30, 20, 'rgba(20,20,20,0.35)');
  return cv;
}
