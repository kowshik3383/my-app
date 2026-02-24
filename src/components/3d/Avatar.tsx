"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import { stopAllSpeech, interruptSpeech } from "@/lib/browserVoice";
import { useStore } from "@/store/useStore";
import type { Group, SkinnedMesh, Material, Bone } from "three";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Hips: Bone;
    Wolf3D_Body: SkinnedMesh;
    Wolf3D_Outfit_Bottom: SkinnedMesh;
    Wolf3D_Outfit_Footwear: SkinnedMesh;
    Wolf3D_Outfit_Top: SkinnedMesh;
    Wolf3D_Hair: SkinnedMesh;
    EyeLeft: SkinnedMesh;
    EyeRight: SkinnedMesh;
    Wolf3D_Head: SkinnedMesh;
    Wolf3D_Teeth: SkinnedMesh;
  };
  materials: {
    Wolf3D_Body: Material;
    Wolf3D_Outfit_Bottom: Material;
    Wolf3D_Outfit_Footwear: Material;
    Wolf3D_Outfit_Top: Material;
    Wolf3D_Hair: Material;
    Wolf3D_Eye: Material;
    Wolf3D_Skin: Material;
    Wolf3D_Teeth: Material;
  };
};

interface FacialExpression {
  [key: string]: number;
}
interface FacialExpressions {
  [key: string]: FacialExpression;
}

const facialExpressions: FacialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.17,
    noseSneerRight: 0.14,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.57,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39,
    eyeLookUpRight: 0.4,
    eyeLookInLeft: 0.96,
    eyeLookInRight: 0.96,
    jawOpen: 0.96,
    mouthDimpleLeft: 0.96,
    mouthDimpleRight: 0.96,
    mouthStretchLeft: 0.28,
    mouthStretchRight: 0.29,
    mouthSmileLeft: 0.56,
    mouthSmileRight: 0.38,
    tongueOut: 0.96,
  },
};

const corresponding: { [key: string]: string } = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

interface AvatarProps {
  [key: string]: any;
}

