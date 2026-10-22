// Física simplificada do robô: motores com perfil de velocidade, cinemática diferencial
// e relógio simulado. Tudo em mm, graus e milissegundos, como no Pybricks.
import { t as tr } from '../i18n';
import { MAT_H, MAT_W, MatColor, MatSurface, TRAINING } from './mat';

export type PortName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Role = 'leftWheel' | 'rightWheel' | 'leftArm' | 'rightArm' | 'color';

export type AttachmentKind = 'none' | 'claw';

export interface RobotConfig {
  ports: Record<Role, PortName>;
  attachments: { left: AttachmentKind; right: AttachmentKind };
  wheelDiameter: number; // diâmetro real das rodas (mm)
  axleTrack: number; // distância real entre as rodas (mm)
}

export const DEFAULT_CONFIG: RobotConfig = {
  ports: { leftWheel: 'A', rightWheel: 'B', leftArm: 'C', rightArm: 'E', color: 'D' },
  attachments: { left: 'none', right: 'none' },
  wheelDiameter: 62.4,
  axleTrack: 150,
};

/** Geometria do modelo (mm), no referencial do robô: x para frente, y para a esquerda.
 *  Frente = lado do hub e do para-choque com rodízios; as rodas de tração ficam atrás. */
export const BODY = { front: 132, back: -36, half: 82 };
/** Quanto a garra avança à frente do para-choque (mm). */
export const CLAW_REACH = 106;
/** Ângulo do motor (graus) em que a garra fica toda aberta; 0 = fechada. */
export const CLAW_OPEN = 90;
/** Ponto que o sensor de cor lê no chão (lateral esquerda, perto da frente). */
export const SENSOR_POS = { x: 92, y: 66 };

export interface Pose { x: number; y: number; h: number } // h: graus, anti-horário a partir do eixo x do tapete

export interface Frame {
  t: number;
  x: number; y: number; h: number;
  wl: number; wr: number; // ângulo físico das rodas (graus)
  al: number; ar: number; // ângulo dos anexos (graus)
  line: number;
  light: string | null;
  /** Posição dos objetos de missão: x, y, giro (graus) de cada um. */
  objs?: number[];
}

/** Objeto de missão (caixa) que o robô pode empurrar ou pegar com a garra. */
export interface ObjSpec { id: string; x: number; y: number; size: number; color: string; rot?: number }
interface ObjState extends ObjSpec { rot: number; held: 'left' | 'right' | null }

export interface WorldOptions {
  /** Física realista: semente do sorteio de escorregamento das rodas. */
  realistic?: { seed: number } | null;
  objects?: ObjSpec[];
  surface?: MatSurface;
}

/** Gerador pseudoaleatório com semente (mesma semente, mesma rodada). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number) {
  const u = Math.max(1e-9, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

/** Região entre as mandíbulas da garra, no referencial do robô (mm). */
export const CLAW_GRIP = { fx: 214, ly: 46, r: 34 };

export interface SimEvent { t: number; kind: 'print' | 'beep' | 'display' | 'warn' | 'info'; text: string }

export const MOTOR_MAX = 1000; // graus/s (motor SPIKE, aproximado)
const MOTOR_ACCEL = 2000; // graus/s²
const DT = 5; // passo de integração em ms
const FRAME_EVERY = 20; // grava um quadro a cada 20 ms
export const MATCH_MS = 150_000; // partida da FLL: 2 min 30 s

export class TimeUp extends Error {}

interface Profile { T: number; pos: (t: number) => number; vel: (t: number) => number }

