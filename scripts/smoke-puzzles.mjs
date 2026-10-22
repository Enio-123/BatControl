// Teste de fumaça dos problemas: abre a aba Trilha > Problemas, resolve/erra alguns e tira capturas.
import { chromium } from 'playwright';
const url = 'file://' + process.cwd() + '/dist/index.html';
const out = '/tmp/claude-0/shots/';
const lang = process.argv[2] || 'pt';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
await page.waitForTimeout(2800);
await page.locator('.lang-opt').nth({ pt: 0, en: 1, es: 2, fr: 3, de: 4, zh: 5, ja: 6 }[lang]).click();
await page.click('.lang-card .btn.primary');
await page.waitForTimeout(400);
await page.click('.bottom-tabs [data-tab=path]');
await page.waitForTimeout(300);
await page.screenshot({ path: out + `pz-${lang}-0path.png`, fullPage: true });
await page.locator('.path-switch .seg button').nth(1).click();
await page.waitForTimeout(300);
await page.screenshot({ path: out + `pz-${lang}-1lobby.png`, fullPage: true });
const log = [];
await page.click('.pz-lobby .btn.primary');
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(500);
  const title = await page.locator('.player-body h2').first().innerText();
  const isChoice = await page.locator('.player-body .option').count();
  if (isChoice) {
    await page.locator('.player-body .option').first().click();
    await page.locator('.player-foot .btn.primary').click();
  } else {
    // pede dica (conta como erro) e roda o código inicial
    await page.locator('.player-foot .btn.ghost').first().click();
    await page.locator('.player-foot .btn.primary').click();
    await page.waitForTimeout(300);
    if (!(await page.locator('.player-foot.ok, .player-foot.bad').count())) await page.locator('.player-foot .btn.primary').click().catch(() => {});
  }
  await page.waitForFunction(() => document.querySelector('.player-foot.ok, .player-foot.bad'), null, { timeout: 15000 });
  await page.waitForTimeout(isChoice ? 1500 : 300);
  await page.screenshot({ path: out + `pz-${lang}-p${i}.png`, fullPage: true });
  const fb = await page.locator('.player-foot .feedback').innerText();
  const chip = await page.locator('.pz-chip').innerText();
  log.push(`${i} ${isChoice ? 'choice' : 'code'} | ${title.replace(/\n/g, ' ')} | ${fb.replace(/\n/g, ' ')} | chip ${chip}`);
  const ok = await page.locator('.player-foot.ok').count();
  if (isChoice || ok) await page.locator('.player-foot .btn.primary').click();
  else await page.locator('.player-foot .btn.ghost').last().click();
}
await page.locator('.player-top .icon-btn').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: out + `pz-${lang}-9lobby.png`, fullPage: true });
await page.click('.bottom-tabs [data-tab=home]');
await page.waitForTimeout(300);
await page.screenshot({ path: out + `pz-${lang}-10home.png`, fullPage: true });
console.log(log.join('\n'));
console.log('errors', errors);
await browser.close();
