# Lessons

- **Scaffolding into a non-empty dir:** `cp -R scaffold/. project/` overwrote the existing CLAUDE.md. Exclude existing files (e.g. `rsync --ignore-existing`) or diff before copying.
- **Blank R3F canvas with post-processing:** check `document.visibilityState` first. A hidden tab pauses rAF, so a composer that renders in `useFrame` draws nothing. Test headless instead.
- **React Compiler lint (`react-hooks/immutability`):** don't mutate hook return values or props. Use methods on objects, the store's `get()`, or refs the component owns.
