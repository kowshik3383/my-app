"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useEffect } from "react";

function AvatarModel({ url }: { url: string }) {
  const { scene, animations } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

export default function Page() {
  const [avatarUrl, setAvatarUrl] = useState(
    "/models/69a46c3a6e4b038c0e322ff6.glb",
  );
  const [selectedOutfit, setSelectedOutfit] = useState("Casual");
  const [selectedAnimation, setSelectedAnimation] = useState("Idle");
  const [skinTone, setSkinTone] = useState("#f1c27d");

  useEffect(() => {
    console.log("Outfit:", selectedOutfit);
    console.log("Animation:", selectedAnimation);
    console.log("Skin:", skinTone);

    // Later:
    // Call your avatar API here
    // Update avatarUrl dynamically
  }, [selectedOutfit, selectedAnimation, skinTone]);

  const outfits = ["Casual", "Formal", "Street", "Sport"];
  const animations = ["Idle", "Wave", "Dance"];

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* LEFT - 3D VIEWER */}
      <div className="w-2/3">
        <Canvas camera={{ position: [0, 1.5, 3] }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 2, 2]} />
          <AvatarModel url={avatarUrl} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* RIGHT - CONTROLS */}
      <div className="w-1/3 border-l border-zinc-800 p-6 space-y-6 overflow-y-auto">
        <h1 className="text-2xl font-bold">Avatar Studio</h1>

        {/* Skin Tone */}
        <div>
          <h2 className="mb-2 font-medium">Skin Tone</h2>
          <input
            type="color"
            value={skinTone}
            onChange={(e) => setSkinTone(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

        {/* Outfit */}
        <div>
          <h2 className="mb-2 font-medium">Outfit</h2>
          <div className="grid grid-cols-2 gap-3">
            {outfits.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedOutfit(item)}
                className={`p-3 rounded-lg transition ${
                  selectedOutfit === item
                    ? "bg-blue-600"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Animation */}
        <div>
          <h2 className="mb-2 font-medium">Animation</h2>
          <div className="space-y-3">
            {animations.map((anim) => (
              <button
                key={anim}
                onClick={() => setSelectedAnimation(anim)}
                className={`w-full p-3 rounded-lg transition ${
                  selectedAnimation === anim
                    ? "bg-green-600"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={() => alert("API call would happen here")}
          className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-xl font-semibold transition"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
