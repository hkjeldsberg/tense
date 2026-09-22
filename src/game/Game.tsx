"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRoom, fetchRooms } from "@/lib/content";
import type { AnswerOption, ContentSource, Puzzle, Room, RoomSummary } from "@/lib/types";
import { loadProgress, saveProgress, emptyProgress } from "./progress";
import { Scene, ROOM_SCENES } from "./Scene";
import type { RoomBindings } from "./slot";
import { Hud } from "./ui/Hud";
import { Intro, Loading, RoomComplete } from "./ui/Overlays";
import { Prompt } from "./ui/Prompt";

const shuffle = <T,>(xs: T[]) => {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function Game() {
  const [progress, setProgress] = useState(loadProgress);
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null);
  const [source, setSource] = useState<ContentSource | null>(null);
  const [chosenRoomId, setChosenRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<{ puzzle: Puzzle; options: AnswerOption[] } | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => {
    fetchRooms().then((r) => {
      setRooms(r.rooms);
      setSource(r.source);
    });
  }, []);

  const unlocked = useCallback(
    (i: number) => !!rooms && (i === 0 || progress.completedRooms.includes(rooms[i - 1].id)),
    [rooms, progress.completedRooms],
  );

  // Current room: explicit choice → last visited (if still unlocked) → first unfinished unlocked room.
  const roomId = useMemo(() => {
    if (!rooms?.length) return null;
    if (chosenRoomId) return chosenRoomId;
    const lastIdx = rooms.findIndex((r) => r.id === progress.lastRoom);
    if (lastIdx >= 0 && unlocked(lastIdx)) return rooms[lastIdx].id;
    const next = rooms.findIndex((r, i) => unlocked(i) && !progress.completedRooms.includes(r.id));
    return rooms[next >= 0 ? next : 0].id;
  }, [rooms, chosenRoomId, progress.lastRoom, progress.completedRooms, unlocked]);

  // Content is requested on scene load.
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    fetchRoom(roomId).then((r) => {
      if (cancelled) return;
      setRoom(r?.room ?? null);
      if (r) setSource(r.source);
    });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const loadedRoom = room?.id === roomId ? room : null;
  const solved = useMemo(() => new Set(progress.solved), [progress.solved]);

  const selectRoom = (id: string) => {
    setChosenRoomId(id);
    setActive(null);
    setShowComplete(false);
    setJustCompleted(null);
    setProgress((p) => ({ ...p, lastRoom: id }));
  };

  const bindings = useMemo<RoomBindings>(
    () => ({
      puzzleFor: (obj) => loadedRoom?.puzzles.find((p) => p.scene_object === obj),
      isSolved: (id) => solved.has(id),
      onSelect: (puzzle) => {
        setWrong([]);
        setActive({ puzzle, options: shuffle(puzzle.options) });
      },
      interactive: started && !active && !showComplete,
    }),
    [loadedRoom, solved, started, active, showComplete],
  );

  const choose = (opt: AnswerOption) => {
    if (!active || !loadedRoom || solved.has(active.puzzle.id)) return;
    const pid = active.puzzle.id;
    if (!opt.correct) {
      setWrong((w) => (w.includes(opt.form) ? w : [...w, opt.form]));
      setProgress((p) => ({ ...p, mistakes: { ...p.mistakes, [pid]: (p.mistakes[pid] ?? 0) + 1 } }));
      return;
    }
    const nowSolved = [...progress.solved, pid];
    const done = loadedRoom.puzzles.every((p) => nowSolved.includes(p.id));
    setProgress((p) => ({
      ...p,
      solved: p.solved.includes(pid) ? p.solved : [...p.solved, pid],
      completedRooms: done && !p.completedRooms.includes(loadedRoom.id) ? [...p.completedRooms, loadedRoom.id] : p.completedRooms,
      lastRoom: loadedRoom.id,
    }));
    if (done) setJustCompleted(loadedRoom.id);
  };

  // After the final memory's animation has had time to play, celebrate.
  useEffect(() => {
    if (!justCompleted || active || justCompleted !== roomId) return;
    const id = setTimeout(() => setShowComplete(true), 2600);
    return () => clearTimeout(id);
  }, [justCompleted, active, roomId]);

  const roomIndex = rooms?.findIndex((r) => r.id === roomId) ?? -1;
  const nextRoom = rooms && roomIndex >= 0 ? rooms[roomIndex + 1] : undefined;
  const hasScene = !!roomId && !!ROOM_SCENES[roomId];

  return (
    <main className="fixed inset-0 overflow-hidden bg-paper text-ink">
      {roomId && hasScene && <Scene roomId={roomId} bindings={bindings} paused={!!active || !started} />}

      {loadedRoom && rooms && (
        <Hud
          room={loadedRoom}
          rooms={rooms}
          unlocked={unlocked}
          solved={solved}
          source={source}
          onSelectRoom={selectRoom}
          onReset={() => {
            setProgress(emptyProgress());
            setChosenRoomId(rooms[0].id);
            setJustCompleted(null);
            setShowComplete(false);
          }}
        />
      )}

      {!loadedRoom && <Loading missingScene={!!roomId && !hasScene} />}

      {!started && <Intro onStart={() => setStarted(true)} resuming={progress.solved.length > 0} />}

      {active && (
        <Prompt
          puzzle={active.puzzle}
          options={active.options}
          solved={solved.has(active.puzzle.id)}
          wrong={wrong}
          onChoose={choose}
          onClose={() => setActive(null)}
        />
      )}

      {showComplete && loadedRoom && (
        <RoomComplete
          room={loadedRoom}
          mistakes={loadedRoom.puzzles.reduce((n, p) => n + (progress.mistakes[p.id] ?? 0), 0)}
          nextRoom={nextRoom}
          onNext={() => nextRoom && selectRoom(nextRoom.id)}
          onStay={() => {
            setShowComplete(false);
            setJustCompleted(null);
          }}
        />
      )}
    </main>
  );
}
