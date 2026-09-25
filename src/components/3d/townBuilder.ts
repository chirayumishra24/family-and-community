import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ============================================================
   CLAY DIORAMA TOWN — procedural scene builder
   ------------------------------------------------------------
   Layout is authored in "screen space" (u = right, v = back) as
   seen from the default camera, then mapped to world XZ. Every
   building group is rotated by FACE so its local +z faces the
   viewer and local +x points screen-right.
   ============================================================ */

export const ISLAND_RADIUS = 24;
const S = Math.SQRT1_2;
const FACE = Math.PI / 4;
const LOCKED_TINT = new THREE.Color(0xeee7dc);

export const toWorld = (u: number, v: number, y = 0) => new THREE.Vector3((u - v) * S, y, (-u - v) * S);

/* ── Seeded random so the town looks the same every load ── */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260925);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

/* ── Materials & mesh helpers ── */
export function clay(color: number, extra: THREE.MeshStandardMaterialParameters = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...extra });
  mat.userData.baseColor = color;
  return mat;
}

function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  parent: THREE.Object3D,
  x = 0,
  y = 0,
  z = 0,
  shadow = true
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

const rbox = (w: number, h: number, d: number, r = 0.12) =>
  new RoundedBoxGeometry(w, h, d, 3, Math.max(0.005, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01)));

/** Triangular-prism roof, ridge running along local z. Base sits at y = 0. */
function gableRoof(w: number, d: number, h: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geo.translate(0, 0, -d / 2);
  return geo;
}

/** Four-sided hip roof of footprint w × d. Base sits at y = 0. */
function hipRoof(w: number, d: number, h: number) {
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.scale(w, h, d);
  geo.translate(0, h / 2, 0);
  return geo;
}

