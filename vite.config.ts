import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Dois builds a partir do mesmo código:
// - padrão: um único HTML com tudo embutido (usado no Artifact);
// - `--mode pages`: site para o GitHub Pages, com manifesto e service worker para instalar e usar offline.

const MANIFEST = {
  name: 'BatControl',
  short_name: 'BatControl',
  description: 'Learn Pybricks for FIRST LEGO League: 3D simulator, lessons and BIOGLOW score calculator.',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0b0c0e',
  theme_color: '#0b0c0e',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

const PUBLIC_FILES = ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'];

/** Service worker: guarda todos os arquivos do build na instalação e serve do cache sem internet. */
const swSource = (version: string, files: string[]) => `// Gerado no build. Versão ${version}.
const CACHE = 'batcontrol-${version}';
const FILES = ${JSON.stringify(['./', ...files])};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('batcontrol-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Páginas: tenta a rede primeiro para pegar versões novas; sem internet, usa a cópia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./', { ignoreVary: true })),
    );
    return;
  }
  // Arquivos do build têm hash no nome, então o cache nunca fica velho.
  // ignoreVary: scripts de módulo pedem com cabeçalho Origin, e o servidor pode responder com Vary: Origin.
  e.respondWith(caches.match(req, { ignoreVary: true }).then((hit) => hit || fetch(req)));
});
`;

function pagesPlugin(): Plugin {
  return {
    name: 'batcontrol-pages',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'link', attrs: { rel: 'manifest', href: './manifest.webmanifest' }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'icon', type: 'image/png', href: './icons/favicon-64.png' }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: './icons/apple-touch-icon.png' }, injectTo: 'head' },
    ],
    generateBundle(_, bundle) {
      // Pula variantes .woff (o navegador usa as .woff2) para o cache inicial ficar menor.
      const files = Object.keys(bundle).filter((f) => f !== 'index.html' && !f.endsWith('.woff')).concat(PUBLIC_FILES, 'manifest.webmanifest');
      const version = Date.now().toString(36);
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify(MANIFEST, null, 2) });
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: swSource(version, files) });
    },
  };
}

/** No HTML único, o ícone da aba vai embutido como data URI. */
function inlineFavicon(): Plugin {
  return {
    name: 'batcontrol-favicon',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'link',
        attrs: { rel: 'icon', type: 'image/png', href: `data:image/png;base64,${readFileSync('public/icons/favicon-64.png').toString('base64')}` },
        injectTo: 'head',
      },
    ],
  };
}

export default defineConfig(({ mode }) =>
  mode === 'pages'
    ? {
        base: './',
        plugins: [pagesPlugin()],
        build: { outDir: 'dist-pages', chunkSizeWarningLimit: 4000 },
      }
    : {
        base: './',
        plugins: [inlineFavicon(), viteSingleFile()],
        build: { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 4000, copyPublicDir: false },
      },
);