/** Perfil trapezoidal (ou triangular) para percorrer `delta` com velocidade e aceleração máximas. */
export function trapezoid(delta: number, vmax: number, acc: number): Profile {
  const sign = Math.sign(delta) || 1;
  const D = Math.abs(delta);
  vmax = Math.max(1e-6, Math.abs(vmax));
  acc = Math.max(1e-6, Math.abs(acc));
  let ta = vmax / acc;
  let da = 0.5 * acc * ta * ta;
  let tc: number;
  if (2 * da >= D) {
    ta = Math.sqrt(D / acc);
    da = D / 2;
    vmax = acc * ta;
    tc = 0;
  } else tc = (D - 2 * da) / vmax;
  const T = 2 * ta + tc;
  const pos = (t: number) => {
    if (t <= 0) return 0;
    if (t >= T) return sign * D;
    if (t < ta) return sign * 0.5 * acc * t * t;
    if (t < ta + tc) return sign * (da + vmax * (t - ta));
    const r = T - t;
    return sign * (D - 0.5 * acc * r * r);
  };
  const vel = (t: number) => {
    if (t <= 0 || t >= T) return 0;
    if (t < ta) return sign * acc * t;
    if (t < ta + tc) return sign * vmax;
    return sign * acc * (T - t);
  };
  return { T: T * 1000, pos: (ms) => pos(ms / 1000), vel: (ms) => vel(ms / 1000) };
}

type MotorCtrl =
  | { kind: 'idle' }
  | { kind: 'speed'; target: number; until?: number }
  | { kind: 'profile'; from: number; t0: number; prof: Profile }
  | { kind: 'base' };

export class SimMotor {
  angle = 0; // ângulo no sentido do usuário (já considerando Direction e engrenagens)
  speed = 0;
  offset = 0; // para reset_angle
  ctrl: MotorCtrl = { kind: 'idle' };
  base: SimDriveBase | null = null;
  constructor(public port: PortName, public role: Role | null, public dirSign: 1 | -1, public world: World) {}

  /** Ângulo físico do eixo do motor (sentido horário positivo). */
  get raw() { return this.angle * this.dirSign; }

  done() {
    const c = this.ctrl;
    if (c.kind === 'profile') return this.world.t >= c.t0 + c.prof.T;
    if (c.kind === 'speed') return c.until !== undefined ? this.world.t >= c.until : false;
    if (c.kind === 'base') return this.base ? this.base.done() : true;
    return true;
  }

  takeOver() {
    if (this.base && this.ctrl.kind === 'base') this.base.release();
  }

  step(dt: number) {
    const c = this.ctrl;
    const t = this.world.t;
    if (c.kind === 'idle') { this.speed = 0; return; }
    if (c.kind === 'base') return; // a DriveBase move este motor
    if (c.kind === 'profile') {
      const local = Math.min(t + dt - c.t0, c.prof.T);
      this.angle = c.from + c.prof.pos(local);
      this.speed = c.prof.vel(local);
      return;
    }
    // Controle de velocidade com rampa
    const target = c.until !== undefined && t >= c.until ? 0 : c.target;
    const dv = MOTOR_ACCEL * (dt / 1000);
    if (Math.abs(target - this.speed) <= dv) this.speed = target;
    else this.speed += Math.sign(target - this.speed) * dv;
    this.angle += this.speed * (dt / 1000);
    if (c.until !== undefined && t >= c.until && this.speed === 0) this.ctrl = { kind: 'idle' };
  }
}

type BaseCtrl =
  | { kind: 'idle' }
  | { kind: 'path'; t0: number; prof: Profile; dist: number; turn: number } // percorre fração do caminho
  | { kind: 'drive'; v: number; w: number; tv: number; tw: number };

export interface DriveSettings { straightSpeed: number; straightAccel: number; turnRate: number; turnAccel: number }

export class SimDriveBase {
  ctrl: BaseCtrl = { kind: 'idle' };
  // Integradores no referencial do usuário (o que distance() e angle() reportam)
  dist = 0;
  turn = 0;
  distOffset = 0;
  turnOffset = 0;
  settings: DriveSettings;
  useGyro = false;
  /** Rumo do robô (graus, anti-horário) quando a DriveBase foi criada. */
  h0: number;
  private progressDone = 0; // fração já aplicada do caminho atual

