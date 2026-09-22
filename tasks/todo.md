# Plan: The Memory Diorama (MVP)

- [x] Scaffold Next.js (App Router, TS, Tailwind) + R3F, drei, postprocessing, supabase-js
- [x] Content: 3 rooms × 5 puzzles in `content/rooms.json` (regular → irregular → contrast)
- [x] Supabase: `tense` schema migration (rooms, puzzles, RLS read-only) + generated seed
- [x] Content loader: Supabase on scene load, bundled JSON fallback when env missing/fails
- [x] 3D: isometric ortho camera, toon (cel) materials, ink-outline post effect
- [x] Objects: clickable/highlighted, loop anim (imperfect) vs one-off permanent anim (preterite)
- [x] UI: cloze prompt, rule feedback on wrong answer, room progress, next room, saved progress
- [x] Pause ambient animation while prompt open
- [x] Verify: lint, typecheck, build, play-through in browser
- [x] User todos in TODO.md (Supabase project, expose schema, env vars, Vercel)

## Review
- All items done. Lint, typecheck, and build are clean.
- Headless Chromium (swiftshader) play-through: 3 rooms, 15 puzzles, wrong answer then right answer on each, 0 console errors. Screenshots checked for every room's start and end states, the feedback and correct states, reload persistence, and mobile.
- Gotcha: the Chrome-extension tab was hidden, so rAF was paused and the composer never drew. Verified headless instead.
- Supabase path verified end-to-end after user set up the project (game reports "Content: Supabase", no fallback warnings).
