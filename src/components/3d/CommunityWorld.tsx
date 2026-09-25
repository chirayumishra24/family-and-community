import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CHECKPOINTS } from '../../data/communityCheckpoints';
import { Check, Lock, RotateCcw, Hand, Landmark } from 'lucide-react';
import { buildTown, setPainted, disposeObject, Town } from './townBuilder';

interface CommunityWorldProps {
  unlockedCount: number;
  unlockedBuildings: string[];
  lastUnlockedId: string | null;
  hintedBuildingId: string | null;
  onSelectBuilding?: (checkpointId: number) => void;
  isCompleted?: boolean;
}

// Labelled structures shown as floating pins over the 3D town
const PINS: Array<{ buildingId: string; label: string; landmark?: boolean }> = [
  { buildingId: 'temple', label: 'Temple / Place of Worship', landmark: true },
  { buildingId: 'community-hall', label: 'Community Hall' },
  { buildingId: 'park', label: 'Park & Playground' },
  { buildingId: 'health-centre', label: 'Health Centre' },
  { buildingId: 'school', label: 'School' },
  { buildingId: 'market', label: 'Market' },
  { buildingId: 'houses', label: 'Houses & Families' },
  { buildingId: 'water-supply', label: 'Water Supply' },
  { buildingId: 'transport', label: 'Roads & Transport' },
];

const FOV = 32;
const DEFAULT_POLAR = 0.98;
const DEFAULT_AZIMUTH = Math.PI / 4;
const TARGET = new THREE.Vector3(0, 0.6, 0);
const BUILD_DURATION = 1.3;

/** Camera distance that frames the whole island for the given aspect ratio. */
const fitDistance = (aspect: number) => {
  const vf = THREE.MathUtils.degToRad(FOV);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
  return Math.max(25 / Math.tan(hf / 2), 19.5 / Math.tan(vf / 2)) * 0.96;
};

