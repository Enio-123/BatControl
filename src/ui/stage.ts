// Palco de simulação: viewer 3D + barra de reprodução + leituras. Reutilizado na aba
// Simular e nos desafios de código.
import { t } from '../i18n';
import { RunResult } from '../sim/runner';
import { Frame, ObjSpec, Pose, SENSOR_POS } from '../sim/world';
import { MatSurface, PRINT, TRAINING } from '../sim/mat';
import { CameraMode, Target, Viewer } from '../three/viewer';
import { fmtTime, h, icon } from './dom';

export class Stage {
  el: HTMLElement;
  host: HTMLElement;
  hud: HTMLElement;
  tools: HTMLElement;
  transport: HTMLElement;
  private frames: Frame[] = [];
  private t = 0;
  private playing = false;
  private speed = 1;
  private raf = 0;
  private last = 0;
  private scrub: HTMLInputElement;
  private timeEl: HTMLElement;
  private playBtn: HTMLButtonElement;
  private readout: HTMLElement;
  private camBtns: HTMLButtonElement[] = [];
  private camMode: CameraMode = '3d';
  private startPose: Pose = { x: 0, y: 0, h: 0 };
  private targets: Target[] = [];
  private objects: ObjSpec[] = [];
  surface: MatSurface = TRAINING;
  /** Marcas extras na linha do tempo (início de cada saída na partida). */
  private marks: HTMLElement;
  onFrame: (f: Frame) => void = () => {};
  onEnd: () => void = () => {};

  constructor(private viewer: Viewer, opts: { compact?: boolean } = {}) {
    this.host = h('div', { class: 'stage-host' });
    this.readout = h('div', { class: 'readout', 'aria-live': 'off' });
    const cams: [CameraMode, string][] = [['3d', '3D'], ['top', t('stage.top')], ['follow', t('stage.follow')]];
    const camBar = h('div', { class: 'seg cam-seg', role: 'group', 'aria-label': t('stage.camera') },
      cams.map(([mode, label]) => {
        const b = h('button', { type: 'button', class: mode === '3d' ? 'on' : '', onclick: () => this.setCam(mode) }, label);
        b.dataset.mode = mode;
        this.camBtns.push(b);
        return b;
      }));
    this.tools = h('div', { class: 'stage-tools' });
    this.hud = h('div', { class: 'stage-hud' }, camBar, this.tools);
    this.host.append(this.hud, this.readout);

    this.playBtn = h('button', { type: 'button', class: 'icon-btn play-btn', 'aria-label': t('stage.play'), onclick: () => this.toggle() }, icon('play'));
    this.scrub = h('input', { type: 'range', min: '0', max: '0', step: '10', value: '0', 'aria-label': t('stage.timeline'), class: 'scrub' });
    this.scrub.addEventListener('input', () => { this.pause(); this.seek(Number(this.scrub.value)); });
    this.timeEl = h('span', { class: 'time mono' }, '0:00.0');
    const speedSel = h('select', { class: 'speed', 'aria-label': t('stage.speed') },
      ['0.5', '1', '2', '4'].map((s) => h('option', { value: s, selected: s === '1' }, `${s}×`)));
    speedSel.addEventListener('change', () => (this.speed = Number(speedSel.value)));
    this.marks = h('div', { class: 'scrub-marks', 'aria-hidden': 'true' });
    this.transport = h('div', { class: 'transport' }, this.playBtn, h('div', { class: 'scrub-wrap' }, this.scrub, this.marks), this.timeEl, speedSel);
    this.el = h('div', { class: opts.compact ? 'stage compact' : 'stage' }, this.host, this.transport);
  }

  mount() {
    this.viewer.mount(this.host);
    this.viewer.setCamera(this.camMode);
    this.viewer.setTargets(this.targets);
    this.viewer.setObjects(this.objects);
    this.render();
  }

  setCam(mode: CameraMode) {
    this.camMode = mode;
    this.camBtns.forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
    this.viewer.setCamera(mode);
  }

  get cam() { return this.camMode; }

  setScene(start: Pose, targets: Target[] = [], objects: ObjSpec[] = []) {
    this.pause();
    this.startPose = start;
    this.targets = targets;
    this.objects = objects;
    this.frames = [];
    this.t = 0;
    this.scrub.max = '0';
    this.scrub.value = '0';
    this.marks.replaceChildren();
    this.viewer.setTargets(targets);
    this.viewer.setObjects(objects);
    this.render();
  }

