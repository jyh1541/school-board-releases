// 첫 화면 3D: 연필이 파란 S를 그리고 모니터·폰이 떠오른다.
// 스크롤하면 모니터가 정면으로 오고 대시보드 위젯이 층층이 떠오른다.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.documentElement;
const stageEl = document.getElementById('stage');
const canvas = document.getElementById('stage-canvas');
const reduceMotion = root.classList.contains('reduce-motion');
// ?debug: 등장·스크롤 애니메이션 없이 장면 상태를 직접 지정해 확인한다 (window.__sb)
const DEBUG = new URLSearchParams(location.search).has('debug');

// 대시보드 화면: 하네스(apps/desktop/.schoolboard-dev/site-renewal-20261007)로 1600x1000을 1.35배로 찍은 최신 화면
const DASHBOARD_SRC = 'assets/shots/desktop/dashboard-2160.webp';
const PHONE_SRC = 'assets/shots/mobile/home-780.webp';
const SW = 3.2;
const SH = SW * 1000 / 1600;
const PW = 1.02, PH = 2.12;

// 대시보드 안 위젯 위치(화면 대비 %, 캡처 때 DOM에서 잰 값)와 떠오르는 높이
const LAYERS = [
  { rect: [0.4, 4.6, 10.5, 50], depth: 0.4 },
  { rect: [12.09, 5.4, 35.81, 93], depth: 0.75, label: '구글 캘린더와 실시간 연동', side: 'top', ox: -0.2 },
  { rect: [48.28, 5.4, 14.06, 9.8], depth: 1.55 },
  { rect: [62.72, 5.4, 17.75, 9.8], depth: 1.7, label: '날씨·미세먼지', side: 'top', wideOnly: true },
  { rect: [80.84, 5.4, 17.69, 9.8], depth: 1.95, label: 'D-Day', side: 'right' },
  { rect: [48.28, 15.8, 24.94, 33.2], depth: 1.2 },
  { rect: [73.59, 15.8, 24.94, 33.2], depth: 1.35, label: '나이스·컴시간 시간표', side: 'right' },
  { rect: [48.28, 49.6, 17.69, 25.4], depth: 0.9 },
  { rect: [66.34, 49.6, 14.12, 25.4], depth: 1.0 },
  { rect: [80.84, 49.6, 17.69, 48.8], depth: 1.1, label: '오늘 급식', side: 'right' },
  { rect: [48.28, 75.6, 32.19, 22.8], depth: 1.45, label: '구글 할 일까지', side: 'bottom' },
];

// 아이콘의 S 획을 3D로 옮긴 곡선 (위 오른쪽에서 시작해 아래 왼쪽에서 끝남)
const S_POINTS = [
  [0.95, 1.05, 0.0], [0.55, 1.42, 0.15], [-0.15, 1.5, 0.3], [-0.75, 1.1, 0.35],
  [-0.7, 0.45, 0.25], [-0.1, 0.02, 0.1], [0.6, -0.42, 0.0], [0.78, -1.05, 0.1],
  [0.3, -1.5, 0.25], [-0.45, -1.52, 0.35], [-0.95, -1.1, 0.3],
];

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

// 그래픽카드 없이 CPU로 그리는 환경이면 3D 대신 정지 이미지를 쓴다
function isSoftwareRenderer(renderer) {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(name || ''));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

if (!webglAvailable()) {
  root.classList.add('no-webgl');
} else {
  start().catch((err) => {
    console.error(err);
    root.classList.add('no-webgl');
  });
}

