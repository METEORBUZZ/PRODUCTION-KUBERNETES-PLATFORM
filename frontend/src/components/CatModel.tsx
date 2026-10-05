import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CatModelProps {
  isHovered: boolean;
  isVoted: boolean;
  reducedMotion?: boolean;
}

export const CatModel: React.FC<CatModelProps> = ({ isHovered, isVoted, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const jumpProgress = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Idle floating bob
    if (!reducedMotion) {
      groupRef.current.position.y = Math.sin(time * 2.2) * 0.08;
      
      // Gentle idle sway
      groupRef.current.rotation.y = Math.sin(time * 1.2) * 0.15;

      // Tail swish
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(time * 3) * 0.25;
      }

      // Gentle head tilt when hovered
      if (headRef.current && isHovered) {
        headRef.current.rotation.z = Math.sin(time * 4) * 0.1;
      }
    }

    // Reaction on vote: celebratory jump & spin
    if (isVoted) {
      jumpProgress.current += delta * 4;
      if (jumpProgress.current <= Math.PI * 2) {
        const jumpY = Math.sin(jumpProgress.current) * 0.5;
        groupRef.current.position.y += jumpY;
        groupRef.current.rotation.y += delta * 8;
      }
    } else {
      jumpProgress.current = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={isHovered ? 1.08 : 1.0}>
      {/* Sci-Fi Glowing Pedestal */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[1.3, 1.4, 0.1, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Glowing Neon Ring */}
      <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.28, 32]} />
        <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.8, 0]} color="#06b6d4" intensity={2} distance={3} />

      {/* Cat Body */}
      <mesh position={[0, -0.25, 0]}>
        <capsuleGeometry args={[0.55, 0.5, 16, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.25}
          metalness={0.2}
          emissive="#0284c7"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Chest Accent (Creamy white) */}
      <mesh position={[0, -0.2, 0.38]} scale={[0.35, 0.45, 0.2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Collar with Golden Bell */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.48, 0.05, 16, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Bell */}
      <mesh position={[0, 0.08, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Cat Head Group */}
      <group ref={headRef} position={[0, 0.65, 0.05]}>
        {/* Main Head */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.25}
            metalness={0.2}
            emissive="#0284c7"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Left Ear */}
        <mesh position={[-0.32, 0.48, 0]} rotation={[0.1, 0, 0.35]}>
          <coneGeometry args={[0.22, 0.42, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Left Ear Inner */}
        <mesh position={[-0.3, 0.46, 0.08]} rotation={[0.1, 0, 0.35]}>
          <coneGeometry args={[0.14, 0.3, 16]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} />
        </mesh>

        {/* Right Ear */}
        <mesh position={[0.32, 0.48, 0]} rotation={[0.1, 0, -0.35]}>
          <coneGeometry args={[0.22, 0.42, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Right Ear Inner */}
        <mesh position={[0.3, 0.46, 0.08]} rotation={[0.1, 0, -0.35]}>
          <coneGeometry args={[0.14, 0.3, 16]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} />
        </mesh>

        {/* Glowing Eyes */}
        {/* Left Eye */}
        <mesh position={[-0.2, 0.08, 0.48]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#a7f3d0"
            emissive="#10b981"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
        {/* Left Pupil */}
        <mesh position={[-0.2, 0.08, 0.56]} scale={[0.4, 1.2, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#022c22" />
        </mesh>

        {/* Right Eye */}
        <mesh position={[0.2, 0.08, 0.48]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#a7f3d0"
            emissive="#10b981"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
        {/* Right Pupil */}
        <mesh position={[0.2, 0.08, 0.56]} scale={[0.4, 1.2, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#022c22" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.54]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.05, 0.05, 3]} />
          <meshStandardMaterial color="#f472b6" roughness={0.3} />
        </mesh>

        {/* Cute Whisker Lines */}
        <mesh position={[-0.32, -0.04, 0.5]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.25, 0.015, 0.015]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <mesh position={[-0.32, -0.09, 0.5]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.25, 0.015, 0.015]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <mesh position={[0.32, -0.04, 0.5]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.25, 0.015, 0.015]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <mesh position={[0.32, -0.09, 0.5]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.25, 0.015, 0.015]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
      </group>

      {/* Paws */}
      <mesh position={[-0.26, -0.85, 0.32]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[0.26, -0.85, 0.32]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Curved Tail */}
      <group ref={tailRef} position={[0, -0.6, -0.45]}>
        <mesh position={[0, 0.25, -0.15]} rotation={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.6, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.55, -0.32]} rotation={[-1.1, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.4, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.3} />
        </mesh>
        {/* Tail tip */}
        <mesh position={[0, 0.72, -0.46]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
