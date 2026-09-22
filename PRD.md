## Product Specification: The Memory Diorama

**Objective:** A web-native 3D puzzle game where players reconstruct fragmented memories by selecting the correct Spanish past tense (pretérito imperfecto vs. indefinido) based on contextual cues.

## Gameplay Mechanics

The player enters an isometric 3D room acting as a "memory node." Interacting with specific objects triggers a memory fragment consisting of an incomplete Spanish sentence.

* **Interaction:** Clicking a highlighted object (e.g., a dusty radio) pauses the ambient room state and displays a Cloze-style UI prompt.
* **The Choice:** The player must choose between an ongoing background state (imperfect) and an interrupting action (preterite) to complete the sentence.
* **Visual Resolution (Imperfect):** Selecting a correct imperfect verb (e.g., *sonaba*) triggers a continuous, looping WebGL animation on the object, setting the scene's background ambiance.
* **Visual Resolution (Preterite):** Selecting a correct preterite verb (e.g., *se rompió*) triggers a one-off, discrete physics event or animation that permanently alters the room state.
* **Feedback Loop:** Incorrect answers trigger a brief, contextual explanation of the grammatical rule overlaid on the UI, and the object's animation remains locked.
* **Progression:** Rooms become progressively more complex, starting with isolated regular verbs and advancing to complex sentences contrasting both tenses with heavily irregular verbs (e.g., *fui*, *iba*).

## Technical Architecture

The project will utilize a modern 3D web stack to ensure high accessibility, rapid iteration, and complete separation of game logic from content.

* **Frontend Framework:** Next.js (App Router) combined with React and TypeScript for robust state management and UI overlay routing.
* **3D Engine:** React Three Fiber (R3F) and Three.js to render the isometric rooms and manage object interactions directly in the browser canvas.
* **Visual Aesthetic:** Custom WebGL shaders will be applied globally to the R3F scene to achieve a retro-modern comic book art style. This includes a flat cel-shading pass combined with a post-processing effect for variable-width black ink outlines.
* **Backend & Data Layer:** Supabase will host the externalized learning content (sentences, vocabulary, grammar rules) via PostgreSQL, allowing the curriculum to expand without requiring code deployment or frontend updates.

## Content Data Schema

Learning content will be requested from Supabase on scene load. This structure isolates the Spanish text, the correct logical answers, and the pedagogical feedback from the 3D rendering logic.

| Field | Type | Description | Example |
| --- | --- | --- | --- |
| `id` | UUID | Unique identifier for the puzzle node | `9b1deb4d-3b7d...` |
| `scene_object` | String | Target 3D mesh ID in the R3F canvas | `radio_vintage_01` |
| `sentence_pre` | String | Text preceding the verb gap | "Mientras yo estudiaba, " |
| `sentence_post` | String | Text following the verb gap | " a llover de repente." |
| `verb_base` | String | Infinitive form for reference | "empezar" |
| `options` | JSONB | Array containing answer options | `[{"form": "empezaba", "type": "imperfect", "correct": false}, {"form": "empezó", "type": "preterite", "correct": true}]` |
| `rule_feedback` | String | Explanation for the specific tense usage | "Use the preterite for sudden, interrupting actions." |
| `anim_trigger` | String | Animation state mapped to correct answer | `anim_rain_start_once` |
