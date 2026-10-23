// Procura nomes antigos (robot., robot =, left_arm, right_arm) em todas as telas do app, com dados antigos salvos.
import { chromium } from 'playwright';
const url = 'file://' + process.cwd() + '/dist/index.html';
const BAD = /\brobot\.(straight|turn|drive|stop|curve|settings|distance|use_gyro|reset|angle)\b|\brobot\s*=|\bleft_arm\b|\bright_arm\b|Motor D\b/;
const oldCode = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nhub = PrimeHub()\nleft_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)\nright_motor = Motor(Port.B)\nrobot = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=140)\nleft_arm = Motor(Port.C)\nright_arm = Motor(Port.D)\n\n# move the robot.\nrobot.straight(300)\nleft_arm.run_angle(300, 90)\n';
const lang = process.argv[2] || 'pt';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(([code, lang]) => {
  if (localStorage.getItem('seeded')) return;
  localStorage.setItem('seeded', '1');
  localStorage.setItem('batcontrol:v1', JSON.stringify({ prefs: { lang }, code, programs: [{ id: 'p1', name: 'Velho', code, updated: 1 }], currentProgram: 'p1' }));
}, [oldCode, lang]);
await page.goto(url);
await page.waitForTimeout(2600);
const found = [];
const scan = async (where) => {
  const txt = await page.evaluate(() => document.body.innerText);
  txt.split('\n').forEach((l) => { if (BAD.test(l)) found.push(`${where}: ${l.trim().slice(0, 120)}`); });
};
const tab = async (id) => { await page.click(`.top-tabs [data-tab=${id}]`); await page.waitForTimeout(400); };
await tab('home'); await scan('home');
await tab('sim'); await page.waitForTimeout(500); await scan('sim/code');
for (let i = 1; i < 4; i++) { await page.locator('.panel-tabs button').nth(i).click(); await page.waitForTimeout(250); await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true))); await scan(`sim/panel${i}`); }
await page.locator('.panel-tabs button').nth(0).click();
await page.locator('.code-head .seg button').nth(1).click(); await page.waitForTimeout(300); await scan('sim/blocks');
await page.locator('.code-head .seg button').nth(0).click(); await page.waitForTimeout(300);
await tab('learn');
const topics = await page.locator('.learn-nav button').count();
for (let i = 0; i < topics; i++) { await page.locator('.learn-nav button').nth(i).click(); await page.waitForTimeout(120); await scan(`learn/${i}`); }
await tab('path'); await scan('path');
await tab('score'); await scan('score');
const stored = await page.evaluate(() => localStorage.getItem('batcontrol:v1'));
console.log('stored old names left:', BAD.test(JSON.parse(stored).code) || BAD.test(JSON.parse(stored).programs[0].code));
console.log('topics', topics, 'found', found.length); found.slice(0, 30).forEach((f) => console.log(' ', f));
console.log('errors', errors);
await b.close();