export const CommunityWorld: React.FC<CommunityWorldProps> = ({
  unlockedCount,
  unlockedBuildings,
  lastUnlockedId,
  hintedBuildingId,
  onSelectBuilding,
  isCompleted = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const townRef = useRef<Town | null>(null);
  const pinRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const buildAnimsRef = useRef<Map<string, number>>(new Map());
  const burstRef = useRef<(pos: THREE.Vector3) => void>(() => {});
  const hintRef = useRef<{ beam: THREE.Mesh; ring: THREE.Mesh } | null>(null);
  const resetViewRef = useRef<() => void>(() => {});
  const clockRef = useRef<THREE.Timer | null>(null);
  const seenLastIdRef = useRef<string | null>(lastUnlockedId);

  const isBuildingUnlocked = (buildingId: string) => {
    if (isCompleted || unlockedBuildings.includes(buildingId)) return true;
    const idx = CHECKPOINTS.findIndex((cp) => cp.buildingId === buildingId);
    return idx >= 0 && idx < unlockedCount;
  };

  /* ── Scene setup (once) ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const sky = document.createElement('canvas');
    sky.width = 4;
    sky.height = 256;
    const sctx = sky.getContext('2d')!;
    const grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#9fd6ff');
    grad.addColorStop(0.55, '#d9efff');
    grad.addColorStop(1, '#fff3e0');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.CanvasTexture(sky);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;

    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Soft, warm "clay studio" lighting
    scene.add(new THREE.HemisphereLight(0xe8f4ff, 0xd9c3a0, 1.5));
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.3);
    sun.position.set(22, 38, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 110;
    const sc = sun.shadow.camera;
    sc.left = -30;
    sc.right = 30;
    sc.top = 30;
    sc.bottom = -30;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfdcff, 0.55);
    fill.position.set(-20, 16, -18);
    scene.add(fill);

    const town = buildTown();
    scene.add(town.root);
    townRef.current = town;

    // Hint beacon: light beam + pulsing ground ring
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 1.6, 20, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    beam.visible = false;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.18, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xffc233, transparent: true, opacity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    scene.add(beam, ring);
    hintRef.current = { beam, ring };

    // Celebration particles (round sprites, multi-coloured)
    const PCOUNT = 220;
    const dot = document.createElement('canvas');
    dot.width = dot.height = 32;
    const dctx = dot.getContext('2d')!;
    dctx.fillStyle = '#fff';
    dctx.beginPath();
    dctx.arc(16, 16, 14, 0, Math.PI * 2);
    dctx.fill();
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PCOUNT * 3).fill(-100);
    const pCol = new Float32Array(PCOUNT * 3);
    const pVel = new Float32Array(PCOUNT * 3);
    const palette = [0xffc233, 0xff6b9a, 0x4fb0ef, 0x7ed957, 0xffffff].map((c) => new THREE.Color(c));
    for (let i = 0; i < PCOUNT; i++) palette[i % palette.length].toArray(pCol, i * 3);
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ size: 0.55, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, depthWrite: false, alphaTest: 0.1 })
    );
    particles.frustumCulled = false;
    scene.add(particles);
    let particleLife = 0;
    burstRef.current = (pos: THREE.Vector3) => {
      for (let i = 0; i < PCOUNT; i++) {
        pPos[i * 3] = pos.x + (Math.random() - 0.5) * 2;
        pPos[i * 3 + 1] = pos.y + 1;
        pPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 2;
        pVel[i * 3] = (Math.random() - 0.5) * 9;
        pVel[i * 3 + 1] = Math.random() * 9 + 5;
        pVel[i * 3 + 2] = (Math.random() - 0.5) * 9;
      }
      pGeo.attributes.position.needsUpdate = true;
      particleLife = 2;
    };

    // Orbit controls (mouse, touch & smart-board friendly)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.8;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.22;

    let fitDist = 70;
    const placeCamera = (dist: number) => {
      const sph = new THREE.Spherical(dist, DEFAULT_POLAR, DEFAULT_AZIMUTH);
      camera.position.setFromSpherical(sph).add(TARGET);
      camera.lookAt(TARGET);
    };

    let resetTween: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
    resetViewRef.current = () => {
      const to = new THREE.Vector3().setFromSpherical(new THREE.Spherical(fitDist, DEFAULT_POLAR, DEFAULT_AZIMUTH)).add(TARGET);
      resetTween = { from: camera.position.clone(), to, t: 0 };
    };

    const size = { w: 1, h: 1 };
    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      size.w = w;
      size.h = h;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitDist = fitDistance(camera.aspect);
      controls.minDistance = fitDist * 0.4;
      controls.maxDistance = fitDist * 1.35;
      placeCamera(fitDist);
      controls.update();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const timer = new THREE.Timer();
    clockRef.current = timer;
    const proj = new THREE.Vector3();
    let raf = 0;

    const animate = (ts: number) => {
      raf = requestAnimationFrame(animate);
      timer.update(ts);
      const rawDt = timer.getDelta();
      const dt = Number.isFinite(rawDt) ? THREE.MathUtils.clamp(rawDt, 0, 0.05) : 0;
      const time = timer.getElapsed();

      if (resetTween) {
        resetTween.t = Math.min(1, resetTween.t + dt / 0.7);
        const e = 1 - Math.pow(1 - resetTween.t, 3);
        camera.position.lerpVectors(resetTween.from, resetTween.to, e);
        if (resetTween.t >= 1) resetTween = null;
      }
      controls.update();

      town.update(time, dt);

      // Construction bounce for freshly unlocked buildings
      buildAnimsRef.current.forEach((start, id) => {
        const g = town.buildings.get(id);
        const p = Math.min(1, (time - start) / BUILD_DURATION);
        const e = 1 - Math.pow(1 - p, 3);
        const wobble = Math.sin(p * Math.PI * 3) * Math.exp(-p * 4) * 0.35;
        const sy = 0.05 + e * 0.95 + Math.max(0, wobble);
        const sxz = 1 + wobble * 0.25;
        const targets = g?.userData.distributed ? g.children : g ? [g] : [];
        targets.forEach((t) => t.scale.set(sxz, sy, sxz));
        if (p >= 1) {
          targets.forEach((t) => t.scale.set(1, 1, 1));
          buildAnimsRef.current.delete(id);
        }
      });

      // Hint beacon pulse
      if (beam.visible) {
        (beam.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(time * 5) * 0.12;
        ring.scale.setScalar(1 + Math.sin(time * 4) * 0.12);
      }

      // Particles
      if (particleLife > 0) {
        particleLife -= dt;
        for (let i = 0; i < PCOUNT; i++) {
          pPos[i * 3] += pVel[i * 3] * dt;
          pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
          pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
          pVel[i * 3 + 1] -= 12 * dt;
          if (particleLife <= 0) pPos[i * 3 + 1] = -100;
        }
        pGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);

      // Move HTML pins directly (no React re-render per frame)
      PINS.forEach((pin, i) => {
        const el = pinRefs.current[i];
        const anchor = town.anchors.get(pin.buildingId);
        if (!el || !anchor) return;
        proj.copy(anchor).project(camera);
        const rawX = (proj.x * 0.5 + 0.5) * size.w;
        const y = (-proj.y * 0.5 + 0.5) * size.h;
        const onScreen = proj.z < 1 && rawX > 0 && rawX < size.w && y > 40 && y < size.h;
        // Keep the whole label inside the panel
        const half = el.offsetWidth / 2 + 8;
        const x = THREE.MathUtils.clamp(rawX, half, Math.max(half, size.w - half));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        el.style.opacity = onScreen ? '1' : '0';
        el.style.pointerEvents = onScreen ? 'auto' : 'none';
        el.style.zIndex = String(1000 - Math.round(proj.z * 1000));
      });
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposeObject(scene);
      skyTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      townRef.current = null;
      hintRef.current = null;
    };
  }, []);

  /* ── Paint unlocked buildings, leave the rest as unpainted clay ── */
  useEffect(() => {
    const town = townRef.current;
    if (!town) return;
    town.buildings.forEach((g, id) => {
      const unlocked = isBuildingUnlocked(id);
      setPainted(g, unlocked);
      if (g.userData.hideWhenLocked) g.visible = unlocked;
    });
    town.landmarks.forEach((g) => setPainted(g, true));
    town.setPopulation(isCompleted ? 28 : Math.min(26, 4 + Math.floor(unlockedCount * 1.2)));
  }, [unlockedCount, unlockedBuildings, isCompleted]);

  /* ── Construction animation + particle burst for the newest building ── */
  useEffect(() => {
    if (!lastUnlockedId || lastUnlockedId === seenLastIdRef.current) return;
    seenLastIdRef.current = lastUnlockedId;
    const town = townRef.current;
    const g = town?.buildings.get(lastUnlockedId);
    if (!town || !g || !clockRef.current) return;
    buildAnimsRef.current.set(lastUnlockedId, clockRef.current.getElapsed());
    const pos = g.userData.distributed ? new THREE.Vector3(0, 2, 0) : g.position.clone();
    burstRef.current(pos);
  }, [lastUnlockedId]);

  /* ── Hint beacon ── */
  useEffect(() => {
    const hint = hintRef.current;
    const town = townRef.current;
    if (!hint || !town) return;
    const target = hintedBuildingId ? town.buildings.get(hintedBuildingId) : null;
    const show = Boolean(target && !target.userData.distributed);
    hint.beam.visible = show;
    hint.ring.visible = show;
    if (target && show) {
      hint.beam.position.set(target.position.x, 10, target.position.z);
      hint.ring.position.set(target.position.x, 0.25, target.position.z);
    }
  }, [hintedBuildingId]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#d9efff]">
      {/* WebGL canvas */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating building pins (positioned every frame from the render loop) */}
      <div className="absolute inset-0 pointer-events-none">
        {PINS.map((pin, i) => {
          const unlocked = pin.landmark || isBuildingUnlocked(pin.buildingId);
          const isHinted = hintedBuildingId === pin.buildingId;
          const cp = CHECKPOINTS.find((c) => c.buildingId === pin.buildingId);
          return (
            <button
              key={pin.buildingId}
              ref={(el) => (pinRefs.current[i] = el)}
              onClick={() => cp && onSelectBuilding?.(cp.id)}
              style={{ opacity: 0 }}
              className="absolute left-0 top-0 pb-2 transition-opacity duration-200 will-change-transform"
            >
              <span
                className={`relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-[11px] xl:text-xs font-bold whitespace-nowrap shadow-[0_8px_16px_-6px_rgba(18,48,94,0.45),inset_0_-2px_4px_rgba(120,92,60,0.14),inset_0_2px_3px_rgba(255,255,255,0.9)] ${
                  isHinted
                    ? 'bg-amber-300 text-amber-950 scale-110 animate-bounce'
                    : unlocked
                    ? 'bg-white/95 text-[#12305e]'
                    : 'bg-white/80 text-slate-500'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white shadow-inner ${
                    pin.landmark ? 'bg-orange-500' : unlocked ? 'bg-blue-500' : 'bg-slate-400'
                  }`}
                >
                  {pin.landmark ? (
                    <Landmark className="w-3 h-3" />
                  ) : unlocked ? (
                    <Check className="w-3 h-3 stroke-[3.5]" />
                  ) : (
                    <Lock className="w-2.5 h-2.5" />
                  )}
                </span>
                {pin.label}
                <span
                  className={`absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 rounded-[2px] ${
                    isHinted ? 'bg-amber-300' : unlocked ? 'bg-white/95' : 'bg-white/80'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Hanging wooden sign */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
        <div className="clay-wood relative rounded-2xl px-6 xl:px-8 py-2 text-center">
          <div className="text-lg xl:text-2xl font-black tracking-wide uppercase font-display leading-none drop-shadow">
            Our Community
          </div>
          <div className="text-[9px] xl:text-[11px] font-bold tracking-[0.18em] text-amber-100/90 uppercase mt-1 whitespace-nowrap">
            A Place Where Everyone Matters
          </div>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#6b3a1a] shadow-inner" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#6b3a1a] shadow-inner" />
        </div>
      </div>

      {/* View controls */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <button
          onClick={() => resetViewRef.current()}
          title="Reset view"
          className="clay-sm clay-btn w-10 h-10 flex items-center justify-center text-blue-600"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="hidden xl:flex clay-sm items-center gap-1.5 px-3 h-10 text-[11px] font-bold text-slate-500 pointer-events-none">
          <Hand className="w-3.5 h-3.5 text-blue-500" />
          Drag to rotate · Pinch to zoom
        </div>
      </div>

      {/* Guidance note */}
      <div className="absolute bottom-3 right-3 z-20 max-w-[230px] clay-sm px-3.5 py-2.5 text-[11px] xl:text-xs font-semibold text-slate-600 leading-snug pointer-events-none">
        Build a complete community by answering questions about families, communities and their roles.
      </div>
    </div>
  );
};
