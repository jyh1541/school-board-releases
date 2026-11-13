// 메인 첫 화면 3D
// 1) 실제 앱 화면 카드들이 제목 둘레를 둥글게 돌고, 색색의 소품이 떠다닌다.
// 2) 스크롤하면 카드들이 빨려 들어가며 모니터 한 화면(대시보드)이 된다.
// 3) 더 내리면 휴대폰이 앞으로 나온다.
// ?p=0.5 처럼 주면 스크롤 위치를 고정해 장면을 확인할 수 있다.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

window.__hero3d = true;

const root = document.documentElement;
const heroEl = document.getElementById('top');
const canvas = document.getElementById('hero-canvas');
const copyEl = document.getElementById('hero-copy');
const mascotEl = document.getElementById('hero-mascot');
const stage1 = document.getElementById('stage-1');
const stage2 = document.getElementById('stage-2');
const chipEls = [...document.getElementById('hero-chips').children];
const monMascot = document.getElementById('monitor-mascot');
const hint = document.querySelector('.scroll-hint');
const glowEl = document.querySelector('.hero-glow');
const FORCE_P = new URLSearchParams(location.search).get('p');

// 카드에 쓰는 실제 앱 화면 (assets/shots/desktop/<이름>-1080.webp)
const SHOTS = ['timetable', 'attendance', 'seating', 'meal', 'calendar', 'geulkkakki', 'exam-schedule', 'memo',
  'vote', 'qr-attendance', 'student-records', 'random-pick', 'consultations', 'class-timer', 'notebook', 'cut-score'];
const DASHBOARD_SRC = 'assets/shots/desktop/dashboard-2160.webp';
const PHONE_SRC = 'assets/shots/mobile/home-780.webp';
const SW = 3.2, SH = 2;            // 모니터 화면 (16:10)
const PW = 1.02, PH = 2.12;        // 휴대폰
const CW = 1.6, CH = CW * 711 / 1116; // 카드 (흰 테두리 포함 비율)

// 떠다니는 소품 [모양, 색, 가로 위치(-1~1), 세로 위치(-1~1), 깊이(+가 앞), 크기]
const PROPS = [
  ['note', 0xFFD54A, -0.88, 0.58, 1.8, 0.85],
  ['sphere', 0x0A4BFF, 0.9, 0.66, 1.0, 0.3],
  ['torus', 0xFF5C8A, -0.96, -0.2, 2.3, 0.34],
  ['note', 0x6EE0BE, 0.8, -0.7, 2.1, 0.78],
  ['sphere', 0xFFB020, -0.6, -0.86, 2.7, 0.2],
  ['pencil', 0, 0.97, 0.12, 2.5, 1],
  ['note', 0xFF9EB7, 0.56, 0.94, -1.6, 0.7],
  ['sphere', 0x8B6CFF, -0.42, 0.97, -0.9, 0.25],
  ['torus', 0x2FA8FF, 0.22, -0.97, 2.9, 0.26],
  ['cube', 0xFF6B4A, -0.22, -0.8, -2.2, 0.4],
  ['sphere', 0x16C08E, 0.36, 0.62, -3.2, 0.32],
  ['note', 0xB7A4FF, -0.74, 0.12, -2.8, 0.74],
];
// 대시보드 둘레에 붙는 말풍선 (모니터 기준 좌표)
const CHIP_AT = [[0.9, 1.13], [-0.6, 1.13], [1.74, 0.12], [-1.3, -0.78], [0.55, -1.13]];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const backOut = (t) => { const c = 1.6; t = clamp(t, 0, 1) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}
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

if (root.classList.contains('no-webgl') || !webglAvailable()) {
  root.classList.add('no-webgl');
} else {
  start().catch((err) => { console.error(err); root.classList.add('no-webgl'); });
}

