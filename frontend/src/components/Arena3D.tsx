import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CatCharacter } from './CatCharacter';
import { DogCharacter } from './DogCharacter';

interface Arena3DProps {
  catVoted: boolean;
  dogVoted: boolean;
  isCatHovered?: boolean;
  isDogHovered?: boolean;
  onCatClick?: () => void;
  onDogClick?: () => void;
  reducedMotion?: boolean;
  isMobile?: boolean;
}

// Interactive Camera Rig that lerps with mouse parallax
const CameraRig: React.FC<{ reducedMotion: boolean; isMobile: boolean }> = ({
  reducedMotion,
  isMobile,
}) => {
  useFrame((state) => {
    if (reducedMotion) return;

    // Subtle natural mouse parallax
    const targetX = state.pointer.x * (isMobile ? 0.3 : 0.8);
    const targetY = state.pointer.y * 0.4 + (isMobile ? 0.2 : 0.4);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.lookAt(0, isMobile ? 0 : 0.1, 0);
  });

  return null;
};

// Subtle ambient motes/dust particles floating gently in the studio light
const AmbientMotes: React.FC<{ count?: number; reducedMotion: boolean }> = ({
  count = 35,
  reducedMotion,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = React.useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 4 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += delta * 0.08;
      if (array[i * 3 + 1] > 3) {
        array[i * 3 + 1] = -1;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#d4af37"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const Arena3D: React.FC<Arena3DProps> = ({
  catVoted,
  dogVoted,
  onCatClick,
  onDogClick,
  reducedMotion = false,
  isMobile = false,
}) => {
  // Desktop: Side-by-side [ -2.0, 0, 0 ] and [ 2.0, 0, 0 ]
  // Mobile: Vertically shifted or centered
  const catPos: [number, number, number] = isMobile ? [-1.3, 0.4, 0] : [-2.2, 0, 0];
  const dogPos: [number, number, number] = isMobile ? [1.3, -0.6, 0] : [2.2, 0, 0];

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] select-none">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, isMobile ? 5.2 : 4.4], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <CameraRig reducedMotion={reducedMotion} isMobile={isMobile} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.65} color="#faf7f2" />

        {/* Main Soft Key Light (Warm Sun/Studio key) */}
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.1}
          color="#fffaf0"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={15}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* Cool Rim Light from rear for silhouette depth */}
        <directionalLight position={[-4, 4, -4]} intensity={0.4} color="#e2e8f0" />

        {/* Subtle Warm Character Fill Lights */}
        <pointLight position={[-2.2, 1.5, 1.8]} intensity={0.8} color="#fde68a" distance={5} />
        <pointLight position={[2.2, 1.5, 1.8]} intensity={0.8} color="#fed7aa" distance={5} />

        {/* Soft Floor Arena */}
        <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 28]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Elegant Studio Arena Floor (Neutral Charcoal / Warm Graphite) */}
        <mesh position={[0, -1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.5, 64]} />
          <meshStandardMaterial
            color="#141312"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>

        {/* Subtle arena perimeter ring */}
        <mesh position={[0, -1.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.35, 5.42, 64]} />
          <meshBasicMaterial color="#383531" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Floating warm studio motes */}
        <AmbientMotes count={isMobile ? 18 : 35} reducedMotion={reducedMotion} />

        {/* 3D Cat Character */}
        <CatCharacter
          position={catPos}
          isVoted={catVoted}
          reducedMotion={reducedMotion}
          onClick={onCatClick}
        />

        {/* 3D Dog Character */}
        <DogCharacter
          position={dogPos}
          isVoted={dogVoted}
          reducedMotion={reducedMotion}
          onClick={onDogClick}
        />
      </Canvas>
    </div>
  );
};
