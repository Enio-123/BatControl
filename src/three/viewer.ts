// Cena 3D: mesa da FLL, tapete de treino e o robô da BatLego feito com formas simples.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MAT_H, MAT_W, drawMat } from '../sim/mat';
import { ObjSpec } from '../sim/world';
import { CLAW_OPEN, Frame, SENSOR_POS } from '../sim/world';

const S = 0.1; // 1 unidade = 10 mm

/** Converte coordenadas do tapete (mm, y para cima) para a cena. */
function matToScene(x: number, y: number, up = 0) {
  return new THREE.Vector3((x - MAT_W / 2) * S, up * S, -(y - MAT_H / 2) * S);
}

const COL = {
  black: 0x1b1c1e,
  white: 0xeeeeea,
  azure: 0x3fb3c4,
  yellow: 0xf2c11d,
  blue: 0x1f5fd6,
  red: 0xc8322b,
  tire: 0x161616,
  rim: 0x5a6656,
  gray: 0xb9bcbf,
  beige: 0xd9cfb3,
};

export type CameraMode = '3d' | 'top' | 'follow';

export interface Target { kind: 'rect'; x: number; y: number; w: number; h: number }

export class Viewer {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  robot: THREE.Group;
  wheels: THREE.Object3D[] = [];
  gears: THREE.Object3D[] = [];
  claws: THREE.Group[] = [];
  hubButton: THREE.Mesh;
  sensorDot: THREE.Mesh;
  trail: THREE.Line;
  trailPositions: Float32Array;
  targets = new THREE.Group();
  objects = new THREE.Group();
  ruler = new THREE.Group();
  ghost: THREE.Line;
  ghostPositions: Float32Array;
  private matMesh!: THREE.Mesh;
  private matLabels: Parameters<typeof drawMat>[1] | undefined;
  private photo: HTMLCanvasElement | null = null;
  private raycaster = new THREE.Raycaster();
  mode: CameraMode = '3d';
  container: HTMLElement | null = null;
  private ro: ResizeObserver;
  private raf = 0;
  private needsRender = true;
  private pose = { x: 0, y: 0, h: 0 };
  private clock = new THREE.Clock();

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'viewer-canvas';
    

