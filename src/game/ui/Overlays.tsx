"use client";

import type { Room, RoomSummary } from "@/lib/types";
import { TENSE_LABEL } from "./Prompt";

export function Intro({ onStart, resuming }: { onStart: () => void; resuming: boolean }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/30 p-4">
      <div className="panel w-full max-w-md animate-pop p-6 text-center sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50">A Spanish past-tense puzzle</p>
        <h1 className="font-display text-5xl leading-none">The Memory Diorama</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">
          These rooms are fragments of a memory. Click the glowing objects and finish each sentence with the right past tense.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
          {(["imperfect", "preterite"] as const).map((t) => (
            <div key={t} className="rounded-md border-2 border-ink p-2" style={{ background: `color-mix(in oklab, ${TENSE_LABEL[t].color} 18%, white)` }}>
              <strong className="block text-sm">{TENSE_LABEL[t].es}</strong>
              {TENSE_LABEL[t].hint}
              <span className="mt-1 block italic text-ink/70">{t === "imperfect" ? "→ loops forever" : "→ changes the room"}</span>
            </div>
          ))}
        </div>
        <button autoFocus onClick={onStart} className="btn mt-6 w-full">
          {resuming ? "Keep remembering" : "Enter the memory"}
        </button>
      </div>
    </div>
  );
}

export function Loading({ missingScene }: { missingScene: boolean }) {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <p className="font-display text-2xl text-ink/60">
        {missingScene ? "This room has no 3D scene yet." : "Recalling the memory…"}
      </p>
    </div>
  );
}

interface RoomCompleteProps {
  room: Room;
  mistakes: number;
  nextRoom?: RoomSummary;
  onNext: () => void;
  onStay: () => void;
}

export function RoomComplete({ room, mistakes, nextRoom, onNext, onStay }: RoomCompleteProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/30 p-4">
      <div className="panel w-full max-w-md animate-pop p-6 text-center sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50">¡Memoria reconstruida!</p>
        <h2 lang="es" className="font-display text-4xl leading-none">
          {room.title}
        </h2>
        <p className="mt-3 text-sm text-ink/80">
          {room.puzzles.length} memories restored with{" "}
          <strong>{mistakes === 0 ? "no mistakes. ¡Perfecto!" : `${mistakes} mistake${mistakes === 1 ? "" : "s"}`}</strong>
        </p>
        {nextRoom ? (
          <>
            <p className="mt-4 text-sm">
              Next: <strong lang="es">{nextRoom.title}</strong>
              <span className="block text-xs text-ink/60">{nextRoom.focus}</span>
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={onStay} className="btn btn-ghost flex-1">
                Stay here
              </button>
              <button autoFocus onClick={onNext} className="btn flex-1">
                Next memory →
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm">You&apos;ve rebuilt every memory. The imperfect sets the scene; the preterite moves the story forward.</p>
            <button autoFocus onClick={onStay} className="btn mt-5 w-full">
              Enjoy the room
            </button>
          </>
        )}
      </div>
    </div>
  );
}
