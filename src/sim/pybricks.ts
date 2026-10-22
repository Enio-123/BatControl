// Módulos pybricks.* simulados, ligados ao World.
import { t as tr } from '../i18n';
import { Kwargs, NativeFn, PyEnum, PyError, PyList, PyModule, PyObject, PyTuple, toNumber, truthy } from '../interp/interpreter';
import { MOTOR_MAX, PortName, SimDriveBase, SimMotor, World, trapezoid } from './world';

type ArgSpec = string[]; // 'nome' obrigatório, 'nome?' opcional

function bind(fname: string, spec: ArgSpec, args: any[], kw: Kwargs): Record<string, any> {
  const out: Record<string, any> = {};
  const names = spec.map((s) => s.replace('?', ''));
  if (args.length > spec.length) {
    throw new PyError('TypeError', tr('e.argMax', { f: fname, n: spec.length, m: args.length }));
  }
  for (const k of Object.keys(kw)) {
    if (!names.includes(k)) {
      throw new PyError('TypeError', tr('e.argUnknownList', { f: fname, p: k, list: names.join(', ') }));
    }
  }
  spec.forEach((s, i) => {
    const n = s.replace('?', '');
    if (i < args.length) out[n] = args[i];
    else if (n in kw) out[n] = kw[n];
    else if (!s.endsWith('?')) throw new PyError('TypeError', tr('e.argMissing', { f: fname, p: n }));
  });
  return out;
}

const num = (v: any, fname: string, arg: string) => toNumber(v, tr('e.argOf', { arg, f: fname }));

function enumNS(typeName: string, names: string[], extra: (n: string) => Record<string, any> = () => ({})) {
  const attrs: Record<string, any> = {};
  for (const n of names) attrs[n] = new PyEnum(typeName, n, extra(n));
  return new PyObject(typeName, attrs);
}

const COLOR_HSV: Record<string, [number, number, number]> = {
  NONE: [0, 0, 0], BLACK: [0, 0, 10], GRAY: [0, 0, 50], WHITE: [0, 0, 100], RED: [0, 100, 100], ORANGE: [30, 100, 100],
  BROWN: [30, 100, 50], YELLOW: [60, 100, 100], GREEN: [120, 100, 100], CYAN: [180, 100, 100], BLUE: [240, 100, 100],
  VIOLET: [270, 100, 100], MAGENTA: [300, 100, 100],
};

