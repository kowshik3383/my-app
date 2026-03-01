"use client";

import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useStore } from "@/store/useStore";
import { getRoleTheme } from "@/lib/roleSystem";
import { Avatar } from "./Avatar";

interface DotsProps {
  [key: string]: any;
}

const Dots = (props: DotsProps) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prev) => (prev.length > 2 ? "." : prev + "."));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null);
  const { cameraZoomed } = useChat();
  const { userProfile } = useStore();

  // Role-based environment lighting
  const roleTheme = getRoleTheme(userProfile?.aiRole ?? "friend");
  const environmentPreset = roleTheme.environmentPreset;

  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
    }
  }, []);

  useEffect(() => {
    if (cameraControls.current) {
      if (cameraZoomed) {
        cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
      } else {
        cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
      }
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      {/* Role-driven environment lighting changes the mood of the scene */}
      <Environment preset={environmentPreset} />
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
