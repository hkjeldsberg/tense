@AGENTS.md

# CLAUDE.md

## Project

**The Memory Diorama**: a 3D web game for learning Spanish verb tenses (see `PRD.md`), focused on:
- **Pretérito imperfecto** (past imperfect): habitual, ongoing, or background past actions
- **Pretérito indefinido** (past preterite): completed, one-time past actions
- **Irregular verbs** in both tenses (e.g. ser/ir, tener, hacer, estar, poder, decir, venir)

Picking the right tense makes an object in an isometric room come alive. The imperfect plays a looping animation; the preterite plays a one-off event that changes the room for good.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- React Three Fiber, drei, postprocessing: orthographic isometric camera, `MeshToonMaterial` cel shading, custom ink-outline + halftone pass (`src/game/effects/InkOutline.tsx`)
- Supabase (schema `tense`) for content, with `content/rooms.json` as a built-in fallback
- Deployed on Vercel

## Commands

```bash
npm run dev        # http://localhost:3000
npm run lint       # eslint (React Compiler rules on)
npm run typecheck
npm run build
npm run seed:gen   # content/rooms.json → supabase/seed.sql
```

## Layout

- `content/rooms.json`: **the single source of truth for learning content.** After editing it, run `npm run seed:gen` and apply `supabase/seed.sql`.
- `supabase/migrations/`: schema (`tense.rooms`, `tense.puzzles`) with public read-only RLS
- `src/lib/content.ts`: loads from Supabase and falls back to the local JSON
- `src/game/Game.tsx`: game state (progress saved in localStorage), prompt flow
- `src/game/Scene.tsx`: Canvas, lights, post-processing, `ROOM_SCENES` registry (room id → scene)
- `src/game/slot.tsx`: `<Slot id anim>` binds a content `scene_object` to a 3D object (click, marker, anim start time)
- `src/game/rooms/*.tsx`: one diorama per room; each object reads `useSlot()` and animates in `useFrame`
- `src/game/time.tsx`: pausable game clock (paused while a prompt is open)

## Conventions

- Animation naming: `anim_*_loop` = imperfect (continuous), `anim_*_once` = preterite (permanent change). If content names a trigger an object doesn't implement, `Slot` falls back to a generic loop/once animation based on the suffix.
- One-off animations must be pure functions of `onceProgress(t, since, duration)`, so restored progress renders the final state straight away.
- A new room needs a scene component registered in `ROOM_SCENES` plus rows in the content. Content alone can reword or retarget puzzles within the existing objects.
- React Compiler lint: mutate three.js objects inside `useFrame`/effects via refs, not hook return values or props.

## Guidelines

- Spanish content must be correct. Double-check conjugations, accents (é, í, ó), and usage rules. Avoid sentences where both tenses would be acceptable.
- Keep verb and sentence data out of the code.
- Game UI text is in English and the learning content is in Spanish.
- Verify visually: headless Chromium (`--use-angle=swiftshader`) works. A Chrome tab that's hidden or occluded pauses `requestAnimationFrame`, so the post-processed canvas looks blank there.