  constructor(public left: SimMotor, public right: SimMotor, public wheelDiameter: number, public axleTrack: number, public world: World) {
    this.h0 = world.pose.h;
    const wheelMax = (MOTOR_MAX * 0.4 * Math.PI * wheelDiameter) / 360;
    const turnMax = (wheelMax / (axleTrack / 2)) * (180 / Math.PI);
    this.settings = {
      straightSpeed: Math.round(wheelMax),
      straightAccel: Math.round(wheelMax * 4),
      turnRate: Math.round(turnMax),
      turnAccel: Math.round(turnMax * 4),
    };
  }

  attach() {
    for (const m of [this.left, this.right]) {
      m.base = this;
      m.ctrl = { kind: 'base' };
      m.speed = 0;
    }
  }

  release() {
    this.ctrl = { kind: 'idle' };
    for (const m of [this.left, this.right]) if (m.ctrl.kind === 'base') m.ctrl = { kind: 'idle' };
  }

  done() {
    const c = this.ctrl;
    if (c.kind === 'path') return this.world.t >= c.t0 + c.prof.T;
    if (c.kind === 'drive') return false;
    return true;
  }

  startPath(dist: number, turn: number, prof: Profile) {
    this.attach();
    this.ctrl = { kind: 'path', t0: this.world.t, prof, dist, turn };
    this.progressDone = 0;
  }

  startDrive(v: number, w: number) {
    const prev = this.ctrl;
    this.attach();
    if (prev.kind === 'drive') { prev.tv = v; prev.tw = w; this.ctrl = prev; }
    else this.ctrl = { kind: 'drive', v: 0, w: 0, tv: v, tw: w };
  }

  stop() {
    this.ctrl = { kind: 'idle' };
    this.attach();
  }

  /** Converte deslocamento (mm) e giro (graus horário) em giro das rodas e aplica. */
  private apply(ds: number, dturn: number) {
    const arc = (dturn * Math.PI) / 180 * (this.axleTrack / 2);
    const k = 360 / (Math.PI * this.wheelDiameter);
    this.left.angle += (ds + arc) * k;
    this.right.angle += (ds - arc) * k;
    this.dist += ds;
    this.turn += dturn;
  }

  /** Correção do giroscópio: gira as rodas sem mexer no que distance()/angle() contam. */
  correct(dturn: number) {
    const arc = (dturn * Math.PI) / 180 * (this.axleTrack / 2);
    const k = 360 / (Math.PI * this.wheelDiameter);
    this.left.angle += arc * k;
    this.right.angle -= arc * k;
  }

  get attached() {
    return this.left.ctrl.kind === 'base' && this.right.ctrl.kind === 'base';
  }

  step(dt: number) {
    const c = this.ctrl;
    const t = this.world.t;
    for (const m of [this.left, this.right]) m.speed = 0;
    if (c.kind === 'path') {
      const local = Math.min(t + dt - c.t0, c.prof.T);
      const frac = c.prof.T > 0 ? c.prof.pos(local) : 1;
      const df = frac - this.progressDone;
      this.progressDone = frac;
      this.apply(c.dist * df, c.turn * df);
    } else if (c.kind === 'drive') {
      const s = dt / 1000;
      const ramp = (cur: number, tgt: number, acc: number) => (Math.abs(tgt - cur) <= acc * s ? tgt : cur + Math.sign(tgt - cur) * acc * s);
      c.v = ramp(c.v, c.tv, this.settings.straightAccel);
      c.w = ramp(c.w, c.tw, this.settings.turnAccel);
      this.apply(c.v * s, c.w * s);
    }
  }
}

export class World {
  t = 0;
  pose: Pose;
  motors = new Map<PortName, SimMotor>();
  bases: SimDriveBase[] = [];
  frames: Frame[] = [];
  events: SimEvent[] = [];
  line = 0;
  light: string | null = null;
  heading0: number;
  imuOffset = 0;
  private lastFrame = -Infinity;
  private wl = 0;
  private wr = 0;
  private bumped = false;
  private micro = 0;
  /** Tempo máximo desta rodada (ms). */
  limit = MATCH_MS;
  surface: MatSurface;
  objects: ObjState[];
  /** Fatores físicos da rodada no modo realista (1 = ideal). */
  slip = { left: 1, right: 1, turn: 1, noise: 0 };
  private rand: (() => number) | null = null;
  private clawPrev = { left: 0, right: 0 };