async function start() {
  const small = window.innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  if (!FORCE_P && isSoftwareRenderer(renderer)) { renderer.dispose(); root.classList.add('no-webgl'); return; }
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-5, 7, 9);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xdfe6ff, 0.6));

  // ---------- 배경: 천천히 움직이는 밝은 오로라 + 옅은 공책 줄 ----------
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uP: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: renderer.getPixelRatio() } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: `
      uniform float uTime; uniform float uP; uniform vec2 uRes; uniform float uDpr; varying vec2 vUv;
      float blob(vec2 uv, vec2 c, float r) { vec2 d = (uv - c) * vec2(uRes.x / uRes.y, 1.0); return smoothstep(r, 0.0, length(d)); }
      void main() {
        vec2 uv = vUv; float t = uTime * 0.07;
        vec3 col = vec3(0.969, 0.976, 0.992);
        col = mix(col, vec3(0.74, 0.82, 1.0),  blob(uv, vec2(0.16 + 0.07 * sin(t * 1.3), 0.80 + 0.06 * cos(t)), 0.62) * 0.85);
        col = mix(col, vec3(0.88, 0.80, 1.0),  blob(uv, vec2(0.86 + 0.06 * cos(t * 1.1), 0.84 + 0.05 * sin(t * 1.7)), 0.55) * 0.85);
        col = mix(col, vec3(1.0, 0.84, 0.78),  blob(uv, vec2(0.82 + 0.07 * sin(t * 0.9), 0.14 + 0.06 * cos(t * 1.2)), 0.56) * 0.8);
        col = mix(col, vec3(0.78, 0.95, 0.89), blob(uv, vec2(0.12 + 0.06 * cos(t * 1.4), 0.12 + 0.05 * sin(t)), 0.52) * 0.8);
        col = mix(col, vec3(1.0, 0.94, 0.76),  blob(uv, vec2(0.5 + 0.12 * sin(t * 0.7), 0.42 + 0.1 * cos(t * 0.8) - uP * 0.2), 0.36) * 0.4);
        float ry = mod(gl_FragCoord.y, 34.0 * uDpr);
        col = mix(col, vec3(0.84, 0.88, 0.95), (1.0 - smoothstep(0.0, 1.2 * uDpr, ry)) * 0.22);
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthWrite: false, depthTest: false,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  const [dashImg, phoneImg] = await Promise.all([loadImage(DASHBOARD_SRC), loadImage(PHONE_SRC)]);

  function roundTexture(img, w, h, radius) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.beginPath(); g.roundRect(0, 0, w, h, radius); g.clip();
    g.drawImage(img, 0, 0, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  function shadowTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.filter = 'blur(20px)';
    g.fillStyle = 'rgba(20, 30, 70, 1)';
    g.beginPath(); g.roundRect(44, 52, 168, 150, 22); g.fill();
    return new THREE.CanvasTexture(c);
  }
  const shadowTex = shadowTexture();
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x1b2540, roughness: 0.4, metalness: 0.35 });

  // ---------- 모니터 ----------
  const monitor = new THREE.Group();
  const monBody = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.14, SH + 0.14, 0.12, 4, 0.06), navyMat);
  monBody.position.z = -0.062;
  const screenMat = new THREE.MeshBasicMaterial({ map: roundTexture(dashImg, dashImg.naturalWidth, dashImg.naturalHeight, 14), toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat);
  screen.position.z = 0.002;
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), flashMat);
  flash.position.z = 0.01;
  const neck = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.9, 0.1, 2, 0.03), navyMat);
  neck.position.set(0, -SH / 2 - 0.32, -0.18);
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.06, 0.62, 2, 0.03), navyMat);
  base.position.set(0, -SH / 2 - 0.78, -0.1);
  const monShadow = new THREE.Mesh(new THREE.PlaneGeometry(SW * 1.5, SH * 1.5), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.4, depthWrite: false }));
  monShadow.position.set(0.15, -0.35, -0.3);
  monitor.add(monShadow, monBody, screen, flash, neck, base);
  scene.add(monitor);

  // ---------- 휴대폰 ----------
  const phone = new THREE.Group();
  const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, 0.1, 6, 0.14), navyMat);
  phoneBody.position.z = -0.052;
  const psw = PW - 0.1, psh = psw * phoneImg.naturalHeight / phoneImg.naturalWidth;
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(psw, psh), new THREE.MeshBasicMaterial({ map: roundTexture(phoneImg, phoneImg.naturalWidth, phoneImg.naturalHeight, 36), toneMapped: false }));
  phoneScreen.position.z = 0.002;
  phone.add(phoneBody, phoneScreen);
  scene.add(phone);

  // ---------- 앱 화면 카드 ----------
  const cardCount = small ? 10 : SHOTS.length;
  const cardGeo = new THREE.PlaneGeometry(CW, CH);
  const shadowGeo = new THREE.PlaneGeometry(CW * 1.45, CH * 1.6);
  function drawCard(ctx, img) {
    const W = 1116, H = 711, P = 18;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.roundRect(0, 0, W, H, 40); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.roundRect(P, P, W - P * 2, H - P * 2, 26); ctx.clip();
    if (img) ctx.drawImage(img, P, P, W - P * 2, H - P * 2);
    else { ctx.fillStyle = '#EEF2FA'; ctx.fillRect(P, P, W - P * 2, H - P * 2); }
    ctx.restore();
  }
  const cards = [];
  for (let i = 0; i < cardCount; i++) {
    const c = document.createElement('canvas');
    c.width = 1116; c.height = 711;
    const ctx = c.getContext('2d');
    drawCard(ctx, null);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    const mesh = new THREE.Mesh(cardGeo, mat);
    const sMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.3, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, sMat);
    shadow.position.set(0.06, -0.12, -0.06);
    const group = new THREE.Group();
    group.add(shadow, mesh);
    scene.add(group);
    const card = {
      group, mat, sMat, angle: (i / cardCount) * Math.PI * 2 + 0.3,
      size: 0.86 + ((i * 37) % 10) / 30, phase: i * 1.7,
      land: [((i * 53) % 100) / 100 - 0.5, ((i * 29) % 100) / 100 - 0.5],
    };
    cards.push(card);
    loadImage(`assets/shots/desktop/${SHOTS[i]}-1080.webp`).then((img) => { drawCard(ctx, img); tex.needsUpdate = true; }).catch(() => {});
  }

  // ---------- 떠다니는 소품 ----------
  const gloss = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.6 });
  function makePencil() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 6), new THREE.MeshStandardMaterial({ color: 0xf27a4d, roughness: 0.5, flatShading: true }));
    body.position.y = 0.28 + 0.675;
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.026, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xebc89b, roughness: 0.8, flatShading: true }));
    wood.position.y = 0.17;
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.0, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x2b3142, roughness: 0.4 }));
    lead.position.y = 0.03;
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.084, 0.14, 24), new THREE.MeshStandardMaterial({ color: 0xc9ced8, roughness: 0.25, metalness: 0.9 }));
    ferrule.position.y = 1.7;
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.15, 24), new THREE.MeshStandardMaterial({ color: 0xf3a7b0, roughness: 0.7 }));
    eraser.position.y = 1.845;
    g.add(body, wood, lead, ferrule, eraser);
    g.children.forEach((m) => { m.position.y -= 0.95; });
    return g;
  }
  const props = PROPS.filter((_, i) => !small || i % 2 === 0).map(([kind, color, nx, ny, z, size], i) => {
    let obj;
    if (kind === 'note') obj = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.08, 4, 0.06), gloss(color));
    else if (kind === 'sphere') obj = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), gloss(color));
    else if (kind === 'torus') obj = new THREE.Mesh(new THREE.TorusGeometry(1, 0.36, 24, 60), gloss(color));
    else if (kind === 'cube') obj = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.16), gloss(color));
    else obj = makePencil();
    scene.add(obj);
    return { obj, nx, ny, z, size, spin: 0.25 + (i % 4) * 0.12, phase: i * 1.3, rot: [i * 0.7, i * 1.1, i * 0.4] };
  });

  // ---------- 화면 배치 ----------
  let L = {};
  function layout() {
    const w = heroEl.clientWidth || window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bgMat.uniforms.uRes.value.set(w, h);
    bgMat.uniforms.uDpr.value = renderer.getPixelRatio();
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const hw = hh * camera.aspect;
    const portrait = camera.aspect < 1;
    if (portrait) {
      L = {
        hw, hh, portrait,
        ring: { cx: 0, cy: -hh * 0.62, rx: hw * 1.05, ry: hh * 0.22, zc: -0.4, za: 1.0 },
        cardW: clamp(hw * 0.62, 0.7, 1.3),
        mon: { x: 0, y: -hh * 0.3, w: hw * 1.9, ry: 0 },
        mon2: { x: -hw * 0.12, y: -hh * 0.22, w: hw * 1.7, ry: 0.1 },
        ph: { x: hw * 0.42, y: -hh * 0.42, z: 0.8, h: hh * 0.7 },
      };
    } else {
      const narrow = clamp((1.6 - camera.aspect) / 0.5, 0, 1);
      L = {
        hw, hh, portrait,
        ring: { cx: 0, cy: 0.05, rx: hw * 0.84, ry: hh * 0.86, zc: -0.6, za: 1.4 },
        cardW: clamp(hw * 0.34, 1.2, 2.1),
        // 가로가 덜 넓은 화면(태블릿 가로 등)은 왼쪽 글과 겹치지 않게 모니터를 더 오른쪽·작게
        mon: { x: hw * (0.3 + 0.07 * narrow), y: -0.12, w: Math.min(hw * (1.0 - 0.14 * narrow), hh * 2.4), ry: -0.16 },
        mon2: { x: hw * 0.2, y: -0.05, w: Math.min(hw * 0.9, hh * 2.2), ry: -0.24 },
        ph: { x: hw * 0.66, y: -hh * 0.16, z: 1.2, h: hh * 1.0 },
      };
    }
    chipEls.forEach((el) => { el.__w = el.offsetWidth; el.__h = el.offsetHeight; });
  }

  const tmp = new THREE.Vector3();
  function toScreen(obj, x, y, z) {
    tmp.set(x, y, z);
    obj.localToWorld(tmp);
    tmp.project(camera);
    return [(tmp.x * 0.5 + 0.5) * canvas.clientWidth, (-tmp.y * 0.5 + 0.5) * canvas.clientHeight];
  }

  // ---------- 매 프레임 ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let ps = FORCE_P != null ? Number(FORCE_P) : 0;
  const t0 = performance.now() - (FORCE_P != null ? 10000 : 0);
  const land = new THREE.Vector3();

  function progress() {
    if (FORCE_P != null) return Number(FORCE_P);
    const r = heroEl.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
  }

  function frame() {
    const t = (performance.now() - t0) / 1000;
    ps += (progress() - ps) * 0.12;
    const p = ps;
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uP.value = p;

    camera.position.set(pointer.sx * 0.5 * (1 - p * 0.5), -pointer.sy * 0.3, 12);
    camera.lookAt(0, 0, 0);

    const { hw, hh, ring } = L;
    const copyOut = smooth(0, 0.14, p);
    const monIn = smooth(0.1, 0.4, p);
    const shift = smooth(0.6, 0.84, p);
    const phoneIn = smooth(0.62, 0.86, p);

    // 모니터: 아래에서 떠올라 오른쪽에 서고, 휴대폰이 오면 살짝 물러난다
    const M = L.mon, M2 = L.mon2;
    const mx = lerp(M.x, M2.x, shift), my = lerp(M.y, M2.y, shift);
    const mScale = lerp(M.w, M2.w, shift) / SW;
    monitor.position.set(mx, my - (1 - monIn) * hh * 2.1, lerp(-1.5, 0, monIn) - shift * 0.4);
    monitor.scale.setScalar(mScale * lerp(0.7, 1, monIn));
    monitor.rotation.set(lerp(0.55, 0.02, monIn) + pointer.sy * 0.04, lerp(M.ry, M2.ry, shift) + pointer.sx * 0.08, 0);
    monitor.visible = monIn > 0.001;
    screenMat.color.setScalar(lerp(0.4, 1, smooth(0.22, 0.4, p)));
    flashMat.opacity = smooth(0.24, 0.32, p) * (1 - smooth(0.34, 0.46, p)) * 0.55;
    monitor.updateMatrixWorld();

    // 카드: 둥글게 돌다가 → 모니터 화면 속으로
    const intro = (i) => backOut((t - 0.15 - i * 0.05) / 1.0);
    const cardScale = L.cardW / CW;
    cards.forEach((c, i) => {
      const conv = smooth(0.02 + i * 0.009, 0.3 + i * 0.009, p);
      const a = c.angle + t * 0.055 + conv * 1.4;
      const ox = ring.cx + ring.rx * Math.cos(a);
      const oy = ring.cy + ring.ry * Math.sin(a) + Math.sin(t * 0.9 + c.phase) * 0.06;
      const oz = ring.zc - Math.sin(a) * ring.za;
      const e = intro(i);
      // 등장: 가운데 뒤쪽에서 튀어나온다
      let x = lerp(0, ox, e), y = lerp(-0.2, oy, e), z = lerp(-5, oz, e);
      land.set(c.land[0] * SW * 0.7, c.land[1] * SH * 0.7, 0.06);
      monitor.localToWorld(land);
      x = lerp(x, land.x, conv); y = lerp(y, land.y, conv); z = lerp(z, land.z, conv);
      c.group.position.set(x, y, z);
      const s = cardScale * c.size * Math.max(0.001, e) * lerp(1, 0.18, conv);
      c.group.scale.setScalar(s);
      c.group.rotation.set(
        lerp(Math.sin(a) * 0.14, monitor.rotation.x, conv),
        lerp(-Math.cos(a) * 0.38, monitor.rotation.y, conv),
        lerp(Math.cos(a) * 0.05, 0, conv),
      );
      const fade = 1 - smooth(0.72, 1, conv);
      c.mat.opacity = fade;
      c.sMat.opacity = 0.3 * fade * (1 - conv);
      c.group.visible = fade > 0.01;
    });

    // 소품: 둥둥 떠다니다가 스크롤하면 위로 흩어진다
    props.forEach((pr, i) => {
      const e = backOut((t - 0.5 - i * 0.07) / 0.9);
      const lift = p * hh * (1.6 + pr.z * 0.25);
      pr.obj.position.set(
        pr.nx * hw + pointer.sx * pr.z * 0.12,
        pr.ny * hh + Math.sin(t * 0.8 + pr.phase) * 0.12 + lift,
        pr.z,
      );
      pr.obj.scale.setScalar(pr.size * Math.max(0.001, e) * (pr.obj.isGroup ? 1 : 0.5));
      pr.obj.rotation.set(pr.rot[0] + t * pr.spin * 0.6 + p * 2, pr.rot[1] + t * pr.spin, pr.rot[2] + p);
    });

    // 휴대폰: 오른쪽에서 앞으로
    const P = L.ph;
    phone.visible = phoneIn > 0.001;
    phone.position.set(P.x + (1 - phoneIn) * hw * 1.2, P.y + Math.sin(t * 0.9) * 0.05 * phoneIn, P.z);
    phone.scale.setScalar(P.h / PH);
    phone.rotation.set(0.04 - pointer.sy * 0.05, lerp(-1.1, -0.38, phoneIn) + pointer.sx * 0.1, lerp(0.25, 0.04, phoneIn));

    // ---------- 화면 위 글 ----------
    copyEl.style.opacity = (1 - copyOut).toFixed(3);
    copyEl.style.setProperty('--lift', (-copyOut * 80).toFixed(1) + 'px');
    copyEl.style.visibility = copyOut > 0.99 ? 'hidden' : 'visible';
    mascotEl.style.opacity = (1 - smooth(0, 0.1, p)).toFixed(3);
    if (hint) hint.style.opacity = (1 - smooth(0, 0.05, p)).toFixed(3);
    glowEl.style.opacity = (1 - copyOut).toFixed(3);
    setStage(stage1, smooth(0.34, 0.44, p) * (1 - smooth(0.6, 0.68, p)));
    setStage(stage2, smooth(0.76, 0.86, p));

    // 말풍선: 모니터 둘레
    const vw = canvas.clientWidth;
    chipEls.forEach((el, k) => {
      const show = smooth(0.4 + k * 0.025, 0.48 + k * 0.025, p) * (1 - smooth(0.58, 0.64, p));
      el.style.opacity = show.toFixed(3);
      if (show < 0.002) return;
      let [sx, sy] = toScreen(monitor, CHIP_AT[k][0], CHIP_AT[k][1], 0.25);
      const half = (el.__w || 160) / 2;
      sx = clamp(sx, half + 8, vw - half - 8);
      el.style.transform = `translate3d(${(sx - half).toFixed(1)}px, ${(sy - (el.__h || 36) / 2 + (1 - show) * 16).toFixed(1)}px, 0) scale(${lerp(0.85, 1, show).toFixed(3)})`;
    });

    // 모니터 오른쪽 아래에 사는 똑똑이 (앱에서처럼)
    const mm = smooth(0.36, 0.44, p) * (1 - smooth(0.6, 0.68, p));
    monMascot.style.opacity = mm.toFixed(3);
    if (mm > 0.002) {
      const [ax, ay] = toScreen(monitor, SW / 2 - 0.08, -SH / 2 + 0.06, 0.1);
      const [bx] = toScreen(monitor, -SW / 2, 0, 0);
      const w = clamp((ax - bx) * 0.13, 56, 150);
      monMascot.style.width = w.toFixed(0) + 'px';
      monMascot.style.transform = `translate3d(${(ax - w * 0.82).toFixed(1)}px, ${(ay - w * 0.98).toFixed(1)}px, 0)`;
    }

    renderer.render(scene, camera);
  }
  function setStage(el, v) {
    el.style.opacity = v.toFixed(3);
    el.style.visibility = v > 0.01 ? 'visible' : 'hidden';
    el.style.setProperty('--lift', ((1 - v) * 30).toFixed(1) + 'px');
  }

  // 처음 40프레임이 너무 느리면(대략 20fps 미만) 정지 화면으로 바꾼다
  const frameTimes = [];
  let last = 0, stopped = false, visible = true;
  function giveUp() {
    stopped = true;
    root.classList.add('no-webgl');
    renderer.dispose();
  }
  function loop(now) {
    if (stopped || root.classList.contains('no-webgl')) return;
    if (visible && !document.hidden) {
      if (FORCE_P == null && last && frameTimes.length < 40) {
        frameTimes.push(now - last);
        if (frameTimes.length === 40) {
          const median = [...frameTimes].sort((a, b) => a - b)[20];
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
  document.fonts?.ready.then(layout);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(heroEl);
  window.addEventListener('pointermove', (ev) => {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (ev.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  root.classList.add('hero-ready');
  requestAnimationFrame(loop);
  window.__heroScene = { scene, camera, L: () => L };
}
