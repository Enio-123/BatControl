// Aba Simular: palco 3D em destaque e painel com Código, Saída, Robô e Partida.
// Ferramentas do palco: régua (toque em pontos do tapete para gerar straight/turn), rastro
// fantasma da rodada anterior e tela cheia na horizontal com controles flutuantes.
import { t } from '../i18n';
import { TOPICS } from '../content/reference';
import { program, setupFor, START, START2 } from '../content/setup';
import { localizeCode, topicText } from '../content/text';
import { BASE2 } from '../sim/mat';
import { OBJECT_PRESETS, presetObjects } from '../sim/objects';
import { MatchResult, runMatch, runProgram, RunResult } from '../sim/runner';
import { AttachmentKind, Frame, Pose, PortName, Role, WorldOptions } from '../sim/world';
import { TRAINING } from '../sim/mat';
import { MatchRun, save, state } from '../store';
import { Viewer } from '../three/viewer';
import { BlocksEditor, splitSetup } from './blocks';
import { ConsoleView } from './console';
import { buzz, fill, fmtTime, h, icon, iconBtn, segmented, toast, toggle } from './dom';
import { CodeEditor } from './editor';
import { openHub } from './hubsheet';
import { addProgram, byId, current, ensureLibrary, openLibrary, openShare, updateCurrent } from './library';
import { importPhoto, MatPhoto, removePhoto, savedPhoto } from './photo';
import { Stage } from './stage';

export const defaultCode = () => localizeCode(program(`# Leave the base, go to the red zone and come back
robo.straight(800)
robo.turn(90)
robo.turn(-90)
robo.straight(-800)
hub.speaker.beep()`));

const clawDemo = () => localizeCode(program(`# Claws: 0 degrees = closed, 90 degrees = open
anexo_left.run_angle(300, 90, wait=False)
anexo_right.run_angle(300, 90)
robo.straight(466)
# Close both claws on the crates
anexo_left.run_angle(300, -90, wait=False)
anexo_right.run_angle(300, -90)
robo.straight(-466)`));

/** Comandos rápidos para montar o programa tocando, sem digitar tudo no celular. */
const QUICK: [string, string][] = [
  ['quick.forward', 'robo.straight(200)'],
  ['quick.back', 'robo.straight(-200)'],
  ['quick.right', 'robo.turn(90)'],
  ['quick.left', 'robo.turn(-90)'],
  ['quick.curve', 'robo.curve(200, 90)'],
  ['quick.openL', 'anexo_left.run_angle(300, 90)'],
  ['quick.closeL', 'anexo_left.run_angle(300, -90)'],
  ['quick.openR', 'anexo_right.run_angle(300, 90)'],
  ['quick.closeR', 'anexo_right.run_angle(300, -90)'],
  ['quick.wait', 'wait(500)'],
  ['quick.repeat', 'for i in range(4):'],
  ['quick.beep', 'hub.speaker.beep()'],
];

type Panel = 'code' | 'out' | 'robot' | 'match';

const norm360 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

// ---------- Régua ----------

/** Rota tocada no tapete: cada ponto vira um turn (se precisar) e um straight. */
class RulerTool {
  active = false;
  points: { x: number; y: number }[] = [];
  el: HTMLElement;
  private list: HTMLElement;
  private down: { x: number; y: number } | null = null;

