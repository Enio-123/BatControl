import { runProgram } from '../src/sim/runner';
import { DEFAULT_CONFIG } from '../src/sim/world';

const HEAD = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor
from pybricks.parameters import Port, Direction, Stop, Color
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

hub = PrimeHub()
motor_esq = Motor(Port.A, Direction.COUNTERCLOCKWISE)
motor_dir = Motor(Port.B)
robo = DriveBase(motor_esq, motor_dir, wheel_diameter=56, axle_track=140)
`;
const start = { x: 200, y: 220, h: 0 };
const t0 = Date.now();
function t(name: string, body: string) {
  const r = runProgram(HEAD + body, DEFAULT_CONFIG, start);
  const f = r.final;
  console.log(`--- ${name}: t=${(f.t / 1000).toFixed(2)}s x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} h=${f.h.toFixed(1)} err=${r.error ? r.error.type + ': ' + r.error.message + ' @' + r.error.line : '-'}`);
  for (const e of r.events) console.log(`   [${e.kind} ${e.t}] ${e.text}`);
}
t('straight 500', 'robo.straight(500)\nprint(robo.distance(), robo.angle())');
t('turn 90 right', 'robo.turn(90)\nprint(hub.imu.heading())');
t('square', 'for i in range(4):\n    robo.straight(300)\n    robo.turn(-90)\n');
t('curve', 'robo.curve(200, 90)');
t('stop on black line', 'sensor = ColorSensor(Port.E)\nrobo.drive(200, 0)\nwhile sensor.color() != Color.BLACK:\n    wait(10)\nrobo.stop()\nprint("parei em", robo.distance())');
t('strafe', 'robo.strafe(100)');
t('name err', 'robô.straight(100)');
t('syntax', 'if True\n  robo.straight(1)');
t('fstring + func', 'def andar(d=100):\n    robo.straight(d)\n    return d*2\nx = andar(150)\nprint(f"andou {x/2:.1f} mm", x)');
t('arm', 'braco = Motor(Port.C)\nbraco.run_angle(500, 180)\nprint(braco.angle())');
t('infinite', 'while True:\n    pass');
t('no dir', 'robo2 = None\nm = Motor(Port.F)');
t('line follow', `sensor = ColorSensor(Port.E)
robo.straight(0)
alvo = 50
while robo.distance() < 600:
    erro = sensor.reflection() - alvo
    robo.drive(150, erro * 1.2)
    wait(10)
robo.stop()`);
console.log("wall ms", Date.now()-t0);
function t2(name: string, start2: any, body: string) {
  const r = runProgram(HEAD + body, DEFAULT_CONFIG, start2);
  const f = r.final;
  console.log(`--- ${name}: t=${(f.t / 1000).toFixed(2)}s x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} h=${f.h.toFixed(1)} err=${r.error ? r.error.message : '-'}`);
  for (const e of r.events.slice(0, 8)) console.log(`   [${e.kind} ${e.t}] ${e.text}`);
}
t2('follow', { x: 430, y: 580, h: 0 }, `sensor = ColorSensor(Port.E)
while robo.distance() < 1300:
    erro = sensor.reflection() - 50
    robo.drive(150, erro * 1.5)
    wait(10)
robo.stop()`);
t2('stopline', { x: 120, y: 220, h: 0 }, `sensor = ColorSensor(Port.E)
robo.drive(200, 0)
while sensor.color() != Color.BLACK:
    wait(10)
robo.stop()`);
t2('yellow', { x: 120, y: 220, h: 0 }, `robo.straight(800)\nrobo.turn(-90)\nrobo.straight(640)`);