function textMaterial(text: string, bg: string, fg: string, w = 512, h = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(4, 4, w - 8, h - 8, 28);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = `900 ${Math.round(h * 0.52)}px Outfit, "Arial Black", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 4, w - 40);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  mat.userData.baseColor = 0xffffff;
  return mat;
}

function stripeMaterial(a: string, b: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? b : a;
    ctx.fillRect(i * 16, 0, 16, 16);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
  mat.userData.baseColor = 0xffffff;
  return mat;
}

function sign(parent: THREE.Object3D, text: string, x: number, y: number, z: number, w: number, bg = '#1f6fe0', fg = '#ffffff') {
  const h = w / 4;
  const board = mesh(rbox(w + 0.12, h + 0.12, 0.08, 0.04), clay(0xffffff), parent, x, y, z);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), textMaterial(text, bg, fg));
  face.position.set(0, 0, 0.045);
  board.add(face);
  return board;
}

/** Framed window facing local +z. */
function windowPane(parent: THREE.Object3D, x: number, y: number, z: number, w = 0.42, h = 0.46, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  mesh(rbox(w + 0.12, h + 0.12, 0.06, 0.03), clay(0xffffff), g, 0, 0, 0, false);
  mesh(rbox(w, h, 0.08, 0.03), clay(0x8fd3ff, { roughness: 0.25, emissive: 0x2a6fa0, emissiveIntensity: 0.12 }), g, 0, 0, 0.01, false);
  mesh(new THREE.BoxGeometry(w, 0.035, 0.1), clay(0xffffff), g, 0, 0, 0.02, false);
  parent.add(g);
  return g;
}

function door(parent: THREE.Object3D, x: number, y: number, z: number, w = 0.5, h = 0.85, color = 0x9a5b32) {
  mesh(rbox(w + 0.1, h + 0.06, 0.06, 0.03), clay(0xffffff), parent, x, y + h / 2, z, false);
  mesh(rbox(w, h, 0.09, 0.04), clay(color), parent, x, y + h / 2 - 0.02, z + 0.01, false);
  mesh(new THREE.SphereGeometry(0.035, 8, 6), clay(0xfacc15), parent, x + w * 0.3, y + h * 0.48, z + 0.07, false);
}

/* ── People ── */
const SKIN = [0x8d5524, 0xc68642, 0xe0ac69, 0xa0674b, 0xb97a57];
const HAIR = [0x1f1a17, 0x2b1d14, 0x3b2a1e];
const SHIRTS = [0x3b82f6, 0xef4444, 0xf59e0b, 0x10b981, 0x8b5cf6, 0xec4899, 0x14b8a6, 0xf97316, 0xfde047];

export function makePerson(shirt = pick(SHIRTS), scale = 1): THREE.Group {
  const p = new THREE.Group();
  const pants = clay(pick([0x1e3a8a, 0x44403c, 0x7c2d12, 0x334155]));
  const legGeo = new THREE.CapsuleGeometry(0.07, 0.28, 4, 8);
  mesh(legGeo, pants, p, -0.08, 0.2, 0);
  mesh(legGeo, pants, p, 0.08, 0.2, 0);
  mesh(new THREE.CapsuleGeometry(0.16, 0.26, 4, 10), clay(shirt), p, 0, 0.58, 0);
  const skin = clay(pick(SKIN));
  mesh(new THREE.SphereGeometry(0.15, 14, 10), skin, p, 0, 0.95, 0);
  const hair = mesh(new THREE.SphereGeometry(0.155, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), clay(pick(HAIR)), p, 0, 0.97, -0.01);
  hair.rotation.x = -0.25;
  p.scale.setScalar(scale);
  return p;
}

/* ── Trees & vegetation (fresh materials so building groups can tint them) ── */
function roundTree(scale = 1, leaf = pick([0x5fb84a, 0x4caa3f, 0x6cc24a, 0x3f9b3a])): THREE.Group {
  const t = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.3, 8), clay(0x8b5a3c), t, 0, 0.65, 0);
  const leafMat = clay(leaf);
  const blobs: Array<[number, number, number, number]> = [
    [0, 1.9, 0, 0.95],
    [0.5, 1.6, 0.25, 0.65],
    [-0.45, 1.65, -0.2, 0.7],
    [0.1, 2.45, -0.1, 0.6],
  ];
  blobs.forEach(([x, y, z, r]) => mesh(new THREE.SphereGeometry(r, 16, 12), leafMat, t, x, y, z));
  t.scale.setScalar(scale);
  return t;
}

function palmTree(scale = 1): THREE.Group {
  const t = new THREE.Group();
  const trunkMat = clay(0xa47148);
  let x = 0;
  for (let i = 0; i < 6; i++) {
    const seg = mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8), trunkMat, t, x, 0.25 + i * 0.46, 0);
    seg.rotation.z = -0.08;
    x += 0.04;
  }
  const leafMat = clay(0x4caf50);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const leaf = new THREE.Group();
    leaf.position.set(x, 2.95, 0);
    leaf.rotation.y = a;
    const blade = mesh(rbox(0.28, 0.05, 1.3, 0.02), leafMat, leaf, 0, -0.2, 0.6);
    blade.rotation.x = 0.45;
    t.add(leaf);
  }
  mesh(new THREE.SphereGeometry(0.12, 8, 6), clay(0x7c5a2a), t, x + 0.08, 2.85, 0.08);
  t.scale.setScalar(scale);
  return t;
}

function bush(scale = 1, color = pick([0x4caa3f, 0x5fb84a, 0x3f9b3a])): THREE.Group {
  const b = new THREE.Group();
  const mat = clay(color);
  mesh(new THREE.SphereGeometry(0.42, 12, 10), mat, b, 0, 0.3, 0);
  mesh(new THREE.SphereGeometry(0.32, 12, 10), mat, b, 0.35, 0.22, 0.1);
  mesh(new THREE.SphereGeometry(0.3, 12, 10), mat, b, -0.3, 0.2, -0.1);
  if (rand() > 0.5) {
    const flower = clay(pick([0xf472b6, 0xfde047, 0xffffff, 0xfb7185]));
    for (let i = 0; i < 4; i++) {
      mesh(new THREE.SphereGeometry(0.06, 6, 5), flower, b, (rand() - 0.5) * 0.7, 0.5 + rand() * 0.15, (rand() - 0.5) * 0.5, false);
    }
  }
  b.scale.setScalar(scale);
  return b;
}

function bench(parent: THREE.Object3D, x: number, z: number, rotY = 0) {
  const b = new THREE.Group();
  b.position.set(x, 0, z);
  b.rotation.y = rotY;
  const wood = clay(0xb7794a);
  mesh(rbox(1.0, 0.08, 0.34, 0.03), wood, b, 0, 0.36, 0);
  mesh(rbox(1.0, 0.26, 0.06, 0.03), wood, b, 0, 0.55, -0.15);
  const leg = clay(0x475569);
  mesh(new THREE.BoxGeometry(0.06, 0.34, 0.3), leg, b, -0.42, 0.17, 0);
  mesh(new THREE.BoxGeometry(0.06, 0.34, 0.3), leg, b, 0.42, 0.17, 0);
  parent.add(b);
  return b;
}

function fence(parent: THREE.Object3D, from: THREE.Vector2, to: THREE.Vector2, color = 0xf5f0e6) {
  const mat = clay(color);
  const len = from.distanceTo(to);
  const n = Math.max(2, Math.round(len / 0.5));
  const ang = Math.atan2(to.x - from.x, to.y - from.y);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    mesh(rbox(0.1, 0.5, 0.1, 0.03), mat, parent, from.x + (to.x - from.x) * t, 0.25, from.y + (to.y - from.y) * t);
  }
  const rail = mesh(rbox(0.06, 0.07, len, 0.02), mat, parent, (from.x + to.x) / 2, 0.36, (from.y + to.y) / 2);
  rail.rotation.y = ang;
}

function flag(parent: THREE.Object3D, x: number, y: number, z: number, h: number, colors: number[], animated: THREE.Object3D[]) {
  mesh(new THREE.CylinderGeometry(0.04, 0.05, h, 8), clay(0xe5e7eb), parent, x, y + h / 2, z);
  const cloth = new THREE.Group();
  cloth.position.set(x, y + h - 0.25, z);
  colors.forEach((c, i) => mesh(new THREE.BoxGeometry(0.7, 0.14, 0.03), clay(c), cloth, 0.37, 0.14 - i * 0.14, 0, false));
  parent.add(cloth);
  animated.push(cloth);
}

/* ── Curves, ribbons (roads / river) ── */
function curveUV(points: Array<[number, number]>, closed = false) {
  return new THREE.CatmullRomCurve3(points.map(([u, v]) => toWorld(u, v)), closed, 'centripetal');
}

function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, y: number, segments = 240) {
  const pts = curve.getSpacedPoints(segments);
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const t = curve.getTangentAt(Math.min(i / segments, 1));
    const n = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
    const p = pts[i];
    pos.push(p.x + n.x, y, p.z + n.z, p.x - n.x, y, p.z - n.z);
    uvs.push(0, i / segments, 1, i / segments);
    if (i < pts.length - 1) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function flatMesh(geo: THREE.BufferGeometry, color: number, parent: THREE.Object3D, extra: THREE.MeshStandardMaterialParameters = {}) {
  const m = new THREE.Mesh(geo, clay(color, extra));
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

/* ============================================================
   PUBLIC TOWN OBJECT
   ============================================================ */
export interface Town {
  root: THREE.Group;
  buildings: Map<string, THREE.Group>;
  landmarks: Map<string, THREE.Group>;
  anchors: Map<string, THREE.Vector3>;
  setPopulation: (count: number) => void;
  update: (time: number, delta: number) => void;
}

interface Footprint {
  x: number;
  z: number;
  r: number;
}

export function setPainted(group: THREE.Object3D, painted: boolean) {
  group.userData.painted = painted;
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mat) => {
      const base = mat.userData.baseColor;
      const std = mat as THREE.MeshStandardMaterial;
      if (base === undefined || !std.color) return;
      std.color.setHex(base);
      if (!painted) std.color.lerp(LOCKED_TINT, 0.82);
    });
  });
}

export function buildTown(): Town {
  const root = new THREE.Group();
  const buildings = new Map<string, THREE.Group>();
  const landmarks = new Map<string, THREE.Group>();
  const footprints: Footprint[] = [];
  const animators: Array<(time: number, delta: number) => void> = [];
  const waving: THREE.Object3D[] = [];

  /** Create a building group centred on screen-space (u, v) and facing the viewer. */
  const site = (id: string, u: number, v: number, r: number, rotY = 0, registry = buildings) => {
    const g = new THREE.Group();
    g.position.copy(toWorld(u, v));
    g.rotation.y = FACE + rotY;
    g.name = id;
    root.add(g);
    registry.set(id, g);
    footprints.push({ x: g.position.x, z: g.position.z, r });
    return g;
  };

  /* ── 1. Island base ── */
  const R = ISLAND_RADIUS;
  mesh(new THREE.CylinderGeometry(R, R, 0.6, 96), clay(0x9bd16a), root, 0, -0.3, 0, false);
  const rim = mesh(new THREE.TorusGeometry(R - 0.05, 0.38, 12, 120), clay(0x8cc65c), root, 0, -0.45, 0, false);
  rim.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(R - 0.2, R - 2.8, 3.2, 96), clay(0xd39a66), root, 0, -2.3, 0, false);
  mesh(new THREE.CylinderGeometry(R - 2.8, R - 8, 2.4, 96), clay(0xb57a4a), root, 0, -5.1, 0, false);
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const rr = R - 0.6 - rand() * 1.4;
    const rock = mesh(new THREE.DodecahedronGeometry(0.4 + rand() * 0.5, 0), clay(pick([0xc08a5a, 0xa87048, 0xe0b084])), root, Math.cos(a) * rr, -1.4 - rand() * 2.2, Math.sin(a) * rr, false);
    rock.scale.y = 0.7;
  }

  /* ── 2. River with sandy banks & animated foam ── */
  const river = curveUV([
    [23.3, 2],
    [19.5, -3.5],
    [14.5, -9.5],
    [9.5, -14],
    [4, -18.5],
    [-1.5, -22.4],
  ]);
  flatMesh(ribbon(river, 4.8, 0.02), 0xf3dcaa, root);
  const water = flatMesh(ribbon(river, 3.4, 0.05), 0x52b9f2, root, { roughness: 0.2, metalness: 0.05, emissive: 0x0b5f95, emissiveIntensity: 0.12 });
  water.castShadow = false;
  const riverPts = river.getSpacedPoints(160);

  const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, transparent: true, opacity: 0.85 });
  const foam: Array<{ m: THREE.Mesh; t: number; off: number; speed: number }> = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + rand() * 0.08, 8, 6), foamMat);
    m.scale.y = 0.25;
    root.add(m);
    foam.push({ m, t: rand(), off: (rand() - 0.5) * 2.4, speed: 0.012 + rand() * 0.01 });
  }
  animators.push((_, dt) => {
    foam.forEach((f) => {
      f.t = (f.t + f.speed * dt) % 1;
      const p = river.getPointAt(f.t);
      const tan = river.getTangentAt(f.t);
      f.m.position.set(p.x - tan.z * f.off, 0.09, p.z + tan.x * f.off);
      const edge = Math.min(f.t, 1 - f.t) * 12;
      f.m.scale.setScalar(Math.min(1, edge));
      f.m.scale.y = 0.25 * Math.min(1, edge);
    });
  });

  /* ── 3. Roads ── */
  const loop = curveUV(
    [
      [-14, -4.2],
      [-4, -5.2],
      [6, -5],
      [14, -3.6],
      [15.8, 2.6],
      [12, 7.2],
      [2, 7.8],
      [-8, 7.6],
      [-15, 5],
      [-16.8, 0],
    ],
    true
  );
  const spur = curveUV([
    [-1, -5.2],
    [0, -10],
    [3, -15],
    [8.3, -21.6],
  ]);
  const lane = curveUV([
    [-11, -4.6],
    [-11.4, -9.5],
    [-12.6, -13],
    [-14.2, -16.8],
  ]);
  const roadGroup = new THREE.Group();
  root.add(roadGroup);
  flatMesh(ribbon(loop, 3.3, 0.03, 300), 0xece2d2, roadGroup);
  flatMesh(ribbon(spur, 3.3, 0.035), 0xece2d2, roadGroup);
  flatMesh(ribbon(loop, 2.6, 0.07, 300), 0x8e94a3, roadGroup);
  flatMesh(ribbon(spur, 2.6, 0.075), 0x8e94a3, roadGroup);
  flatMesh(ribbon(lane, 1.5, 0.045), 0xe3c48f, roadGroup);

  const dashMat = clay(0xffffff);
  const dashes = (curve: THREE.Curve<THREE.Vector3>, count: number) => {
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.55), dashMat);
      d.position.set(p.x, 0.09, p.z);
      d.rotation.y = Math.atan2(tan.x, tan.z);
      roadGroup.add(d);
    }
  };
  dashes(loop, 70);
  dashes(spur, 16);

  const loopPts = loop.getSpacedPoints(200);
  const spurPts = spur.getSpacedPoints(80);
  const lanePts = lane.getSpacedPoints(40);

  /* ── 4. Bridge where the spur road crosses the river (checkpoint 5) ── */
  {
    let best = { d: Infinity, t: 0 };
    spurPts.forEach((sp, i) => {
      riverPts.forEach((rp) => {
        const d = sp.distanceToSquared(rp);
        if (d < best.d) best = { d, t: i / (spurPts.length - 1) };
      });
    });
    const p = spur.getPointAt(best.t);
    const tan = spur.getTangentAt(best.t);
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    g.rotation.y = Math.atan2(tan.x, tan.z);
    g.name = 'bridge';
    root.add(g);
    buildings.set('bridge', g);

    const stone = clay(0xd8c7ad);
    const rail = clay(0xf4ead9);
    const N = 9;
    const L = 6.4;
    for (let i = 0; i < N; i++) {
      const z = -L / 2 + (i + 0.5) * (L / N);
      const k = z / (L / 2);
      const y = 0.15 + 0.75 * (1 - k * k);
      const slope = -2 * 0.75 * k / (L / 2);
      const seg = mesh(rbox(3.0, 0.28, L / N + 0.08, 0.06), stone, g, 0, y, z);
      seg.rotation.x = -Math.atan(slope);
      [-1.45, 1.45].forEach((x) => {
        const r = mesh(rbox(0.22, 0.34, L / N + 0.08, 0.06), rail, g, x, y + 0.3, z);
        r.rotation.x = -Math.atan(slope);
      });
    }
    [-1.4, 1.4].forEach((x) => {
      const arch = mesh(new THREE.TorusGeometry(2.6, 0.32, 8, 28, Math.PI), stone, g, x, -1.7, 0);
      arch.rotation.y = Math.PI / 2;
      [-L / 2, L / 2].forEach((z) => mesh(rbox(0.36, 0.9, 0.36, 0.08), rail, g, x, 0.45, z));
    });
    footprints.push({ x: p.x, z: p.z, r: 3.5 });
  }

  /* ── 5. Houses & Families (checkpoint 1) ── */
  {
    const g = site('houses', -11.6, -10.3, 0);
    const cottages: Array<[number, number, number, number, number]> = [
      [-8.5, -7.9, 0xfff1d6, 0xe86a3c, 0.1],
      [-8.4, -12.4, 0xfde2e4, 0xd9534f, -0.05],
      [-14.7, -8.1, 0xe0f2fe, 0xe8793c, 0.05],
      [-15.4, -12.3, 0xfef9c3, 0xc2552d, -0.1],
    ];
    cottages.forEach(([u, v, wall, roof, rot]) => {
      const c = new THREE.Group();
      c.position.set(u + 11.6, 0, -(v + 10.3));
      c.rotation.y = rot;
      mesh(rbox(2.3, 0.14, 2.1, 0.05), clay(0xd6c2a1), c, 0, 0.07, 0);
      mesh(rbox(2.1, 1.5, 1.8, 0.14), clay(wall), c, 0, 0.88, 0);
      mesh(gableRoof(2.5, 2.2, 1.15), clay(roof), c, 0, 1.6, 0);
      mesh(rbox(0.32, 0.7, 0.32, 0.06), clay(0xb45f45), c, 0.55, 2.2, -0.4);
      door(c, 0, 0.14, 0.91);
      windowPane(c, -0.6, 0.98, 0.91);
      windowPane(c, 0.6, 0.98, 0.91);
      windowPane(c, 1.06, 1.0, 0, 0.4, 0.42, Math.PI / 2);
      mesh(rbox(0.8, 0.1, 0.35, 0.03), clay(0xcbd5e1), c, 0, 0.19, 1.15);
      const b1 = bush(0.6);
      b1.position.set(-0.95, 0.1, 1.2);
      c.add(b1);
      const b2 = bush(0.5);
      b2.position.set(0.95, 0.1, 1.2);
      c.add(b2);
      g.add(c);
      footprints.push({ x: toWorld(u, v).x, z: toWorld(u, v).z, r: 1.9 });
    });
    fence(g, new THREE.Vector2(2.1, 3.6), new THREE.Vector2(4.4, 3.6));
    fence(g, new THREE.Vector2(-4.4, 3.8), new THREE.Vector2(-2.3, 3.8));
    const fam = [makePerson(0xef4444), makePerson(0x3b82f6), makePerson(0xfde047, 0.65)];
    fam.forEach((p, i) => {
      p.position.set(-0.4 + i * 0.45, 0, 0.2);
      p.rotation.y = 0.3;
      g.add(p);
    });
  }

  /* ── 6. Family courtyard (checkpoint 2) ── */
  {
    const g = site('courtyard', -5.4, -8.9, 1.9);
    mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.14, 32), clay(0xf1e3c8), g, 0, 0.07, 0);
    mesh(rbox(0.6, 0.55, 0.6, 0.08), clay(0xe2733f), g, 0, 0.42, 0);
    mesh(new THREE.SphereGeometry(0.34, 12, 10), clay(0x3f9b3a), g, 0, 0.9, 0);
    // Charpai (woven cot)
    mesh(rbox(1.1, 0.1, 0.6, 0.03), clay(0xf5deb3), g, -0.9, 0.42, 0.5);
    [-0.45, 0.45].forEach((dx) => [-0.25, 0.25].forEach((dz) => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), clay(0x8b5a3c), g, -0.9 + dx, 0.2, 0.5 + dz)));
    const elder = makePerson(0xffffff, 0.95);
    elder.position.set(0.9, 0, 0.6);
    g.add(elder);
    const child = makePerson(0xec4899, 0.62);
    child.position.set(0.5, 0, 1.0);
    g.add(child);
  }

  /* ── 7. Neighbourhood gateway across the lane (checkpoint 3) ── */
  {
    const t = 0.93;
    const p = lane.getPointAt(t);
    const tan = lane.getTangentAt(t);
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    g.rotation.y = Math.atan2(tan.x, tan.z);
    g.name = 'entrance';
    root.add(g);
    buildings.set('entrance', g);
    footprints.push({ x: p.x, z: p.z, r: 2 });
    const pillar = clay(0xfff1d6);
    mesh(rbox(0.5, 2.3, 0.5, 0.1), pillar, g, -1.35, 1.15, 0);
    mesh(rbox(0.5, 2.3, 0.5, 0.1), pillar, g, 1.35, 1.15, 0);
    mesh(rbox(3.4, 0.42, 0.62, 0.12), clay(0xe86a3c), g, 0, 2.45, 0);
    mesh(rbox(3.0, 0.2, 0.5, 0.08), clay(0xfacc15), g, 0, 2.15, 0);
    const toran = [0xf97316, 0x22c55e, 0xfacc15, 0xef4444, 0x22c55e, 0xf97316];
    toran.forEach((c, i) => {
      const leaf = mesh(new THREE.ConeGeometry(0.12, 0.3, 4), clay(c), g, -1.0 + i * 0.4, 1.9, 0.22, false);
      leaf.rotation.x = Math.PI;
    });
  }

  /* ── 8. Kinship banyan (checkpoint 4) ── */
  {
    const g = site('kinship-hub', -6.0, -1.2, 2.2);
    mesh(new THREE.CylinderGeometry(1.7, 1.85, 0.42, 32), clay(0xe7dccb), g, 0, 0.21, 0);
    mesh(new THREE.TorusGeometry(1.72, 0.1, 8, 40), clay(0xd6c6ae), g, 0, 0.42, 0).rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.38, 0.6, 2.4, 10), clay(0x7a4b2e), g, 0, 1.6, 0);
    const leaf = clay(0x3f9b3a);
    const canopy: Array<[number, number, number, number]> = [
      [0, 3.3, 0, 1.6],
      [1.2, 2.9, 0.3, 1.1],
      [-1.2, 2.95, -0.2, 1.15],
      [0.3, 2.9, 1.1, 1.0],
      [-0.2, 3.0, -1.1, 1.0],
      [0.2, 4.1, 0, 1.0],
    ];
    canopy.forEach(([x, y, z, r]) => mesh(new THREE.SphereGeometry(r, 16, 12), leaf, g, x, y, z));
    const root_ = clay(0x8b5a3c);
    [[1.1, 0.4], [-1.0, -0.5], [0.4, -1.1], [-0.6, 0.9]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.1, 6), root_, g, x, 1.45, z));
    [0xef4444, 0x3b82f6, 0xfde047, 0x10b981].forEach((c, i) => {
      const p = makePerson(c, i > 1 ? 0.65 : 0.95);
      const a = -0.6 + i * 0.45;
      p.position.set(Math.sin(a) * 1.35, 0.42, Math.cos(a) * 1.35);
      p.rotation.y = a + Math.PI;
      g.add(p);
    });
  }

  /* ── 9. School (checkpoint 6) ── */
  {
    const g = site('school', 0, 1.6, 4.0);
    mesh(rbox(7.4, 0.14, 5.2, 0.06), clay(0xf6dfb0), g, 0, 0.07, 0);
    const wall = clay(0xf4e7d3);
    // Boundary wall with a front gap
    mesh(rbox(7.4, 0.4, 0.2, 0.06), wall, g, 0, 0.3, -2.5);
    mesh(rbox(0.2, 0.4, 5.0, 0.06), wall, g, -3.6, 0.3, 0);
    mesh(rbox(0.2, 0.4, 5.0, 0.06), wall, g, 3.6, 0.3, 0);
    mesh(rbox(2.4, 0.4, 0.2, 0.06), wall, g, -2.4, 0.3, 2.5);
    mesh(rbox(2.4, 0.4, 0.2, 0.06), wall, g, 2.4, 0.3, 2.5);

    const brick = clay(0xe9885f);
    mesh(rbox(6.6, 2.9, 2.6, 0.16), brick, g, 0, 1.59, -1.1);
    mesh(rbox(6.8, 0.18, 2.8, 0.06), clay(0xfff5e6), g, 0, 1.55, -1.1);
    mesh(hipRoof(7.2, 3.2, 1.1), clay(0x3f6fd8), g, 0, 3.02, -1.1);
    // Clock tower
    mesh(rbox(1.7, 4.6, 1.7, 0.14), brick, g, 0, 2.44, -0.55);
    mesh(hipRoof(2.1, 2.1, 1.1), clay(0x3f6fd8), g, 0, 4.74, -0.55);
    const clock = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24), clay(0xffffff), g, 0, 4.05, 0.33);
    clock.rotation.x = Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.05, 0.3, 0.04), clay(0x1f2937), g, 0, 4.15, 0.39, false);
    mesh(new THREE.BoxGeometry(0.22, 0.05, 0.04), clay(0x1f2937), g, 0.09, 4.05, 0.39, false);
    [-2.6, -1.8, -1.0, 1.0, 1.8, 2.6].forEach((x) => {
      windowPane(g, x, 0.95, 0.21);
      windowPane(g, x, 2.3, 0.21);
    });
    door(g, 0, 0.14, 0.31, 0.8, 1.0, 0x2563eb);
    sign(g, 'SCHOOL', 0, 1.62, 0.36, 1.3, '#e11d48');
    // Front steps
    mesh(rbox(1.6, 0.12, 0.5, 0.04), clay(0xe5e7eb), g, 0, 0.2, 0.55);
    flag(g, -2.6, 0.14, 1.6, 2.4, [0xff9933, 0xffffff, 0x138808], waving);
    [-3.0, 3.0].forEach((x) => {
      const t = roundTree(0.55);
      t.position.set(x, 0.14, 1.9);
      g.add(t);
    });
    [makePerson(0x3b82f6, 0.65), makePerson(0xef4444, 0.65), makePerson(0x10b981, 0.65)].forEach((p, i) => {
      p.position.set(1.2 + i * 0.6, 0.14, 1.4 + (i % 2) * 0.4);
      p.rotation.y = -0.4 + i * 0.3;
      g.add(p);
    });
  }

  /* ── 10. Library (checkpoint 7) ── */
  {
    const g = site('library', -6.6, 11.8, 2.2);
    mesh(rbox(3.6, 0.3, 2.9, 0.08), clay(0xe7dccb), g, 0, 0.15, 0);
    mesh(rbox(3.2, 1.9, 2.4, 0.14), clay(0xdff5e6), g, 0, 1.25, 0);
    mesh(hipRoof(3.7, 2.9, 1.2), clay(0x2f9e63), g, 0, 2.2, 0);
    [-1.2, -0.4, 0.4, 1.2].forEach((x) => mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.9, 10), clay(0xffffff), g, x, 1.25, 1.3));
    door(g, 0, 0.3, 1.21, 0.55, 0.9, 0x166534);
    windowPane(g, -0.9, 1.3, 1.21);
    windowPane(g, 0.9, 1.3, 1.21);
    sign(g, 'LIBRARY', 0, 1.95, 1.3, 1.1, '#15803d');
  }

  /* ── 11. Health centre (checkpoint 8) ── */
  {
    const g = site('health-centre', -11, 2.2, 3.2);
    mesh(rbox(5.4, 0.14, 4.0, 0.06), clay(0xe2e8f0), g, 0, 0.07, 0);
    mesh(rbox(4.4, 2.3, 2.8, 0.16), clay(0xffffff), g, 0, 1.29, -0.4);
    mesh(rbox(4.6, 0.3, 3.0, 0.1), clay(0x38a3e8), g, 0, 2.5, -0.4);
    mesh(rbox(1.2, 0.5, 1.0, 0.1), clay(0xcbd5e1), g, 1.2, 2.85, -0.8);
    // Red cross panel
    mesh(rbox(1.1, 1.1, 0.1, 0.12), clay(0xffffff), g, -1.2, 1.55, 1.05);
    mesh(rbox(0.75, 0.24, 0.14, 0.05), clay(0xe11d48), g, -1.2, 1.55, 1.1);
    mesh(rbox(0.24, 0.75, 0.14, 0.05), clay(0xe11d48), g, -1.2, 1.55, 1.1);
    // Entrance canopy
    mesh(rbox(1.8, 0.14, 1.1, 0.05), clay(0x38a3e8), g, 0.9, 1.35, 1.4);
    [0.15, 1.65].forEach((x) => mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), clay(0xffffff), g, x, 0.74, 1.85));
    door(g, 0.9, 0.14, 1.01, 0.8, 0.95, 0x7dd3fc);
    windowPane(g, 1.8, 1.65, 1.01);
    sign(g, 'HEALTH CENTRE', -0.2, 2.2, 1.12, 1.4, '#0284c7');
    const nurse = makePerson(0xffffff);
    nurse.position.set(-0.4, 0.14, 1.6);
    g.add(nurse);
  }

  /* ── 12. ASHA wellness post (checkpoint 9) ── */
  {
    const g = site('wellness-post', -19.6, -0.6, 1.8);
    mesh(rbox(2.0, 0.12, 1.8, 0.05), clay(0xe2e8f0), g, 0, 0.06, 0);
    mesh(rbox(1.7, 1.4, 1.4, 0.14), clay(0xffffff), g, 0, 0.82, -0.1);
    mesh(rbox(2.0, 0.16, 1.7, 0.06), clay(0x22c55e), g, 0, 1.6, -0.05);
    mesh(rbox(0.5, 0.14, 0.1, 0.03), clay(0xe11d48), g, 0, 1.05, 0.62);
    mesh(rbox(0.14, 0.5, 0.1, 0.03), clay(0xe11d48), g, 0, 1.05, 0.62);
    bench(g, 0.2, 1.1);
    const w = makePerson(0xec4899);
    w.position.set(-0.7, 0, 0.9);
    g.add(w);
  }

  /* ── 13. Market stalls (checkpoint 10) ── */
  {
    const g = site('market', 10, 1.4, 3.2);
    mesh(rbox(5.8, 0.14, 4.4, 0.06), clay(0xf1e2c6), g, 0, 0.07, 0);
    const stalls: Array<[number, number, string, string]> = [
      [-1.9, -1.2, '#ef4444', '#ffffff'],
      [0, -1.3, '#22c55e', '#ffffff'],
      [1.9, -1.2, '#f59e0b', '#ffffff'],
      [-1.0, 1.0, '#3b82f6', '#ffffff'],
      [1.1, 1.0, '#ec4899', '#ffffff'],
    ];
    const produce = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0xa855f7];
    stalls.forEach(([x, z, a, b]) => {
      const s = new THREE.Group();
      s.position.set(x, 0.14, z);
      mesh(rbox(1.5, 0.6, 0.8, 0.08), clay(0xb7794a), s, 0, 0.3, 0);
      [-0.68, 0.68].forEach((px) => [-0.36, 0.36].forEach((pz) => mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), clay(0x8b5a3c), s, px, 0.75, pz)));
      const awning = mesh(rbox(1.7, 0.1, 1.2, 0.04), stripeMaterial(a, b), s, 0, 1.55, 0.05);
      awning.rotation.x = 0.18;
      for (let i = 0; i < 6; i++) {
        mesh(new THREE.SphereGeometry(0.1, 10, 8), clay(pick(produce)), s, -0.55 + i * 0.22, 0.68, 0.15 * (i % 2 ? 1 : -1));
      }
      g.add(s);
    });
    [makePerson(0xf97316), makePerson(0x8b5cf6), makePerson(0x14b8a6, 0.7)].forEach((p, i) => {
      p.position.set(-1.8 + i * 1.8, 0.14, 0);
      p.rotation.y = i * 1.1;
      g.add(p);
    });
    [-0.5, 0.5].forEach((x) => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), clay(0x8b5a3c), g, x, 0.45, 2.25));
    sign(g, 'MARKET', 0, 0.95, 2.3, 1.1, '#f59e0b');
  }

  /* ── 14. Park & playground (checkpoint 11) ── */
  {
    const g = site('park', 14.2, 12.2, 3.4);
    mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.16, 48), clay(0x86cf5f), g, 0, 0.08, 0);
    mesh(new THREE.TorusGeometry(2.1, 0.22, 6, 48), clay(0xefe2c9), g, 0, 0.16, 0).rotation.x = Math.PI / 2;
    // Fountain
    mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.35, 24), clay(0xe5e7eb), g, 0, 0.3, 0);
    mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 24), clay(0x52b9f2, { roughness: 0.2 }), g, 0, 0.46, 0);
    const jet = mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.9, 10), clay(0xbfe6ff, { transparent: true, opacity: 0.8 }), g, 0, 0.9, 0, false);
    animators.push((time) => {
      if (!g.userData.painted) return;
      jet.scale.y = 0.85 + Math.sin(time * 6) * 0.15;
    });
    // Swings
    const swingFrame = clay(0x2f8cf0);
    [-0.6, 0.6].forEach((dx) => {
      [-0.25, 0.25].forEach((dz) => {
        const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), swingFrame, g, -2.1 + dx, 0.85, -0.9 + dz);
        leg.rotation.x = dz > 0 ? -0.25 : 0.25;
      });
    });
    const bar = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), swingFrame, g, -2.1, 1.72, -0.9);
    bar.rotation.z = Math.PI / 2;
    [-0.3, 0.3].forEach((dx, i) => {
      const pivot = new THREE.Group();
      pivot.position.set(-2.1 + dx, 1.7, -0.9);
      mesh(new THREE.BoxGeometry(0.02, 1.1, 0.02), clay(0x475569), pivot, -0.12, -0.55, 0, false);
      mesh(new THREE.BoxGeometry(0.02, 1.1, 0.02), clay(0x475569), pivot, 0.12, -0.55, 0, false);
      mesh(rbox(0.34, 0.06, 0.2, 0.02), clay(0xf97316), pivot, 0, -1.1, 0);
      g.add(pivot);
      animators.push((time) => {
        if (!g.userData.painted) return;
        pivot.rotation.x = Math.sin(time * 2.2 + i * 1.6) * 0.45;
      });
    });
    // Slide
    mesh(rbox(0.6, 1.2, 0.6, 0.06), clay(0xfacc15), g, 1.8, 0.75, -1.4);
    const slide = mesh(rbox(0.5, 0.08, 1.8, 0.03), clay(0xef4444), g, 1.8, 0.75, -0.35);
    slide.rotation.x = 0.62;
    bench(g, 1.9, 1.7, -0.6);
    bench(g, -1.6, 2.0, 0.5);
    [[-2.6, 1.5], [2.6, 0.2], [0.4, -2.6]].forEach(([x, z]) => {
      const t = roundTree(0.55);
      t.position.set(x, 0.16, z);
      g.add(t);
    });
    [makePerson(0xfde047, 0.62), makePerson(0xec4899, 0.62), makePerson(0x22c55e, 0.62)].forEach((p, i) => {
      p.position.set(-0.8 + i * 0.9, 0.16, 1.1 - (i % 2) * 0.3);
      p.rotation.y = i;
      g.add(p);
    });
  }

  /* ── 15. Chaupal gathering square (checkpoint 12) ── */
  {
    const g = site('chaupal', 5.4, -2.0, 1.8);
    mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.34, 32), clay(0xe7dccb), g, 0, 0.17, 0);
    const t = roundTree(0.85, 0x4caa3f);
    t.position.set(0, 0.34, -0.2);
    g.add(t);
    bench(g, -0.8, 0.9, 0.5);
    bench(g, 0.8, 0.9, -0.5);
    [makePerson(0xffffff), makePerson(0xf97316)].forEach((p, i) => {
      p.position.set(i ? 0.5 : -0.5, 0.34, 0.4);
      p.rotation.y = i ? -0.8 : 0.8;
      g.add(p);
    });
  }

  /* ── 16. Community hall / Panchayat Bhavan (checkpoint 13) ── */
  {
    const g = site('community-hall', 0.2, 11.6, 3.6);
    mesh(rbox(6.4, 0.4, 4.2, 0.1), clay(0xe7dccb), g, 0, 0.2, 0);
    [0, 1, 2].forEach((i) => mesh(rbox(2.6 - i * 0.2, 0.14, 0.4, 0.04), clay(0xf1e8d8), g, 0, 0.07 + i * 0.14, 2.3 - i * 0.2));
    mesh(rbox(5.6, 2.5, 3.0, 0.16), clay(0xfff1dc), g, 0, 1.65, -0.35);
    mesh(rbox(5.9, 0.3, 3.3, 0.1), clay(0xf3a15b), g, 0, 3.0, -0.35);
    const dome = mesh(new THREE.SphereGeometry(1.0, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), clay(0xf28b45), g, 0, 3.12, -0.35);
    dome.scale.y = 0.85;
    mesh(new THREE.SphereGeometry(0.14, 12, 10), clay(0xfacc15), g, 0, 4.0, -0.35);
    // Portico
    mesh(rbox(3.6, 0.3, 1.5, 0.1), clay(0xf3a15b), g, 0, 2.55, 1.6);
    mesh(gableRoof(3.6, 1.4, 0.6), clay(0xfff1dc), g, 0, 2.72, 1.6).rotation.y = 0;
    [-1.5, -0.5, 0.5, 1.5].forEach((x) => mesh(new THREE.CylinderGeometry(0.13, 0.15, 2.1, 12), clay(0xffffff), g, x, 1.45, 2.1));
    door(g, 0, 0.4, 1.16, 0.9, 1.2, 0x9a5b32);
    [-2.1, 2.1].forEach((x) => {
      windowPane(g, x, 1.4, 1.16);
      windowPane(g, x, 2.3, 1.16, 0.36, 0.36);
    });
    sign(g, 'COMMUNITY HALL', 0, 2.05, 1.2, 1.5, '#7c3aed');
    flag(g, 2.5, 3.15, -0.35, 1.3, [0xff9933, 0xffffff, 0x138808], waving);
  }

  /* ── 18. Bus stop & transport (checkpoint 15) ── */
  {
    const g = site('transport', 3.3, -9.4, 1.8, -0.3);
    mesh(rbox(2.8, 0.1, 1.4, 0.04), clay(0xd6d3d1), g, 0, 0.05, 0);
    mesh(rbox(2.7, 0.14, 1.3, 0.06), clay(0xf97316), g, 0, 1.75, 0);
    mesh(rbox(2.5, 1.2, 0.06, 0.03), clay(0xbfe6ff, { transparent: true, opacity: 0.7 }), g, 0, 1.05, -0.55);
    [-1.2, 1.2].forEach((x) => mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), clay(0x334155), g, x, 0.87, -0.5));
    bench(g, 0, -0.15);
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8), clay(0x334155), g, 1.6, 0.95, 0.4);
    const busSign = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 20), clay(0x2563eb), g, 1.6, 1.95, 0.4);
    busSign.rotation.x = Math.PI / 2;
    const traveller = makePerson(0x8b5cf6);
    traveller.position.set(-0.6, 0, 0.3);
    g.add(traveller);
  }

  /* ── 19. Water supply tower (checkpoint 16) ── */
  {
    const g = site('water-supply', 15.4, -13.6, 2.2);
    const steel = clay(0x94a3b8);
    [-0.85, 0.85].forEach((x) =>
      [-0.85, 0.85].forEach((z) => {
        const leg = mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), steel, g, x, 2.1, z);
        leg.rotation.z = -x * 0.05;
        leg.rotation.x = z * 0.05;
      })
    );
    [1.2, 2.6].forEach((y) => {
      mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), steel, g, 0, y, 0.85);
      mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), steel, g, 0, y, -0.85);
      mesh(new THREE.BoxGeometry(0.06, 0.06, 1.8), steel, g, 0.85, y, 0);
      mesh(new THREE.BoxGeometry(0.06, 0.06, 1.8), steel, g, -0.85, y, 0);
    });
    mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.14, 32), clay(0x64748b), g, 0, 4.2, 0);
    mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.6, 32), clay(0x4fb0ef), g, 0, 5.05, 0);
    [4.6, 5.5].forEach((y) => mesh(new THREE.TorusGeometry(1.31, 0.05, 6, 40), clay(0xffffff), g, 0, y, 0).rotation.x = Math.PI / 2);
    mesh(new THREE.SphereGeometry(1.3, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), clay(0x3b8fd6), g, 0, 5.85, 0).scale.y = 0.4;
    mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8), clay(0x2563eb), g, 0, 2.1, 0);
    mesh(rbox(1.4, 1.0, 1.1, 0.1), clay(0xe0f2fe), g, 1.9, 0.5, 0.9);
    mesh(rbox(1.6, 0.14, 1.3, 0.05), clay(0x2563eb), g, 1.9, 1.05, 0.9);
    sign(g, 'WATER', 0, 5.05, 1.33, 1.1, '#0369a1');
  }

  /* ── 20. Eco waste management (checkpoint 17) ── */
  {
    const g = site('waste-management', 10.4, -8.6, 1.6);
    mesh(rbox(2.8, 0.1, 1.6, 0.04), clay(0xd6d3d1), g, 0, 0.05, 0);
    [0x22c55e, 0x3b82f6, 0xef4444].forEach((c, i) => {
      mesh(rbox(0.6, 0.8, 0.6, 0.12), clay(c), g, -0.8 + i * 0.8, 0.5, -0.1);
      mesh(rbox(0.66, 0.1, 0.66, 0.04), clay(0x1f2937), g, -0.8 + i * 0.8, 0.95, -0.1);
    });
    const worker = makePerson(0x16a34a);
    worker.position.set(1.3, 0, 0.5);
    g.add(worker);
  }

  /* ── 21. Open cultural amphitheatre (checkpoint 18) ── */
  {
    const g = site('cultural-stage', 6.8, 13.8, 2.9);
    mesh(rbox(3.6, 0.5, 2.0, 0.1), clay(0xb7794a), g, 0, 0.25, -0.6);
    mesh(rbox(3.6, 2.2, 0.3, 0.1), clay(0x9f1239), g, 0, 1.6, -1.5);
    mesh(gableRoof(4.0, 2.4, 0.8), clay(0xf59e0b), g, 0, 2.7, -0.6).rotation.y = Math.PI / 2;
    [-1.7, 1.7].forEach((x) => {
      mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), clay(0xfacc15), g, x, 1.6, 0.4);
      mesh(rbox(0.4, 1.8, 0.14, 0.05), clay(0xdc2626), g, x * 0.88, 1.5, 0.3);
    });
    const arc = Math.PI - 0.9;
    for (let s = 0; s < 3; s++) {
      const row = mesh(new THREE.TorusGeometry(1.7 + s * 0.6, 0.2, 8, 28, arc), clay(0xe7dccb), g, 0, 0.18 + s * 0.2, -0.2);
      row.rotation.set(-Math.PI / 2, 0, 1.5 * Math.PI - arc / 2);
      row.scale.z = 1 + s * 0.6;
    }
    const dancer = makePerson(0xec4899);
    dancer.position.set(0, 0.5, -0.4);
    g.add(dancer);
    animators.push((time) => {
      if (!g.userData.painted) return;
      dancer.rotation.y = time * 2;
      dancer.position.y = 0.5 + Math.abs(Math.sin(time * 4)) * 0.12;
    });
  }

  /* ── 22. Festival fairground with Ferris wheel (checkpoint 19) ── */
  {
    const g = site('festival-ground', 0.8, 18.6, 3.4);
    mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.12, 48), clay(0xf3dcaa), g, 0, 0.06, 0);
    const frame = clay(0x7c3aed);
    [-0.45, 0.45].forEach((z) => {
      [-1, 1].forEach((sx) => {
        const leg = mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.3, 8), frame, g, sx * 0.8, 1.55, z);
        leg.rotation.z = sx * 0.45;
      });
    });
    const wheel = new THREE.Group();
    wheel.position.set(0, 2.95, 0);
    g.add(wheel);
    [-0.4, 0.4].forEach((z) => mesh(new THREE.TorusGeometry(1.9, 0.07, 8, 48), clay(0xec4899), wheel, 0, 0, z));
    const cars: THREE.Object3D[] = [];
    const carColors = [0xef4444, 0xfacc15, 0x22c55e, 0x3b82f6, 0xf97316, 0x14b8a6, 0xa855f7, 0xf472b6];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spoke = mesh(new THREE.BoxGeometry(0.05, 3.8, 0.05), clay(0xffffff), wheel, 0, 0, 0, false);
      spoke.rotation.z = a;
      const car = new THREE.Group();
      car.position.set(Math.cos(a) * 1.9, Math.sin(a) * 1.9, 0);
      mesh(rbox(0.45, 0.4, 0.55, 0.1), clay(carColors[i]), car, 0, -0.3, 0);
      wheel.add(car);
      cars.push(car);
    }
    mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.0, 12), clay(0xfacc15), wheel, 0, 0, 0).rotation.x = Math.PI / 2;
    animators.push((_, dt) => {
      if (!g.userData.painted) return;
      wheel.rotation.z += dt * 0.35;
      cars.forEach((c) => (c.rotation.z = -wheel.rotation.z));
    });
    // Festive tents & bunting
    [[-2.2, 1.4, '#ef4444'], [2.2, 1.3, '#3b82f6']].forEach(([x, z, c]) => {
      const tent = mesh(new THREE.ConeGeometry(0.9, 1.3, 8), stripeMaterial(c as string, '#ffffff'), g, x as number, 0.75, z as number);
      tent.rotation.y = 0.3;
    });
    const bunting = [0xef4444, 0xfacc15, 0x22c55e, 0x3b82f6, 0xf97316, 0xec4899];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const f = mesh(new THREE.ConeGeometry(0.14, 0.3, 3), clay(bunting[i % bunting.length]), g, Math.cos(a) * 3.0, 1.4, Math.sin(a) * 3.0, false);
      f.rotation.x = Math.PI;
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), clay(0xca8a04), g, Math.cos(a) * 3.05, 0.8, Math.sin(a) * 3.05);
    }
  }

  /* ── 23. Thriving town: balloons over the centre (checkpoint 20) ── */
  {
    const g = new THREE.Group();
    g.name = 'thriving-town';
    g.userData.distributed = true;
    g.userData.hideWhenLocked = true;
    root.add(g);
    buildings.set('thriving-town', g);
    const colors = [0xef4444, 0xfacc15, 0x3b82f6, 0x22c55e, 0xec4899, 0xf97316, 0xa855f7];
    for (let i = 0; i < 16; i++) {
      const b = new THREE.Group();
      const a = rand() * Math.PI * 2;
      const r = 3 + rand() * 12;
      b.position.set(Math.cos(a) * r, 7 + rand() * 4, Math.sin(a) * r);
      const balloon = mesh(new THREE.SphereGeometry(0.45, 16, 12), clay(colors[i % colors.length], { roughness: 0.35 }), b, 0, 0, 0);
      balloon.scale.y = 1.2;
      mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 4), clay(0xffffff), b, 0, -1.2, 0, false);
      g.add(b);
      const phase = rand() * 10;
      const baseY = b.position.y;
      animators.push((time) => {
        if (!g.visible) return;
        b.position.y = baseY + Math.sin(time * 0.8 + phase) * 0.4;
      });
    }
  }

  /* ── Landmark: temple on a hill (always built) ── */
  {
    const g = site('temple', -13.4, 13.2, 4.6, 0, landmarks);
    const hill = mesh(new THREE.SphereGeometry(4.6, 40, 20), clay(0x8cc65c), g, 0, -0.55, 0);
    hill.scale.y = 0.45;
    const topY = 4.6 * 0.45 - 0.6;
    mesh(rbox(2.8, 0.4, 2.8, 0.1), clay(0xe7dccb), g, 0, topY + 0.2, 0);
    mesh(rbox(2.0, 1.1, 2.0, 0.14), clay(0xfde7c7), g, 0, topY + 0.95, 0);
    const spireMat = clay(0xf2a65a);
    for (let i = 0; i < 5; i++) {
      mesh(new THREE.CylinderGeometry(0.85 - i * 0.16, 0.95 - i * 0.16, 0.5, 8), spireMat, g, 0, topY + 1.75 + i * 0.46, 0);
    }
    mesh(new THREE.SphereGeometry(0.2, 12, 10), clay(0xfacc15), g, 0, topY + 4.1, 0);
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), clay(0x9ca3af), g, 0, topY + 4.6, 0);
    const pennant = new THREE.Group();
    pennant.position.set(0, topY + 4.95, 0);
    const tri = mesh(new THREE.ConeGeometry(0.2, 0.6, 3), clay(0xff7a1a), pennant, 0.3, 0, 0, false);
    tri.rotation.z = -Math.PI / 2;
    g.add(pennant);
    waving.push(pennant);
    door(g, 0, topY + 0.4, 1.01, 0.55, 0.75, 0xb45309);
    for (let i = 0; i < 5; i++) mesh(rbox(1.0, 0.16, 0.5, 0.04), clay(0xe7dccb), g, 0, topY - 0.1 - i * 0.28, 1.6 + i * 0.5);
    [[-2.6, 1.2], [2.4, 1.6], [-1.8, -2.2], [2.2, -1.8]].forEach(([x, z]) => {
      const t = roundTree(0.6);
      t.position.set(x, 0.7, z);
      g.add(t);
    });
  }

  /* ── Fields (scenery) ── */
  const field = (u: number, v: number, w: number, d: number, color: number, rot = 0) => {
    const g = new THREE.Group();
    g.position.copy(toWorld(u, v));
    g.rotation.y = FACE + rot;
    root.add(g);
    mesh(rbox(w, 0.16, d, 0.06), clay(0xc9955e), g, 0, 0.08, 0);
    const rowMat = clay(color);
    for (let x = -w / 2 + 0.4; x <= w / 2 - 0.3; x += 0.55) mesh(rbox(0.32, 0.22, d - 0.4, 0.1), rowMat, g, x, 0.2, 0);
    footprints.push({ x: g.position.x, z: g.position.z, r: Math.max(w, d) / 2 + 0.3 });
  };
  field(11, -17.4, 3.8, 2.8, 0xfacc15, 0.35);
  field(18.8, 6.2, 3.2, 3.2, 0x84cc16, 0);
  field(-19.8, 6.6, 3.0, 3.4, 0xfacc15, 0.2);
  field(-6.8, -17.8, 3.6, 2.6, 0x84cc16, -0.2);

  /* ── 17. Road network: street lamps along the loop (checkpoint 14) ── */
  {
    const g = new THREE.Group();
    g.name = 'road-network';
    g.userData.distributed = true;
    root.add(g);
    buildings.set('road-network', g);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const p = loop.getPointAt(t);
      const tan = loop.getTangentAt(t);
      const nrm = new THREE.Vector3(-tan.z, 0, tan.x);
      if (nrm.dot(p) < 0) nrm.negate();
      const pos = p.clone().addScaledVector(nrm, 2.0);
      if (footprints.some((f) => Math.hypot(f.x - pos.x, f.z - pos.z) < f.r + 0.4)) continue;
      const lamp = new THREE.Group();
      lamp.position.copy(pos);
      mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.0, 8), clay(0x334155), lamp, 0, 1.0, 0);
      mesh(new THREE.SphereGeometry(0.2, 12, 10), clay(0xfff3c4, { emissive: 0xffd36b, emissiveIntensity: 0.5 }), lamp, 0, 2.1, 0);
      g.add(lamp);
    }
  }

  /* ── Scatter trees & bushes, avoiding roads, river and buildings ── */
  {
    const clearOf = (x: number, z: number, pad: number) => {
      if (Math.hypot(x, z) > R - 1.6) return false;
      if (footprints.some((f) => Math.hypot(f.x - x, f.z - z) < f.r + pad)) return false;
      if (loopPts.some((p) => Math.hypot(p.x - x, p.z - z) < 1.65 + pad)) return false;
      if (spurPts.some((p) => Math.hypot(p.x - x, p.z - z) < 1.65 + pad)) return false;
      if (lanePts.some((p) => Math.hypot(p.x - x, p.z - z) < 0.8 + pad)) return false;
      if (riverPts.some((p) => Math.hypot(p.x - x, p.z - z) < 2.4 + pad)) return false;
      return true;
    };
    let trees = 0;
    for (let tries = 0; tries < 900 && trees < 70; tries++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * (R - 1.5);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clearOf(x, z, 0.8)) continue;
      const nearRiver = riverPts.some((p) => Math.hypot(p.x - x, p.z - z) < 4.5);
      const t = nearRiver && rand() > 0.3 ? palmTree(0.8 + rand() * 0.3) : roundTree(0.7 + rand() * 0.45);
      t.position.set(x, 0, z);
      t.rotation.y = rand() * Math.PI * 2;
      root.add(t);
      footprints.push({ x, z, r: 0.9 });
      trees++;
    }
    let bushes = 0;
    for (let tries = 0; tries < 600 && bushes < 45; tries++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * (R - 1.2);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clearOf(x, z, 0.2)) continue;
      const b = bush(0.6 + rand() * 0.5);
      b.position.set(x, 0, z);
      root.add(b);
      bushes++;
    }
  }

  /* ── Bus following the loop road ── */
  const bus = new THREE.Group();
  {
    mesh(rbox(1.25, 1.1, 2.9, 0.28), clay(0xffc93c), bus, 0, 0.8, 0);
    mesh(rbox(1.3, 0.34, 2.5, 0.1), clay(0x1e3a8a, { roughness: 0.3 }), bus, 0, 1.0, -0.1);
    mesh(rbox(1.1, 0.4, 0.1, 0.06), clay(0x1e3a8a, { roughness: 0.3 }), bus, 0, 1.02, 1.42);
    mesh(rbox(1.3, 0.1, 2.95, 0.04), clay(0xef4444), bus, 0, 0.55, 0);
    [-0.5, 0.5].forEach((x) => mesh(new THREE.SphereGeometry(0.08, 8, 6), clay(0xfff7cc, { emissive: 0xfff1a8, emissiveIntensity: 0.6 }), bus, x * 0.8, 0.55, 1.45, false));
    [-0.62, 0.62].forEach((x) =>
      [-0.9, 0.9].forEach((z) => {
        const w = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 14), clay(0x1f2937), bus, x, 0.26, z);
        w.rotation.z = Math.PI / 2;
      })
    );
    root.add(bus);
  }
  let busT = 0.05;

  /* ── Walking residents on the pavements ── */
  const walkers: Array<{ p: THREE.Group; t: number; speed: number; off: number }> = [];
  for (let i = 0; i < 28; i++) {
    const p = makePerson(SHIRTS[i % SHIRTS.length], i % 4 === 3 ? 0.65 : 0.9);
    p.visible = false;
    root.add(p);
    walkers.push({ p, t: rand(), speed: (0.004 + rand() * 0.004) * (rand() > 0.5 ? 1 : -1), off: rand() > 0.5 ? 1.45 : -1.45 });
  }

  /* ── Clouds ── */
  const clouds: THREE.Group[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.95 });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Group();
    [[0, 0, 0, 1.2], [1.1, -0.2, 0.2, 0.9], [-1.0, -0.25, -0.1, 0.85], [0.3, 0.5, 0, 0.8]].forEach(([x, y, z, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), cloudMat);
      m.position.set(x, y, z);
      c.add(m);
    });
    // Clouds drift along the back arc of the sky so they never block the town
    c.userData.angle = -Math.PI * 0.75 + (i - 2) * 0.42;
    c.userData.phase = rand() * 10;
    c.userData.radius = 30 + rand() * 6;
    c.userData.y = 7 + rand() * 5;
    c.scale.setScalar(1.2 + rand() * 0.8);
    root.add(c);
    clouds.push(c);
  }

  /* ── Pin anchors: top of each labelled structure ── */
  const anchors = new Map<string, THREE.Vector3>();
  const box = new THREE.Box3();
  [...buildings, ...landmarks].forEach(([id, g]) => {
    if (g.userData.distributed || !g.children.length) return;
    box.setFromObject(g);
    anchors.set(id, new THREE.Vector3(g.position.x, box.max.y + 0.5, g.position.z));
  });

  const tmp = new THREE.Vector3();
  const update = (time: number, dt: number) => {
    // Bus
    busT = (busT + dt * 0.018) % 1;
    const bp = loop.getPointAt(busT);
    const bt = loop.getTangentAt(busT);
    bus.position.set(bp.x + bt.z * 0.62, 0.02 + Math.sin(time * 9) * 0.015, bp.z - bt.x * 0.62);
    bus.rotation.y = Math.atan2(bt.x, bt.z);

    walkers.forEach((w) => {
      if (!w.p.visible) return;
      w.t = (w.t + w.speed * dt + 1) % 1;
      const p = loop.getPointAt(w.t);
      const tan = loop.getTangentAt(w.t);
      tmp.set(-tan.z, 0, tan.x).multiplyScalar(w.off);
      w.p.position.set(p.x + tmp.x, Math.abs(Math.sin(time * 7 + w.t * 90)) * 0.05, p.z + tmp.z);
      w.p.rotation.y = Math.atan2(tan.x, tan.z) + (w.speed < 0 ? Math.PI : 0);
    });

    clouds.forEach((c) => {
      const a = c.userData.angle + Math.sin(time * 0.05 + c.userData.phase) * 0.25;
      c.position.set(Math.cos(a) * c.userData.radius, c.userData.y + Math.sin(time * 0.3 + c.userData.phase) * 0.3, Math.sin(a) * c.userData.radius);
    });

    waving.forEach((f, i) => (f.rotation.y = Math.sin(time * 3 + i) * 0.25));
    animators.forEach((fn) => fn(time, dt));
  };

  const setPopulation = (count: number) => {
    walkers.forEach((w, i) => (w.p.visible = i < count));
  };

  return { root, buildings, landmarks, anchors, setPopulation, update };
}

/** Dispose every geometry, material and texture under an object. */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mat) => {
      const std = mat as THREE.MeshStandardMaterial;
      std.map?.dispose();
      mat.dispose();
    });
  });
}
