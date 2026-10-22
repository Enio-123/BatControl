// Trilha de desafios no estilo Duolingo: unidades → lições → exercícios.
// Aqui fica a parte que não depende do idioma; enunciados e explicações vêm de src/content/text.
import { t } from '../i18n';
import { BASE2, inBase, zoneById, Zone } from '../sim/mat';
import { RunResult } from '../sim/runner';
import { AttachmentKind, Frame, ObjSpec, Pose, SENSOR_POS } from '../sim/world';
import { IMPORTS, program, START, START2 } from './setup';
import type { Target } from '../three/viewer';

export type Exercise =
  | { kind: 'choice'; code?: string; answer: 0 }
  | { kind: 'fill'; code: string; answers: string[][] }
  | { kind: 'order'; lines: string[] }
  | {
      kind: 'code';
      starter: string;
      start?: Pose;
      targets?: Target[];
      objects?: ObjSpec[];
      attachments?: { left: AttachmentKind; right: AttachmentKind };
      /** Física realista com semente fixa (o resultado é sempre o mesmo). */
      realistic?: number;
      check: (r: RunResult, code: string) => string | null;
      solution: string;
    };

export interface Lesson { id: string; exercises: Exercise[] }
export interface Unit { id: string; lessons: Lesson[] }

// ---------- Ajudantes de correção ----------

