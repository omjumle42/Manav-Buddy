import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// ══════════════════════════════════════════
// SIMPLEX NOISE (3D) — Compact TypeScript Implementation
// ══════════════════════════════════════════
class SimplexNoise {
  private p: Uint8Array = new Uint8Array(256);
  private perm: Uint8Array = new Uint8Array(512);
  private permMod12: Uint8Array = new Uint8Array(512);

  private static grad3 = new Float32Array([
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
    1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
    0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
  ]);

  constructor(seed = 7) {
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    let s = seed * 65536;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const n = s % (i + 1);
      const q = this.p[i];
      this.p[i] = this.p[n];
      this.p[n] = q;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  public noise3D(xin: number, yin: number, zin: number): number {
    const grad3 = SimplexNoise.grad3;
    const F3 = 1 / 3;
    const G3 = 1 / 6;
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);

    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;

    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1 = 0, j1 = 0, k1 = 0, i2 = 0, j2 = 0, k2 = 0;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;

    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;

    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]] * 3;
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] * 3;
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] * 3;
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] * 3;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
    }

    return 32 * (n0 + n1 + n2 + n3);
  }
}

interface ConsciousnessOrbProps {
  state: "disconnected" | "connecting" | "listening" | "speaking";
  energy: number; // 0..1 based on frequency speech amplitude context
}

