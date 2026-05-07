"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Model() {
  const { scene } = useGLTF("/models/models2.glb") as unknown as { scene: Group };
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} scale={1.2} position={[0, -0.5, 0]} />
    </group>
  );
}

export default function HeroAvatar() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 25 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -2]} intensity={0.3} />
        <Environment
          files="/hdr/avatar-world.hdr"
          background={false}
        />
        <Model />
        <ContactShadows
          opacity={0.4}
          position={[0, -1.2, 0]}
          scale={3}
          blur={2}
        />
      </Canvas>
    </div>
  );
}