  constructor(public config: RobotConfig, start: Pose, opts: WorldOptions = {}) {
    this.pose = { ...start };
    this.heading0 = start.h;
    this.surface = opts.surface ?? TRAINING;
    this.objects = (opts.objects ?? []).map((o) => ({ ...o, rot: o.rot ?? 0, held: null }));
    if (opts.realistic) {
      const r = rng(opts.realistic.seed);
      this.rand = r;
      // Cada roda "anda" um pouco diferente do diâmetro nominal e os giros escorregam.
      this.slip = {
        left: 1 + gauss(r) * 0.004,
        right: 1 + gauss(r) * 0.004,
        turn: 1 - (0.012 + Math.abs(gauss(r)) * 0.01),
        noise: 0.02,
      };
    }
    this.record(true);
  }

  log(kind: SimEvent['kind'], text: string) {
    this.events.push({ t: this.t, kind, text });
  }

  roleOf(port: PortName): Role | null {
    const entry = Object.entries(this.config.ports).find(([, p]) => p === port);
    return entry ? (entry[0] as Role) : null;
  }

  /** Avanço de tempo minúsculo para cada instrução do programa (o hub não é infinitamente rápido). */
  tickInstruction() {
    this.micro += 0.02;
    if (this.micro >= 1) {
      const ms = Math.floor(this.micro);
      this.micro -= ms;
      this.advance(ms);
    }
  }

  advance(ms: number) {
    let remaining = ms;
    while (remaining > 0) {
      const dt = Math.min(DT, remaining);
      if (this.t + dt > this.limit) {
        this.stepPhysics(this.limit - this.t);
        this.t = this.limit;
        this.record(true);
        throw new TimeUp();
      }
      this.stepPhysics(dt);
      this.t += dt;
      remaining -= dt;
      this.record(false);
    }
  }

  /** Avança até a condição ficar verdadeira (para comandos que esperam terminar). */
  waitUntil(cond: () => boolean, maxMs = this.limit) {
    const start = this.t;
    while (!cond()) {
      if (this.t - start > maxMs) break;
      this.advance(DT);
    }
  }

  private stepPhysics(dt: number) {
    for (const b of this.bases) b.step(dt);
    for (const m of this.motors.values()) m.step(dt);

    const { ports, wheelDiameter, axleTrack } = this.config;
    const L = this.motors.get(ports.leftWheel);
    const R = this.motors.get(ports.rightWheel);
    // Motor esquerdo é montado espelhado: girar no sentido horário leva o robô para trás.
    const wlNow = L && L.role === 'leftWheel' ? -L.raw : this.wl;
    const wrNow = R && R.role === 'rightWheel' ? R.raw : this.wr;
    const k = (Math.PI * wheelDiameter) / 360;
    let dl = (wlNow - this.wl) * k;
    let dr = (wrNow - this.wr) * k;
    this.wl = wlNow;
    this.wr = wrNow;
    this.updateClaws();
    if (dl === 0 && dr === 0) { this.gyroCorrect(dt); return; }
    if (this.rand) {
      dl *= this.slip.left * (1 + gauss(this.rand) * this.slip.noise);
      dr *= this.slip.right * (1 + gauss(this.rand) * this.slip.noise);
    }
    const ds = (dl + dr) / 2;
    let dth = (dr - dl) / axleTrack; // rad, anti-horário
    // Nos giros no lugar as rodas arrastam de lado e o robô gira um pouco menos.
    if (this.rand && Math.sign(dl) !== Math.sign(dr)) dth *= this.slip.turn;
    const p = this.pose;
    const hm = (p.h * Math.PI) / 180 + dth / 2;
    const next = { x: p.x + ds * Math.cos(hm), y: p.y + ds * Math.sin(hm), h: p.h + (dth * 180) / Math.PI };
    if (this.fits(next)) {
      this.pose = next;
      this.pushObjects();
    } else {
      // Bateu na borda: as rodas giram, mas o robô não sai da mesa.
      const rotOnly = { x: p.x, y: p.y, h: next.h };
      if (this.fits(rotOnly)) this.pose = rotOnly;
      if (!this.bumped) {
        this.bumped = true;
        this.log('warn', tr('w.wall'));
      }
    }
    this.gyroCorrect(dt);
  }

