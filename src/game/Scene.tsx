"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { useEffect, type ComponentType } from "react";
import { InkOutline } from "./effects/InkOutline";
import { Bedroom } from "./rooms/Bedroom";
import { Kitchen } from "./rooms/Kitchen";
import { LivingRoom } from "./rooms/LivingRoom";
import { RoomBindingsContext, type RoomBindings } from "./slot";
import { GameTimeProvider } from "./time";

/** Room id (tense.rooms.id) → 3D diorama. Content decides what happens in it. */
export const ROOM_SCENES: Record<string, { Scene: ComponentType; background: string }> = {
  cocina: { Scene: Kitchen, background: "#f3ead8" },
  salon: { Scene: LivingRoom, background: "#e3e9ee" },
  dormitorio: { Scene: Bedroom, background: "#eee3f0" },
};

/** Fits the 8×8 room into the viewport with an isometric orthographic view. */
function CameraRig() {
  const get = useThree((s) => s.get);
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    const { camera } = get();
    camera.position.set(10, 8.5, 10);
    camera.lookAt(0, 1.1, 0);
    camera.zoom = Math.min(width / 13.5, height / 11.5);
    camera.updateProjectionMatrix();
  }, [get, width, height]);
  return null;
}

interface SceneProps {
  roomId: string;
  bindings: RoomBindings;
  paused: boolean;
}

export function Scene({ roomId, bindings, paused }: SceneProps) {
  const entry = ROOM_SCENES[roomId];
  if (!entry) return null;
  const { Scene: Room, background } = entry;
  return (
    <Canvas
      flat
      orthographic
      dpr={[1, 2]}
      camera={{ position: [10, 8.5, 10], zoom: 60, near: 0.1, far: 40 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[background]} />
      <CameraRig />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#fff6e0", "#8a7a6a", 0.6]} />
      <directionalLight position={[6, 10, 4]} intensity={2.2} />
      <GameTimeProvider paused={paused}>
        <RoomBindingsContext.Provider value={bindings}>
          <Room />
        </RoomBindingsContext.Provider>
      </GameTimeProvider>
      <EffectComposer enableNormalPass multisampling={0}>
        <InkOutline thickness={1.5} />
      </EffectComposer>
    </Canvas>
  );
}
