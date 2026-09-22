"use client";

import { useState } from "react";
import type { ContentSource, Room, RoomSummary } from "@/lib/types";
import { TENSE_LABEL } from "./Prompt";

interface HudProps {
  room: Room;
  rooms: RoomSummary[];
  unlocked: (i: number) => boolean;
  solved: Set<string>;
  source: ContentSource | null;
  onSelectRoom: (id: string) => void;
  onReset: () => void;
}

export function Hud({ room, rooms, unlocked, solved, source, onSelectRoom, onReset }: HudProps) {
  const [help, setHelp] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const done = room.puzzles.filter((p) => solved.has(p.id)).length;

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="panel pointer-events-auto max-w-sm px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Memory {room.order_index} · {room.subtitle}
          </p>
          <h1 lang="es" className="font-display text-3xl leading-none">
            {room.title}
          </h1>
          <p className="mt-1 text-xs text-ink/70">{room.focus}</p>
          <div className="mt-2 flex items-center gap-1.5" aria-label={`${done} of ${room.puzzles.length} memories restored`}>
            {room.puzzles.map((p) => (
              <span key={p.id} className={`pip ${solved.has(p.id) ? "pip-on" : ""}`} />
            ))}
            <span className="ml-1 text-xs font-semibold">
              {done}/{room.puzzles.length}
            </span>
          </div>
        </div>

        <nav className="pointer-events-auto flex items-center gap-2" aria-label="Rooms">
          {rooms.map((r, i) => {
            const open = unlocked(i);
            const current = r.id === room.id;
            return (
              <button
                key={r.id}
                disabled={!open || current}
                onClick={() => onSelectRoom(r.id)}
                title={open ? r.title : "Complete the previous memory to unlock"}
                className={`room-pill ${current ? "room-pill-current" : ""}`}
              >
                {open ? r.order_index : "🔒"}
              </button>
            );
          })}
          <button onClick={() => setHelp((h) => !h)} className="room-pill" aria-expanded={help} title="How to play">
            ?
          </button>
        </nav>
      </header>

      {help && (
        <aside className="panel absolute right-4 top-20 z-10 w-80 max-w-[calc(100vw-2rem)] p-4 text-sm">
          <h2 className="font-display text-xl">How it works</h2>
          <p className="mt-1 text-ink/80">Click a glowing ◆ object to recall its memory, then pick the past tense that fits.</p>
          <ul className="mt-3 space-y-2">
            {(["imperfect", "preterite"] as const).map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-ink" style={{ background: TENSE_LABEL[t].color }} />
                <span>
                  <strong>{TENSE_LABEL[t].es}</strong> ({TENSE_LABEL[t].en}): {TENSE_LABEL[t].hint}.{" "}
                  {t === "imperfect" ? "The object keeps moving in a loop." : "The room changes once, for good."}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t-2 border-ink/10 pt-3 text-xs text-ink/60">
            <span>Content: {source === "supabase" ? "Supabase" : "built-in"}</span>
            {confirmReset ? (
              <span className="flex gap-2">
                <button
                  className="font-bold text-[var(--preterite)] underline"
                  onClick={() => {
                    onReset();
                    setConfirmReset(false);
                    setHelp(false);
                  }}
                >
                  Yes, reset
                </button>
                <button className="underline" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button className="underline" onClick={() => setConfirmReset(true)}>
                Reset progress
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