export const ConsciousnessOrb: React.FC<ConsciousnessOrbProps> = ({ state, energy }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core setup variables refs to update inside fluid loops
  const energyRef = useRef<number>(energy);
  const stateRef = useRef<string>(state);

  useEffect(() => {
    energyRef.current = energy;
    stateRef.current = state;
  }, [energy, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // CONFIG Matches the provided template exactly
    const CONFIG = {
      radius: 1.5,           // Base sphere radius
      pointCount: 8500,      // Particle density
      noiseFreq: 1.3,        // Surface bump frequency
      noiseAmp: 0.15,        // Surface bump strength (organic morphing)
      noiseSpeed: 0.16,      // Morph speed
      rotateSpeed: 0.05,     // Idle auto-rotation rate
      pointSize: 0.045,      // Point visual scale
      haloOpacity: 0.16
    };

    const noise = new SimplexNoise(7);

    // Dynamic state-based colors matching the professional aesthetic:
    // Listening (Cyan / Sky)
    // Speaking (Purple / Magenta / Indigo)
    // Connecting/Thinking (Gold / Pink / Orange)
    // Idle/Disconnected (Deep Slate Blue)
    const getColorsByState = (currentState: string) => {
      switch (currentState) {
        case "speaking":
          return {
            coreA: 0xa855f7, // Vivid Purple
            coreB: 0x4f46e5, // Deep Indigo
            rimA: 0xec4899,  // Bright Pink / Magenta
            rimB: 0xd946ef   // Fuschia
          };
        case "listening":
          return {
            coreA: 0x06b6d4, // Cyan
            coreB: 0x2563eb, // Royal Blue
            rimA: 0x38bdf8,  // Vibrant Sky Blue
            rimB: 0x818cf8   // Vivid Lavender
          };
        case "connecting":
          return {
            coreA: 0xf59e0b, // Amber
            coreB: 0xeab308, // Yellow
            rimA: 0xf97316,  // Orange
            rimB: 0x1d4ed8   // Distant Electric Blue
          };
        default: // disconnected or idle
          return {
            coreA: 0x1e293b, // Slate 800
            coreB: 0x0f172a, // Slate 900
            rimA: 0x334155,  // Slate 700
            rimB: 0x3b82f6   // Silent Electric Soft Blue
          };
      }
    };

    const currentColors = getColorsByState(stateRef.current);

    // SCENE SETUP
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    // Soft glowing radial texture
    const makeGlowTexture = () => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.65)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(c);
    };
    const glowTex = makeGlowTexture();

    // FIBONACCI SPHERE DISTRIBUTION (perfectly even particle spacing)
    const N = CONFIG.pointCount;
    const basePositions = new Float32Array(N * 3);
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);

    const cCoreA = new THREE.Color(currentColors.coreA);
    const cCoreB = new THREE.Color(currentColors.coreB);
    const cRimA = new THREE.Color(currentColors.rimA);
    const cRimB = new THREE.Color(currentColors.rimB);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      positions[i * 3] = x * CONFIG.radius;
      positions[i * 3 + 1] = y * CONFIG.radius;
      positions[i * 3 + 2] = z * CONFIG.radius;

      // Color mapping: blend based on latitude + subtle entropy
      const tMix = (y + 1) / 2;
      const mixA = cCoreA.clone().lerp(cRimA, tMix);
      const mixB = cCoreB.clone().lerp(cRimB, Math.random());
      const blendedColor = mixA.lerp(mixB, 0.3);

      colors[i * 3] = blendedColor.r;
      colors[i * 3 + 1] = blendedColor.g;
      colors[i * 3 + 2] = blendedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: CONFIG.pointSize,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // OUTER FRESNEL-GLOW FUSION HALO
    const haloGeometry = new THREE.SphereGeometry(CONFIG.radius * 1.12, 32, 32);
    const haloMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uRim: { value: cRimA },
        uCore: { value: cCoreA },
        uOpacity: { value: CONFIG.haloOpacity }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform vec3 uRim;
        uniform vec3 uCore;
        uniform float uOpacity;
        void main() {
          float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
          vec3 col = mix(uCore, uRim, fresnel);
          gl_FragColor = vec4(col, fresnel * uOpacity);
        }
      `
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(halo);

    // Dynamic mouse parallax tracking variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetMouseX = (event.clientX - cx) / (rect.width / 2);
      targetMouseY = (event.clientY - cy) / (rect.height / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Color Lerper helpers to support active state transitions
    const lerpedCoreA = cCoreA.clone();
    const lerpedCoreB = cCoreB.clone();
    const lerpedRimA = cRimA.clone();
    const lerpedRimB = cRimB.clone();

    // MAIN TRANSFORMS ANIMATION LOOP
    let tickTime = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      tickTime += 0.012;

      // Smooth state transitions backplane color interpolator
      const activeColors = getColorsByState(stateRef.current);
      const targetCoreA = new THREE.Color(activeColors.coreA);
      const targetCoreB = new THREE.Color(activeColors.coreB);
      const targetRimA = new THREE.Color(activeColors.rimA);
      const targetRimB = new THREE.Color(activeColors.rimB);

      // Lerp rate
      lerpedCoreA.lerp(targetCoreA, 0.04);
      lerpedCoreB.lerp(targetCoreB, 0.04);
      lerpedRimA.lerp(targetRimA, 0.04);
      lerpedRimB.lerp(targetRimB, 0.04);

      // Update shader uniforms
      haloMaterial.uniforms.uRim.value = lerpedRimA;
      haloMaterial.uniforms.uCore.value = lerpedCoreA;

      // Sync user mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Extract raw inputs
      const currentEnergy = Math.max(0, Math.min(1, energyRef.current));
      
      // Idle breathing pulse
      let idlePulse = Math.sin(tickTime * 0.5) * 0.5 + 0.5; // 0..1
      if (stateRef.current === "disconnected") {
        idlePulse *= 0.3; // calmer drift when disconnected
      }

      // Compute bump multiplier. Connection thinking has a high jitter frequency.
      const amp = CONFIG.noiseAmp * (0.5 + 0.5 * idlePulse) + currentEnergy * 0.28;
      const speedFactor = stateRef.current === "connecting" ? 2.5 : stateRef.current === "disconnected" ? 0.3 : 1.0;

      const posAttr = geometry.attributes.position;
      const colorAttr = geometry.attributes.color;

      for (let i = 0; i < N; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        // Sample simplex noise 3D
        const nValue = noise.noise3D(
          bx * CONFIG.noiseFreq + tickTime * CONFIG.noiseSpeed * speedFactor,
          by * CONFIG.noiseFreq + tickTime * CONFIG.noiseSpeed * speedFactor,
          bz * CONFIG.noiseFreq
        );

        // Displace points out from center
        const r = CONFIG.radius + nValue * amp;
        posAttr.array[i * 3] = bx * r;
        posAttr.array[i * 3 + 1] = by * r;
        posAttr.array[i * 3 + 2] = bz * r;

        // Color dynamic update for gorgeous voice ripple transitions
        if (i % 6 === 0) {
          const tMix = (by + 1) / 2;
          const mixColorA = lerpedCoreA.clone().lerp(lerpedRimA, tMix);
          // High intensity creates neon-white flash highlights inside the core
          const mixColorB = lerpedCoreB.clone().lerp(lerpedRimB, Math.random() + currentEnergy * 0.5);
          const blended = mixColorA.lerp(mixColorB, 0.2 + currentEnergy * 0.3);

          colorAttr.array[i * 3] = blended.r;
          colorAttr.array[i * 3 + 1] = blended.g;
          colorAttr.array[i * 3 + 2] = blended.b;
        }
      }

      posAttr.needsUpdate = true;
      if (Math.random() < 0.2) {
        colorAttr.needsUpdate = true;
      }

      // Spin variables
      const rotationSpeed = CONFIG.rotateSpeed * (1 + currentEnergy * 2);
      points.rotation.y += rotationSpeed * 0.012;
      points.rotation.x = Math.sin(tickTime * 0.1) * 0.06 + mouseY * 0.3;
      points.rotation.y += mouseX * 0.3;

      halo.rotation.copy(points.rotation);

      // Energy Scale Pulse
      const scale = 1 + currentEnergy * 0.08 + Math.sin(tickTime * 1.5) * 0.015;
      points.scale.setScalar(scale);
      halo.scale.setScalar(scale * 1.01);

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE SUPPORT
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 400;
      const h = containerRef.current.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      glowTex.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[360px] md:w-[480px] h-[360px] md:h-[480px] flex items-center justify-center select-none pointer-events-none transition-all duration-300"
    >
      <canvas ref={canvasRef} className="block w-full h-full object-contain pointer-events-auto" />
    </div>
  );
};