    this.camera = new THREE.PerspectiveCamera(40, 1, 1, 2000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 420;
    this.controls.addEventListener('change', () => (this.needsRender = true));

    this.buildWorld();
    this.robot = this.buildRobot();
    this.scene.add(this.robot);
    this.scene.add(this.targets);
    this.scene.add(this.objects);
    this.scene.add(this.ruler);

    const sdot = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: 0xff2d2d, transparent: true, opacity: 0.85 }));
    sdot.rotation.x = -Math.PI / 2;
    this.sensorDot = sdot;
    this.scene.add(sdot);

    this.trailPositions = new Float32Array(3 * 20000);
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    tg.setDrawRange(0, 0);
    this.trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xe0a800 }));
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);

    // Rastro da rodada anterior, tracejado e discreto, para comparar
    this.ghostPositions = new Float32Array(3 * 20000);
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.BufferAttribute(this.ghostPositions, 3));
    gg.setDrawRange(0, 0);
    this.ghost = new THREE.Line(gg, new THREE.LineDashedMaterial({ color: 0x5aa0ff, dashSize: 1.6, gapSize: 1.1, transparent: true, opacity: 0.9 }));
    this.ghost.frustumCulled = false;
    this.scene.add(this.ghost);

    this.hubButton = this.robot.getObjectByName('hubButton') as THREE.Mesh;
    this.setCamera('3d');
    this.ro = new ResizeObserver(() => this.resize());
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      if (this.mode === 'follow') this.followCam(dt);
      const moved = this.controls.update();
      if (moved || this.needsRender) {
        this.renderer.render(this.scene, this.camera);
        this.needsRender = false;
      }
    };
    loop();
  }

  mount(el: HTMLElement) {
    if (this.container === el) return;
    if (this.container) this.ro.unobserve(this.container);
    this.container = el;
    el.prepend(this.renderer.domElement);
    this.ro.observe(el);
    this.resize();
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.mode !== 'follow') this.setCamera(this.mode);
    this.needsRender = true;
  }

  setBackground(color: string) {
    this.scene.background = new THREE.Color(color);
    this.needsRender = true;
  }

  setCamera(mode: CameraMode) {
    this.mode = mode;
    this.controls.enabled = mode !== 'follow';
    // Distância para o tapete inteiro caber na tela, qualquer que seja a proporção
    const vfov = (this.camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const W = MAT_W * S + 12;
    const H = MAT_H * S + 12;
    const portrait = this.camera.aspect < 1.25;
    if (portrait && mode !== 'follow') {
      // Tela em pé: o lado comprido do tapete fica na vertical, visto a partir da base
      const elev = ((mode === 'top' ? 89.9 : 46) * Math.PI) / 180;
      const dW = (H / 2) / Math.tan(hfov / 2);
      const dH = (W / 2) / Math.tan(vfov / 2) * (mode === 'top' ? 1 : 0.84);
      const d = Math.max(dW, dH) * 1.02;
      this.camera.position.set(-d * Math.cos(elev), d * Math.sin(elev), 0);
      this.controls.target.set(mode === 'top' ? 0 : -4, 0, 0);
    } else if (mode === '3d') {
      const elev = (52 * Math.PI) / 180;
      const dW = W / 2 / Math.tan(hfov / 2);
      const dH = (H / 2) / Math.tan(vfov / 2) / Math.sin(elev) + H * 0.3;
      const d = Math.max(dW, dH) * 1.02;
      this.camera.position.set(0, d * Math.sin(elev), d * Math.cos(elev));
      this.controls.target.set(0, 0, 2);
    } else if (mode === 'top') {
      const d = Math.max(W / 2 / Math.tan(hfov / 2), H / 2 / Math.tan(vfov / 2)) * 1.03;
      this.camera.position.set(0, d, 0.01);
      this.controls.target.set(0, 0, 0);
    }
    this.controls.maxDistance = Math.max(420, this.camera.position.length() * 1.6);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.needsRender = true;
  }

  private followCam(dt: number) {
    const r = (this.pose.h * Math.PI) / 180;
    const p = matToScene(this.pose.x, this.pose.y);
    const back = new THREE.Vector3(-Math.cos(r), 0, Math.sin(r));
    const want = p.clone().add(back.multiplyScalar(30)).add(new THREE.Vector3(0, 30, 0));
    const k = 1 - Math.exp(-dt * 6);
    this.camera.position.lerp(want, k);
    this.controls.target.lerp(p.clone().add(new THREE.Vector3(0, 4, 0)), k);
    this.needsRender = true;
  }

  // ---------- Mundo ----------

  private buildWorld() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.6);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-80, 220, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -140; sc.right = 140; sc.top = 90; sc.bottom = -90; sc.near = 10; sc.far = 600;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    const mat = new THREE.Mesh(new THREE.PlaneGeometry(MAT_W * S, MAT_H * S), new THREE.MeshStandardMaterial({ roughness: 0.9 }));
    mat.rotation.x = -Math.PI / 2;
    mat.receiveShadow = true;
    this.scene.add(mat);
    this.matMesh = mat;
    this.refreshMat();

    // Bordas da mesa (madeira pintada de preto) e tampo
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2b2e, roughness: 0.7 });
    const t = 3.8; // espessura
    const hgt = 7.6;
    const W = MAT_W * S;
    const H = MAT_H * S;
    const walls: [number, number, number, number][] = [
      [0, -H / 2 - t / 2, W + 2 * t, t],
      [0, H / 2 + t / 2, W + 2 * t, t],
      [-W / 2 - t / 2, 0, t, H],
      [W / 2 + t / 2, 0, t, H],
    ];
    for (const [x, z, w, d] of walls) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, d), wallMat);
      m.position.set(x, hgt / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(W + 2 * t + 6, 4, H + 2 * t + 6), new THREE.MeshStandardMaterial({ color: 0x3a3b3f, roughness: 0.9 }));
    top.position.y = -2.05;
    top.receiveShadow = true;
    this.scene.add(top);
  }

  // ---------- Robô ----------

  private buildRobot(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Group();
    body.scale.setScalar(S);
    // O modelo é montado com as rodas em +x; gira 180° para a frente ficar no lado do hub.
    body.rotation.y = Math.PI;
    g.add(body);
    const mats = new Map<number, THREE.MeshStandardMaterial>();
    const m = (c: number) => {
      if (!mats.has(c)) mats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.02 }));
      return mats.get(c)!;
    };
    // Caixa no referencial do robô: fx (frente), ly (esquerda), uz (cima), em mm.
    const box = (fx0: number, fx1: number, ly0: number, ly1: number, uz0: number, uz1: number, color: number, parent: THREE.Object3D = body) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0, uz1 - uz0, ly1 - ly0), m(color));
      mesh.position.set((fx0 + fx1) / 2, (uz0 + uz1) / 2, -(ly0 + ly1) / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    // Pino azul visto de frente (pequeno cilindro)
    const pin = (fx: number, ly: number, uz: number, axis: 'x' | 'y' | 'z', color = COL.blue) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.6, 12), m(color));
      c.position.set(fx, uz, -ly);
      if (axis === 'x') c.rotation.z = Math.PI / 2;
      if (axis === 'z') c.rotation.x = Math.PI / 2;
      body.add(c);
    };

    // Chassi
    box(-118, 30, -58, 58, 6, 16, COL.black);
    // Frente (paredes de vigas pretas, lado das engrenagens)
    box(26, 34, -56, 56, 8, 60, COL.black);
    for (let i = -2; i <= 2; i++) pin(34.9, i * 16, 52, 'x');
    pin(34.9, -40, 20, 'x');
    pin(34.9, 40, 20, 'x');
    box(30, 36, -50, 50, 2, 8, COL.black); // viga de baixo

    // Motores grandes (azul-claro), um de cada lado
    for (const side of [1, -1]) {
      box(-64, 12, side > 0 ? 34 : -60, side > 0 ? 60 : -34, 12, 52, COL.azure);
      box(-60, 8, side > 0 ? 40 : -54, side > 0 ? 54 : -40, 52, 55, COL.azure);
    }

    // Rodas 56 mm
    for (const side of [1, -1]) {
      const wheel = new THREE.Group();
      wheel.position.set(0, 28, -side * 71);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 18, 40), m(COL.tire));
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 19, 28), m(COL.rim));
      rim.rotation.x = Math.PI / 2;
      wheel.add(rim);
      // Marcas para enxergar a roda girando
      for (let k = 0; k < 2; k++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 19.6, 12), m(COL.blue));
        p.rotation.x = Math.PI / 2;
        const a = k * Math.PI;
        p.position.set(Math.cos(a) * 9, Math.sin(a) * 9, 0);
        wheel.add(p);
      }
      const tread = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 18.4), m(0x2b2b2b));
      tread.position.set(0, 27.8, 0);
      wheel.add(tread);
      body.add(wheel);
      this.wheels.push(wheel);
    }

    // Hub SPIKE Prime (branco, deitado)
    box(-114, -52, -44, 44, 14, 44, COL.white);
    box(-112, -54, -42, 42, 44, 46, 0xf7f7f4);
    const matrix = new THREE.Group();
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const px = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 4.2), m(0x2c2d30));
      px.position.set(-98 + i * 7, 46.4, -(14 + (j - 2) * 7));
      matrix.add(px);
    }
    body.add(matrix);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1.6, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, roughness: 0.4 }));
    btn.position.set(-84, 46.6, 26);
    btn.name = 'hubButton';
    body.add(btn);
    // Cabos (fitas bege)
    box(-110, -60, 14, 22, 46.5, 48, COL.beige);
    box(-104, -62, -30, -22, 46.5, 48, COL.beige);

    // Moldura branca de vigas no topo
    for (const side of [1, -1]) {
      box(-70, 32, side > 0 ? 50 : -58, side > 0 ? 58 : -50, 58, 66, COL.white);
      box(-118, -64, side > 0 ? 50 : -58, side > 0 ? 58 : -50, 40, 48, COL.white);
      box(-70, -62, side > 0 ? 50 : -58, side > 0 ? 58 : -50, 44, 60, COL.white);
      for (const fx of [-50, -30, 0, 20]) pin(fx, side * 54, 66.9, 'y');
    }
    box(22, 30, -58, 58, 60, 68, COL.black); // viga preta da frente
    for (let i = -3; i <= 3; i += 2) pin(26, i * 8, 68.9, 'y');
    box(-70, -62, -50, 50, 58, 66, COL.white);
    box(-44, 18, -40, -32, 54, 62, COL.white);
    box(-44, 18, 32, 40, 54, 62, COL.white);
    box(-44, -36, -32, 32, 54, 62, COL.black);
    box(10, 18, -32, 32, 54, 62, COL.white);

    // Engrenagens das saídas de anexo (giram com os motores C e D)
    for (const side of [1, -1]) {
      const gear = new THREE.Group();
      gear.position.set(10, 66, -side * 24);
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 4, 16), m(COL.black));
      gear.add(disk);
      for (let k = 0; k < 12; k++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4, 2.4), m(COL.black));
        const a = (k / 12) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * 7.4, 0, Math.sin(a) * 7.4);
        tooth.rotation.y = -a;
        gear.add(tooth);
      }
      const axle = new THREE.Mesh(new THREE.BoxGeometry(2.2, 16, 2.2), m(COL.gray));
      axle.position.y = 6;
      gear.add(axle);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(9, 2, 2.2), m(COL.gray));
      flag.position.set(4, 12, 0);
      gear.add(flag);
      body.add(gear);
      this.gears.push(gear);
    }

    // Laterais traseiras: vigas amarelas e quadro preto
    for (const side of [1, -1]) {
      const ly0 = side > 0 ? 56 : -64;
      const ly1 = side > 0 ? 64 : -56;
      box(-126, -40, ly0, ly1, 4, 12, COL.yellow);
      box(-112, -106, ly0, ly1, 12, 56, COL.yellow);
      box(-72, -66, ly0, ly1, 12, 56, COL.yellow);
      box(-106, -72, side > 0 ? 57 : -63, side > 0 ? 63 : -57, 14, 54, COL.black);
      pin(-100, side * 63.8, 46, 'z');
      pin(-78, side * 63.8, 46, 'z');
      pin(-100, side * 63.8, 22, 'z');
      // Rodízio branco
      const caster = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 6, 20), m(COL.white));
      caster.rotation.x = Math.PI / 2;
      caster.position.set(-118, 8, -side * 66);
      caster.castShadow = true;
      body.add(caster);
    }
    // Para-choque traseiro: 4 vigas pretas empilhadas
    for (let k = 0; k < 4; k++) box(-130, -122, -56, 56, 6 + k * 9.5, 14.5 + k * 9.5, COL.black);
    pin(-130.9, -44, 34, 'x');
    pin(-130.9, 44, 34, 'x');
    pin(-130.9, -44, 15, 'x');
    pin(-130.9, 44, 15, 'x');
    // Conectores vermelhos e azuis do topo traseiro
    box(-118, -112, 30, 38, 46, 52, COL.red);
    box(-118, -112, -38, -30, 46, 52, COL.red);
    box(-122, -114, 46, 54, 48, 54, COL.azure);
    box(-122, -114, -54, -46, 48, 54, COL.blue);

    // Sensor de cor (lateral direita, perto do hub)
    // (no referencial do modelo, que está girado 180°)
    const sx = -SENSOR_POS.x;
    box(sx - 12, sx + 12, -72, -63, 10, 34, COL.white);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1.2, 20), m(0x111111));
    lens.rotation.x = Math.PI / 2;
    lens.position.set(sx, 22, 72.4);
    body.add(lens);

    // Garras opcionais na frente (lado do hub), uma de cada lado
    for (const side of [1, -1]) g.add(this.buildClaw(side, m));

    g.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
    return g;
  }

  /** Garra de pinça simples: suporte, braço e duas mandíbulas que abrem com o motor do anexo. */
  private buildClaw(side: number, m: (c: number) => THREE.MeshStandardMaterial) {
    const claw = new THREE.Group();
    claw.scale.setScalar(S);
    claw.visible = false;
    const c = side * 46; // centro da garra (ly)
    const box = (fx0: number, fx1: number, ly0: number, ly1: number, uz0: number, uz1: number, color: number, parent: THREE.Object3D) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0, uz1 - uz0, ly1 - ly0), m(color));
      mesh.position.set((fx0 + fx1) / 2, (uz0 + uz1) / 2, -(ly0 + ly1) / 2);
      parent.add(mesh);
      return mesh;
    };
    box(128, 146, c - 12, c + 12, 18, 44, COL.white, claw); // suporte preso ao para-choque
    box(146, 196, c - 4, c + 4, 28, 36, COL.black, claw); // braço
    // Engrenagens que abrem as duas mandíbulas ao mesmo tempo
    for (const k of [1, -1]) {
      const gear = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 4, 14), m(COL.gray));
      gear.position.set(190, 38, -(c + k * 6));
      claw.add(gear);
    }
    const jaws: THREE.Group[] = [];
    for (const k of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(190, 0, -(c + k * 7));
      box(0, 46, -3, 3, 22, 34, COL.yellow, pivot);
      box(40, 48, k > 0 ? -9 : -3, k > 0 ? 3 : 9, 22, 34, COL.yellow, pivot); // ponta voltada para dentro
      pivot.userData.k = k;
      claw.add(pivot);
      jaws.push(pivot);
    }
    claw.userData.jaws = jaws;
    claw.userData.side = side;
    this.claws.push(claw);
    return claw;
  }

  setAttachments(a: { left: string; right: string }) {
    for (const claw of this.claws) claw.visible = (claw.userData.side > 0 ? a.left : a.right) === 'claw';
    this.needsRender = true;
  }

  // ---------- Estado ----------

  setFrame(f: Frame) {
    this.pose = { x: f.x, y: f.y, h: f.h };
    const p = matToScene(f.x, f.y);
    this.robot.position.copy(p);
    this.robot.rotation.y = (f.h * Math.PI) / 180;
    // Rodas: rotação física (graus), positivo = para frente
    // Modelo girado 180°: a roda "0" do modelo é a direita do robô
    this.wheels[1].rotation.z = (f.wl * Math.PI) / 180;
    this.wheels[0].rotation.z = (f.wr * Math.PI) / 180;
    this.gears[1].rotation.y = -(f.al * Math.PI) / 180;
    this.gears[0].rotation.y = -(f.ar * Math.PI) / 180;
    for (const claw of this.claws) {
      const ang = claw.userData.side > 0 ? f.al : f.ar;
      const open = (Math.max(0, Math.min(CLAW_OPEN, ang)) / CLAW_OPEN) * 40; // até 40° por mandíbula
      for (const j of claw.userData.jaws as THREE.Group[]) j.rotation.y = (j.userData.k * open * Math.PI) / 180;
    }
    const btnMat = this.hubButton.material as THREE.MeshStandardMaterial;
    const lc = LIGHT[f.light ?? ''] ?? null;
    btnMat.color.set(lc ?? 0xffffff);
    btnMat.emissive.set(lc ?? 0x000000);
    btnMat.emissiveIntensity = lc ? 0.8 : 0;
    const r = (f.h * Math.PI) / 180;
    const sx = f.x + SENSOR_POS.x * Math.cos(r) - SENSOR_POS.y * Math.sin(r);
    const sy = f.y + SENSOR_POS.x * Math.sin(r) + SENSOR_POS.y * Math.cos(r);
    this.sensorDot.position.copy(matToScene(sx, sy, 0.6));
    if (f.objs) {
      this.objects.children.forEach((g, i) => {
        if (f.objs!.length < i * 3 + 3) return;
        g.position.copy(matToScene(f.objs![i * 3], f.objs![i * 3 + 1]));
        g.rotation.y = (f.objs![i * 3 + 2] * Math.PI) / 180;
      });
    }
    this.needsRender = true;
  }

  /** Volta os objetos para a posição inicial (antes de rodar). */
  resetObjects(list: ObjSpec[]) {
    this.objects.children.forEach((g, i) => {
      const o = list[i];
      if (!o) return;
      g.position.copy(matToScene(o.x, o.y));
      g.rotation.y = ((o.rot ?? 0) * Math.PI) / 180;
    });
    this.needsRender = true;
  }

  setTrail(frames: Frame[], upto: number) {
    const n = Math.min(upto + 1, frames.length, 20000);
    const step = Math.max(1, Math.ceil(frames.length / 20000));
    let k = 0;
    for (let i = 0; i < n; i += step) {
      const f = frames[i];
      this.trailPositions[k++] = (f.x - MAT_W / 2) * S;
      this.trailPositions[k++] = 0.25;
      this.trailPositions[k++] = -(f.y - MAT_H / 2) * S;
    }
    const geo = this.trail.geometry;
    geo.setDrawRange(0, k / 3);
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    this.needsRender = true;
  }

  setTargets(list: Target[]) {
    this.targets.clear();
    for (const t of list) {
      const pts = [
        matToScene(t.x, t.y, 3), matToScene(t.x + t.w, t.y, 3), matToScene(t.x + t.w, t.y + t.h, 3), matToScene(t.x, t.y + t.h, 3), matToScene(t.x, t.y, 3),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffb300 }));
      this.targets.add(line);
      // Cantoneiras em relevo para destacar o alvo
      const mat = new THREE.MeshBasicMaterial({ color: 0xffb300 });
      for (const [cx, cy] of [[t.x, t.y], [t.x + t.w, t.y], [t.x + t.w, t.y + t.h], [t.x, t.y + t.h]]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 6, 8), mat);
        post.position.copy(matToScene(cx, cy, 30));
        this.targets.add(post);
      }
    }
    this.needsRender = true;
  }

  /** Redesenha o tapete (textos no idioma atual ou a foto do tapete oficial). */
  private refreshMat() {
    const canvas = this.photo ?? drawMat(1.5, this.matLabels);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const m = this.matMesh.material as THREE.MeshStandardMaterial;
    m.map?.dispose();
    m.map = tex;
    m.needsUpdate = true;
    this.needsRender = true;
  }

  setMatLabels(labels: Parameters<typeof drawMat>[1]) {
    this.matLabels = labels;
    if (!this.photo) this.refreshMat();
  }

  /** Usa uma imagem (já no tamanho do tapete) no lugar do tapete de treino; null volta ao treino. */
  setMatPhoto(canvas: HTMLCanvasElement | null) {
    this.photo = canvas;
    this.refreshMat();
  }

  /** Caixas de missão. */
  setObjects(list: ObjSpec[]) {
    this.objects.clear();
    for (const o of list) {
      const g = new THREE.Group();
      const size = o.size * S;
      const box = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.9, size), new THREE.MeshStandardMaterial({ color: o.color, roughness: 0.6 }));
      box.position.y = size * 0.45;
      box.castShadow = true;
      box.receiveShadow = true;
      g.add(box);
      // Faixa clara para enxergar o giro da caixa
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(size * 1.01, size * 0.16, size * 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
      stripe.position.y = size * 0.6;
      g.add(stripe);
      g.position.copy(matToScene(o.x, o.y));
      g.rotation.y = ((o.rot ?? 0) * Math.PI) / 180;
      this.objects.add(g);
    }
    this.needsRender = true;
  }

  setGhost(frames: Frame[] | null) {
    const geo = this.ghost.geometry;
    if (!frames || !frames.length) {
      geo.setDrawRange(0, 0);
      this.needsRender = true;
      return;
    }
    const step = Math.max(1, Math.ceil(frames.length / 20000));
    let k = 0;
    for (let i = 0; i < frames.length; i += step) {
      const f = frames[i];
      this.ghostPositions[k++] = (f.x - MAT_W / 2) * S;
      this.ghostPositions[k++] = 0.2;
      this.ghostPositions[k++] = -(f.y - MAT_H / 2) * S;
    }
    geo.setDrawRange(0, k / 3);
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    this.ghost.computeLineDistances();
    this.needsRender = true;
  }

  /** Ponto do tapete (mm) sob uma posição da tela, ou null fora do tapete. */
  pick(clientX: number, clientY: number): { x: number; y: number } | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObject(this.matMesh)[0];
    if (!hit) return null;
    return { x: hit.point.x / S + MAT_W / 2, y: -hit.point.z / S + MAT_H / 2 };
  }

  /** Desenha a rota da régua: pontos ligados por segmentos. */
  setRuler(points: { x: number; y: number }[]) {
    this.ruler.clear();
    if (points.length) {
      const pts = points.map((p) => matToScene(p.x, p.y, 4));
      if (pts.length > 1) {
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff3d7f, depthTest: false }));
        line.renderOrder = 10;
        this.ruler.add(line);
      }
      const dot = new THREE.MeshBasicMaterial({ color: 0xff3d7f, depthTest: false });
      pts.forEach((p, i) => {
        const m = new THREE.Mesh(new THREE.CircleGeometry(i === 0 ? 1.4 : 1.1, 20), dot);
        m.rotation.x = -Math.PI / 2;
        m.position.copy(p);
        m.renderOrder = 11;
        this.ruler.add(m);
      });
    }
    this.needsRender = true;
  }

  /** Posição na tela (px, relativa ao canvas) de um ponto do tapete. */
  project(x: number, y: number) {
    const v = matToScene(x, y, 4).project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: ((v.x + 1) / 2) * r.width, y: ((1 - v.y) / 2) * r.height, visible: v.z < 1 };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.renderer.dispose();
  }
}

const LIGHT: Record<string, number> = {
  RED: 0xff2a1f, GREEN: 0x1fd15a, BLUE: 0x2a6bff, YELLOW: 0xffd21f, ORANGE: 0xff8a1f, WHITE: 0xffffff,
  CYAN: 0x1fe0ff, MAGENTA: 0xff1fd2, VIOLET: 0x8a2bff,
};