  /** Com use_gyro(True), a DriveBase corrige o rumo pelo giroscópio (rumo real do robô). */
  private gyroCorrect(dt: number) {
    for (const b of this.bases) {
      if (!b.useGyro || !b.attached) continue;
      const want = b.h0 - b.turn; // rumo pedido pelos comandos (anti-horário)
      let err = want - this.pose.h;
      err = ((((err + 180) % 360) + 360) % 360) - 180;
      if (Math.abs(err) < 1e-4) continue;
      b.correct(-err * Math.min(1, dt / 40));
    }
  }

  /** Corpo do robô (e braços das garras) como retângulos no tapete, para empurrar objetos. */
  private robotRects(): { fx0: number; fx1: number; ly0: number; ly1: number }[] {
    const rects = [{ fx0: BODY.back, fx1: BODY.front, ly0: -BODY.half, ly1: BODY.half }];
    const a = this.config.attachments;
    for (const [side, kind] of [[1, a.left], [-1, a.right]] as const) {
      if (kind !== 'claw') continue;
      rects.push({ fx0: BODY.front, fx1: 170, ly0: side * 46 - 8, ly1: side * 46 + 8 });
    }
    return rects;
  }

  private toRobot(x: number, y: number) {
    const r = (this.pose.h * Math.PI) / 180;
    const dx = x - this.pose.x;
    const dy = y - this.pose.y;
    return { fx: dx * Math.cos(r) + dy * Math.sin(r), ly: -dx * Math.sin(r) + dy * Math.cos(r) };
  }

  private toMat(fx: number, ly: number) {
    const r = (this.pose.h * Math.PI) / 180;
    return { x: this.pose.x + fx * Math.cos(r) - ly * Math.sin(r), y: this.pose.y + fx * Math.sin(r) + ly * Math.cos(r) };
  }

  private pushObjects() {
    if (!this.objects.length) return;
    const rects = this.robotRects();
    for (const o of this.objects) {
      if (o.held) continue;
      const rad = o.size / 2;
      for (const q of rects) {
        const p = this.toRobot(o.x, o.y);
        const cx = Math.max(q.fx0, Math.min(q.fx1, p.fx));
        const cy = Math.max(q.ly0, Math.min(q.ly1, p.ly));
        let nx = p.fx - cx;
        let ny = p.ly - cy;
        let d = Math.hypot(nx, ny);
        if (d >= rad) continue;
        if (d < 1e-6) {
          // Centro do objeto dentro do retângulo: sai pelo lado mais próximo
          const opts = [[p.fx - q.fx0, -1, 0], [q.fx1 - p.fx, 1, 0], [p.ly - q.ly0, 0, -1], [q.ly1 - p.ly, 0, 1]];
          opts.sort((a, b) => a[0] - b[0]);
          nx = opts[0][1];
          ny = opts[0][2];
          d = -opts[0][0];
        } else { nx /= d; ny /= d; }
        const push = rad - d;
        const np = this.toMat(p.fx + nx * push, p.ly + ny * push);
        o.x = Math.max(rad, Math.min(MAT_W - rad, np.x));
        o.y = Math.max(rad, Math.min(MAT_H - rad, np.y));
      }
    }
    this.carryHeld();
  }

  /** Objeto preso na garra acompanha o robô. */
  private carryHeld() {
    for (const o of this.objects) {
      if (!o.held) continue;
      const p = this.toMat(CLAW_GRIP.fx, (o.held === 'left' ? 1 : -1) * CLAW_GRIP.ly);
      o.x = p.x;
      o.y = p.y;
      o.rot = this.pose.h;
    }
  }

