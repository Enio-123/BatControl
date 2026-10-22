// Gera os ícones PNG do app a partir da logo (src/ui/logo.ts e src/assets/batlego-emblem.png). Uso: node scripts/icons.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const src = readFileSync('src/ui/logo.ts', 'utf8');
const wings = src.match(/const WINGS = '([^']*)'/)[1];
const img = src.match(/<image class="bat" href="\$\{emblemUrl\}"([^/]*)\/>/)[1];
const emblem = 'data:image/png;base64,' + readFileSync('src/assets/batlego-emblem.png').toString('base64');
const art = `<g fill="#f5c518">${wings}</g><image href="${emblem}"${img}/>`;
// rounded: ícone com cantos; sem cantos para iOS e maskable, que arredondam sozinhos
const svg = (size, { rounded, scale = 1 }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512"><rect width="512" height="512" ${rounded ? 'rx="112" ' : ''}fill="#141517"/><g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${art}</g></svg>`;
const jobs = [
  ['icon-192.png', 192, { rounded: true }],
  ['icon-512.png', 512, { rounded: true }],
  ['favicon-64.png', 64, { rounded: true }],
  ['apple-touch-icon.png', 180, { rounded: false, scale: 0.94 }],
  ['maskable-512.png', 512, { rounded: false, scale: 0.78 }],
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [file, size, opt] of jobs) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg(size, opt)}</body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: `public/icons/${file}`, omitBackground: true });
  await p.close();
}
await b.close();
console.log('ok');
