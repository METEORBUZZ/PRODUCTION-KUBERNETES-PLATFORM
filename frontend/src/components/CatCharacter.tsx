import React, { useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface CatCharacterProps {
  position?: [number, number, number];
  isVoted: boolean;
  reducedMotion?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}

const CatFigureMesh: React.FC<{
  isVoted: boolean;
  reducedMotion: boolean;
}> = ({ isVoted, reducedMotion }) => {
  const rootRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const jumpProgress = useRef(0);

  // Load the transparent full-body 3D Cat cutout
  const texture = useLoader(THREE.TextureLoader, '/cat-standalone.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  useFrame((state, delta) => {
    if (!rootRef.current || !characterRef.current) return;
    const time = state.clock.getElapsedTime();

    if (!reducedMotion) {
      // Natural subtle breathing bob
      const breathing = Math.sin(time * 2.2) * 0.035;
      characterRef.current.position.y = 0.25 + breathing;

      // Mouse parallax tilt & subtle lean
      const targetRotY = (state.pointer.x + 0.3) * 0.22;
      const targetRotX = -state.pointer.y * 0.08;
      characterRef.current.rotation.y = THREE.MathUtils.lerp(
        characterRef.current.rotation.y,
        targetRotY,
        0.08
      );
      characterRef.current.rotation.x = THREE.MathUtils.lerp(
        characterRef.current.rotation.x,
        targetRotX,
        0.08
      );
    }

    // Celebratory hop reaction when voted
    if (isVoted) {
      jumpProgress.current += delta * 5.5;
      if (jumpProgress.current <= Math.PI) {
        const hop = Math.sin(jumpProgress.current) * 0.45;
        characterRef.current.position.y += hop;
        characterRef.current.rotation.z = Math.sin(jumpProgress.current * 2) * 0.08;

        // Shadow scales down as character hops up
        if (shadowRef.current) {
          const shadowScale = 1.0 - (hop / 0.45) * 0.35;
          shadowRef.current.scale.set(shadowScale, shadowScale, 1);
        }
      }
    } else {
      jumpProgress.current = 0;
      if (shadowRef.current) {
        shadowRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group ref={rootRef}>
      {/* Studio Circular Pedestal on Floor */}
      <mesh position={[0, -1.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.2, 0.08, 48]} />
        <meshStandardMaterial
          color="#161514"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Subtle Warm Brass Stage Trim (Horizontal Plane) */}
      <mesh position={[0, -0.975, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.96, 1.04, 48]} />
        <meshBasicMaterial color="#d4a373" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Contact Drop Shadow directly under the character's feet */}
      <mesh
        ref={shadowRef}
        position={[0, -0.97, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>

      {/* Standalone Full-Body Character */}
      <group ref={characterRef} position={[0, 0.25, 0]}>
        {/* Main Character Texture Plane (Transparent Cutout) */}
        <mesh position={[0, 0, 0]} castShadow>
          <planeGeometry args={[1.72, 2.56]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            alphaTest={0.02}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};

// Fallback while texture loads
const CatFallback: React.FC = () => (
  <group position={[0, 0.25, 0]}>
    <mesh position={[0, -1.02, 0]}>
      <cylinderGeometry args={[1.05, 1.2, 0.08, 32]} />
      <meshStandardMaterial color="#161514" roughness={0.7} />
    </mesh>
  </group>
);

export const CatCharacter: React.FC<CatCharacterProps> = ({
  position = [-2.2, 0, 0],
  isVoted,
  reducedMotion = false,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  return (
    <group
      position={position}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <Suspense fallback={<CatFallback />}>
        <CatFigureMesh isVoted={isVoted} reducedMotion={reducedMotion} />
      </Suspense>
    </group>
  );
};