  load(r: RunResult, marks: number[] = []) {
    this.frames = r.frames;
    this.t = 0;
    this.scrub.max = String(this.duration);
    this.viewer.resetObjects(this.objects);
    this.marks.replaceChildren(...marks.map((m) => h('i', { style: `left:${this.duration ? (m / this.duration) * 100 : 0}%` })));
    this.render();
  }

  get duration() {
    return this.frames.length ? this.frames[this.frames.length - 1].t : 0;
  }

  get isPlaying() { return this.playing; }

  play() {
    if (!this.frames.length) return;
    if (this.t >= this.duration) this.t = 0;
    this.playing = true;
    this.playBtn.replaceChildren(icon('pause'));
    this.playBtn.setAttribute('aria-label', t('stage.pause'));
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    const loop = (now: number) => {
      const dt = Math.min(100, now - this.last) * this.speed;
      this.last = now;
      this.t = Math.min(this.duration, this.t + dt);
      this.render();
      if (this.t >= this.duration) {
        this.pause();
        this.onEnd();
        return;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  pause() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.playBtn.replaceChildren(icon('play'));
    this.playBtn.setAttribute('aria-label', t('stage.play'));
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Pula direto para o fim (para quem prefere não esperar a animação). */
  skipToEnd() {
    this.pause();
    this.seek(this.duration);
    this.onEnd();
  }

  seek(t: number) {
    this.t = Math.max(0, Math.min(this.duration, t));
    this.render();
  }

  get time() { return this.t; }

  frameAt(t: number): Frame {
    const fs = this.frames;
    if (!fs.length) {
      const p = this.startPose;
      return { t: 0, x: p.x, y: p.y, h: p.h, wl: 0, wr: 0, al: 0, ar: 0, line: 0, light: null };
    }
    let lo = 0;
    let hi = fs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (fs[mid].t <= t) lo = mid; else hi = mid - 1;
    }
    const a = fs[lo];
    const b = fs[Math.min(lo + 1, fs.length - 1)];
    if (b === a || b.t === a.t) return a;
    const k = (t - a.t) / (b.t - a.t);
    const lerp = (x: number, y: number) => x + (y - x) * k;
    return {
      ...a, x: lerp(a.x, b.x), y: lerp(a.y, b.y), h: lerp(a.h, b.h), wl: lerp(a.wl, b.wl), wr: lerp(a.wr, b.wr), al: lerp(a.al, b.al), ar: lerp(a.ar, b.ar),
      objs: a.objs && b.objs && a.objs.length === b.objs.length ? a.objs.map((v, i) => lerp(v, b.objs![i])) : a.objs,
    };
  }

  private trailIndex(t: number) {
    const fs = this.frames;
    let lo = 0;
    let hi = fs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (fs[mid].t <= t) lo = mid; else hi = mid - 1;
    }
    return lo;
  }

  render() {
    const f = this.frameAt(this.t);
    this.viewer.setFrame(f);
    this.viewer.setTrail(this.frames, this.frames.length ? this.trailIndex(this.t) : -1);
    this.scrub.value = String(this.t);
    this.timeEl.textContent = `${fmtTime(this.t)} / ${fmtTime(this.duration)}`;
    // Rumo no padrão do Pybricks (horário positivo a partir da largada)
    const heading = Math.round(this.startPose.h - f.h);
    const r = (f.h * Math.PI) / 180;
    const sx = f.x + SENSOR_POS.x * Math.cos(r) - SENSOR_POS.y * Math.sin(r);
    const sy = f.y + SENSOR_POS.x * Math.sin(r) + SENSOR_POS.y * Math.cos(r);
    const c = this.surface.color(sx, sy);
    const cname = c ? t('color.' + c) : t('stage.offMat');
    this.readout.replaceChildren(
      h('span', {}, h('b', {}, 'x '), `${Math.round(f.x)}`),
      h('span', {}, h('b', {}, 'y '), `${Math.round(f.y)}`),
      h('span', {}, `${heading}°`),
      h('span', { class: 'sensor-dot', title: `${t('stage.sensor')}: ${cname}` }, h('i', { style: `background:${c ? PRINT[c] : 'transparent'}` }), cname),
    );
    this.onFrame(f);
  }
}
