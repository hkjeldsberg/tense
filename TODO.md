# TODO (MANUAL by USER)
- [x] **Supabase: create the schema.** SQL Editor → run `supabase/migrations/0001_tense_schema.sql`.
- [x] **Supabase: expose the schema.** Project Settings → API (Data API) → *Exposed schemas* → add `tense` → Save. Without this, the API returns an "Invalid schema" error and the game quietly uses its built-in content.
- [x] **Supabase: seed the content.** SQL Editor → run `supabase/seed.sql`. Re-run it after each `npm run seed:gen`; it's idempotent.
- [x] **Local env:** `cp .env.example .env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
- [ ] **Vercel:** import the repo (the framework is detected as Next.js) and add the same two env vars for Production and Preview.
- [ ] Check it's live: open the ❓ panel in the game. It should say "Content: Supabase".
- [ ] (Optional) `git init` and commit. The project isn't a git repo yet.

# TODO (CLAUDE)

# DONE
- Read PRD and implemented the MVP (2026-09-22):
  - Next.js 16 + R3F isometric 3D, toon/cel shading, custom ink-outline + halftone post-processing pass
  - 3 rooms × 5 puzzles: regular → common irregulars → both tenses + heavy irregulars
  - Imperfect → looping animation; preterite → one-off permanent room change; wrong answer → rule feedback, object stays locked
  - Ambient animation pauses while a prompt is open; progress saved in localStorage; rooms unlock in order
  - Supabase schema `tense` (rooms, puzzles, read-only RLS) + generated seed; falls back to `content/rooms.json` when Supabase isn't configured
  - Verified: lint, typecheck, build; headless play-through of all 15 puzzles with no console errors; reload restores the final room state; mobile layout checked