export function makeModules(world: World): Record<string, PyModule> {
  const Port = enumNS('Port', ['A', 'B', 'C', 'D', 'E', 'F']);
  const Direction = enumNS('Direction', ['CLOCKWISE', 'COUNTERCLOCKWISE']);
  const Stop = enumNS('Stop', ['COAST', 'BRAKE', 'HOLD', 'NONE', 'COAST_SMART']);
  const Color = enumNS('Color', Object.keys(COLOR_HSV), (n) => ({ h: COLOR_HSV[n][0], s: COLOR_HSV[n][1], v: COLOR_HSV[n][2] }));
  const Button = enumNS('Button', ['LEFT', 'RIGHT', 'CENTER', 'BLUETOOTH']);
  const Side = enumNS('Side', ['TOP', 'BOTTOM', 'FRONT', 'BACK', 'LEFT', 'RIGHT']);
  const Axis = enumNS('Axis', ['X', 'Y', 'Z']);
  const Icon = enumNS('Icon', ['HAPPY', 'SAD', 'HEART', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'PAUSE', 'EMPTY', 'FULL', 'SQUARE', 'TRIANGLE', 'CIRCLE']);

  const portName = (p: any, fname: string): PortName => {
    if (!(p instanceof PyEnum) || p.typeName !== 'Port') {
      throw new PyError('TypeError', tr('e.needPort', { f: fname }));
    }
    return p.name as PortName;
  };
  const used = new Map<PortName, string>();
  const claim = (port: PortName, what: string) => {
    if (used.has(port)) throw new PyError('OSError', tr('e.portUsed', { port, what: used.get(port)! }));
    used.set(port, what);
  };

  // ---------- Motor ----------
  const motorObjects = new WeakMap<PyObject, SimMotor>();
  const MotorCls = new NativeFn('Motor', (args, kw) => {
    const a = bind('Motor', ['port', 'positive_direction?', 'gears?', 'reset_angle?', 'profile?'], args, kw);
    const port = portName(a.port, 'Motor');
    const role = world.roleOf(port);
    if (!role || role === 'color') {
      throw new PyError('OSError', tr('e.noMotor', { port, wl: world.config.ports.leftWheel, wr: world.config.ports.rightWheel, al: world.config.ports.leftArm, ar: world.config.ports.rightArm }));
    }
    claim(port, 'Motor');
    let dir: 1 | -1 = 1;
    if (a.positive_direction !== undefined) {
      const d = a.positive_direction;
      if (!(d instanceof PyEnum) || d.typeName !== 'Direction') throw new PyError('TypeError', tr('e.direction'));
      dir = d.name === 'COUNTERCLOCKWISE' ? -1 : 1;
    }
    let ratio = 1;
    if (a.gears !== undefined && a.gears !== null) {
      const g = a.gears instanceof PyList || a.gears instanceof PyTuple ? a.gears.items : [];
      const flat = g.map((x: any) => (x instanceof PyList || x instanceof PyTuple ? x.items.map((n: any) => toNumber(n)) : [toNumber(x)]));
      for (const train of flat) if (train.length >= 2) ratio *= train[train.length - 1] / train[0];
    }
    const m = new SimMotor(port, role, dir, world);
    world.motors.set(port, m);
    const obj = makeMotorObject(m, ratio);
    motorObjects.set(obj, m);
    return obj;
  });

  function makeMotorObject(m: SimMotor, ratio: number): PyObject {
    // `ratio`: graus do motor por grau na saída
    const outAngle = () => (m.angle - m.offset) / ratio;
    const fn = (name: string, spec: ArgSpec, body: (a: Record<string, any>) => any) =>
      new NativeFn(name, (args, kw) => body(bind(name, spec, args, kw)));
    const clampSpeed = (v: number) => {
      const s = v * ratio;
      if (Math.abs(s) > MOTOR_MAX) {
        world.log('warn', tr('w.speedMax', { v: Math.round(v), port: m.port, max: MOTOR_MAX }));
        return Math.sign(s) * MOTOR_MAX;
      }
      return s;
    };
    const finishWait = (wait: any) => {
      if (wait === undefined || truthy(wait)) world.waitUntil(() => m.done());
    };
    return new PyObject('Motor', {
      angle: fn('angle', [], () => Math.round(outAngle())),
      speed: fn('speed', [], () => Math.round(m.speed / ratio)),
      reset_angle: fn('reset_angle', ['angle?'], (a) => {
        const target = a.angle === undefined || a.angle === null ? 0 : num(a.angle, 'reset_angle', 'angle');
        m.offset = m.angle - target * ratio;
        return null;
      }),
      run: fn('run', ['speed'], (a) => {
        m.takeOver();
        m.ctrl = { kind: 'speed', target: clampSpeed(num(a.speed, 'run', 'speed')) };
        return null;
      }),
      run_time: fn('run_time', ['speed', 'time', 'then?', 'wait?'], (a) => {
        m.takeOver();
        const time = num(a.time, 'run_time', 'time');
        if (time < 0) throw new PyError('ValueError', tr('e.negTime'));
        m.ctrl = { kind: 'speed', target: clampSpeed(num(a.speed, 'run_time', 'speed')), until: world.t + time };
        finishWait(a.wait);
        return null;
      }),
      run_angle: fn('run_angle', ['speed', 'rotation_angle', 'then?', 'wait?'], (a) => {
        m.takeOver();
        const speed = Math.abs(clampSpeed(num(a.speed, 'run_angle', 'speed')));
        if (speed === 0) throw new PyError('ValueError', tr('e.zeroSpeed', { f: 'run_angle' }));
        const delta = num(a.rotation_angle, 'run_angle', 'rotation_angle') * ratio * Math.sign(num(a.speed, 'run_angle', 'speed'));
        m.ctrl = { kind: 'profile', from: m.angle, t0: world.t, prof: trapezoid(delta, speed, 2000) };
        finishWait(a.wait);
        return null;
      }),
      run_target: fn('run_target', ['speed', 'target_angle', 'then?', 'wait?'], (a) => {
        m.takeOver();
        const speed = Math.abs(clampSpeed(num(a.speed, 'run_target', 'speed')));
        if (speed === 0) throw new PyError('ValueError', tr('e.zeroSpeed', { f: 'run_target' }));
        const target = num(a.target_angle, 'run_target', 'target_angle') * ratio + m.offset;
        m.ctrl = { kind: 'profile', from: m.angle, t0: world.t, prof: trapezoid(target - m.angle, speed, 2000) };
        finishWait(a.wait);
        return null;
      }),
      run_until_stalled: fn('run_until_stalled', ['speed', 'then?', 'duty_limit?'], () => {
        throw new PyError('NotImplementedError', tr('e.stalled'));
      }),
      dc: fn('dc', ['duty'], (a) => {
        m.takeOver();
        const duty = Math.max(-100, Math.min(100, num(a.duty, 'dc', 'duty')));
        m.ctrl = { kind: 'speed', target: (duty / 100) * MOTOR_MAX };
        return null;
      }),
      stop: fn('stop', [], () => { m.takeOver(); m.ctrl = { kind: 'idle' }; return null; }),
      brake: fn('brake', [], () => { m.takeOver(); m.ctrl = { kind: 'idle' }; return null; }),
      hold: fn('hold', [], () => { m.takeOver(); m.ctrl = { kind: 'idle' }; return null; }),
      done: fn('done', [], () => m.done()),
      stalled: fn('stalled', [], () => false),
      track_target: fn('track_target', ['target_angle'], (a) => {
        m.takeOver();
        m.angle = num(a.target_angle, 'track_target', 'target_angle') * ratio + m.offset;
        m.ctrl = { kind: 'idle' };
        return null;
      }),
    });
  }

  // ---------- DriveBase ----------
  const makeBaseCls = (clsName: string, gyro: boolean) => new NativeFn(clsName, (args, kw) => {
    const a = bind(clsName, ['left_motor', 'right_motor', 'wheel_diameter', 'axle_track'], args, kw);
    const L = a.left_motor instanceof PyObject ? motorObjects.get(a.left_motor) : undefined;
    const R = a.right_motor instanceof PyObject ? motorObjects.get(a.right_motor) : undefined;
    if (!L || !R) throw new PyError('TypeError', tr('e.dbMotors'));
    if (L === R) throw new PyError('ValueError', tr('e.dbSame'));
    if (L.base || R.base) throw new PyError('OSError', tr('e.dbTaken'));
    const wd = num(a.wheel_diameter, clsName, 'wheel_diameter');
    const at = num(a.axle_track, clsName, 'axle_track');
    if (wd <= 0 || at <= 0) throw new PyError('ValueError', tr('e.dbSize'));
    const base = new SimDriveBase(L, R, wd, at, world);
    base.useGyro = gyro;
    L.base = base;
    R.base = base;
    world.bases.push(base);
    return makeDriveBase(base);
  });
  const DriveBaseCls = makeBaseCls('DriveBase', false);
  const GyroDriveBaseCls = makeBaseCls('GyroDriveBase', true);

  function makeDriveBase(b: SimDriveBase): PyObject {
    const fn = (name: string, spec: ArgSpec, body: (a: Record<string, any>) => any) =>
      new NativeFn(name, (args, kw) => body(bind(name, spec, args, kw)));
    const wait = (w: any) => {
      if (w === undefined || truthy(w)) world.waitUntil(() => b.done());
    };
    const strafeHint = 'h.strafe';
    return new PyObject(
      'DriveBase',
      {
        straight: fn('straight', ['distance', 'then?', 'wait?'], (a) => {
          const d = num(a.distance, 'straight', 'distance');
          const s = b.settings;
          b.startPath(d, 0, trapezoid(1, s.straightSpeed / Math.max(1e-6, Math.abs(d)), s.straightAccel / Math.max(1e-6, Math.abs(d))));
          wait(a.wait);
          return null;
        }),
        turn: fn('turn', ['angle', 'then?', 'wait?'], (a) => {
          const ang = num(a.angle, 'turn', 'angle');
          const s = b.settings;
          b.startPath(0, ang, trapezoid(1, s.turnRate / Math.max(1e-6, Math.abs(ang)), s.turnAccel / Math.max(1e-6, Math.abs(ang))));
          wait(a.wait);
          return null;
        }),
        curve: fn('curve', ['radius', 'angle', 'then?', 'wait?'], (a) => {
          const r = num(a.radius, 'curve', 'radius');
          const ang = num(a.angle, 'curve', 'angle');
          const arc = Math.abs(r) * Math.abs(ang) * (Math.PI / 180);
          const dist = Math.sign(r || 1) * arc;
          const s = b.settings;
          // Limita pela velocidade linear ou angular, o que for mais restritivo
          const tLin = arc / s.straightSpeed;
          const tAng = Math.abs(ang) / s.turnRate;
          const vFrac = 1 / Math.max(tLin, tAng, 1e-6);
          b.startPath(dist, ang * (r < 0 ? -1 : 1), trapezoid(1, vFrac, vFrac * 4));
          wait(a.wait);
          return null;
        }),
        drive: fn('drive', ['speed', 'turn_rate'], (a) => {
          b.startDrive(num(a.speed, 'drive', 'speed'), num(a.turn_rate, 'drive', 'turn_rate'));
          return null;
        }),
        stop: fn('stop', [], () => { b.stop(); return null; }),
        brake: fn('brake', [], () => { b.stop(); return null; }),
        done: fn('done', [], () => b.done()),
        distance: fn('distance', [], () => Math.round(b.dist - b.distOffset)),
        angle: fn('angle', [], () => Math.round((b.useGyro ? b.h0 - world.pose.h : b.turn) - b.turnOffset)),
        reset: fn('reset', ['distance?', 'angle?'], (a) => {
          b.distOffset = b.dist - (a.distance !== undefined ? num(a.distance, 'reset', 'distance') : 0);
          b.turnOffset = (b.useGyro ? b.h0 - world.pose.h : b.turn) - (a.angle !== undefined ? num(a.angle, 'reset', 'angle') : 0);
          return null;
        }),
        state: fn('state', [], () => {
          const c = b.ctrl;
          const v = c.kind === 'drive' ? c.v : 0;
          const w = c.kind === 'drive' ? c.w : 0;
          return new PyTuple([Math.round(b.dist - b.distOffset), Math.round(v), Math.round(b.turn - b.turnOffset), Math.round(w)]);
        }),
        settings: fn('settings', ['straight_speed?', 'straight_acceleration?', 'turn_rate?', 'turn_acceleration?'], (a) => {
          const s = b.settings;
          const keys: [string, keyof typeof s][] = [
            ['straight_speed', 'straightSpeed'], ['straight_acceleration', 'straightAccel'], ['turn_rate', 'turnRate'], ['turn_acceleration', 'turnAccel'],
          ];
          const given = keys.filter(([k]) => a[k] !== undefined && a[k] !== null);
          if (!given.length) return new PyTuple([s.straightSpeed, s.straightAccel, s.turnRate, s.turnAccel]);
          for (const [k, field] of given) {
            const v = num(a[k], 'settings', k);
            if (v <= 0) throw new PyError('ValueError', tr('e.positive', { k }));
            s[field] = v;
          }
          const wheelMax = (MOTOR_MAX * Math.PI * b.wheelDiameter) / 360;
          if (s.straightSpeed > wheelMax) world.log('warn', tr('w.wheelMax', { v: s.straightSpeed, max: Math.round(wheelMax) }));
          return null;
        }),
        use_gyro: fn('use_gyro', ['use_gyro'], (a) => {
          b.useGyro = truthy(a.use_gyro);
          // Ao ligar, a referência passa a ser o rumo atual
          if (b.useGyro) b.h0 = world.pose.h + b.turn;
          return null;
        }),
        stalled: fn('stalled', [], () => false),
      },
      {
        strafe: strafeHint,
        move_sideways: strafeHint,
        forward: 'h.forward',
        gyro_turn: 'h.gyroTurn',
        rotate: 'h.rotate',
      },
    );
  }

  // ---------- ColorSensor ----------
  const ColorSensorCls = new NativeFn('ColorSensor', (args, kw) => {
    const a = bind('ColorSensor', ['port'], args, kw);
    const port = portName(a.port, 'ColorSensor');
    if (world.config.ports.color !== port) {
      throw new PyError('OSError', tr('e.noSensor', { port, at: world.config.ports.color }));
    }
    claim(port, 'ColorSensor');
    const fn = (name: string, spec: ArgSpec, body: (a: Record<string, any>) => any) =>
      new NativeFn(name, (args2, kw2) => {
        const r = body(bind(name, spec, args2, kw2));
        world.advance(2); // cada leitura leva um instante
        return r;
      });
    return new PyObject('ColorSensor', {
      color: fn('color', ['surface?'], () => {
        const c = world.sensorColor();
        return Color.attrs[c ?? 'NONE'];
      }),
      reflection: fn('reflection', [], () => world.sensorReflection()),
      ambient: fn('ambient', [], () => 12),
      hsv: fn('hsv', ['surface?'], () => {
        const c = world.sensorColor() ?? 'NONE';
        return Color.attrs[c];
      }),
      detectable_colors: fn('detectable_colors', ['colors?'], () => null),
      lights: new PyObject('Lights', { on: new NativeFn('on', () => null), off: new NativeFn('off', () => null) }),
    });
  });

  const notOnRobot = (name: string) =>
    new NativeFn(name, () => {
      throw new PyError('OSError', tr('e.noDevice', { name }));
    });

  // ---------- PrimeHub ----------
  let hubCreated = false;
  const PrimeHubCls = new NativeFn('PrimeHub', (args, kw) => {
    bind('PrimeHub', ['top_side?', 'front_side?', 'broadcast_channel?', 'observe_channels?'], args, kw);
    if (hubCreated) throw new PyError('OSError', tr('e.hubTwice'));
    hubCreated = true;
    const nf = (name: string, f: (args: any[], kw: Kwargs) => any) => new NativeFn(name, f);
    const display = new PyObject('Display', {
      text: nf('text', (a) => { world.log('display', String(a[0] ?? '')); world.advance(Math.max(1, String(a[0] ?? '').length) * 500 + 1000); return null; }),
      number: nf('number', (a) => { world.log('display', String(Math.round(toNumber(a[0])))); return null; }),
      char: nf('char', (a) => { world.log('display', String(a[0] ?? '')); return null; }),
      icon: nf('icon', () => null),
      off: nf('off', () => null),
      pixel: nf('pixel', () => null),
      orientation: nf('orientation', () => null),
    });
    const light = new PyObject('Light', {
      on: nf('on', (a) => {
        const c = a[0];
        world.light = c instanceof PyEnum ? c.name : null;
        return null;
      }),
      off: nf('off', () => { world.light = null; return null; }),
      blink: nf('blink', (a) => { world.light = a[0] instanceof PyEnum ? a[0].name : null; return null; }),
    });
    const speaker = new PyObject('Speaker', {
      beep: nf('beep', (a, k) => {
        const freq = a[0] ?? k.frequency ?? 500;
        const dur = a[1] ?? k.duration ?? 100;
        world.log('beep', tr('w.beep', { hz: Math.round(toNumber(freq)) }));
        world.advance(Math.max(0, toNumber(dur)));
        return null;
      }),
      volume: nf('volume', () => null),
      play_notes: nf('play_notes', () => null),
    });
    const imu = new PyObject('IMU', {
      heading: nf('heading', () => Math.round(world.imuHeading() * 10) / 10),
      reset_heading: nf('reset_heading', (a) => {
        const v = a[0] === undefined ? 0 : toNumber(a[0]);
        world.imuOffset = world.heading0 - world.pose.h - v;
        return null;
      }),
      tilt: nf('tilt', () => new PyTuple([0, 0])),
      ready: nf('ready', () => true),
      stationary: nf('stationary', () => true),
      angular_velocity: nf('angular_velocity', () => new PyTuple([0, 0, 0])),
      acceleration: nf('acceleration', () => new PyTuple([0, 0, 9810])),
      up: nf('up', () => Side.attrs.TOP),
    });
    const buttons = new PyObject('Buttons', { pressed: nf('pressed', () => new PyList([])) });
    const battery = new PyObject('Battery', { voltage: nf('voltage', () => 8000), current: nf('current', () => 150) });
    return new PyObject('PrimeHub', { display, light, speaker, imu, buttons, battery, system: new PyObject('System', { set_stop_button: nf('set_stop_button', () => null) }) });
  });

  // ---------- tools ----------
  const waitFn = new NativeFn('wait', (args, kw) => {
    const a = bind('wait', ['time'], args, kw);
    const ms = num(a.time, 'wait', 'time');
    if (ms > 0) world.advance(ms);
    return null;
  });
  const StopWatchCls = new NativeFn('StopWatch', () => {
    let start = world.t;
    let paused: number | null = null;
    return new PyObject('StopWatch', {
      time: new NativeFn('time', () => Math.round((paused ?? world.t) - start)),
      reset: new NativeFn('reset', () => { start = world.t; if (paused !== null) paused = world.t; return null; }),
      pause: new NativeFn('pause', () => { if (paused === null) paused = world.t; return null; }),
      resume: new NativeFn('resume', () => { if (paused !== null) { start += world.t - paused; paused = null; } return null; }),
    });
  });

  const umath: Record<string, any> = {
    pi: Math.PI, e: Math.E, inf: Infinity,
  };
  for (const f of ['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'log', 'floor', 'ceil', 'trunc'] as const) {
    umath[f] = new NativeFn(f, (a) => (Math as any)[f](toNumber(a[0])));
  }
  umath.atan2 = new NativeFn('atan2', (a) => Math.atan2(toNumber(a[0]), toNumber(a[1])));
  umath.fabs = new NativeFn('fabs', (a) => Math.abs(toNumber(a[0])));
  umath.pow = new NativeFn('pow', (a) => toNumber(a[0]) ** toNumber(a[1]));
  umath.degrees = new NativeFn('degrees', (a) => (toNumber(a[0]) * 180) / Math.PI);
  umath.radians = new NativeFn('radians', (a) => (toNumber(a[0]) * Math.PI) / 180);
  umath.copysign = new NativeFn('copysign', (a) => Math.abs(toNumber(a[0])) * (Math.sign(toNumber(a[1])) || 1));

  const parameters = { Port, Direction, Stop, Color, Button, Side, Axis, Icon };
  const pupdevices = {
    Motor: MotorCls,
    ColorSensor: ColorSensorCls,
    UltrasonicSensor: notOnRobot('UltrasonicSensor'),
    ForceSensor: notOnRobot('ForceSensor'),
    ColorDistanceSensor: notOnRobot('ColorDistanceSensor'),
  };
  const hubs = { PrimeHub: PrimeHubCls, InventorHub: PrimeHubCls };
  const robotics = { DriveBase: DriveBaseCls, GyroDriveBase: GyroDriveBaseCls };
  const tools = { wait: waitFn, StopWatch: StopWatchCls };

  const pybricks = new PyModule('pybricks', {});
  const mods: Record<string, PyModule> = {
    pybricks,
    'pybricks.parameters': new PyModule('pybricks.parameters', parameters),
    'pybricks.pupdevices': new PyModule('pybricks.pupdevices', pupdevices),
    'pybricks.hubs': new PyModule('pybricks.hubs', hubs),
    'pybricks.robotics': new PyModule('pybricks.robotics', robotics),
    'pybricks.tools': new PyModule('pybricks.tools', tools),
    umath: new PyModule('umath', umath),
  };
  for (const k of ['parameters', 'pupdevices', 'hubs', 'robotics', 'tools']) pybricks.attrs[k] = mods['pybricks.' + k];
  return mods;
}
