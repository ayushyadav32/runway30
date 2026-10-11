import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, AlertTriangle, Flame, Compass } from 'lucide-react';

interface FinancialCore3DProps {
  healthScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'CRITICAL';
  className?: string;
  showBadge?: boolean;
}

/**
 * Checks if WebGL is supported safely in the current environment (FAIE headless-safe).
 */
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch (e) {
    return false;
  }
}

export const FinancialCore3D: React.FC<FinancialCore3DProps> = ({
  healthScore,
  riskLevel,
  className = '',
  showBadge = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // References for dynamic Three.js mutation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number>(0);
  
  // Linear / Revolut palette targets
  const primaryColorTarget = useRef<THREE.Color>(new THREE.Color('#10B981')); // Aurora Mint
  const secondaryColorTarget = useRef<THREE.Color>(new THREE.Color('#38BDF8')); // Cyber Blue
  const speedRef = useRef<number>(1.0);
  const pulseFreqRef = useRef<number>(2.0);

  // Update target colors & velocity reactively based on healthScore & riskLevel
  useEffect(() => {
    if (healthScore >= 750) {
      primaryColorTarget.current.set('#10B981'); // Aurora Mint
      secondaryColorTarget.current.set('#38BDF8'); // Cyber Blue
      speedRef.current = 0.85;
      pulseFreqRef.current = 1.8;
    } else if (healthScore >= 500) {
      primaryColorTarget.current.set('#F59E0B'); // Radiant Amber
      secondaryColorTarget.current.set('#FBBF24'); // Amber Gold
      speedRef.current = 1.25;
      pulseFreqRef.current = 2.4;
    } else {
      primaryColorTarget.current.set('#F43F5E'); // Neon Crimson
      secondaryColorTarget.current.set('#FB7185'); // Crimson Flare
      speedRef.current = 2.8; // High frequency alarm velocity
      pulseFreqRef.current = 5.6; // Rapid alarm pulse
    }
  }, [healthScore, riskLevel]);

  // Main WebGL Initializer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. FAIE Headless-Safe Verification
    if (!checkWebGLSupport()) {
      setWebGLSupported(false);
      return;
    }

    let isVisible = true;
    let isTabActive = !document.hidden;

    // Setup Three.js dimensions
    const width = container.clientWidth || 288;
    const height = container.clientHeight || 288;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;

    try {
      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 6.4;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      rendererRef.current = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      // Fallback cleanly without crashing in headless / restricted environments
      setWebGLSupported(false);
      return;
    }

    // 2. Build 3D Financial Core Object Hierarchy
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Outer Geodesic Wireframe Sphere / Icosahedron Cage
    const outerGeo = new THREE.IcosahedronGeometry(2.05, 1);
    geometries.push(outerGeo);
    const outerMat = new THREE.MeshBasicMaterial({
      color: primaryColorTarget.current,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    materials.push(outerMat);
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // Mid-level Geodesic Lattice (Counter-rotating)
    const midGeo = new THREE.IcosahedronGeometry(1.5, 0);
    geometries.push(midGeo);
    const midMat = new THREE.MeshBasicMaterial({
      color: secondaryColorTarget.current,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    materials.push(midMat);
    const midMesh = new THREE.Mesh(midGeo, midMat);
    coreGroup.add(midMesh);

    // Primary Orbital Gyroscope Ring
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.022, 16, 100);
    geometries.push(ring1Geo);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: primaryColorTarget.current,
      transparent: true,
      opacity: 0.65,
    });
    materials.push(ring1Mat);
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    coreGroup.add(ring1Mesh);

    // Secondary Counter-Rotating Gyroscope Ring
    const ring2Geo = new THREE.TorusGeometry(2.45, 0.016, 16, 100);
    geometries.push(ring2Geo);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: secondaryColorTarget.current,
      transparent: true,
      opacity: 0.45,
    });
    materials.push(ring2Mat);
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 3;
    coreGroup.add(ring2Mesh);

    // Floating Inner Luminous Crystal Core (Faceted Icosahedron for high-tech jewel look)
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 0);
    geometries.push(innerGeo);
    const innerMat = new THREE.MeshStandardMaterial({
      color: primaryColorTarget.current,
      emissive: primaryColorTarget.current,
      emissiveIntensity: 1.25,
      roughness: 0.12,
      metalness: 0.88,
      flatShading: true,
    });
    materials.push(innerMat);
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Starfield Particle Field (Orbiting ambient neon particles - optimized to 80 for 60FPS)
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    geometries.push(particleGeo);
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.3 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: secondaryColorTarget.current,
      size: 0.055,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    materials.push(particleMat);
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryColorTarget.current, 3.2, 22);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(4, 6, 5);
    scene.add(dirLight);

    // 3. Mouse & Mobile Touch Interaction (Smooth Lerping)
    let targetRotX = 0;
    let targetRotY = 0;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const clampedX = Math.max(-1.2, Math.min(1.2, x));
      const clampedY = Math.max(-1.2, Math.min(1.2, y));
      targetRotY = clampedX * 0.75;
      targetRotX = -clampedY * 0.55;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    // 4. Performance: IntersectionObserver + VisibilityChange
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActive = false;
        cancelAnimationFrame(reqIdRef.current);
      } else {
        isTabActive = true;
        lastTime = performance.now();
        cancelAnimationFrame(reqIdRef.current);
        reqIdRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 288;
      const h = container.clientHeight || 288;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Render Loop
    let lastTime = performance.now();
    const startTime = performance.now();
    const currentPrimary = new THREE.Color().copy(primaryColorTarget.current);
    const currentSecondary = new THREE.Color().copy(secondaryColorTarget.current);

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!isVisible || !isTabActive) return;

      const currentTime = performance.now();
      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      const elapsed = (currentTime - startTime) * 0.001;

      // Smooth color transitions
      currentPrimary.lerp(primaryColorTarget.current, 0.06);
      currentSecondary.lerp(secondaryColorTarget.current, 0.06);

      outerMat.color.copy(currentPrimary);
      midMat.color.copy(currentSecondary);
      ring1Mat.color.copy(currentPrimary);
      ring2Mat.color.copy(currentSecondary);
      innerMat.color.copy(currentPrimary);
      innerMat.emissive.copy(currentPrimary);
      particleMat.color.copy(currentSecondary);
      pointLight.color.copy(currentPrimary);

      // Rotation & Velocity
      const speed = speedRef.current;
      outerMesh.rotation.y += 0.35 * delta * speed;
      outerMesh.rotation.x += 0.18 * delta * speed;

      midMesh.rotation.y -= 0.5 * delta * speed;
      midMesh.rotation.z += 0.25 * delta * speed;

      ring1Mesh.rotation.z += 0.75 * delta * speed;
      ring2Mesh.rotation.z -= 0.6 * delta * speed;

      innerCore.rotation.y += 0.9 * delta * speed;
      innerCore.rotation.x += 0.45 * delta * speed;

      particleSystem.rotation.y += 0.14 * delta * speed;

      // Health-Reactive Pulse & Jitter
      const isCritical = healthScore < 500;
      const pulseFreq = pulseFreqRef.current;
      const pulseAmp = isCritical ? 0.24 : 0.08;
      const scale = 1.0 + Math.sin(elapsed * pulseFreq) * pulseAmp;
      innerCore.scale.set(scale, scale, scale);

      if (isCritical) {
        const jitter = (Math.random() - 0.5) * 0.035;
        innerCore.position.set(jitter, jitter * 0.7, 0);
        particleMat.size = 0.065 + Math.sin(elapsed * 12) * 0.02;
      } else {
        innerCore.position.set(0, 0, 0);
        particleMat.size = 0.052;
      }

      // Smooth Mouse Lerping
      coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.065;
      coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.065;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const getBadgeMeta = () => {
    if (healthScore >= 750) {
      return {
        label: 'CORE SAFE • OPTIMAL',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        icon: Zap,
      };
    } else if (healthScore >= 500) {
      return {
        label: 'CORE CAUTION • PACING',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'CORE ALARM • HIGH RISK',
        color: 'text-rose-400',
        bg: 'bg-rose-500/20 border-rose-500/40',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
        icon: Flame,
      };
    }
  };

  const badge = getBadgeMeta();
  const BadgeIcon = badge.icon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Three.js Canvas Container (or Fallback if WebGL unsupported) */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {webGLSupported ? (
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
          />
        ) : (
          /* FAIE Headless-Safe Fallback: CSS 3D Frosted Glass Core with Pulsing Glow */
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center animate-pulse">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-25 ${
              healthScore >= 750 ? 'bg-emerald-500' : healthScore >= 500 ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            
            <div className={`w-full h-full rounded-full border-2 border-dashed animate-spin ${
              healthScore >= 750 ? 'border-emerald-400/50' : healthScore >= 500 ? 'border-amber-400/50' : 'border-rose-400/50'
            }`} style={{ animationDuration: '8s' }} />
            
            <div className={`absolute w-3/4 h-3/4 rounded-full border border-dotted animate-spin ${
              healthScore >= 750 ? 'border-sky-400/60' : healthScore >= 500 ? 'border-amber-400/60' : 'border-rose-500/60'
            }`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />

            <div className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center ${
              healthScore >= 750 
                ? 'bg-gradient-to-tr from-emerald-500 to-sky-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                : healthScore >= 500 
                ? 'bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
                : 'bg-gradient-to-tr from-rose-600 to-red-400 shadow-[0_0_35px_rgba(244,63,94,0.6)]'
            }`}>
              <BadgeIcon className="w-8 h-8 text-black" />
            </div>
          </div>
        )}

        {/* Ambient Radial Backlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full blur-3xl opacity-25"
          style={{
            background:
              healthScore >= 750
                ? 'radial-gradient(circle, #10B981 0%, #38BDF8 40%, transparent 70%)'
                : healthScore >= 500
                ? 'radial-gradient(circle, #F59E0B 0%, #FBBF24 40%, transparent 70%)'
                : 'radial-gradient(circle, #F43F5E 0%, #EF4444 40%, transparent 70%)',
          }}
        />
      </div>

      {/* 💡 How It Works Callout Box */}
      <div className="mt-4 max-w-sm w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex items-start gap-2 text-slate-300 shadow-md">
        <span className="text-sm shrink-0">💡</span>
        <div className="space-y-0.5">
          <span className="font-bold text-white font-mono text-[11px] block uppercase tracking-wider text-cyan-400">[LIVE FINANCIAL RADAR]</span>
          <p className="text-[11px] leading-relaxed text-slate-300">
            <strong className="text-white">Visual Health Orb:</strong> Analyzes your remaining runway. It rotates green and calm when your daily spend is safe. If your expenses exceed safe limits, it shifts into pulsing crimson to warn of an upcoming deficit.
          </p>
        </div>
      </div>
    </div>
  );
};
