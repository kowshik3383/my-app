"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function AvatarBackground() {
  const texture = useLoader(
    THREE.TextureLoader,
    "/backgrounds/avatar-world.jpg"
  );

  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh scale={[50, 30, 1]} position={[0, 5, -20]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}