export function Avatar(props: AvatarProps) {
  const { nodes, materials, scene } = useGLTF(
    "/models/64f1a714fe61576b46f27ca2.glb"
  ) as GLTFResult & { scene: Group };

  const { message, onMessagePlayed, chat, interruptSignal } = useChat();
  const { userProfile, setSpeechControl } = useStore();

  const [lipsync, setLipsync] = useState<any>();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [animation, setAnimation] = useState("");
  const [audioStartTime, setAudioStartTime] = useState<number>(0);
  const [expressionIntensity, setExpressionIntensity] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { animations } = useGLTF("/models/animations.glb");
  const group = useRef<Group>(null);
  const { actions, mixer } = useAnimations(animations, group);

  // Set initial idle animation
  useEffect(() => {
    const initial = animations.find((a) => a.name === "Idle")
      ? "Idle"
      : animations[0]?.name || "";
    setAnimation(initial);
  }, [animations]);

  // ─── Interrupt signal handler ───────────────────────────────────────────────
  useEffect(() => {
    if (interruptSignal === 0) return;

    // Immediate stop — <150ms target
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopAllSpeech();
    setAudio(null);
    setAudioStartTime(0);
    setLipsync(undefined);
    setAnimation("Standing Idle");
    setFacialExpression("default");
    setSpeechControl({ isSpeaking: false, isInterrupted: true });
  }, [interruptSignal, setSpeechControl]);

  // ─── Message handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!message) {
      setAnimation("Standing Idle");
      setAudio(null);
      setAudioStartTime(0);
      audioRef.current = null;
      setSpeechControl({ isSpeaking: false });
      return;
    }

    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    setExpressionIntensity(message.emotionIntensity ?? 1.0);
    setSpeechControl({ isSpeaking: true });

    // Build lang code for browser TTS
    const langMap: Record<string, string> = {
      en: "en-US", hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN",
    };
    const lang = langMap[userProfile?.language || "en"] || "en-US";

    if (message.audio) {
      // ElevenLabs audio
      const newAudio = new Audio("data:audio/mp3;base64," + message.audio);
      audioRef.current = newAudio;
      setAudioStartTime(performance.now() / 1000);
      newAudio.play().catch((err) => {
        console.error("Audio playback failed:", err);
        // Fallback to browser TTS
        fallbackBrowserSpeech(message.text, lang, onMessagePlayed, setSpeechControl);
      });
      setAudio(newAudio);
      newAudio.onended = () => {
        audioRef.current = null;
        setAudio(null);
        setAudioStartTime(0);
        setSpeechControl({ isSpeaking: false });
        onMessagePlayed();
      };
    } else if (message.text && typeof window !== "undefined" && window.speechSynthesis) {
      // Browser TTS fallback
      setAudioStartTime(performance.now() / 1000);
      fallbackBrowserSpeech(message.text, lang, onMessagePlayed, setSpeechControl);
    } else {
      // No audio: animate for estimated duration
      setAudioStartTime(performance.now() / 1000);
      const duration = (message.text?.split(" ").length || 10) * 400;
      const timeout = setTimeout(() => {
        setAudioStartTime(0);
        setSpeechControl({ isSpeaking: false });
        onMessagePlayed();
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [message, onMessagePlayed, userProfile?.language, setSpeechControl]);

  // ─── Animation blending ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!animation || !actions[animation]) return;
    const inUse = mixer.stats.actions.inUse;
    actions[animation]
      .reset()
      .fadeIn(inUse === 0 ? 0 : 0.4)
      .play();
    return () => {
      actions[animation]?.fadeOut(0.4);
    };
  }, [animation, actions, mixer]);

  // ─── Morph target lerp helper ─────────────────────────────────────────────────
  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences?.[index] === undefined) return;
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
        if (!setupMode) {
          try { set({ [target]: value }); } catch (_) {}
        }
      }
    });
  };

  // ─── Per-frame: expressions + lipsync ────────────────────────────────────────
  useFrame(() => {
    if (!setupMode && nodes.EyeLeft.morphTargetDictionary) {
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
        const mapping = facialExpressions[facialExpression];
        const targetValue = mapping?.[key] != null
          ? mapping[key] * expressionIntensity
          : 0;
        lerpMorphTarget(key, targetValue, 0.08); // smooth transitions
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // LIPSYNC
    if (setupMode) return;

    const appliedMorphTargets: string[] = [];
    if (message && lipsync && audioStartTime > 0) {
      const currentAudioTime = audio
        ? audio.currentTime
        : performance.now() / 1000 - audioStartTime;

      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          appliedMorphTargets.push(corresponding[mouthCue.value]);
          lerpMorphTarget(corresponding[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) return;
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary || {}).map((key) => ({
        [key]: {
          label: key,
          value: 0,
          min: nodes.EyeLeft.morphTargetInfluences?.[nodes.EyeLeft.morphTargetDictionary?.[key] || 0] || 0,
          max: 1,
          onChange: (val: number) => { if (setupMode) lerpMorphTarget(key, val, 1); },
        },
      }))
    )
  );

  useControls("FacialExpressions", {
    chat: button(() => chat("")),
    winkLeft: button(() => { setWinkLeft(true); setTimeout(() => setWinkLeft(false), 300); }),
    winkRight: button(() => { setWinkRight(true); setTimeout(() => setWinkRight(false), 300); }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value: string) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value: string) => setFacialExpression(value),
    },
    enableSetupMode: button(() => { setupMode = true; }),
    disableSetupMode: button(() => { setupMode = false; }),
  });

  // Auto-blink
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); nextBlink(); }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh name="Wolf3D_Body" geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Bottom" geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Footwear" geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Top" geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh name="Wolf3D_Hair" geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
    </group>
  );
}

// ─── Browser TTS fallback helper ─────────────────────────────────────────────
function fallbackBrowserSpeech(
  text: string,
  lang: string,
  onEnd: () => void,
  setSpeechControl: (ctrl: any) => void
) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  utterance.lang = lang;
  utterance.onend = () => {
    setSpeechControl({ isSpeaking: false });
    onEnd();
  };
  utterance.onerror = () => {
    setSpeechControl({ isSpeaking: false });
    onEnd();
  };
  window.speechSynthesis.speak(utterance);
}

useGLTF.preload("/models/64f1a714fe61576b46f27ca2.glb");
useGLTF.preload("/models/animations.glb");
