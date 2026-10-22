// Testa no Chromium: (1) o build do GitHub Pages instala o service worker e abre sem internet;
// (2) o mpy-cross compila um programa no navegador (servidor de desenvolvimento do Vite).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const serve = (args, port) => {
  // Grupo de processos próprio, para encerrar o npx e o vite juntos no final.
  const p = spawn('npx', ['vite', ...args, '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true });
  return { kill: () => { try { process.kill(-p.pid); } catch {} } };
};
const waitUp = async (url) => { for (let i = 0; i < 60; i++) { try { await fetch(url); return; } catch { await new Promise((r) => setTimeout(r, 500)); } } throw new Error('server did not start: ' + url); };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let bad = 0;
const preview = serve(['preview', '--outDir', 'dist-pages'], 4317);
const dev = serve([], 4318);
try {
  await waitUp('http://localhost:4317/');
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('failed ' + r.url()));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  await page.goto('http://localhost:4317/');
  const sw = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    for (let i = 0; i < 50 && r.active?.state !== 'activated'; i++) await new Promise((ok) => setTimeout(ok, 100));
    return r.active?.state;
  });
  await page.waitForTimeout(1500);
  const cached = await page.evaluate(async () => { const k = await caches.keys(); const c = await caches.open(k[0]); return (await c.keys()).length; });
  console.log('service worker:', sw, '| cached files:', cached);
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  console.log('page controlled by service worker:', controlled);
  await ctx.setOffline(true);
  await page.reload();
  const offlineOk = await page.waitForSelector('.lang-card', { timeout: 10000 }).then(() => true, () => false);
  if (!offlineOk) console.log('offline body:', (await page.evaluate(() => document.body.innerHTML)).slice(0, 400));
  console.log('offline reload renders app:', offlineOk);
  const manifest = await page.evaluate(() => document.querySelector('link[rel=manifest]')?.getAttribute('href'));
  console.log('manifest link:', manifest, '| page errors:', errors.length ? errors : 'none');
  if (sw !== 'activated' || !offlineOk || !manifest || errors.length) bad++;
  await ctx.close();

  await waitUp('http://localhost:4318/');
  const p2 = await browser.newPage();
  await p2.goto('http://localhost:4318/');
  const res = await p2.evaluate(async () => {
    const hub = await import('/src/ble/hub.ts');
    const { program } = await import('/src/content/setup.ts');
    const mpy = await hub.compile(program('robo.straight(300)\nrobo.turn(90)'));
    const multi = hub.multiMpy(mpy);
    let err = '';
    try { await hub.compile('robo.straight(300'); } catch (e) { err = String(e.message || e); }
    return { mpyLen: mpy.length, head: Array.from(mpy.slice(0, 4)), multiLen: multi.length, err: err.slice(0, 120) };
  });
  // Cabeçalho .mpy: 'M' (77), versão 6, flags, bits do small int.
  console.log('mpy-cross:', JSON.stringify(res));
  if (res.head[0] !== 77 || res.head[1] !== 6 || !res.err) bad++;
} finally {
  preview.kill(); dev.kill();
  await browser.close();
}
console.log('bad', bad);
process.exitCode = bad ? 1 : 0;