  constructor(private viewer: Viewer, private host: HTMLElement, private startPose: () => Pose, private insert: (code: string) => void, private onClose: () => void) {
    this.list = h('ol', { class: 'ruler-list' });
    this.el = h('div', { class: 'ruler-panel', hidden: true, role: 'region', 'aria-label': t('ruler.title') },
      h('div', { class: 'ruler-head' },
        h('strong', {}, icon('ruler', 16), t('ruler.title')),
        iconBtn('close', t('ruler.close'), () => this.toggle(false), 'icon-btn small')),
      h('p', { class: 'muted small ruler-help' }, t('ruler.help')),
      this.list,
      h('div', { class: 'ruler-actions' },
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => { this.points.pop(); this.refresh(); } }, t('ruler.undo')),
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => { this.points = []; this.refresh(); } }, t('ruler.clear')),
        h('button', { type: 'button', class: 'btn primary small', onclick: () => { const c = this.code(); if (c) { this.insert(c); buzz('ok'); toast(t('ruler.inserted'), 'ok'); } } }, icon('plus', 14), t('ruler.insert'))));
    host.addEventListener('pointerdown', (e) => { if (this.active) this.down = { x: e.clientX, y: e.clientY }; });
    host.addEventListener('pointerup', (e) => {
      if (!this.active || !this.down) return;
      const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y);
      this.down = null;
      if (moved > 6) return; // foi um arrasto de câmera, não um toque
      if ((e.target as HTMLElement).closest('button, .ruler-panel, .stage-hud, .readout')) return;
      const p = this.viewer.pick(e.clientX, e.clientY);
      if (!p) return;
      this.points.push({ x: Math.round(p.x), y: Math.round(p.y) });
      buzz('tap');
      this.refresh();
    });
  }

  toggle(on = !this.active) {
    this.active = on;
    this.el.hidden = !on;
    this.host.classList.toggle('ruling', on);
    if (!on) { this.points = []; this.onClose(); }
    this.refresh();
  }

  /** Comandos de cada trecho, partindo da largada. turn() positivo = horário (padrão Pybricks). */
  steps() {
    const s = this.startPose();
    let x = s.x, y = s.y, hd = s.h;
    return this.points.map((p) => {
      const dist = Math.hypot(p.x - x, p.y - y);
      const want = (Math.atan2(p.y - y, p.x - x) * 180) / Math.PI;
      let turn = -norm360(want - hd);
      let d = dist;
      // Se for mais curto ir de ré, gira menos e anda para trás
      if (Math.abs(turn) > 120) { turn = -norm360(want + 180 - hd); d = -dist; }
      hd -= turn;
      x = p.x; y = p.y;
      return { turn: Math.round(turn), dist: Math.round(d) };
    });
  }

  code() {
    return this.steps().flatMap((s) => [s.turn ? `robo.turn(${s.turn})` : '', s.dist ? `robo.straight(${s.dist})` : '']).filter(Boolean).join('\n');
  }

  refresh() {
    const s = this.startPose();
    this.viewer.setRuler(this.active && this.points.length ? [{ x: s.x, y: s.y }, ...this.points] : []);
    this.el.classList.toggle('has-points', this.points.length > 0);
    const steps = this.steps();
    this.list.replaceChildren(...(steps.length
      ? steps.map((st, i) => h('li', {}, h('span', { class: 'muted small' }, `${i + 1}`),
          h('span', { class: 'mono' }, [st.turn ? `turn(${st.turn})` : '', `straight(${st.dist})`].filter(Boolean).join('  ')),
          h('span', { class: 'muted small' }, `${Math.abs(st.dist)} mm`)))
      : [h('li', { class: 'muted small empty' }, t('ruler.empty'))]));
  }
}

// ---------- Aba ----------

export class SimTab {
  el: HTMLElement;
  editor!: CodeEditor;
  blocks = new BlocksEditor();
  stage: Stage;
  console = new ConsoleView();
  private start: Pose;
  private status: HTMLElement;
  private panels = new Map<Panel, HTMLElement>();
  private panelBtns = new Map<Panel, HTMLButtonElement>();
  private result: RunResult | null = null;
  private match: MatchResult | null = null;
  private prevFrames: Frame[] | null = null;
  private ruler: RulerTool;
  private photo: MatPhoto | null = null;
  private progName: HTMLElement;
  private editorHost: HTMLElement;
  private quick: HTMLElement;
  private modeSeg!: HTMLElement;
  private matchPanel: HTMLElement;
  private matchSummary: HTMLElement;
  private fsBtn: HTMLButtonElement;
  private ghostBtn: HTMLButtonElement;
  private rulerBtn: HTMLButtonElement;
  private shownAttach = '';

