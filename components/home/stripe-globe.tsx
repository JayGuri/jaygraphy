"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Adapted stripe globe: single midnight theme, no controls, scoped to a card
export function StripeGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Midnight theme only
    const THEMES = {
      midnight: {
        sky0: [0x000003, 0x020510, 0x060d28],
        sky1: [0x060d28, 0x0c1840, 0x162048],
        fogMix: 0.0,
        strandR: 0.65,
        strandG: 0.78,
        strandB: 1.0,
        glowR: 0.15,
        glowG: 0.28,
        glowB: 0.8,
        opacity: 1.3,
      },
    } as const;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const hexToRGB = (hex: number) => [
      ((hex >> 16) & 255) / 255,
      ((hex >> 8) & 255) / 255,
      (hex & 255) / 255,
    ];

    const AF = THEMES.midnight;
    const cur = {
      sky0a: hexToRGB(AF.sky0[0]),
      sky0b: hexToRGB(AF.sky0[1]),
      sky0c: hexToRGB(AF.sky0[2]),
      sky1a: hexToRGB(AF.sky1[0]),
      sky1b: hexToRGB(AF.sky1[1]),
      sky1c: hexToRGB(AF.sky1[2]),
      fogMix: AF.fogMix,
      strandR: AF.strandR,
      strandG: AF.strandG,
      strandB: AF.strandB,
      glowR: AF.glowR,
      glowG: AF.glowG,
      glowB: AF.glowB,
      opacity: AF.opacity,
    };

    function lerpTheme() {
      const t = THEMES.midnight;
      const TL = 0.02;
      const lc = (a: number, b: number) => lerp(a, b, TL);
      (["sky0a", "sky0b", "sky0c", "sky1a", "sky1b", "sky1c"] as const).forEach(
        (k, i) => {
          const arr = i < 3 ? t.sky0 : t.sky1;
          const tgt = hexToRGB(arr[i % 3]);
          cur[k][0] = lc(cur[k][0], tgt[0]);
          cur[k][1] = lc(cur[k][1], tgt[1]);
          cur[k][2] = lc(cur[k][2], tgt[2]);
        }
      );
      cur.fogMix = lc(cur.fogMix, t.fogMix);
      cur.strandR = lc(cur.strandR, t.strandR);
      cur.strandG = lc(cur.strandG, t.strandG);
      cur.strandB = lc(cur.strandB, t.strandB);
      cur.glowR = lc(cur.glowR, t.glowR);
      cur.glowG = lc(cur.glowG, t.glowG);
      cur.glowB = lc(cur.glowB, t.glowB);
      cur.opacity = lc(cur.opacity, t.opacity);
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || 400;
      const height = rect.height || 300;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

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
      time: { value: 0.0 },
    };
    const bgMat = new THREE.ShaderMaterial({
      uniforms: bgUni,
      vertexShader:
        "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }",
      fragmentShader: `
        uniform vec3 sky0a, sky0b, sky0c;
        uniform vec3 sky1a, sky1b, sky1c;
        uniform float fogMix, time;
        varying vec2 vUv;
        vec3 triBlend(vec3 a, vec3 b, vec3 c, float t) {
          return t < 0.5 ? mix(a, b, t*2.) : mix(b, c, (t-0.5)*2.);
        }
        void main(){
          vec3 bottom = triBlend(sky1a, sky1b, sky1c, vUv.y);
          vec3 top    = triBlend(sky0a, sky0b, sky0c, vUv.y);
          vec3 col = mix(bottom, top, smoothstep(0.25, 0.85, vUv.y));
          float horizonMask = exp(-pow((vUv.y - 0.22)*8., 2.));
          vec3 horizonCol = mix(sky1a, sky1c, 0.5);
          col = mix(col, horizonCol, horizonMask * fogMix * 0.7);
          float sh = sin(vUv.x*120.+time*0.5)*sin(vUv.y*90.+time*0.35)*0.008;
          col += sh;
          gl_FragColor = vec4(clamp(col,0.,1.), 1.);
        }
      `,
      depthWrite: false,
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    const mainScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      (container.clientWidth || 400) / (container.clientHeight || 300),
      0.01,
      200
    );
    camera.position.set(0, 0, 5.2);
    camera.lookAt(0, 0, 0);

    const R = 1.82;
    const sphereCenter = new THREE.Vector3(0, 0, 0);
    const sphereObj = new THREE.Sphere(sphereCenter.clone(), R);

    const glowUni = {
      glowColor: { value: new THREE.Vector3(cur.glowR, cur.glowG, cur.glowB) },
      time: { value: 0.0 },
    };
    const globeMat = new THREE.ShaderMaterial({
      uniforms: glowUni,
      vertexShader: `
        varying vec3 vN; varying vec3 vP;
        void main(){
          vN = normalize(normalMatrix*normal);
          vP = position;
          gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.);
        }`,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float time;
        varying vec3 vN; varying vec3 vP;
        void main(){
          float fr = pow(clamp(dot(vN,vec3(0,0,1)),0.,1.), 1.6);
          float yB = clamp((-vP.y / 1.82 + 0.5) * 1.2, 0., 1.);
          float centr = exp(-pow(length(vec2(vP.x, vP.z))*0.7,2.));
          float alpha = fr*0.18 + yB*fr*0.14 + centr*0.07;
          vec3 col = mix(glowColor*0.5, glowColor*1.4, yB*fr + centr*0.4);
          gl_FragColor = vec4(col, clamp(alpha,0.,1.));
        }`,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R, 80, 80),
      globeMat
    );
    globeMesh.position.copy(sphereCenter);
    mainScene.add(globeMesh);

    // Helper math from original
    function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number) {
      const dot = Math.max(-1, Math.min(1, a.dot(b)));
      if (Math.abs(dot) > 0.9999) {
        return new THREE.Vector3().lerpVectors(a, b, t).normalize();
      }
      const theta = Math.acos(dot);
      const s = Math.sin(theta);
      const wa = Math.sin((1 - t) * theta) / s;
      const wb = Math.sin(t * theta) / s;
      return new THREE.Vector3(
        wa * a.x + wb * b.x,
        wa * a.y + wb * b.y,
        wa * a.z + wb * b.z
      );
    }

    function sphereDir(theta: number, phi: number) {
      return new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      ).normalize();
    }

    function slerpBezier(
      p0: THREE.Vector3,
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      p3: THREE.Vector3,
      t: number
    ) {
      const q0 = slerp(p0, p1, t);
      const q1 = slerp(p1, p2, t);
      const q2 = slerp(p2, p3, t);
      const r0 = slerp(q0, q1, t);
      const r1 = slerp(q1, q2, t);
      return slerp(r0, r1, t).normalize();
    }

    function catmullRom(pts: THREE.Vector3[], t: number) {
      const n = pts.length;
      const s = Math.max(0, Math.min(1 - 1e-6, t)) * (n - 1);
      const i = Math.floor(s);
      const f = s - i;
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(n - 1, i + 1)];
      const p3 = pts[Math.min(n - 1, i + 2)];
      const f2 = f * f;
      const f3 = f2 * f;
      return new THREE.Vector3(
        0.5 *
          ((2 * p1.x) +
            (-p0.x + p2.x) * f +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3),
        0.5 *
          ((2 * p1.y) +
            (-p0.y + p2.y) * f +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3),
        0.5 *
          ((2 * p1.z) +
            (-p0.z + p2.z) * f +
            (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * f2 +
            (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * f3)
      );
    }

    const CONV = sphereDir(Math.PI * 0.28, -Math.PI * 0.4);
    const NUM_STRANDS = 180;
    const SEG = 80;
    const strands: any[] = [];

    for (let i = 0; i < NUM_STRANDS; i++) {
      let endN: THREE.Vector3;
      let tries = 0;
      do {
        const u = Math.random();
        const v = Math.random();
        const theta = Math.acos(2 * u - 1);
        const phi = v * Math.PI * 2.0;
        endN = sphereDir(theta, phi);
        tries++;
      } while (
        (endN.dot(new THREE.Vector3(0, 0, 1)) < -0.1 ||
          endN.distanceTo(CONV) < 0.18) &&
        tries < 60
      );

      const perp = new THREE.Vector3().crossVectors(CONV, endN).normalize();
      const curve = (Math.random() - 0.5) * 0.8;

      const c1 = slerp(CONV, endN, 0.33)
        .addScaledVector(perp, curve * 0.45)
        .normalize();
      const c2 = slerp(CONV, endN, 0.67)
        .addScaledVector(perp, curve * 0.32)
        .normalize();

      const basePts: THREE.Vector3[] = [];
      for (let s = 0; s <= SEG; s++) {
        const t = s / SEG;
        const dir = slerpBezier(CONV, c1, c2, endN, t);
        basePts.push(
          new THREE.Vector3(
            dir.x * R + sphereCenter.x,
            dir.y * R + sphereCenter.y,
            dir.z * R + sphereCenter.z
          )
        );
      }

      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array((SEG + 1) * 3);
      basePts.forEach((p, j) => {
        posArr[j * 3] = p.x;
        posArr[j * 3 + 1] = p.y;
        posArr[j * 3 + 2] = p.z;
      });
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

      const baseOpacity = 0.11 + Math.random() * 0.26;
      const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: baseOpacity,
      });
      const line = new THREE.Line(geo, mat);
      mainScene.add(line);

      const speed = 0.2 + Math.random() * 0.58;
      const offset = Math.random();
      const pelletSize = 0.006 + Math.random() * 0.009;
      const TRAIL = 4;

      const pelletGeo = new THREE.SphereGeometry(pelletSize, 8, 8);
      const pelletMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
      });
      const pellet = new THREE.Mesh(pelletGeo, pelletMat);
      mainScene.add(pellet);

      const trailPellets: any[] = [];
      for (let tr = 0; tr < TRAIL; tr++) {
        const frac = 1 - (tr + 1) / (TRAIL + 1);
        const tg = new THREE.SphereGeometry(pelletSize * frac * 0.9, 7, 7);
        const tm = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.7 * frac,
        });
        const tp = new THREE.Mesh(tg, tm);
        mainScene.add(tp);
        trailPellets.push({ mesh: tp, mat: tm, baseFrac: frac });
      }

      strands.push({
        line,
        geo,
        mat,
        basePts,
        pellet,
        pelletMat,
        trailPellets,
        speed,
        offset,
        baseOpacity,
        pullVec: new THREE.Vector3(),
        targetPull: new THREE.Vector3(),
        pulseOffset: Math.random() * Math.PI * 2,
        trailGap: 0.022 + Math.random() * 0.018,
      });
    }

    const mouseNDC = new THREE.Vector2(-9999, -9999);
    let mouseSphere: THREE.Vector3 | null = null;
    let isClicking = false;
    let clickBurst = 0;
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseNDC.set(x, y);
    };
    const onMouseLeave = () => {
      mouseNDC.set(-9999, -9999);
      mouseSphere = null;
    };
    const onMouseDown = () => {
      isClicking = true;
      clickBurst = 1;
    };
    const onMouseUp = () => {
      isClicking = false;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);

    const updateMouseHit = () => {
      raycaster.setFromCamera(mouseNDC, camera);
      const t = new THREE.Vector3();
      mouseSphere = raycaster.ray.intersectSphere(sphereObj, t) ? t.clone() : null;
    };

    window.addEventListener("resize", resize);
    resize();

    let time = 0;
    const qq = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const CURSOR_R = 0.88;
    const PULL_BASE = 0.38;
    const PULL_CLICK = 0.8;
    const PULL_LERP = 0.065;
    const deformedBuf: THREE.Vector3[] = [];
    for (let j = 0; j <= SEG; j++) deformedBuf.push(new THREE.Vector3());

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.0038;
      clickBurst *= 0.88;
      updateMouseHit();
      lerpTheme();

      bgUni.sky0a.value.set(...cur.sky0a);
      bgUni.sky0b.value.set(...cur.sky0b);
      bgUni.sky0c.value.set(...cur.sky0c);
      bgUni.sky1a.value.set(...cur.sky1a);
      bgUni.sky1b.value.set(...cur.sky1b);
      bgUni.sky1c.value.set(...cur.sky1c);
      bgUni.fogMix.value = cur.fogMix;
      bgUni.time.value = time;

      glowUni.glowColor.value.set(cur.glowR, cur.glowG, cur.glowB);
      glowUni.time.value = time;

      const curR = CURSOR_R * (1.0 + clickBurst * 0.55);
      const pullStrength = isClicking
        ? PULL_CLICK + clickBurst * 0.4
        : PULL_BASE + clickBurst * 0.25;

      for (const s of strands) {
        const pts = s.basePts as THREE.Vector3[];
        const posArr = s.geo.attributes.position.array as Float32Array;

        s.targetPull.set(0, 0, 0);
        if (mouseSphere) {
          const endW = pts[SEG];
          const d = endW.distanceTo(mouseSphere);
          if (d < curR) {
            const inf = 1 - d / curR;
            const ease = qq(inf);
            s.targetPull
              .subVectors(mouseSphere, endW)
              .multiplyScalar(ease * pullStrength);
          }
        }
        const pl =
          s.targetPull.lengthSq() > 0.001 ? PULL_LERP * 1.4 : PULL_LERP * 0.7;
        s.pullVec.lerp(s.targetPull, pl);

        const pull = s.pullVec as THREE.Vector3;
        for (let j = 0; j <= SEG; j++) {
          const t = j / SEG;
          const rawT = Math.max(0, (t - 0.25) / 0.75);
          const taper = rawT * rawT * (3 - 2 * rawT);
          const p = pts[j];
          posArr[j * 3] = p.x + pull.x * taper;
          posArr[j * 3 + 1] = p.y + pull.y * taper;
          posArr[j * 3 + 2] = p.z + pull.z * taper;
          deformedBuf[j].set(
            posArr[j * 3],
            posArr[j * 3 + 1],
            posArr[j * 3 + 2]
          );
        }
        s.geo.attributes.position.needsUpdate = true;

        const pulse =
          0.82 + 0.18 * Math.sin(time * s.speed * 2.2 + s.pulseOffset);
        s.mat.opacity = s.baseOpacity * pulse * cur.opacity;
        s.mat.color.setRGB(cur.strandR, cur.strandG, cur.strandB);

        const pT = ((time * s.speed + s.offset) % 1.0) as number;
        const pelletPos = catmullRom(deformedBuf, pT);
        s.pellet.position.copy(pelletPos);

        const pPulse =
          0.75 + 0.25 * Math.sin(time * 4.0 + s.pulseOffset * 1.7);
        s.pelletMat.opacity = pPulse * cur.opacity;
        s.pelletMat.color.setRGB(cur.strandR, cur.strandG, cur.strandB);
        s.pellet.scale.setScalar(0.75 + 0.5 * pPulse);

        for (let tr = 0; tr < s.trailPellets.length; tr++) {
          const { mesh, mat, baseFrac } = s.trailPellets[tr];
          const trT = Math.max(0, pT - s.trailGap * (tr + 1));
          mesh.position.copy(catmullRom(deformedBuf, trT));
          mat.opacity = baseFrac * 0.65 * cur.opacity;
          mat.color.setRGB(cur.strandR, cur.strandG, cur.strandB);
        }
      }

      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(mainScene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
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

