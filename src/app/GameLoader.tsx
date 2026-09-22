"use client";

import dynamic from "next/dynamic";

// WebGL + localStorage: client only.
export const GameLoader = dynamic(() => import("@/game/Game"), {
  ssr: false,
  loading: () => (
    <main className="fixed inset-0 flex items-center justify-center bg-paper">
      <p className="font-display text-2xl text-ink/60">Recalling the memory…</p>
    </main>
  ),
});