  constructor(private viewer: Viewer) {
    ensureLibrary(defaultCode);
    this.start = state.start ?? { ...START };
    this.stage = new Stage(viewer);
    this.status = h('button', { type: 'button', class: 'status-line', onclick: () => this.showPanel('out') }, t('sim.ready'));

    // Código
    this.editorHost = h('div', { class: 'editor-host' });
    this.quick = h('div', { class: 'quick', role: 'toolbar', 'aria-label': t('sim.quick') },
      QUICK.map(([key, code]) => h('button', { type: 'button', class: 'chip-btn', title: code, onclick: () => { this.editor.insertLine(code); buzz('tap'); } }, t(key))));
    this.progName = h('span', { class: 'prog-name' });
    this.modeSeg = segmented<'python' | 'blocks'>([['python', 'Python'], ['blocks', t('sim.blocks')]], state.prefs.editor, (v) => this.setMode(v), t('sim.editorMode'));
    // Ícone + nome (o nome some em telas estreitas)
    this.modeSeg.querySelectorAll('button').forEach((b, i) => { const text = b.textContent ?? ''; b.replaceChildren(icon(i === 0 ? 'code' : 'blocks', 16), h('span', { class: 'lbl' }, text)); b.setAttribute('aria-label', text); b.title = text; });
    const codeHead = h('div', { class: 'code-head' },
      h('button', { type: 'button', class: 'prog-btn', 'aria-label': t('lib.title'), title: t('lib.title'), onclick: () => openLibrary((p) => this.openProgram(p.code)) }, icon('folder', 16), this.progName, icon('down', 14)),
      this.modeSeg,
      h('div', { class: 'code-actions' },
        iconBtn('share', t('share.short'), () => openShare(current())),
        iconBtn('bluetooth', t('hub.title'), () => openHub(() => this.code, this.console, () => this.showPanel('out')))));
    const codePanel = h('div', { class: 'panel code-panel' }, codeHead, this.quick, this.editorHost, this.blocks.el, this.status);
    const outPanel = h('div', { class: 'panel out-panel' }, this.console.el);
    const robotPanel = h('div', { class: 'panel robot-panel' });
    this.matchSummary = h('div', { class: 'match-summary', 'aria-live': 'polite' });
    this.matchPanel = h('div', { class: 'panel match-panel' });
    this.panels.set('code', codePanel).set('out', outPanel).set('robot', robotPanel).set('match', this.matchPanel);

    const tabs = h('div', { class: 'panel-tabs', role: 'tablist', 'aria-label': t('sim.panel') },
      ([['code', 'sim.code', 'code'], ['out', 'sim.out', 'info'], ['robot', 'sim.robot', 'robot'], ['match', 'sim.match', 'timer']] as [Panel, string, Parameters<typeof icon>[0]][]).map(([id, key, ic]) => {
        const b = h('button', { type: 'button', role: 'tab', onclick: () => this.showPanel(id) }, icon(ic, 16), h('span', {}, t(key)));
        this.panelBtns.set(id, b);
        return b;
      }));

    const runBtn = h('button', { type: 'button', class: 'btn primary run-btn', onclick: () => this.run() }, icon('play', 18), t('sim.run'));
    const resetBtn = h('button', { type: 'button', class: 'btn ghost', onclick: () => this.reset(), 'aria-label': t('sim.resetLabel') }, icon('restart', 18), h('span', { class: 'hide-sm' }, t('sim.reset')));

    // Ferramentas do palco
    this.ruler = new RulerTool(viewer, this.stage.host, () => this.start, (c) => this.insertCode(c), () => this.rulerBtn?.classList.remove('on'));
    this.rulerBtn = iconBtn('ruler', t('ruler.title'), () => { this.ruler.toggle(); this.rulerBtn.classList.toggle('on', this.ruler.active); if (this.ruler.active) this.stage.setCam('top'); }, 'icon-btn tool');
    this.ghostBtn = iconBtn('ghost', t('sim.ghost'), () => this.setGhost(!state.prefs.ghost), 'icon-btn tool');
    this.ghostBtn.classList.toggle('on', state.prefs.ghost);
    this.fsBtn = iconBtn('expand', t('sim.fullscreen'), () => this.toggleFullscreen(), 'icon-btn tool');
    this.stage.tools.append(this.rulerBtn, this.ghostBtn, this.fsBtn);
    this.stage.host.append(this.ruler.el);
    // Controles flutuantes na tela cheia
    const floatBar = h('div', { class: 'float-bar' },
      h('button', { type: 'button', class: 'btn ghost float', onclick: () => this.reset(), 'aria-label': t('sim.resetLabel') }, icon('restart', 18)),
      h('button', { type: 'button', class: 'btn primary float', onclick: () => this.run(), 'aria-label': t('sim.run') }, icon('play', 18), t('sim.run')));
    this.stage.host.append(floatBar);

    this.el = h('section', { class: 'sim-tab', 'aria-label': t('nav.sim') },
      h('div', { class: 'stage-pane' }, this.stage.el),
      h('div', { class: 'side-pane' },
        tabs,
        codePanel, outPanel, robotPanel, this.matchPanel,
        h('div', { class: 'action-bar' }, resetBtn, runBtn)),
    );

    this.editor = new CodeEditor(this.editorHost, current().code, {
      onChange: (code) => {
        updateCurrent(code);
        this.editor.mark(null);
      },
    });
    this.editor.foldSetup();
    this.blocks.onChange = (code) => { this.editor.code = code; updateCurrent(code); };
    this.stage.onFrame = (f) => {
      if (this.stage.time > 0 && !this.match) this.editor.mark(f.line || null);
      this.console.update(this.stage.time);
      this.liveStatus();
      this.matchAttachments();
    };
    this.stage.onEnd = () => this.finish();
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && this.el.classList.contains('fs')) this.setFs(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.el.classList.contains('fs') && !document.fullscreenElement) this.setFs(false); });

    this.renderRobotPanel();
    this.renderMatchPanel();
    this.refreshProgName();
    this.setMode(state.prefs.editor, true);
    this.applyScene();
    this.console.clear();
    this.showPanel('code');
    // A foto do tapete pode demorar um pouco para ser lida
    void savedPhoto().then((p) => { this.photo = p; if (state.prefs.mat === 'photo') this.applyMat(); });
  }

  get code() { return this.editor.code; }

  show() {
    this.viewer.setAttachments(state.config.attachments);
    this.shownAttach = '';
    this.applyMat();
    this.stage.mount();
    this.ruler.refresh();
    this.viewer.setGhost(state.prefs.ghost ? this.prevFrames : null);
  }

  hide() {
    this.stage.pause();
    this.viewer.setGhost(null);
    this.viewer.setRuler([]);
    if (this.el.classList.contains('fs')) this.setFs(false);
  }

  showPanel(id: Panel) {
    for (const [k, p] of this.panels) p.hidden = k !== id;
    for (const [k, b] of this.panelBtns) {
      b.classList.toggle('on', k === id);
      b.setAttribute('aria-selected', String(k === id));
    }
    this.el.dataset.panel = id;
  }

  private refreshProgName() {
    this.progName.textContent = current().name;
  }

  /** Abre um programa da biblioteca no editor. */
  openProgram(code: string) {
    this.editor.code = code;
    this.editor.foldSetup();
    if (state.prefs.editor === 'blocks' && !this.blocks.load(code)) this.setMode('python');
    this.refreshProgName();
    this.reset();
    this.showPanel('code');
  }

  /** Abre um exemplo como programa novo (sem apagar o programa atual). */
  open(code: string, start?: Pose, name = t('lib.example')) {
    addProgram(name, code);
    this.start = start ?? state.start ?? { ...START };
    this.openProgram(code);
  }

  private insertCode(lines: string) {
    if (state.prefs.editor === 'blocks') this.setMode('python');
    lines.split('\n').forEach((l) => this.editor.insertLine(l));
    updateCurrent(this.editor.code);
  }

  private setMode(mode: 'python' | 'blocks', initial = false) {
    if (mode === 'blocks' && !this.blocks.load(this.editor.code)) {
      if (!initial) toast(t('blocks.cannot'), 'err');
      mode = 'python';
    }
    state.prefs.editor = mode;
    save();
    this.editorHost.hidden = mode !== 'python';
    this.quick.hidden = mode !== 'python';
    this.blocks.el.hidden = mode !== 'blocks';
    this.modeSeg.querySelectorAll('button').forEach((b, i) => {
      const on = (i === 0 ? 'python' : 'blocks') === mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
    if (mode === 'python' && !initial) this.editor.foldSetup();
  }

  private worldOpts(): WorldOptions {
    return {
      objects: presetObjects(state.prefs.objects),
      realistic: state.prefs.realistic ? { seed: (Math.random() * 1e9) | 0 } : null,
      surface: state.prefs.mat === 'photo' && this.photo ? this.photo.surface : TRAINING,
    };
  }

  private applyScene() {
    this.stage.setScene(this.start, [], presetObjects(state.prefs.objects));
  }

  private applyMat() {
    const usePhoto = state.prefs.mat === 'photo' && this.photo;
    this.viewer.setMatPhoto(usePhoto ? this.photo!.canvas : null);
    this.stage.surface = usePhoto ? this.photo!.surface : TRAINING;
    this.stage.render();
  }

  private setGhost(on: boolean) {
    state.prefs.ghost = on;
    save();
    this.ghostBtn.classList.toggle('on', on);
    this.viewer.setGhost(on ? this.prevFrames : null);
    toast(on ? t('sim.ghostOn') : t('sim.ghostOff'));
  }

  private keepGhost() {
    const frames = this.match?.frames ?? this.result?.frames ?? null;
    if (frames && frames.length > 1) this.prevFrames = frames;
    this.viewer.setGhost(state.prefs.ghost ? this.prevFrames : null);
  }

  run() {
    this.keepGhost();
    this.match = null;
    this.matchSummary.replaceChildren();
    const code = this.editor.code;
    const r = runProgram(code, state.config, this.start, this.worldOpts());
    this.result = r;
    this.applyScene();
    this.stage.load(r);
    this.console.load(r);
    this.viewer.setAttachments(state.config.attachments);
    buzz('tap');
    if (r.error && r.final.t === 0) {
      this.finish();
      return;
    }
    this.setStatus(t('sim.running'));
    this.stage.play();
  }

  private setStatus(text: string, kind: '' | 'err' | 'ok' = '') {
    this.status.textContent = text;
    this.status.className = `status-line ${kind}`;
  }

  /** Mostra a última mensagem do programa enquanto a animação roda. */
  private liveStatus() {
    const r = this.match ?? this.result;
    if (!r || this.stage.time >= this.stage.duration) return;
    const last = [...r.events].reverse().find((e) => e.t <= this.stage.time);
    this.setStatus(last ? `${fmtTime(last.t)}  ${last.text}` : `${t('sim.running')} ${fmtTime(this.stage.time)}`);
  }

  private finish() {
    this.console.update(this.stage.time, true);
    if (this.match) { this.finishMatch(); return; }
    const r = this.result;
    if (!r) return;
    this.editor.mark(null, r.error?.line ?? null);
    if (r.error) { this.setStatus(t('sim.errorAt', { line: r.error.line ?? '?', type: r.error.type, msg: r.error.message }), 'err'); buzz('bad'); }
    else if (r.timeUp) { this.setStatus(t('sim.timeUp'), 'err'); buzz('bad'); }
    else { this.setStatus(t('sim.finished', { time: fmtTime(r.final.t) }), 'ok'); buzz('end'); }
  }

  reset() {
    this.applyScene();
    this.console.clear();
    this.editor.mark(null);
    this.result = null;
    this.match = null;
    this.matchSummary.replaceChildren();
    this.viewer.setAttachments(state.config.attachments);
    this.setStatus(t('sim.ready'));
    this.ruler.refresh();
  }

  // ---------- Tela cheia ----------

  private toggleFullscreen() {
    this.setFs(!this.el.classList.contains('fs'));
  }

  private setFs(on: boolean) {
    this.el.classList.toggle('fs', on);
    document.body.classList.toggle('sim-fs', on);
    this.fsBtn.replaceChildren(icon(on ? 'shrink' : 'expand'));
    this.fsBtn.setAttribute('aria-label', on ? t('sim.exitFullscreen') : t('sim.fullscreen'));
    this.fsBtn.title = on ? t('sim.exitFullscreen') : t('sim.fullscreen');
    if (on) {
      // Tela cheia de verdade quando o navegador deixa; senão, só ocupa a janela
      const req = this.el.requestFullscreen?.bind(this.el);
      req?.({ navigationUI: 'hide' }).then(() => (screen.orientation as any)?.lock?.('landscape').catch(() => {})).catch(() => {});
    } else if (document.fullscreenElement) {
      (screen.orientation as any)?.unlock?.();
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => this.viewer.resize(), 60);
  }

  // ---------- Painel Robô ----------

  private renderRobotPanel() {
    const panel = this.panels.get('robot')!;
    const attach = (side: 'left' | 'right', label: string, port: string) =>
      h('div', { class: 'attach-row' },
        h('div', {}, h('strong', {}, label), h('p', { class: 'muted small' }, t('robot.motorPort', { port }))),
        segmented<AttachmentKind>([['none', t('robot.none')], ['claw', t('robot.claw')]], state.config.attachments[side], (kind) => {
          state.config.attachments[side] = kind;
          save();
          this.viewer.setAttachments(state.config.attachments);
          this.reset();
        }, label));

    const presetNames: Record<string, string> = { none: t('objects.none'), push: t('objects.push'), claw: t('objects.claw') };
    const objects = segmented(Object.keys(OBJECT_PRESETS).map((k) => [k, presetNames[k] ?? k] as [string, string]), state.prefs.objects, (v) => {
      state.prefs.objects = v;
      save();
      this.reset();
    }, t('objects.title'));

    // Tapete: treino ou foto do tapete oficial
    const photoMsg = h('p', { class: 'muted small', role: 'status' });
    const matSeg = h('div', { class: 'mat-choice' });
    const renderMat = () => {
      const has = !!this.photo;
      matSeg.replaceChildren(
        segmented<'training' | 'photo'>([['training', t('mat.training')], ['photo', t('mat.photo')]], has ? state.prefs.mat : 'training', (v) => {
          if (v === 'photo' && !this.photo) { fileInput.click(); return; }
          state.prefs.mat = v;
          save();
          this.applyMat();
        }, t('mat.title')),
        h('div', { class: 'row-actions' },
          h('label', { class: 'btn ghost small file-btn' }, icon('camera', 14), has ? t('mat.replace') : t('mat.import'), fileInput),
          has ? h('button', { type: 'button', class: 'btn ghost small', onclick: () => { removePhoto(); this.photo = null; state.prefs.mat = 'training'; save(); this.applyMat(); renderMat(); photoMsg.textContent = ''; } }, icon('trash', 14), t('mat.remove')) : null));
    };
    const fileInput = h('input', { type: 'file', accept: 'image/*', onchange: async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      try {
        const { photo, stored } = await importPhoto(file);
        this.photo = photo;
        state.prefs.mat = 'photo';
        save();
        this.applyMat();
        renderMat();
        photoMsg.textContent = stored ? t('mat.saved') : t('mat.notStored');
        buzz('ok');
      } catch {
        photoMsg.textContent = t('mat.failed');
        buzz('bad');
      }
    } });
    renderMat();

    const exampleIds = ['straight', 'turn', 'curve', 'gyro', 'drive', 'color', 'pid', 'for', 'def'];
    const examples = h('div', { class: 'example-list' },
      h('button', { type: 'button', class: 'example', onclick: () => {
        state.config.attachments = { left: 'claw', right: 'claw' };
        state.prefs.objects = 'claw';
        save();
        this.renderRobotPanel();
        this.open(clawDemo(), { ...START }, t('robot.clawDemo'));
        this.viewer.setAttachments(state.config.attachments);
      } }, h('strong', {}, t('robot.clawDemo')), h('span', { class: 'muted small' }, t('robot.clawDemoDesc'))),
      TOPICS.filter((x) => exampleIds.includes(x.id)).map((x) =>
        h('button', { type: 'button', class: 'example', onclick: () => this.open(localizeCode(x.example), x.start, topicText(x.id).title) },
          h('strong', {}, topicText(x.id).title), h('span', { class: 'muted small mono' }, x.signature ?? ''))));

    panel.replaceChildren(
      h('section', { class: 'robot-sec' },
        h('h3', {}, t('robot.attachments')),
        h('p', { class: 'muted small' }, t('robot.clawHelp')),
        attach('left', t('robot.leftSide'), state.config.ports.leftArm),
        attach('right', t('robot.rightSide'), state.config.ports.rightArm)),
      h('section', { class: 'robot-sec' },
        h('h3', {}, t('objects.title')),
        h('p', { class: 'muted small' }, t('objects.help')),
        objects),
      h('section', { class: 'robot-sec' },
        h('h3', {}, t('mat.title')),
        h('p', { class: 'muted small' }, t('mat.help')),
        matSeg, photoMsg),
      h('section', { class: 'robot-sec' },
        h('h3', {}, t('robot.physics')),
        toggle(t('robot.realistic'), state.prefs.realistic, (v) => { state.prefs.realistic = v; save(); }, t('robot.realisticDesc')),
        toggle(t('sim.ghost'), state.prefs.ghost, (v) => this.setGhost(v), t('sim.ghostDesc'))),
      h('section', { class: 'robot-sec' }, h('h3', {}, t('robot.examples')), examples),
      h('details', { class: 'robot-sec' }, h('summary', {}, t('robot.config')), this.buildConfigForm()),
      h('details', { class: 'robot-sec' }, h('summary', {}, t('calib.title')), this.buildCalibration()),
    );
  }

  private buildConfigForm(): HTMLFormElement {
    const ports: PortName[] = ['A', 'B', 'C', 'D', 'E', 'F'];
    const roles: [Role, string][] = [
      ['leftWheel', t('robot.leftWheel')], ['rightWheel', t('robot.rightWheel')], ['leftArm', t('robot.leftArm')], ['rightArm', t('robot.rightArm')], ['color', t('robot.colorSensor')],
    ];
    const selects = new Map<Role, HTMLSelectElement>();
    const num = (id: string, label: string, value: number, unit: string) => {
      const input = h('input', { id, type: 'number', value: String(value), step: 'any', inputmode: 'decimal' });
      return { input, row: h('label', { class: 'field', for: id }, h('span', {}, label), h('span', { class: 'with-unit' }, input, h('em', {}, unit))) };
    };
    const wd = num('cfg-wd', t('robot.wheelDiameter'), state.config.wheelDiameter, 'mm');
    const at = num('cfg-at', t('robot.axleTrack'), state.config.axleTrack, 'mm');
    const sx = num('cfg-sx', t('robot.startX'), this.start.x, 'mm');
    const sy = num('cfg-sy', t('robot.startY'), this.start.y, 'mm');
    const sh = num('cfg-sh', t('robot.startH'), this.start.h, '°');
    const setStart = (p: Pose) => { sx.input.value = String(p.x); sy.input.value = String(p.y); sh.input.value = String(p.h); };
    const msg = h('p', { class: 'form-msg', role: 'status' });
    const form = h('form', { class: 'config-form' },
      h('p', { class: 'muted small' }, t('robot.portsHelp')),
      h('div', { class: 'grid2' }, roles.map(([role, label]) => {
        const sel = h('select', { id: `cfg-${role}` }, ports.map((p) => h('option', { value: p, selected: state.config.ports[role] === p }, t('robot.port', { port: p }))));
        selects.set(role, sel);
        return h('label', { class: 'field', for: `cfg-${role}` }, h('span', {}, label), sel);
      })),
      h('div', { class: 'grid2' }, wd.row, at.row),
      h('p', { class: 'muted small' }, t('robot.startHelp')),
      h('div', { class: 'row-actions' },
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => setStart(START) }, t('robot.base1')),
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => setStart(START2) }, t('robot.base2'))),
      h('div', { class: 'grid3' }, sx.row, sy.row, sh.row),
      msg,
      h('div', { class: 'dialog-actions' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => {
          const { body } = splitSetup(this.editor.code);
          const code = `${setupFor(state.config)}\n\n${body.trim()}\n`;
          this.editor.code = code;
          this.editor.foldSetup();
          updateCurrent(code);
          if (state.prefs.editor === 'blocks') this.blocks.load(code);
          toast(t('robot.headerApplied'), 'ok');
        } }, t('robot.applyHeader')),
        h('button', { type: 'submit', class: 'btn primary' }, t('robot.save'))),
    );
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.className = 'form-msg err';
      const chosen = roles.map(([r]) => selects.get(r)!.value);
      if (new Set(chosen).size !== chosen.length) { msg.textContent = t('robot.errPorts'); return; }
      const vals = [wd, at, sx, sy, sh].map((x) => Number(x.input.value));
      if (vals.some((v) => !Number.isFinite(v)) || vals[0] <= 0 || vals[1] <= 0) { msg.textContent = t('robot.errNumbers'); return; }
      if (vals[2] < 0 || vals[2] > 2362 || vals[3] < 0 || vals[3] > 1143) { msg.textContent = t('robot.errStart'); return; }
      roles.forEach(([r]) => (state.config.ports[r] = selects.get(r)!.value as PortName));
      state.config.wheelDiameter = vals[0];
      state.config.axleTrack = vals[1];
      this.start = { x: vals[2], y: vals[3], h: vals[4] };
      state.start = this.start;
      save();
      this.reset();
      msg.className = 'form-msg ok';
      msg.textContent = t('robot.saved');
    });
    return form;
  }

  /** Calculadora de calibração: compara o que foi pedido com o que o robô real fez. */
  private buildCalibration(): HTMLElement {
    const field = (label: string, value: string, unit: string) => {
      const input = h('input', { type: 'number', value, step: 'any', inputmode: 'decimal' });
      return { input, row: h('label', { class: 'field' }, h('span', {}, label), h('span', { class: 'with-unit' }, input, h('em', {}, unit))) };
    };
    const cmd = field(t('calib.commanded'), '1000', 'mm');
    const real = field(t('calib.measured'), '', 'mm');
    const tcmd = field(t('calib.turnCommanded'), '3600', '°');
    const treal = field(t('calib.turnMeasured'), '', '°');
    const out = h('div', { class: 'calib-out', 'aria-live': 'polite' });
    const calc = () => {
      const c = Number(cmd.input.value), m = Number(real.input.value);
      const tc = Number(tcmd.input.value), tm = Number(treal.input.value);
      const lines: HTMLElement[] = [];
      let wd = state.config.wheelDiameter;
      if (c > 0 && m > 0) {
        wd = Math.round(state.config.wheelDiameter * (m / c) * 10) / 10;
        lines.push(h('p', {}, t('calib.newWheel'), ' ', h('b', { class: 'mono' }, `wheel_diameter=${wd}`)));
      }
      if (tc > 0 && tm > 0) {
        // Giro medido depois de corrigir a roda: o eixo compensa o que ainda sobra
        const axle = Math.round(state.config.axleTrack * (tc / tm) * (wd / state.config.wheelDiameter) * 10) / 10;
        lines.push(h('p', {}, t('calib.newAxle'), ' ', h('b', { class: 'mono' }, `axle_track=${axle}`)));
      }
      out.replaceChildren(...(lines.length ? lines : [h('p', { class: 'muted small' }, t('calib.fill'))]));
    };
    [cmd, real, tcmd, treal].forEach((f) => f.input.addEventListener('input', calc));
    calc();
    return h('div', { class: 'calib' },
      h('p', { class: 'muted small' }, t('calib.help')),
      h('div', { class: 'grid2' }, cmd.row, real.row),
      h('p', { class: 'muted small' }, t('calib.turnHelp')),
      h('div', { class: 'grid2' }, tcmd.row, treal.row),
      out);
  }

  // ---------- Partida (2:30 com várias saídas) ----------

  private renderMatchPanel() {
    const m = state.match;
    if (!m.runs.length) m.runs.push({ programId: current().id, left: state.config.attachments.left, right: state.config.attachments.right, base: 1 });
    // Programa apagado da biblioteca: usa o atual
    for (const r of m.runs) if (!byId(r.programId)) r.programId = current().id;
    const attachOpts: [AttachmentKind, string][] = [['none', t('robot.none')], ['claw', t('robot.claw')]];
    const sel = <T extends string>(opts: [T, string][], value: T, onchange: (v: T) => void, label: string) => {
      const s = h('select', { 'aria-label': label }, opts.map(([v, text]) => h('option', { value: v, selected: v === value }, text)));
      s.addEventListener('change', () => { onchange(s.value as T); save(); });
      return s;
    };
    const rows = m.runs.map((r, i) => h('li', { class: 'match-run' },
      h('div', { class: 'run-top' },
        h('span', { class: 'run-no mono' }, String(i + 1)),
        sel(state.programs.map((p) => [p.id, p.name] as [string, string]), r.programId, (v) => (r.programId = v), t('match.program')),
        h('div', { class: 'run-move' },
          iconBtn('up', t('blocks.up'), () => { if (i > 0) { [m.runs[i - 1], m.runs[i]] = [m.runs[i], m.runs[i - 1]]; save(); this.renderMatchPanel(); } }, 'icon-btn small'),
          iconBtn('down', t('blocks.down'), () => { if (i < m.runs.length - 1) { [m.runs[i + 1], m.runs[i]] = [m.runs[i], m.runs[i + 1]]; save(); this.renderMatchPanel(); } }, 'icon-btn small'),
          iconBtn('trash', t('blocks.delete'), () => { if (m.runs.length > 1) { m.runs.splice(i, 1); save(); this.renderMatchPanel(); } }, 'icon-btn small danger'))),
      h('div', { class: 'run-opts' },
        h('label', { class: 'field' }, h('span', {}, t('robot.leftArm')), sel(attachOpts, r.left, (v) => (r.left = v), t('robot.leftArm'))),
        h('label', { class: 'field' }, h('span', {}, t('robot.rightArm')), sel(attachOpts, r.right, (v) => (r.right = v), t('robot.rightArm'))),
        h('label', { class: 'field' }, h('span', {}, t('match.base')), sel<'1' | '2'>([['1', t('robot.base1')], ['2', t('robot.base2')]], String(r.base) as '1' | '2', (v) => (r.base = Number(v) as 1 | 2), t('match.base'))))));
    const handling = h('input', { type: 'number', min: '0', max: '60', step: '1', value: String(m.handling), inputmode: 'numeric' });
    handling.addEventListener('change', () => { m.handling = Math.max(0, Math.min(60, Number(handling.value) || 0)); handling.value = String(m.handling); save(); });
    this.matchPanel.replaceChildren(
      h('p', { class: 'muted small' }, t('match.help')),
      h('ol', { class: 'match-runs' }, rows),
      h('div', { class: 'row-actions' },
        h('button', { type: 'button', class: 'btn ghost small', onclick: () => { m.runs.push({ programId: current().id, left: 'none', right: 'none', base: 1 }); save(); this.renderMatchPanel(); } }, icon('plus', 14), t('match.addRun')),
        h('label', { class: 'field inline' }, h('span', {}, t('match.handling')), h('span', { class: 'with-unit' }, handling, h('em', {}, 's')))),
      h('button', { type: 'button', class: 'btn primary wide', onclick: () => this.runMatch() }, icon('timer', 16), t('match.run')),
      this.matchSummary,
    );
  }

  private runMatch() {
    this.keepGhost();
    const steps = state.match.runs.map((r: MatchRun, i) => {
      const p = byId(r.programId) ?? current();
      return {
        name: `${i + 1}. ${p.name}`,
        code: p.code,
        config: { ...state.config, attachments: { left: r.left, right: r.right } },
        start: r.base === 2 ? { ...START2 } : { ...(state.start ?? START) },
      };
    });
    const opts = this.worldOpts();
    const m = runMatch(steps, state.match.handling * 1000, opts);
    this.match = m;
    this.result = null;
    this.stage.setScene(steps[0].start, [], opts.objects ?? []);
    this.stage.load(m, m.segments.slice(1).map((s) => s.t0));
    this.console.load(m);
    this.shownAttach = '';
    this.matchAttachments();
    this.matchSummary.replaceChildren(h('p', { class: 'muted small' }, t('sim.running')));
    buzz('tap');
    this.stage.play();
  }

  /** Durante a partida, mostra o anexo de cada saída. */
  private matchAttachments() {
    const m = this.match;
    if (!m) return;
    const seg = [...m.segments].reverse().find((s) => s.t0 <= this.stage.time) ?? m.segments[0];
    if (!seg) return;
    const key = `${seg.config.attachments.left}/${seg.config.attachments.right}`;
    if (key !== this.shownAttach) {
      this.shownAttach = key;
      this.viewer.setAttachments(seg.config.attachments);
    }
  }

  private finishMatch() {
    const m = this.match!;
    const total = m.segments.length ? m.segments[m.segments.length - 1].t1 : 0;
    const rows = m.segments.map((s) => h('tr', {},
      h('td', {}, s.name),
      h('td', { class: 'mono' }, fmtTime(s.t1 - s.t0)),
      h('td', {}, s.error ? h('span', { class: 'bad' }, t('match.error')) : s.endedInBase ? h('span', { class: 'ok' }, t('match.inBase')) : h('span', { class: 'warn' }, t('match.outside')))));
    fill(this.matchSummary,
      h('div', { class: 'match-stats' },
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, fmtTime(total)), h('span', { class: 'lbl' }, t('match.used'))),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, fmtTime(Math.max(0, 150000 - total))), h('span', { class: 'lbl' }, t('match.left'))),
        h('div', { class: 'stat' }, h('span', { class: 'num mono' }, String(m.tokensLost)), h('span', { class: 'lbl' }, t('match.tokensLost')))),
      h('div', { class: 'table-wrap' }, h('table', { class: 'match-table' },
        h('thead', {}, h('tr', {}, h('th', {}, t('match.program')), h('th', {}, t('match.time')), h('th', {}, t('match.end')))),
        h('tbody', {}, rows))),
      m.skipped.length ? h('p', { class: 'form-msg err' }, t('match.skipped', { names: m.skipped.join(', ') })) : null,
      m.timeUp ? h('p', { class: 'form-msg err' }, t('match.timeUp')) : null,
      h('p', { class: 'muted small' }, t('match.note', { x: BASE2.x })));
    this.setStatus(t('match.done', { time: fmtTime(total), tokens: m.tokensLost }), m.tokensLost || m.timeUp ? 'err' : 'ok');
    buzz('end');
  }
}