const inZone = (f: { x: number; y: number }, id: Zone['id'], margin = 0) => {
  const z = zoneById(id);
  return f.x >= z.x - margin && f.x <= z.x + z.w + margin && f.y >= z.y - margin && f.y <= z.y + z.h + margin;
};
const visited = (r: RunResult, id: Zone['id']) => r.frames.some((f) => inZone(f, id));
const zoneTarget = (id: Zone['id']): Target => ({ kind: 'rect', ...zoneById(id) });
const BASE_TARGET: Target = { kind: 'rect', x: 0, y: 0, w: 400, h: 560 };
const angDiff = (a: number, b: number) => {
  let d = (((a - b) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return Math.abs(d);
};
const where = (f: Frame) => t('chk.where', { x: Math.round(f.x), y: Math.round(f.y) });
const zoneName = (id: Zone['id']) => t('zone.' + id);
const needZone = (r: RunResult, id: Zone['id']) => (inZone(r.final, id) ? null : `${t('chk.needZone', { zone: zoneName(id) })} ${where(r.final)}`);
const uses = (code: string, re: RegExp, key: string) => (re.test(code.replace(/#.*$/gm, '')) ? null : t(key));
const first = (...xs: (string | null)[]) => xs.find((x) => x) ?? null;
const maxOf = (r: RunResult, k: 'al' | 'ar') => Math.max(...r.frames.map((f) => f[k]));
const secs = (ms: number) => (ms / 1000).toFixed(1);
const backHome = (r: RunResult, at: Pose, tol: number) => (Math.hypot(r.final.x - at.x, r.final.y - at.y) <= tol ? null : `${t('chk.notBack')} ${where(r.final)}`);
const objAt = (r: RunResult, id: string) => r.world.objects.find((o) => o.id === id)!;
/** Quantas vezes um comando aparece no código (sem contar comentários). */
const count = (code: string, re: RegExp) => (code.replace(/#.*$/gm, '').match(new RegExp(re.source, 'g')) ?? []).length;
/** Onde está o sensor de cor no fim, a partir da pose do robô. */
const sensorAt = (f: Frame) => {
  const r = (f.h * Math.PI) / 180;
  return { x: f.x + SENSOR_POS.x * Math.cos(r) - SENSOR_POS.y * Math.sin(r), y: f.y + SENSOR_POS.x * Math.sin(r) + SENSOR_POS.y * Math.cos(r) };
};

const BLANK = '# Write your commands here\n';
const SQUARE_START = { x: 600, y: 250, h: 0 };
const FOLLOW_START = { x: 430, y: 580, h: 0 };

// ---------- Conteúdo ----------

export const UNITS: Unit[] = [
  {
    id: 'u1',
    lessons: [
      {
        id: 'u1l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.___(300)', answers: [['straight']] },
          {
            kind: 'code',
            starter: program(BLANK),
            check: (r) => (Math.abs(r.final.x - (START.x + 300)) <= 15 && Math.abs(r.final.y - START.y) <= 15 ? null : `${t('chk.drive300')} ${where(r.final)}`),
            solution: program('robo.straight(300)'),
          },
        ],
      },
      {
        id: 'u1l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo = DriveBase(left_motor, right_motor, wheel_diameter=___, axle_track=150)', answers: [['62.4', '62,4']] },
          {
            kind: 'order',
            lines: ['hub = PrimeHub()', 'left_motor = Motor(Port.A, positive_direction=Direction.COUNTERCLOCKWISE)', 'right_motor = Motor(Port.B, positive_direction=Direction.CLOCKWISE)', 'robo = DriveBase(left_motor, right_motor, wheel_diameter=62.4, axle_track=150)', 'robo.straight(200)'],
          },
          {
            kind: 'code',
            starter: `${IMPORTS}

hub = PrimeHub()
left_motor = Motor(Port.A)
right_motor = Motor(Port.B, positive_direction=Direction.CLOCKWISE)
robo = DriveBase(left_motor, right_motor, wheel_diameter=62.4, axle_track=150)

robo.straight(400)
`,
            check: (r) => (Math.abs(r.final.x - (START.x + 400)) <= 20 && angDiff(r.final.h, 0) < 3 ? null : `${t('chk.straight400')} ${where(r.final)}`),
            solution: program('robo.straight(400)', false),
          },
        ],
      },
      {
        id: 'u1l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('# Drive 500 mm forward\nrobo.straigth(500)'),
            check: (r) => (Math.abs(r.final.x - (START.x + 500)) <= 15 && Math.abs(r.final.y - START.y) <= 15 ? null : `${t('chk.driveTo', { d: 500 })} ${where(r.final)}`),
            solution: program('# Drive 500 mm forward\nrobo.straight(500)'),
          },
        ],
      },
      {
        id: 'u1l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'hub.light.on(Color.___)', answers: [['GREEN']] },
          {
            kind: 'code',
            starter: program(BLANK),
            check: (r) => {
              const moved = r.frames.find((f) => f.x >= START.x + 290);
              return first(
                Math.abs(r.final.x - (START.x + 300)) <= 15 ? null : `${t('chk.driveTo', { d: 300 })} ${where(r.final)}`,
                r.final.light === 'GREEN' ? null : t('chk.lightGreen'),
                moved && r.events.some((e) => e.kind === 'beep' && e.t >= moved.t) ? null : t('chk.beepEnd'));
            },
            solution: program('hub.light.on(Color.GREEN)\nrobo.straight(300)\nhub.speaker.beep()'),
          },
        ],
      },
    ],
  },
  {
    id: 'u2',
    lessons: [
      {
        id: 'u2l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red')],
            check: (r) => needZone(r, 'red'),
            solution: program('robo.straight(800)'),
          },
        ],
      },
      {
        id: 'u2l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.turn(___)', answers: [['-90']] },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('yellow')],
            check: (r) => needZone(r, 'yellow'),
            solution: program('robo.straight(800)\nrobo.turn(-90)\nrobo.straight(640)'),
          },
        ],
      },
      {
        id: 'u2l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'order', lines: ['robo.turn(-90)', 'robo.straight(300)', 'robo.turn(90)'] },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('yellow')],
            check: (r) => first(needZone(r, 'yellow'), angDiff(r.final.h, 0) <= 6 ? null : t('chk.faceRight')),
            solution: program('robo.straight(800)\nrobo.turn(-90)\nrobo.straight(640)\nrobo.turn(90)'),
          },
        ],
      },
      {
        id: 'u2l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red'), BASE_TARGET],
            check: (r, code) => first(visited(r, 'red') ? null : t('chk.notVisited', { zone: zoneName('red') }), uses(code, /^(?![\s\S]*\.(turn|curve)\s*\()/, 'chk.noTurnAtAll'), inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`),
            solution: program('robo.straight(800)\nrobo.straight(-800)'),
          },
        ],
      },
      {
        id: 'u2l5',
        exercises: [
          { kind: 'fill', code: '# turn around\nrobo.turn(___)', answers: [['180', '-180']] },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red'), BASE_TARGET],
            check: (r) => first(visited(r, 'red') ? null : t('chk.notVisited', { zone: zoneName('red') }), inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`, angDiff(r.final.h, 180) <= 6 ? null : t('chk.faceLeft')),
            solution: program('robo.straight(800)\nrobo.turn(180)\nrobo.straight(800)'),
          },
        ],
      },
      {
        id: 'u2l6',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('yellow')],
            check: (r, code) => first(count(code, /\.turn\s*\(/) === 1 && count(code, /\.straight\s*\(/) === 1 ? null : t('chk.oneEach'), needZone(r, 'yellow')),
            solution: program('robo.turn(-38.7)\nrobo.straight(1024)'),
          },
        ],
      },
    ],
  },
  {
    id: 'u3',
    lessons: [
      {
        id: 'u3l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.curve(300, ___)', answers: [['-90']] },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('yellow')],
            check: (r, code) => first(uses(code, /\.curve\s*\(/, 'chk.useCurve'), uses(code, /^(?![\s\S]*\.turn\s*\()/, 'chk.noTurn'), needZone(r, 'yellow')),
            solution: program('robo.straight(500)\nrobo.curve(300, -90)\nrobo.straight(340)'),
          },
        ],
      },
      {
        id: 'u3l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.settings(___=400)', answers: [['straight_speed']] },
          {
            kind: 'code',
            starter: program('robo.straight(1400)'),
            targets: [zoneTarget('blue')],
            check: (r) => first(needZone(r, 'blue'), r.final.t <= 6000 ? null : t('chk.tooSlow', { s: secs(r.final.t), max: 6 })),
            solution: program('robo.settings(straight_speed=400)\nrobo.straight(1400)'),
          },
        ],
      },
      {
        id: 'u3l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('yellow')],
            check: (r, code) => first(count(code, /\.curve\s*\(/) >= 2 ? null : t('chk.twoCurves'), needZone(r, 'yellow'), angDiff(r.final.h, 0) <= 6 ? null : t('chk.faceRight')),
            solution: program('robo.curve(300, -90)\nrobo.curve(300, 90)\nrobo.straight(200)'),
          },
        ],
      },
      {
        id: 'u3l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.settings(___=400)\nrobo.turn(360)', answers: [['turn_rate']] },
          {
            kind: 'code',
            starter: program('robo.turn(360)'),
            start: SQUARE_START,
            check: (r) => first(r.world.bases[0] && Math.abs(r.world.bases[0].turn) >= 350 && angDiff(r.final.h, SQUARE_START.h) <= 6 ? null : t('chk.spinFull'), r.final.t <= 2000 ? null : t('chk.tooSlow', { s: secs(r.final.t), max: 2 })),
            solution: program('robo.settings(turn_rate=400)\nrobo.turn(360)'),
          },
        ],
      },
    ],
  },
  {
    id: 'u4',
    lessons: [
      {
        id: 'u4l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'anexo_right.run_angle(500, ___)', answers: [['360']] },
          {
            kind: 'code',
            starter: program(BLANK),
            check: (r) => (maxOf(r, 'al') >= 170 && Math.abs(r.final.al) <= 5 ? null : maxOf(r, 'al') < 170 ? t('chk.armHalf') : t('chk.armBack', { a: Math.round(r.final.al) })),
            solution: program('anexo_left.run_angle(500, 180)\nanexo_left.run_angle(500, -180)'),
          },
        ],
      },
      {
        id: 'u4l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red')],
            check: (r) => first(needZone(r, 'red'), Math.abs(r.final.ar - 90) <= 5 ? null : t('chk.arm90', { a: Math.round(r.final.ar) }), r.final.t <= 4600 ? null : t('chk.useWaitFalse', { s: secs(r.final.t) })),
            solution: program('anexo_right.run_angle(500, 90, wait=False)\nrobo.straight(800)'),
          },
        ],
      },
      {
        id: 'u4l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('anexo_left.run_angle(500, 75)\nanexo_left.run_angle(500, 30)\n# complete: end exactly at 120 degrees\n'),
            check: (r, code) => first(uses(code, /\.run_target\s*\(/, 'chk.useRunTarget'), Math.abs(r.final.al - 120) <= 3 ? null : t('chk.armAt', { target: 120, a: Math.round(r.final.al) })),
            solution: program('anexo_left.run_angle(500, 75)\nanexo_left.run_angle(500, 30)\nanexo_left.run_target(500, 120)'),
          },
        ],
      },
      {
        id: 'u4l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('anexo_left.run_angle(500, 180)\nanexo_right.run_angle(500, 180)'),
            check: (r) => first(Math.abs(r.final.al - 180) <= 5 && Math.abs(r.final.ar - 180) <= 5 ? null : t('chk.bothArms'), r.final.t <= 800 ? null : t('chk.useWaitFalse', { s: secs(r.final.t) })),
            solution: program('anexo_left.run_angle(500, 180, wait=False)\nanexo_right.run_angle(500, 180)'),
          },
        ],
      },
    ],
  },
  {
    id: 'u5',
    lessons: [
      {
        id: 'u5l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.drive(200, 0)\nwhile sensor.color() != Color.___:\n    wait(10)\nrobo.stop()', answers: [['BLACK']] },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [{ kind: 'rect', x: 1240, y: 60, w: 20, h: 340 }],
            check: (r, code) => {
              const sx = r.final.x + 92;
              return first(uses(code, /\.color\s*\(/, 'chk.useSensor'), sx >= 1225 && sx <= 1300 ? null : t('chk.stopLine', { x: Math.round(sx) }));
            },
            solution: program('robo.drive(200, 0)\nwhile sensor.color() != Color.BLACK:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
      {
        id: 'u5l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`target = 50
gain = 1.5

while robo.distance() < 1300:
    error = sensor.reflection() - target
    # complete: drive at 150 mm/s turning error * gain
    wait(10)

robo.stop()`),
            start: FOLLOW_START,
            targets: [{ kind: 'rect', x: 1450, y: 860, w: 200, h: 230 }],
            check: (r) => (r.final.y >= 820 && r.final.x >= 1400 && r.final.x <= 1700 ? null : `${t('chk.lostLine')} ${where(r.final)}`),
            solution: program('target = 50\ngain = 1.5\n\nwhile robo.distance() < 1300:\n    error = sensor.reflection() - target\n    robo.drive(150, error * gain)\n    wait(10)\n\nrobo.stop()'),
          },
        ],
      },
      {
        id: 'u5l3',
        exercises: [
          { kind: 'fill', code: 'robo.drive(200, 0)\nwhile sensor.color() != Color.___:\n    wait(10)\nrobo.stop()', answers: [['RED']] },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red')],
            check: (r, code) => {
              const s = sensorAt(r.final);
              return first(uses(code, /\.color\s*\(/, 'chk.useSensor'), inZone(s, 'red') && s.x <= 880 ? null : t('chk.stopRed'));
            },
            solution: program('robo.drive(200, 0)\nwhile sensor.color() != Color.RED:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
      {
        id: 'u5l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [{ kind: 'rect', x: 1240, y: 60, w: 20, h: 340 }],
            check: (r, code) => {
              const sx = sensorAt(r.final).x;
              return first(uses(code, /\.reflection\s*\(/, 'chk.useReflection'), sx >= 1225 && sx <= 1300 ? null : t('chk.stopLine', { x: Math.round(sx) }));
            },
            solution: program('robo.drive(200, 0)\nwhile sensor.reflection() > 20:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
      {
        id: 'u5l5',
        exercises: [
          { kind: 'order', lines: ['robo.drive(200, 0)', 'while sensor.color() != Color.RED:', '    wait(10)', 'while sensor.color() != Color.BLACK:', '    wait(10)', 'robo.stop()'] },
          {
            kind: 'code',
            starter: program('robo.drive(200, 0)\n# complete: first wait for RED, then for BLACK\nrobo.stop()'),
            targets: [zoneTarget('red'), { kind: 'rect', x: 1240, y: 60, w: 20, h: 340 }],
            check: (r, code) => {
              const sx = sensorAt(r.final).x;
              return first(count(code, /\.color\s*\(/) >= 2 ? null : t('chk.useSensor'), sx >= 1225 && sx <= 1300 ? null : t('chk.stopLine', { x: Math.round(sx) }));
            },
            solution: program('robo.drive(200, 0)\nwhile sensor.color() != Color.RED:\n    wait(10)\nwhile sensor.color() != Color.BLACK:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
    ],
  },
  {
    id: 'u6',
    lessons: [
      {
        id: 'u6l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'for i in ___(4):\n    robo.straight(300)\n    robo.turn(-90)', answers: [['range']] },
          {
            kind: 'code',
            starter: program(BLANK),
            start: SQUARE_START,
            check: (r, code) => first(uses(code, /\bfor\s+\w+\s+in\b/, 'chk.useFor'), r.world.bases[0] && Math.abs(r.world.bases[0].turn) >= 350 ? null : t('chk.fourCorners'), backHome(r, SQUARE_START, 20)),
            solution: program('for i in range(4):\n    robo.straight(300)\n    robo.turn(-90)'),
          },
        ],
      },
      {
        id: 'u6l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'order', lines: ['def go_and_back(distance):', '    robo.straight(distance)', '    robo.straight(-distance)', 'go_and_back(800)'] },
          {
            kind: 'code',
            starter: program('def go_and_back(distance):\n    # complete here\n    pass\n\n'),
            targets: [zoneTarget('red')],
            check: (r, code) => first(uses(code, /def\s+go_and_back\s*\(/, 'chk.keepFn'), uses(code, /^\s*go_and_back\s*\(/m, 'chk.callFn'), visited(r, 'red') ? null : t('chk.notVisited', { zone: zoneName('red') }), backHome(r, START, 25)),
            solution: program('def go_and_back(distance):\n    robo.straight(distance)\n    robo.straight(-distance)\n\ngo_and_back(800)'),
          },
        ],
      },
      {
        id: 'u6l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('robo.drive(200, 0)\n# complete: keep driving until 600 mm\nrobo.stop()'),
            check: (r, code) => first(uses(code, /\bwhile\b/, 'chk.useWhile'), uses(code, /\.drive\s*\(/, 'chk.useDrive'), Math.abs(r.final.x - (START.x + 600)) <= 25 ? null : `${t('chk.driveTo', { d: 600 })} ${where(r.final)}`),
            solution: program('robo.drive(200, 0)\nwhile robo.distance() < 600:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
      {
        id: 'u6l4',
        exercises: [
          { kind: 'choice', code: 'x = 5\nif x > 3:\n    print("A")\nelse:\n    print("B")', answer: 0 },
          {
            kind: 'code',
            starter: program('robo.straight(700)\n# complete: if the sensor sees RED turn left, otherwise turn right\nrobo.straight(400)'),
            targets: [zoneTarget('red')],
            check: (r, code) => first(uses(code, /\bif\b[\s\S]*\belse\b/, 'chk.useIfElse'), r.final.y >= 550 ? null : t('chk.wrongSide')),
            solution: program('robo.straight(700)\nif sensor.color() == Color.RED:\n    robo.turn(-90)\nelse:\n    robo.turn(90)\nrobo.straight(400)'),
          },
        ],
      },
      {
        id: 'u6l5',
        exercises: [
          { kind: 'choice', code: 'moves = [800, 640]', answer: 0 },
          { kind: 'fill', code: 'for distance in [300, 300, 300]:\n    robo.___(distance)', answers: [['straight']] },
          {
            kind: 'code',
            starter: program('moves = [(800, -90), (640, 0)]\n\nfor distance, angle in moves:\n    # complete: drive the distance, then turn the angle\n    pass'),
            targets: [zoneTarget('yellow')],
            check: (r, code) => first(uses(code, /moves\s*=\s*\[/, 'chk.useList'), uses(code, /\bfor\b[^\n]*\bin\s+moves\b/, 'chk.useList'), needZone(r, 'yellow')),
            solution: program('moves = [(800, -90), (640, 0)]\n\nfor distance, angle in moves:\n    robo.straight(distance)\n    robo.turn(angle)'),
          },
        ],
      },
      {
        id: 'u6l6',
        exercises: [
          { kind: 'fill', code: 'def mm(cm):\n    ___ cm * 10', answers: [['return']] },
          { kind: 'choice', code: 'def double(x):\n    return x * 2\n\nprint(double(4) + 1)', answer: 0 },
          {
            kind: 'code',
            starter: program('def mm(cm):\n    return cm * 10\n\n# complete: drive 80 cm using mm()\n'),
            targets: [zoneTarget('red')],
            check: (r, code) => first(uses(code, /\.straight\s*\(\s*mm\s*\(/, 'chk.useMm'), needZone(r, 'red')),
            solution: program('def mm(cm):\n    return cm * 10\n\nrobo.straight(mm(80))'),
          },
        ],
      },
      {
        id: 'u6l7',
        exercises: [
          { kind: 'choice', code: 'for i in range(10):\n    if i == 3:\n        break\n    print(i)', answer: 0 },
          {
            kind: 'code',
            starter: program('robo.drive(200, 0)\nwhile True:\n    # complete: leave the loop when the sensor sees BLACK\n    wait(10)\nrobo.stop()'),
            targets: [{ kind: 'rect', x: 1240, y: 60, w: 20, h: 340 }],
            check: (r, code) => {
              const sx = sensorAt(r.final).x;
              return first(uses(code, /\bbreak\b/, 'chk.useBreak'), sx >= 1225 && sx <= 1300 ? null : t('chk.stopLine', { x: Math.round(sx) }));
            },
            solution: program('robo.drive(200, 0)\nwhile True:\n    if sensor.color() == Color.BLACK:\n        break\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
    ],
  },
  {
    id: 'u7',
    lessons: [
      {
        id: 'u7l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('blue'), zoneTarget('green'), BASE_TARGET],
            check: (r) => {
              const iBlue = r.frames.findIndex((f) => inZone(f, 'blue'));
              if (iBlue < 0) return t('chk.notVisited', { zone: zoneName('blue') });
              const iGreen = r.frames.findIndex((f, i) => i > iBlue && inZone(f, 'green'));
              if (iGreen < 0) return t('chk.thenGreen');
              const f = r.final;
              return f.x <= 400 && f.y <= 560 ? null : `${t('chk.endInBase')} ${where(f)}`;
            },
            solution: program('robo.settings(straight_speed=400)\nrobo.straight(1480)\nrobo.turn(-49)\nrobo.straight(844)\nrobo.straight(-844)\nrobo.turn(49)\nrobo.straight(-1480)'),
          },
        ],
      },
      {
        id: 'u7l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [{ kind: 'rect', ...BASE2 }],
            check: (r) => first(r.final.x >= BASE2.x && r.final.y <= BASE2.h ? null : `${t('chk.inBase2')} ${where(r.final)}`, r.final.t <= 6000 ? null : t('chk.tooSlow', { s: secs(r.final.t), max: 6 })),
            solution: program('robo.settings(straight_speed=400)\nrobo.straight(2000)'),
          },
        ],
      },
      {
        id: 'u7l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red'), BASE_TARGET],
            check: (r) => first(
              visited(r, 'red') ? null : t('chk.notVisited', { zone: zoneName('red') }),
              maxOf(r, 'ar') >= 85 ? null : t('chk.arm90'),
              Math.abs(r.final.ar) <= 5 ? null : t('chk.armBack', { a: Math.round(r.final.ar) }),
              inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`,
              r.final.t <= 6000 ? null : t('chk.useWaitFalse', { s: secs(r.final.t) })),
            solution: program('robo.settings(straight_speed=400)\nanexo_right.run_angle(500, 90, wait=False)\nrobo.straight(800)\nanexo_right.run_angle(500, -90, wait=False)\nrobo.straight(-800)'),
          },
        ],
      },
    ],
  },
  {
    id: 'u8',
    lessons: [
      {
        id: 'u8l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo.___(True)', answers: [['use_gyro']] },
          {
            kind: 'code',
            starter: program(`# Two laps of a 300 mm square, back to the start
for i in range(8):
    robo.straight(300)
    robo.turn(-90)`),
            start: SQUARE_START,
            realistic: 11,
            check: (r) => first(backHome(r, SQUARE_START, 35), angDiff(r.final.h, SQUARE_START.h) <= 4 ? null : t('chk.heading', { a: Math.round(angDiff(r.final.h, SQUARE_START.h)) })),
            solution: program(`robo.use_gyro(True)
for i in range(8):
    robo.straight(300)
    robo.turn(-90)`),
          },
        ],
      },
      {
        id: 'u8l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'robo = DriveBase(left_motor, right_motor, wheel_diameter=___, axle_track=150)', answers: [['64', '64.0', '63.96', '64,0', '63,96']] },
        ],
      },
      {
        id: 'u8l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'fill', code: 'while hub.imu.___() < 90:\n    wait(10)', answers: [['heading']] },
          {
            kind: 'code',
            starter: program('robo.drive(0, 120)\n# complete: wait until the heading reaches 90\nrobo.stop()'),
            start: SQUARE_START,
            check: (r, code) => first(uses(code, /\.heading\s*\(/, 'chk.useHeading'), angDiff(r.final.h, -90) <= 6 ? null : t('chk.turnRight90', { a: Math.round(-r.final.h) })),
            solution: program('robo.drive(0, 120)\nwhile hub.imu.heading() < 90:\n    wait(10)\nrobo.stop()'),
          },
        ],
      },
    ],
  },
  {
    id: 'u9',
    lessons: [
      {
        id: 'u9l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`target = 50
kp = 6
kd = 0
last_error = 0

while robo.distance() < 1300:
    error = sensor.reflection() - target
    derivative = error - last_error
    robo.drive(400, kp * error + kd * derivative)
    last_error = error
    wait(10)

robo.stop()`),
            start: FOLLOW_START,
            targets: [{ kind: 'rect', x: 1450, y: 860, w: 200, h: 230 }],
            check: (r) => first(r.final.y >= 820 && r.final.x >= 1400 && r.final.x <= 1700 ? null : `${t('chk.lostLinePid')} ${where(r.final)}`, r.final.t <= 4000 ? null : t('chk.tooSlow', { s: secs(r.final.t), max: 4 })),
            solution: program(`target = 50
kp = 6
kd = 8
last_error = 0

while robo.distance() < 1300:
    error = sensor.reflection() - target
    derivative = error - last_error
    robo.drive(400, kp * error + kd * derivative)
    last_error = error
    wait(10)

robo.stop()`),
          },
        ],
      },
      {
        id: 'u9l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`watch = StopWatch()
target = 50
gain = 1.5

# complete: follow the line for 3 seconds (3000 ms)
while robo.distance() < 200:
    error = sensor.reflection() - target
    robo.drive(150, error * gain)
    wait(10)

robo.stop()`),
            start: FOLLOW_START,
            check: (r, code) => first(uses(code, /watch\.time\s*\(/, 'chk.useStopWatch'), r.final.t >= 2900 && r.final.t <= 3400 ? null : t('chk.followTime', { s: secs(r.final.t) }), r.final.y >= 520 && r.final.y <= 680 ? null : `${t('chk.lostLine')} ${where(r.final)}`),
            solution: program(`watch = StopWatch()
target = 50
gain = 1.5

while watch.time() < 3000:
    error = sensor.reflection() - target
    robo.drive(150, error * gain)
    wait(10)

robo.stop()`),
          },
        ],
      },
    ],
  },
  {
    id: 'u10',
    lessons: [
      {
        id: 'u10l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`def push_crate():
    # complete: push the crate into the blue zone and come back
    pass

push_crate()`),
            objects: [{ id: 'crate', x: 1100, y: 220, size: 60, color: '#e0662a' }],
            targets: [zoneTarget('blue'), BASE_TARGET],
            check: (r, code) => {
              const c = objAt(r, 'crate');
              return first(uses(code, /def\s+push_crate\s*\(/, 'chk.keepFn'), inZone(c, 'blue') ? null : t('chk.crateZone', { zone: zoneName('blue') }), inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`);
            },
            solution: program(`def push_crate():
    robo.straight(1300)
    robo.straight(-1300)

push_crate()`),
          },
        ],
      },
      {
        id: 'u10l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`def open_claw():
    anexo_left.run_angle(300, 90)

def close_claw():
    anexo_left.run_angle(300, -90)

# complete: open, drive to the crate, close and bring it to the base
`),
            objects: [{ id: 'crate', x: 800, y: 266, size: 60, color: '#2a8de0' }],
            attachments: { left: 'claw', right: 'none' },
            targets: [BASE_TARGET],
            check: (r) => {
              const c = objAt(r, 'crate');
              return first(c.x <= 400 && c.y <= 560 ? null : t('chk.crateBase'), inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`);
            },
            solution: program(`def open_claw():
    anexo_left.run_angle(300, 90)

def close_claw():
    anexo_left.run_angle(300, -90)

open_claw()
robo.straight(466)
close_claw()
robo.straight(-466)`),
          },
        ],
      },
      {
        id: 'u10l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`def push_crate():
    # complete: push the crate into the red zone and come back
    pass

def visit_yellow():
    # complete: go to the yellow zone and come back
    pass

push_crate()
visit_yellow()`),
            objects: [{ id: 'crate', x: 600, y: 220, size: 60, color: '#e0662a' }],
            targets: [zoneTarget('red'), zoneTarget('yellow'), BASE_TARGET],
            check: (r) => first(
              inZone(objAt(r, 'crate'), 'red') ? null : t('chk.crateZone', { zone: zoneName('red') }),
              visited(r, 'yellow') ? null : t('chk.notVisited', { zone: zoneName('yellow') }),
              inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`),
            solution: program(`def push_crate():
    robo.straight(620)
    robo.straight(-620)

def visit_yellow():
    robo.turn(-90)
    robo.straight(640)
    robo.turn(90)
    robo.straight(800)
    robo.straight(-800)
    robo.turn(-90)
    robo.straight(-640)
    robo.turn(90)

push_crate()
visit_yellow()`),
          },
        ],
      },
      {
        id: 'u10l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`def open_claw():
    anexo_left.run_target(300, 90)

def close_claw():
    anexo_left.run_target(300, 0)

# complete: grab the crate, drop it in the red zone and return to the base
`),
            objects: [{ id: 'crate', x: 600, y: 266, size: 60, color: '#2a8de0' }],
            attachments: { left: 'claw', right: 'none' },
            targets: [zoneTarget('red'), BASE_TARGET],
            check: (r) => first(inZone(objAt(r, 'crate'), 'red') ? null : t('chk.crateZone', { zone: zoneName('red') }), inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`),
            solution: program(`def open_claw():
    anexo_left.run_target(300, 90)

def close_claw():
    anexo_left.run_target(300, 0)

open_claw()
robo.straight(266)
close_claw()
robo.straight(340)
open_claw()
robo.straight(-606)`),
          },
        ],
      },
    ],
  },
  {
    id: 'u11',
    lessons: [
      {
        id: 'u11l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('for i in range(4)\n    robo.straight(300)\nrobo.turn(-90)'),
            start: SQUARE_START,
            check: (r) => first(r.world.bases[0] && Math.abs(r.world.bases[0].turn) >= 350 ? null : t('chk.fourCorners'), backHome(r, SQUARE_START, 20)),
            solution: program('for i in range(4):\n    robo.straight(300)\n    robo.turn(-90)'),
          },
        ],
      },
      {
        id: 'u11l2',
        exercises: [
          { kind: 'choice', code: 'robo.straight(250)\nprint(robo.distance())', answer: 0 },
          {
            kind: 'code',
            starter: program('robo.drive(200, 0)\nwhile sensor.color() != Color.BLACK:\n    wait(10)\nrobo.stop()\n# complete: print how far the robot drove\n'),
            targets: [{ kind: 'rect', x: 1240, y: 60, w: 20, h: 340 }],
            check: (r) => {
              const d = r.final.x - START.x;
              const printed = r.events.filter((e) => e.kind === 'print').map((e) => parseFloat(e.text)).filter((n) => !Number.isNaN(n));
              return printed.some((n) => Math.abs(n - d) <= 15) ? null : t('chk.printDist');
            },
            solution: program('robo.drive(200, 0)\nwhile sensor.color() != Color.BLACK:\n    wait(10)\nrobo.stop()\nprint(robo.distance())'),
          },
        ],
      },
      {
        id: 'u11l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program('# Go to the yellow zone\nrobo.straight(80)\nrobo.turn(90)\nrobo.straight(640)'),
            targets: [zoneTarget('yellow')],
            check: (r) => needZone(r, 'yellow'),
            solution: program('# Go to the yellow zone\nrobo.straight(800)\nrobo.turn(-90)\nrobo.straight(640)'),
          },
        ],
      },
      {
        id: 'u11l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: `${IMPORTS}

hub = PrimeHub()
left_motor = Motor(Port.A, positive_direction=Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.B, positive_direction=Direction.CLOCKWISE)
robo = DriveBase(left_motor, right_motor, wheel_diameter=62.4, axle_track=150)
sensor = ColorSensor(Port.F)

robo.drive(200, 0)
while sensor.color() != Color.RED:
    wait(10)
robo.stop()
`,
            targets: [zoneTarget('red')],
            check: (r) => (inZone(sensorAt(r.final), 'red') ? null : t('chk.stopRed')),
            solution: program('robo.drive(200, 0)\nwhile sensor.color() != Color.RED:\n    wait(10)\nrobo.stop()', false).replace('robo = DriveBase(left_motor, right_motor, wheel_diameter=62.4, axle_track=150)', 'robo = DriveBase(left_motor, right_motor, wheel_diameter=62.4, axle_track=150)\nsensor = ColorSensor(Port.D)'),
          },
        ],
      },
    ],
  },
  {
    id: 'u12',
    lessons: [
      {
        id: 'u12l1',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            start: START2,
            targets: [zoneTarget('blue'), { kind: 'rect', ...BASE2 }],
            check: (r) => first(visited(r, 'blue') ? null : t('chk.notVisited', { zone: zoneName('blue') }), r.final.x >= BASE2.x && r.final.y <= BASE2.h ? null : `${t('chk.inBase2')} ${where(r.final)}`),
            solution: program('robo.straight(642)\nrobo.straight(-642)'),
          },
        ],
      },
      {
        id: 'u12l2',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            targets: [zoneTarget('red'), zoneTarget('blue'), BASE_TARGET],
            check: (r) => first(
              visited(r, 'red') ? null : t('chk.notVisited', { zone: zoneName('red') }),
              visited(r, 'blue') ? null : t('chk.notVisited', { zone: zoneName('blue') }),
              inBase(r.final.x, r.final.y) ? null : `${t('chk.endInBase')} ${where(r.final)}`,
              r.final.t <= 8000 ? null : t('chk.tooSlow', { s: secs(r.final.t), max: 8 })),
            solution: program('robo.settings(straight_speed=480, straight_acceleration=1500)\nrobo.straight(1480)\nrobo.straight(-1480)'),
          },
        ],
      },
      {
        id: 'u12l3',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(BLANK),
            objects: [{ id: 'crate', x: 1100, y: 220, size: 60, color: '#e0662a' }],
            targets: [zoneTarget('blue'), zoneTarget('green'), { kind: 'rect', ...BASE2 }],
            check: (r) => first(
              inZone(objAt(r, 'crate'), 'blue') ? null : t('chk.crateZone', { zone: zoneName('blue') }),
              visited(r, 'green') ? null : t('chk.notVisited', { zone: zoneName('green') }),
              r.final.x >= BASE2.x && r.final.y <= BASE2.h ? null : `${t('chk.inBase2')} ${where(r.final)}`),
            solution: program('robo.straight(1300)\nrobo.turn(-41)\nrobo.straight(971)\nrobo.turn(126)\nrobo.straight(562)'),
          },
        ],
      },
      {
        id: 'u12l4',
        exercises: [
          { kind: 'choice', answer: 0 },
          {
            kind: 'code',
            starter: program(`target = 50
kp = 1.5

# complete: follow the line to the end, then turn the light green and beep
`),
            start: FOLLOW_START,
            targets: [{ kind: 'rect', x: 1450, y: 860, w: 200, h: 230 }],
            check: (r) => {
              const end = r.frames.find((f) => f.y >= 820 && f.x >= 1400);
              return first(
                r.final.y >= 820 && r.final.x >= 1400 && r.final.x <= 1700 ? null : `${t('chk.lostLine')} ${where(r.final)}`,
                r.final.light === 'GREEN' ? null : t('chk.lightGreen'),
                end && r.events.some((e) => e.kind === 'beep' && e.t >= end.t) ? null : t('chk.beepEnd'));
            },
            solution: program(`target = 50
kp = 1.5

while robo.distance() < 1300:
    error = sensor.reflection() - target
    robo.drive(150, kp * error)
    wait(10)

robo.stop()
hub.light.on(Color.GREEN)
hub.speaker.beep()`),
          },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons);
export const unitOf = (lessonId: string) => UNITS.find((u) => u.lessons.some((l) => l.id === lessonId))!;
