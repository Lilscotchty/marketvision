// src/components/dashboard/hero-3d-scene.tsx
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// --- 1. The Swarm (Cyan & White Data Particles) ---
function StarSwarm({ count = 200 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      return {
        initialPos: new THREE.Vector3().setFromSphericalCoords(radius, phi, theta),
        speed: 0.2 + Math.random() * 0.5,
        orbitAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        size: 0.02 + Math.random() * 0.04,
        // THEME CHANGE: Cyan, Blue, and White only
        color: Math.random() > 0.6 ? "#22d3ee" : (Math.random() > 0.3 ? "#60a5fa" : "#ffffff")
      };
    });
  }, [count]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const { initialPos, speed, orbitAxis } = particles[i];
      const angle = time * speed * 0.5;
      const pos = initialPos.clone().applyAxisAngle(orbitAxis, angle);
      const breathing = Math.sin(time * 2 + i) * 0.2;
      pos.add(pos.clone().normalize().multiplyScalar(breathing));

      mesh.position.copy(pos);
      mesh.rotation.x += 0.05;
      mesh.rotation.y += 0.05;
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh 
          key={i} 
          ref={(el) => { meshRefs.current[i] = el; }}
          scale={[p.size, p.size, p.size]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={p.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// --- 2. The Singularity (Polished Blue Core) ---
function TheSingularity() {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) coreRef.current.rotation.y = time * 0.1;
    if (outerRef.current) {
        outerRef.current.rotation.y = -time * 0.2;
        outerRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Core: Obsidian with Blue Reflection */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[1.8, 64, 64]} />
          <meshPhysicalMaterial 
            color="#000000"
            roughness={0}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0}
            emissive="#000814" // Very subtle dark blue glow
            envMapIntensity={2}
          />
        </mesh>

        {/* Shell: Cyan Wireframe */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[2.2, 2]} />
          <meshStandardMaterial 
            wireframe 
            color="#334155" 
            emissive="#06b6d4" // Cyan Emissive
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Halo: Blue Atmosphere */}
        <mesh scale={[2.6, 2.6, 2.6]}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} side={THREE.BackSide} />
        </mesh>
      </group>
    </Float>
  );
}

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        
        {/* THEME CHANGE: Lighting is now Cyan and Deep Blue */}
        <pointLight position={[-10, 5, 10]} intensity={2} color="#22d3ee" /> {/* Cyan Rim */}
        <pointLight position={[10, -5, 10]} intensity={2} color="#3b82f6" /> {/* Blue Rim */}
        <spotLight position={[0, 10, 0]} intensity={1} color="#e0f2fe" angle={0.5} />
        
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <TheSingularity />
        <StarSwarm count={200} />
        
        <fog attach="fog" args={['#030303', 5, 25]} />
      </Canvas>
    </div>
  );
}

