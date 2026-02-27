"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Full closed-orbit globe: each strand is a great circle so pellets complete full circuits
export function StripeGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // ── Theme ──────────────────────────────────────────────────────────────
    const THEME = {
      sky0: [0x000003, 0x020510, 0x060d28] as const,
      sky1: [0x060d28, 0x0c1840, 0x162048] as const,
      fogMix: 0.0,
      sR: 0.65, sG: 0.78, sB: 1.0,
      gR: 0.15, gG: 0.28, gB: 0.80,
      op: 1.3,
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const hexRGB = (hex: number): [number, number, number] => [
      ((hex >> 16) & 255) / 255,
      ((hex >> 8) & 255) / 255,
      (hex & 255) / 255,
    ];

    const cur = {
      sky0a: hexRGB(THEME.sky0[0]), sky0b: hexRGB(THEME.sky0[1]), sky0c: hexRGB(THEME.sky0[2]),
      sky1a: hexRGB(THEME.sky1[0]), sky1b: hexRGB(THEME.sky1[1]), sky1c: hexRGB(THEME.sky1[2]),
      fogMix: THEME.fogMix,
      sR: THEME.sR, sG: THEME.sG, sB: THEME.sB,
      gR: THEME.gR, gG: THEME.gG, gB: THEME.gB,
      op: THEME.op,
    };

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.autoClear = false;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
    camera.position.set(0, 0, 5.4);
    camera.lookAt(0, 0, 0);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const w = width || 400;
      const h = height || 300;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // ── Background scene ───────────────────────────────────────────────────
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgUni = {
      sky0a: { value: new THREE.Vector3(...cur.sky0a) },
      sky0b: { value: new THREE.Vector3(...cur.sky0b) },
      sky0c: { value: new THREE.Vector3(...cur.sky0c) },
      sky1a: { value: new THREE.Vector3(...cur.sky1a) },
      sky1b: { value: new THREE.Vector3(...cur.sky1b) },
      sky1c: { value: new THREE.Vector3(...cur.sky1c) },
      fogMix: { value: 0.0 },
      time:   { value: 0.0 },
    };
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: bgUni,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
      fragmentShader: `
        uniform vec3 sky0a,sky0b,sky0c,sky1a,sky1b,sky1c;
        uniform float fogMix,time;
        varying vec2 vUv;
        vec3 tri(vec3 a,vec3 b,vec3 c,float t){ return t<.5?mix(a,b,t*2.):mix(b,c,(t-.5)*2.); }
        void main(){
          vec3 bot=tri(sky1a,sky1b,sky1c,vUv.y);
          vec3 top=tri(sky0a,sky0b,sky0c,vUv.y);
          vec3 col=mix(bot,top,smoothstep(.2,.82,vUv.y));
          float hm=exp(-pow((vUv.y-.2)*9.,2.));
          col=mix(col,mix(sky1a,sky1c,.5),hm*fogMix*.65);
          col+=sin(vUv.x*130.+time*.5)*sin(vUv.y*100.+time*.38)*.007;
          gl_FragColor=vec4(clamp(col,0.,1.),1.);
        }`,
      depthWrite: false,
    })));

    // ── Main scene ─────────────────────────────────────────────────────────
    const mainScene = new THREE.Scene();
    const R = 1.80;
    const SC = new THREE.Vector3(0, 0, 0);
    const sphereObj = new THREE.Sphere(SC.clone(), R);

    // Globe glow
    const glowUni = {
      glow: { value: new THREE.Vector3(cur.gR, cur.gG, cur.gB) },
      time: { value: 0.0 },
    };
    mainScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 80, 80),
      new THREE.ShaderMaterial({
        uniforms: glowUni,
        vertexShader: `varying vec3 vN,vP; void main(){ vN=normalize(normalMatrix*normal); vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `
          uniform vec3 glow; uniform float time;
          varying vec3 vN,vP;
          void main(){
            float fr=pow(clamp(dot(vN,vec3(0,0,1)),0.,1.),1.7);
            float yb=clamp((-vP.y/1.8+.5)*1.1,0.,1.);
            float ct=exp(-pow(length(vec2(vP.x,vP.z))*.75,2.));
            float a=fr*.18+yb*fr*.13+ct*.06;
            vec3 col=mix(glow*.45,glow*1.5,yb*fr+ct*.4);
            gl_FragColor=vec4(col,clamp(a,0.,1.));
          }`,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
      })
    ));

    // ── Great-circle math ──────────────────────────────────────────────────
    // A great circle on a unit sphere: p(t) = cos(t)·U + sin(t)·V
    // where U,V are orthonormal vectors spanning the orbital plane.
    // t ∈ [0, 2π] → perfectly closed loop, every pellet orbits the full globe.

    function makeOrthonormal(n: THREE.Vector3): { u: THREE.Vector3; v: THREE.Vector3 } {
      const u = new THREE.Vector3();
      if (Math.abs(n.x) < 0.9) u.set(1, 0, 0); else u.set(0, 1, 0);
      u.sub(n.clone().multiplyScalar(u.dot(n))).normalize();
      const v = new THREE.Vector3().crossVectors(n, u).normalize();
      return { u, v };
    }

    // Catmull-Rom on a closed loop — wraps indices mod n
    function catmullClosed(pts: THREE.Vector3[], t: number): THREE.Vector3 {
      const n = pts.length - 1; // pts[0] === pts[n], so n unique points
      const s = (((t % 1) + 1) % 1) * n;
      const i = Math.floor(s);
      const f = s - i;
      const p0 = pts[((i - 1 + n) % n)];
      const p1 = pts[i % n];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const f2 = f * f, f3 = f2 * f;
      return new THREE.Vector3(
        0.5 * ((2 * p1.x) + (-p0.x + p2.x) * f + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3),
        0.5 * ((2 * p1.y) + (-p0.y + p2.y) * f + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3),
        0.5 * ((2 * p1.z) + (-p0.z + p2.z) * f + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * f2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * f3),
      );
    }

    // ── Build strands ──────────────────────────────────────────────────────
    // All great-circle normals are perpendicular to a shared focal direction,
    // so every orbit passes through that point → visual convergence like Stripe.
    const FOCAL = new THREE.Vector3(
      Math.sin(0.90) * Math.cos(-1.32),
      Math.cos(0.90),
      Math.sin(0.90) * Math.sin(-1.32),
    ).normalize();

    const NUM_STRANDS = 180;
    const SEG = 120; // segments — higher = smoother full circle
    const TRAIL_N = 5;

    interface Strand {
      line: THREE.LineLoop;
      geo: THREE.BufferGeometry;
      mat: THREE.LineBasicMaterial;
      basePts: THREE.Vector3[];
      posArr: Float32Array;
      pellet: THREE.Mesh;
      pelletMat: THREE.MeshBasicMaterial;
      trailPellets: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; frac: number }[];
      u: THREE.Vector3;
      v: THREE.Vector3;
      startAngle: number;
      speed: number;
      offset: number;
      baseOpacity: number;
      pulseOff: number;
      trailGap: number;
      pullVec: THREE.Vector3;
      targetPull: THREE.Vector3;
      _pullCenter: number;
    }

    const strands: Strand[] = [];

    for (let i = 0; i < NUM_STRANDS; i++) {
      // Pick a random vector perpendicular to FOCAL → this becomes the circle normal
      // so FOCAL lies on every circle (convergence guarantee)
      const rand = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize();
      const circleNormal = rand
        .sub(FOCAL.clone().multiplyScalar(rand.dot(FOCAL)))
        .normalize();

      const { u, v } = makeOrthonormal(circleNormal);

      // Align t=0 to FOCAL so strand appears to originate from focal point
      const startAngle = Math.atan2(FOCAL.dot(v), FOCAL.dot(u));

      // Bake full circle — SEG+1 points, last == first for seamless LineLoop
      const basePts: THREE.Vector3[] = [];
      for (let s = 0; s <= SEG; s++) {
        const angle = startAngle + (s / SEG) * Math.PI * 2;
        basePts.push(
          new THREE.Vector3()
            .addScaledVector(u, Math.cos(angle))
            .addScaledVector(v, Math.sin(angle))
            .multiplyScalar(R),
        );
      }

      const posArr = new Float32Array((SEG + 1) * 3);
      basePts.forEach((p, j) => {
        posArr[j * 3] = p.x;
        posArr[j * 3 + 1] = p.y;
        posArr[j * 3 + 2] = p.z;
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

      const baseOpacity = 0.09 + Math.random() * 0.22;
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: baseOpacity });
      const line = new THREE.LineLoop(geo, mat);
      mainScene.add(line);

      // Pellet
      const pelletSize = 0.007 + Math.random() * 0.009;
      const pelletMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
      const pellet = new THREE.Mesh(new THREE.SphereGeometry(pelletSize, 8, 8), pelletMat);
      mainScene.add(pellet);

      // Trail pellets
      const trailPellets: Strand["trailPellets"] = [];
      for (let tr = 0; tr < TRAIL_N; tr++) {
        const frac = 1 - (tr + 1) / (TRAIL_N + 1);
        const tm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 * frac });
        const tp = new THREE.Mesh(new THREE.SphereGeometry(pelletSize * frac * 0.85, 7, 7), tm);
        mainScene.add(tp);
        trailPellets.push({ mesh: tp, mat: tm, frac });
      }

      strands.push({
        line, geo, mat, basePts, posArr,
        pellet, pelletMat, trailPellets,
        u, v, startAngle,
        speed:      0.18 + Math.random() * 0.52,
        offset:     Math.random(),
        baseOpacity,
        pulseOff:   Math.random() * Math.PI * 2,
        trailGap:   0.018 + Math.random() * 0.016,
        pullVec:    new THREE.Vector3(),
        targetPull: new THREE.Vector3(),
        _pullCenter: -1,
      });
    }

    // ── Mouse ──────────────────────────────────────────────────────────────
    const mouseNDC = new THREE.Vector2(-9999, -9999);
    let mouseSphere: THREE.Vector3 | null = null;
    let isClicking = false;
    let clickBurst = 0;
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onMouseLeave = () => { mouseNDC.set(-9999, -9999); mouseSphere = null; };
    const onMouseDown  = () => { isClicking = true;  clickBurst = 1.0; };
    const onMouseUp    = () => { isClicking = false; };

    container.addEventListener("mousemove",  onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mousedown",  onMouseDown);
    container.addEventListener("mouseup",    onMouseUp);
    window.addEventListener("resize", resize);
    resize();

    const updateMouseHit = () => {
      raycaster.setFromCamera(mouseNDC, camera);
      const t = new THREE.Vector3();
      mouseSphere = raycaster.ray.intersectSphere(sphereObj, t) ? t.clone() : null;
    };

    // ── Animation ──────────────────────────────────────────────────────────
    let time = 0;
    const qq = (t: number) => t * t * t * (t * (t * 6 - 15) + 10); // quintic ease

    const CURSOR_R   = 0.95;
    const PULL_BASE  = 0.42;
    const PULL_CLICK = 0.85;
    const PULL_LRP   = 0.07;

    // Reusable deformed-path buffer — avoids per-frame allocation
    const defBuf: THREE.Vector3[] = Array.from({ length: SEG + 1 }, () => new THREE.Vector3());

    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.004;
      clickBurst *= 0.87;
      updateMouseHit();

      // Sync bg uniforms
      bgUni.sky0a.value.set(...cur.sky0a); bgUni.sky0b.value.set(...cur.sky0b); bgUni.sky0c.value.set(...cur.sky0c);
      bgUni.sky1a.value.set(...cur.sky1a); bgUni.sky1b.value.set(...cur.sky1b); bgUni.sky1c.value.set(...cur.sky1c);
      bgUni.fogMix.value = cur.fogMix;
      bgUni.time.value   = time;
      glowUni.glow.value.set(cur.gR, cur.gG, cur.gB);
      glowUni.time.value = time;

      const curR     = CURSOR_R * (1 + clickBurst * 0.6);
      const curPull  = isClicking ? PULL_CLICK + clickBurst * 0.35 : PULL_BASE + clickBurst * 0.22;

      for (const s of strands) {
        const { basePts, posArr } = s;

        // ── Cursor pull ──────────────────────────────────────────────────
        // Find closest point on the closed loop to the mouse hit point,
        // then apply a Gaussian-tapered displacement localised around it.
        s.targetPull.set(0, 0, 0);
        s._pullCenter = -1;

        if (mouseSphere) {
          let minD = Infinity, minJ = 0;
          for (let j = 0; j < SEG; j++) {
            const d = basePts[j].distanceTo(mouseSphere);
            if (d < minD) { minD = d; minJ = j; }
          }
          if (minD < curR) {
            const inf  = 1 - minD / curR;
            const ease = qq(inf);
            s.targetPull
              .subVectors(mouseSphere, basePts[minJ])
              .multiplyScalar(ease * curPull);
            s._pullCenter = minJ / SEG; // normalised position [0,1]
          }
        }

        const pl = s.targetPull.lengthSq() > 0.001 ? PULL_LRP * 1.5 : PULL_LRP * 0.65;
        s.pullVec.lerp(s.targetPull, pl);

        // Apply Gaussian-tapered pull around the closest point (wraps loop)
        const pull     = s.pullVec;
        const hasPull  = pull.lengthSq() > 1e-8;
        const pc       = s._pullCenter >= 0 ? s._pullCenter : 0.5;
        const sigma2   = 2 * 0.055 * 0.055;

        for (let j = 0; j <= SEG; j++) {
          const t = j / SEG;
          let taper = 0;
          if (hasPull) {
            let dt = Math.abs(t - pc);
            if (dt > 0.5) dt = 1 - dt; // wraparound distance
            taper = Math.exp(-(dt * dt) / sigma2);
          }
          const p = basePts[j];
          posArr[j * 3    ] = p.x + pull.x * taper;
          posArr[j * 3 + 1] = p.y + pull.y * taper;
          posArr[j * 3 + 2] = p.z + pull.z * taper;
          defBuf[j].set(posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]);
        }
        s.geo.attributes.position.needsUpdate = true;

        // ── Strand appearance ────────────────────────────────────────────
        const pulse = 0.80 + 0.20 * Math.sin(time * s.speed * 2.0 + s.pulseOff);
        s.mat.opacity = s.baseOpacity * pulse * cur.op;
        s.mat.color.setRGB(cur.sR, cur.sG, cur.sB);

        // ── Pellet — t ∈ [0,1) loops forever, full orbit every cycle ────
        const pT = (((time * s.speed + s.offset) % 1.0) + 1.0) % 1.0;
        s.pellet.position.copy(catmullClosed(defBuf, pT));

        const pPulse = 0.72 + 0.28 * Math.sin(time * 3.8 + s.pulseOff * 1.5);
        s.pelletMat.opacity = Math.min(1.0, pPulse * cur.op);
        s.pelletMat.color.setRGB(cur.sR, cur.sG, cur.sB);
        s.pellet.scale.setScalar(0.7 + 0.55 * pPulse);

        // ── Trail ────────────────────────────────────────────────────────
        for (let tr = 0; tr < s.trailPellets.length; tr++) {
          const { mesh, mat, frac } = s.trailPellets[tr];
          const trT = (((pT - s.trailGap * (tr + 1)) % 1.0) + 1.0) % 1.0;
          mesh.position.copy(catmullClosed(defBuf, trT));
          mat.opacity = frac * 0.60 * cur.op;
          mat.color.setRGB(cur.sR, cur.sG, cur.sB);
        }
      }

      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(mainScene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove",  onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mousedown",  onMouseDown);
      container.removeEventListener("mouseup",    onMouseUp);
      // Dispose Three.js resources
      strands.forEach(s => {
        s.geo.dispose();
        s.mat.dispose();
        s.pelletMat.dispose();
        s.trailPellets.forEach(tp => { tp.mat.dispose(); });
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[260px] md:h-[320px] rounded-3xl overflow-hidden border border-white/10 bg-black/40"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}