  /** Garra pega um objeto quando fecha com ele entre as mandíbulas e solta quando abre. */
  private updateClaws() {
    if (!this.objects.length) return;
    const a = this.config.attachments;
    for (const side of ['left', 'right'] as const) {
      if (a[side] !== 'claw') continue;
      const m = this.motors.get(this.config.ports[side === 'left' ? 'leftArm' : 'rightArm']);
      const ang = m ? m.raw : 0;
      const prev = this.clawPrev[side];
      this.clawPrev[side] = ang;
      const held = this.objects.find((o) => o.held === side);
      if (held && ang > CLAW_OPEN * 0.5) {
        held.held = null;
        this.log('info', tr('w.release'));
        continue;
      }
      if (!held && prev > CLAW_OPEN * 0.3 && ang <= CLAW_OPEN * 0.3) {
        const ly = (side === 'left' ? 1 : -1) * CLAW_GRIP.ly;
        const target = this.objects.find((o) => {
          if (o.held) return false;
          const p = this.toRobot(o.x, o.y);
          return Math.hypot(p.fx - CLAW_GRIP.fx, p.ly - ly) <= CLAW_GRIP.r;
        });
        if (target) {
          target.held = side;
          this.log('info', tr('w.grab'));
        }
      }
    }
    this.carryHeld();
  }

  private fits(p: Pose) {
    const r = (p.h * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    const a = this.config.attachments;
    const front = BODY.front + (a.left === 'claw' || a.right === 'claw' ? CLAW_REACH : 0);
    for (const [lx, ly] of [[front, BODY.half], [front, -BODY.half], [BODY.back, BODY.half], [BODY.back, -BODY.half]]) {
      const x = p.x + lx * c - ly * s;
      const y = p.y + lx * s + ly * c;
      if (x < 0 || y < 0 || x > MAT_W || y > MAT_H) return false;
    }
    return true;
  }

  record(force: boolean) {
    if (!force && this.t - this.lastFrame < FRAME_EVERY) return;
    this.lastFrame = this.t;
    const arm = (role: Role) => {
      const m = this.motors.get(this.config.ports[role]);
      return m && m.role === role ? m.raw : 0;
    };
    this.frames.push({
      t: this.t, x: this.pose.x, y: this.pose.y, h: this.pose.h,
      wl: this.wl, wr: this.wr, al: arm('leftArm'), ar: arm('rightArm'),
      line: this.line, light: this.light,
      objs: this.objects.length ? this.objects.flatMap((o) => [o.x, o.y, o.rot]) : undefined,
    });
  }

  /** Cor sob o sensor, em coordenadas do tapete. */
  sensorPoint() {
    const r = (this.pose.h * Math.PI) / 180;
    return {
      x: this.pose.x + SENSOR_POS.x * Math.cos(r) - SENSOR_POS.y * Math.sin(r),
      y: this.pose.y + SENSOR_POS.x * Math.sin(r) + SENSOR_POS.y * Math.cos(r),
    };
  }

  sensorColor(): MatColor | null {
    const p = this.sensorPoint();
    return this.surface.color(p.x, p.y);
  }

  /** Refletância média numa pequena área (o sensor real enxerga um círculo, não um ponto). */
  sensorReflection(): number {
    const p = this.sensorPoint();
    // Média ponderada num círculo de 8 mm: o centro pesa mais, como na mancha de luz do sensor real
    let sum = 0;
    let n = 0;
    for (let dx = -8; dx <= 8; dx += 0.8) {
      for (let dy = -8; dy <= 8; dy += 0.8) {
        const d2 = dx * dx + dy * dy;
        if (d2 > 64) continue;
        const w = 1 - d2 / 80;
        sum += w * this.surface.reflection(p.x + dx, p.y + dy);
        n += w;
      }
    }
    return Math.round(sum / n);
  }

  /** Rumo do giroscópio no padrão Pybricks: horário positivo, desde o início/reset. */
  imuHeading() {
    return this.heading0 - this.pose.h - this.imuOffset;
  }

  finish() {
    // No fim do programa o Pybricks para todos os motores.
    for (const b of this.bases) b.ctrl = { kind: 'idle' };
    for (const m of this.motors.values()) m.ctrl = { kind: 'idle' };
    this.record(true);
  }
}
