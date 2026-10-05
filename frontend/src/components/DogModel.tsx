import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DogModelProps {
  isHovered: boolean;
  isVoted: boolean;
  reducedMotion?: boolean;
}

export const DogModel: React.FC<DogModelProps> = ({ isHovered, isVoted, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Group>(null);
  const earRightRef = useRef<THREE.Group>(null);
  const jumpProgress = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Idle floating bob
    if (!reducedMotion) {
      groupRef.current.position.y = Math.sin(time * 2.2 + 1.0) * 0.08;
      
      // Gentle idle sway
      groupRef.current.rotation.y = Math.sin(time * 1.2 + 0.5) * 0.15;

      // Excited tail wagging (dogs wag vigorously!)
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(time * 9) * 0.45;
        tailRef.current.rotation.z = Math.cos(time * 9) * 0.15;
      }

      // Floppy ear bounce
      if (earLeftRef.current && earRightRef.current) {
        const earFlap = Math.sin(time * 3) * 0.08;
        earLeftRef.current.rotation.z = 0.4 + earFlap;
        earRightRef.current.rotation.z = -0.4 - earFlap;
      }
    }

    // Reaction on vote: celebratory excited bounce
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
      {/* Glowing Neon Ring (Orange / Amber) */}
      <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.28, 32]} />
        <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.8, 0]} color="#f97316" intensity={2} distance={3} />

      {/* Dog Body */}
      <mesh position={[0, -0.25, 0]}>
        <capsuleGeometry args={[0.58, 0.55, 16, 24]} />
        <meshStandardMaterial
          color="#fb923c"
          roughness={0.3}
          metalness={0.15}
          emissive="#ea580c"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Chest Patch (Warm Cream) */}
      <mesh position={[0, -0.2, 0.4]} scale={[0.38, 0.48, 0.2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffedd5" roughness={0.5} />
      </mesh>

      {/* Collar with Golden Bone Tag */}
      <mesh position={[0, 0.14, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 32]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Golden Bone Pendant */}
      <mesh position={[0, 0.09, 0.53]}>
        <boxGeometry args={[0.18, 0.07, 0.05]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Dog Head Group */}
      <group position={[0, 0.65, 0.08]}>
        {/* Main Head */}
        <mesh>
          <sphereGeometry args={[0.56, 32, 32]} />
          <meshStandardMaterial
            color="#fb923c"
            roughness={0.3}
            metalness={0.15}
            emissive="#ea580c"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Snout / Muzzle */}
        <mesh position={[0, -0.06, 0.44]} scale={[1, 0.8, 1.2]}>
          <boxGeometry args={[0.36, 0.32, 0.36]} />
          <meshStandardMaterial color="#ffedd5" roughness={0.4} />
        </mesh>

        {/* Black Nose */}
        <mesh position={[0, 0.03, 0.66]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Happy Cute Tongue */}
        <mesh position={[0, -0.16, 0.58]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.12, 0.16, 0.03]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.3} />
        </mesh>

        {/* Floppy Left Ear */}
        <group ref={earLeftRef} position={[-0.42, 0.3, 0]}>
          <mesh position={[0, -0.22, 0]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.14, 0.36, 16, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.35} />
          </mesh>
        </group>

        {/* Floppy Right Ear */}
        <group ref={earRightRef} position={[0.42, 0.3, 0]}>
          <mesh position={[0, -0.22, 0]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.14, 0.36, 16, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.35} />
          </mesh>
        </group>

        {/* Glowing Canine Eyes */}
        {/* Left Eye */}
        <mesh position={[-0.22, 0.12, 0.48]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#fed7aa"
            emissive="#f97316"
            emissiveIntensity={1.1}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[-0.22, 0.12, 0.56]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#1c1917" />
        </mesh>

        {/* Right Eye */}
        <mesh position={[0.22, 0.12, 0.48]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#fed7aa"
            emissive="#f97316"
            emissiveIntensity={1.1}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0.22, 0.12, 0.56]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#1c1917" />
        </mesh>
      </group>

      {/* Paws */}
      <mesh position={[-0.28, -0.85, 0.34]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#ffedd5" roughness={0.4} />
      </mesh>
      <mesh position={[0.28, -0.85, 0.34]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#ffedd5" roughness={0.4} />
      </mesh>

      {/* Energetic Wagging Tail */}
      <group ref={tailRef} position={[0, -0.55, -0.48]}>
        <mesh position={[0, 0.3, -0.15]} rotation={[-0.7, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.65, 16]} />
          <meshStandardMaterial color="#c2410c" roughness={0.3} />
        </mesh>
        {/* Bushy Tail Tip */}
        <mesh position={[0, 0.62, -0.36]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#ffedd5" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