async function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  if (!DEBUG && isSoftwareRenderer(renderer)) {
    renderer.dispose();
    root.classList.add('no-webgl');
    return;
  }
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.15, 11);
  camera.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-4, 6, 8);
  scene.add(key);

  const [dashImg, phoneImg] = await Promise.all([loadImage(DASHBOARD_SRC), loadImage(PHONE_SRC)]);
  const IW = dashImg.naturalWidth, IH = dashImg.naturalHeight;

  // 둥근 모서리로 잘라낸 캔버스 텍스처
  function canvasTexture(img, sx, sy, sw, sh, radius) {
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const g = c.getContext('2d');
    g.beginPath();
    g.roundRect(0, 0, sw, sh, radius);
    g.clip();
    g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  function softShadowTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.filter = 'blur(22px)';
    g.fillStyle = 'rgba(16, 24, 48, 1)';
    g.beginPath(); g.roundRect(48, 48, 160, 160, 18); g.fill();
    return new THREE.CanvasTexture(c);
  }
  function groundTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(24, 35, 60, 0.30)');
    grad.addColorStop(1, 'rgba(24, 35, 60, 0)');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  const navyMat = new THREE.MeshStandardMaterial({ color: 0x1b2540, roughness: 0.42, metalness: 0.35 });

  // ---------- 모니터 ----------
  const monitor = new THREE.Group();
  const monBody = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.14, SH + 0.14, 0.12, 4, 0.06), navyMat);
  monBody.position.z = -0.062;
  monitor.add(monBody);

  const screenMat = new THREE.MeshBasicMaterial({
    map: canvasTexture(dashImg, 0, 0, IW, IH, 12), transparent: true, toneMapped: false,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat);
  screen.position.z = 0.002;
  monitor.add(screen);

  const standMat = navyMat.clone();
  standMat.transparent = true;
  const stand = new THREE.Group();
  const neck = new THREE.Mesh(new RoundedBoxGeometry(0.36, 1.0, 0.1, 2, 0.03), standMat);
  neck.position.set(0, -SH / 2 - 0.35, -0.18);
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.06, 0.62, 2, 0.03), standMat);
  base.position.set(0, -SH / 2 - 0.86, -0.1);
  stand.add(neck, base);
  monitor.add(stand);

  // 떠오르는 위젯 층
  const shadowTex = softShadowTexture();
  const layers = LAYERS.map((L) => {
    const [px, py, pw100, ph100] = L.rect;
    const x = Math.round(px / 100 * IW), y = Math.round(py / 100 * IH);
    const w = Math.round(pw100 / 100 * IW), h = Math.round(ph100 / 100 * IH);
    const pw = pw100 / 100 * SW;
    const ph = ph100 / 100 * SH;
    const cx = (px + pw100 / 2) / 100 * SW - SW / 2;
    const cy = SH / 2 - (py + ph100 / 2) / 100 * SH;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(pw, ph),
      new THREE.MeshBasicMaterial({ map: canvasTexture(dashImg, x, y, w, h, Math.round(IW * 0.009)), transparent: true, toneMapped: false }),
    );
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(pw * 1.6, ph * 1.6 + 0.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }),
    );
    shadow.position.set(cx, cy, 0.004);
    mesh.position.set(cx, cy, 0.006);
    mesh.visible = false;
    monitor.add(shadow, mesh);
    return { ...L, mesh, shadow, cx, cy, pw, ph };
  });
  scene.add(monitor);

  // ---------- 휴대폰 ----------
  const phone = new THREE.Group();
  const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, 0.1, 6, 0.14), navyMat);
  phoneBody.position.z = -0.052;
  const phoneScreenW = PW - 0.1;
  const phoneScreenH = phoneScreenW * phoneImg.naturalHeight / phoneImg.naturalWidth;
  const phoneScreenMat = new THREE.MeshBasicMaterial({
    map: canvasTexture(phoneImg, 0, 0, phoneImg.naturalWidth, phoneImg.naturalHeight, 34), transparent: true, toneMapped: false,
  });
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(phoneScreenW, phoneScreenH), phoneScreenMat);
  phoneScreen.position.z = 0.002;
  phone.add(phoneBody, phoneScreen);
  scene.add(phone);

  // ---------- S 획 ----------
  const sGroup = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(S_POINTS.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const TUBE_SEG = 360, RAD_SEG = 20, TUBE_R = 0.11;
  const sMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a3fe8, roughness: 0.34, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.38,
  });
  const tubeGeo = new THREE.TubeGeometry(curve, TUBE_SEG, TUBE_R, RAD_SEG, false);
  const tube = new THREE.Mesh(tubeGeo, sMat);
  const capGeo = new THREE.SphereGeometry(TUBE_R, 24, 16);
  const capStart = new THREE.Mesh(capGeo, sMat);
  const capEnd = new THREE.Mesh(capGeo, sMat);
  capStart.position.copy(curve.getPointAt(0));
  sGroup.add(tube, capStart, capEnd);
  scene.add(sGroup);

  // ---------- 연필 (끝이 원점, 몸통이 +y) ----------
  const pencil = new THREE.Group();
  const pencilBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.35, 6),
    new THREE.MeshStandardMaterial({ color: 0xf27a4d, roughness: 0.5, flatShading: true }),
  );
  pencilBody.position.y = 0.28 + 0.675;
  const wood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.026, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0xebc89b, roughness: 0.8, flatShading: true }),
  );
  wood.position.y = 0.06 + 0.11;
  const lead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.0, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0x2b3142, roughness: 0.4 }),
  );
  lead.position.y = 0.03;
  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.084, 0.084, 0.14, 24),
    new THREE.MeshStandardMaterial({ color: 0xc9ced8, roughness: 0.25, metalness: 0.9 }),
  );
  ferrule.position.y = 0.28 + 1.35 + 0.07;
  const eraser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0xf3a7b0, roughness: 0.7 }),
  );
  eraser.position.y = 0.28 + 1.35 + 0.14 + 0.075;
  pencil.add(pencilBody, wood, lead, ferrule, eraser);
  scene.add(pencil);

  // ---------- 바닥 그림자 ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: groundTexture(), transparent: true, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // ---------- 상태 ----------
  const state = {
    draw: 0, monIn: 0, phoneIn: 0, screenOn: 0, pencilRest: 0, // 첫 등장
    view: 0, explode: 0, // 스크롤
  };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  // 화면 비율에 따라 첫 화면 배치를 정한다
  let L = {};
  function layout() {
    const w = stageEl.clientWidth || window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const hw = hh * camera.aspect;
    const portrait = camera.aspect < 1.05;
    if (portrait) {
      // 폰(세로 비율 0.46)은 아래쪽 절반, 태블릿 세로(0.7 안팎)는 조금 위로 올리고 작게
      const tall = clamp((camera.aspect - 0.46) / 0.3, 0, 1)
      const s = clamp(hw * 0.4, 0.42, 0.85) * (1 - 0.12 * tall);
      L = { rig: new THREE.Vector3(0.1, -hh * (0.56 - 0.12 * tall), 0), s, explodePos: new THREE.Vector3(0, -hh * 0.18, 0), explodeScale: hw * 1.7 / SW, portrait };
    } else {
      // 가로가 덜 넓은 화면(태블릿 가로 등)일수록 오른쪽으로 보내고 조금 작게
      const narrow = clamp((1.6 - camera.aspect) / 0.55, 0, 1)
      const s = clamp(hw * 0.185, 0.62, 1.15) * (1 - 0.1 * narrow);
      L = { rig: new THREE.Vector3(hw * (0.44 + 0.08 * narrow), -0.08, 0), s, explodePos: new THREE.Vector3(hw * 0.2, -0.3, 0), explodeScale: Math.min(hw * 0.86 / SW, hh * 1.08 / SH), portrait };
    }
  }

  const tmp = new THREE.Vector3();
  function placeFromRig(obj, local, scale) {
    obj.position.set(L.rig.x + local[0] * L.s, L.rig.y + local[1] * L.s, L.rig.z + local[2] * L.s);
    obj.scale.setScalar(L.s * scale);
  }

  // ---------- 화면 위 HTML 메모 위치 ----------
  const notesEl = document.querySelector('.hero-notes');
  const noteMonitor = document.querySelector('[data-anchor="monitor"]');
  const notePhone = document.querySelector('[data-anchor="phone"]');
  const labelsEl = document.querySelector('.layer-labels');
  const labelEls = layers.map((ly) => {
    if (!ly.label) return null;
    const el = document.createElement('div');
    el.className = `layer-label side-${ly.side}`;
    const vertical = ly.side === 'top' || ly.side === 'bottom';
    const path = vertical ? 'M10 2 L10 34' : 'M2 10 L40 10';
    const box = vertical ? 'width="20" height="36" viewBox="0 0 20 36"' : 'width="42" height="20" viewBox="0 0 42 20"';
    el.innerHTML = `<svg ${box}><path pathLength="1" d="${path}"/></svg><span>${ly.label}</span>`;
    labelsEl.appendChild(el);
    return el;
  });

  function toScreen(obj, x, y, z) {
    tmp.set(x, y, z);
    obj.localToWorld(tmp);
    tmp.project(camera);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return [(tmp.x * 0.5 + 0.5) * w, (-tmp.y * 0.5 + 0.5) * h];
  }

  // ---------- 매 프레임 ----------
  const t0 = performance.now();
  let visible = true;
  function frame() {
    const t = (performance.now() - t0) / 1000;
    const v = state.view;
    const e = state.explode;

    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;
    const tiltY = pointer.sx * 0.16 * (1 - e * 0.6);
    const tiltX = pointer.sy * 0.08 * (1 - e * 0.6);
    const idle = reduceMotion ? 0 : 1;

    // 모니터: 첫 화면 자리 → 정면 확대 → 비스듬히 돌며 위젯 분해
    const monLocal = L.portrait ? [0.05, 0.25, 0] : [0.15, 0.32, 0];
    const heroPos = tmp.set(L.rig.x + monLocal[0] * L.s, L.rig.y + monLocal[1] * L.s, 0).clone();
    const rise = 1 - state.monIn;
    heroPos.y -= rise * 1.6;
    monitor.position.lerpVectors(heroPos, L.explodePos, v);
    monitor.position.y += Math.sin(t * 0.8) * 0.035 * idle * (1 - v);
    monitor.scale.setScalar(lerp(L.s, L.explodeScale, v));
    monitor.rotation.set(
      lerp(0.03 + rise * 0.5, 0, v) - 0.12 * e + tiltX,
      lerp(-0.3, 0, v) - 0.52 * e + tiltY,
      lerp(0.0, 0, v),
    );
    screenMat.color.setScalar(lerp(0.08, 1, state.screenOn) * (1 - 0.42 * e));
    standMat.opacity = 1 - smooth(0.05, 0.45, v);
    stand.visible = standMat.opacity > 0.01;
    monBody.visible = true;

    layers.forEach((ly, i) => {
      const lift = e * ly.depth * 0.8;
      ly.mesh.visible = e > 0.001;
      ly.mesh.position.set(ly.cx * (1 + 0.1 * e), ly.cy * (1 + 0.1 * e), 0.006 + lift);
      ly.shadow.material.opacity = 0.42 * smooth(0, 0.4, e);
      ly.shadow.position.set(ly.cx + 0.05 * lift, ly.cy - 0.08 * lift, 0.004);
      ly.shadow.scale.setScalar(1 + 0.12 * lift);
      // 세로 화면에서는 오른쪽 메모가 화면 밖으로 나가므로 위쪽 메모만 남긴다
      const fits = !L.portrait || ((ly.side === 'top' || ly.side === 'bottom') && !ly.wideOnly);
      const show = fits ? smooth(0.35 + i * 0.04, 0.75 + i * 0.03, e) : 0;
      const el = labelEls[i];
      if (!el) return;
      if (show > 0.001) {
        const p = ly.mesh.position;
        const ax = ly.side === 'right' ? p.x + ly.pw / 2 : ly.side === 'left' ? p.x - ly.pw / 2 : p.x + (ly.ox || 0) * ly.pw;
        const ay = ly.side === 'top' ? p.y + ly.ph / 2 : ly.side === 'bottom' ? p.y - ly.ph / 2 : ly.side === 'left' ? p.y + ly.ph * 0.3 : p.y;
        const [sx, sy] = toScreen(monitor, ax, ay, p.z);
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
        if (ly.side === 'top' || ly.side === 'bottom') {
          const span = el.lastElementChild;
          const half = (span.__w ||= span.offsetWidth) / 2;
          const vw = canvas.clientWidth;
          const shift = Math.min(0, vw - 10 - (sx + half)) + Math.max(0, 10 - (sx - half));
          span.style.transform = `translateX(calc(-50% + ${shift.toFixed(1)}px))`;
        }
      }
      el.style.opacity = show.toFixed(3);
    });

    // 휴대폰: 아래에서 올라와 모니터 앞 오른쪽에 선다. 스크롤하면 오른쪽으로 빠진다
    const phoneLocal = L.portrait ? [1.55, -0.55, 0.9] : [1.7, -0.72, 0.95];
    placeFromRig(phone, phoneLocal, 1);
    phone.position.y -= (1 - state.phoneIn) * 2.2;
    phone.position.y += Math.sin(t * 0.9 + 1.2) * 0.05 * idle;
    phone.position.x += v * 6;
    phone.rotation.set(0.02 + tiltX, -0.42 + tiltY * 1.2 - v * 0.6, 0.035);

    // S 획과 연필
    const sLocal = L.portrait ? [-1.35, -0.2, 1.2] : [-1.75, -0.1, 1.15];
    // 스크롤하면 S와 연필은 위로 날아가며 작아진다(제목 쪽으로 넘어가지 않게)
    const away = smooth(0.1, 0.7, v);
    placeFromRig(sGroup, sLocal, 0.72 * (1 - away * 0.85));
    sGroup.position.y += v * 3.2;
    sGroup.position.x += v * 0.6;
    sGroup.rotation.set(tiltX * 1.4, 0.18 + tiltY * 1.6 + Math.sin(t * 0.6) * 0.05 * idle, 0.06);
    sGroup.visible = v < 0.98;

    const d = clamp(state.draw, 0, 1);
    const segs = Math.max(1, Math.round(d * TUBE_SEG));
    tubeGeo.setDrawRange(0, segs * RAD_SEG * 6);
    tube.visible = d > 0.002;
    capStart.visible = d > 0.002;
    capEnd.visible = d > 0.002;
    const tip = curve.getPointAt(Math.max(d, 0.0001));
    capEnd.position.copy(tip);

    // 연필 끝을 S 획 끝에 맞춘다(그리는 중) → 그리고 나면 옆에 비스듬히 놓인다
    sGroup.updateMatrixWorld();
    const tipWorld = sGroup.localToWorld(tip.clone());
    const restWorld = sGroup.localToWorld(new THREE.Vector3(-0.95, -1.8, 0.5));
    const rest = state.pencilRest;
    pencil.position.lerpVectors(tipWorld, restWorld, rest);
    pencil.position.y += Math.sin(t * 1.1) * 0.03 * rest * idle;
    pencil.scale.setScalar(L.s * 0.9 * (1 - away * 0.85));
    pencil.rotation.set(lerp(-0.45, -0.2, rest) + tiltX, tiltY, lerp(-0.55, -1.05, rest));
    pencil.visible = state.draw > 0 && v < 0.98;

    // 바닥 그림자
    ground.position.set(L.rig.x, L.rig.y - 2.05 * L.s, 0.3);
    ground.scale.set(7.5 * L.s, 2.4 * L.s, 1);
    ground.material.opacity = state.monIn * (1 - smooth(0, 0.4, v));

    // 첫 화면 빨간펜 메모
    if (!L.portrait && notesEl) {
      const [mx, my] = toScreen(monitor, -0.2, SH / 2 + 0.06, 0);
      noteMonitor.style.transform = `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0)`;
      const vw = canvas.clientWidth;
      const mText = noteMonitor.querySelector('.note-text');
      noteMonitor.classList.toggle('flip', mx + 74 + (mText.__w ||= mText.offsetWidth) > vw - 16);
      const [px, py] = toScreen(phone, -0.1, -PH / 2 - 0.04, 0);
      notePhone.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      const pText = notePhone.querySelector('.note-text');
      notePhone.classList.toggle('flip', px - 70 - (pText.__w ||= pText.offsetWidth) < 16);
    }

    renderer.render(scene, camera);
  }

  // 처음 몇십 프레임이 너무 느리면(대략 20fps 미만) 정지 이미지로 바꾼다.
  // 간격이 0.4초 넘게 벌어지면 가려진 창에서 브라우저가 일부러 늦춘 것이라 다시 잰다.
  const frameTimes = [];
  let last = 0, stopped = false, scrollTl = null;
  function giveUp() {
    stopped = true;
    scrollTl?.scrollTrigger?.kill();
    scrollTl?.progress(0).kill();
    root.classList.add('no-webgl');
    window.ScrollTrigger?.refresh();
    renderer.dispose();
  }
  function loop(now) {
    if (stopped) return;
    if (visible && !document.hidden) {
      if (!DEBUG && last && frameTimes.length < 40) {
        frameTimes.push(now - last);
        if (frameTimes.length === 40) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const median = sorted[20];
          if (median > 400) frameTimes.length = 0;
          else if (median > 50) { giveUp(); return; }
        }
      }
      last = now;
      frame();
    } else {
      last = 0;
    }
    requestAnimationFrame(loop);
  }

  layout();
  window.addEventListener('resize', layout);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stageEl);
  window.addEventListener('pointermove', (ev) => {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (ev.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- 첫 등장 ----------
  const gsap = window.gsap;
  if (DEBUG) {
    Object.assign(state, { draw: 1, monIn: 1, phoneIn: 1, screenOn: 1, pencilRest: 1 });
    notesEl?.classList.add('notes-on');
    window.__sb = { state, frame, layout };
  } else if (reduceMotion || !gsap) {
    Object.assign(state, { draw: 1, monIn: 1, phoneIn: 1, screenOn: 1, pencilRest: 1 });
    notesEl?.classList.add('notes-on');
  } else {
    const intro = gsap.timeline({ delay: 0.15 });
    intro
      .to(state, { draw: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
      .to(state, { monIn: 1, duration: 1.2, ease: 'back.out(1.4)' }, 0.55)
      .to(state, { screenOn: 1, duration: 0.6, ease: 'power1.out' }, 1.25)
      .to(state, { phoneIn: 1, duration: 1.1, ease: 'back.out(1.5)' }, 0.95)
      .to(state, { pencilRest: 1, duration: 0.9, ease: 'power3.inOut' }, 1.75)
      .add(() => notesEl?.classList.add('notes-on'), 2.1);

    // ---------- 스크롤 ----------
    gsap.registerPlugin(window.ScrollTrigger);
    const tl = scrollTl = gsap.timeline({
      scrollTrigger: { trigger: stageEl, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
    });
    tl.to('.hero-copy', { autoAlpha: 0, y: -80, duration: 0.45, ease: 'power1.in' }, 0)
      .to(notesEl, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(state, { view: 1, duration: 1, ease: 'power2.inOut' }, 0)
      .to(state, { explode: 1, duration: 1.6, ease: 'power1.inOut' }, 0.85)
      .fromTo('.stage-copy', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.25)
      .to({}, { duration: 0.6 });
  }

  requestAnimationFrame(loop);
}
