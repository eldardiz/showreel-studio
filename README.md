# showreel-studio

Client showreel / brand reveal videos built from screenshots. Manifest-driven Remotion compositions with a reusable effects library (text type-ins, tracking collapse, stagger pops, blurred zoom reveals, page scrolls, device zooms, whips, flashes, crossfades) and presets (editorial / snappy / cinematic).

The brain lives in the workspace skill `vibe-coding/skills/internal-skills/showreel/SKILL.md`; the `/showreel` slash command drives the workflow.

```
src/showreel/      library (manifest types, presets, timeline, devices, transitions, text effects, audio hooks)
src/edits/         one manifest per client edit, registered in src/edits/index.ts
public/edits/<id>/ that edit's assets (screenshots, logo, optional music)
public/sfx/        user-supplied sound effects (nothing bundled)
src/legacy/        the first hand-built native.agency edit, kept as the parity baseline
scripts/qa/        timeline dump, proof-still sheet, cut strips
out/<id>/          renders + qa sheets (gitignored)
```

```
npm run qa:timeline -- native-agency
npm run qa:proof -- native-agency
npm run render:native-agency:mp4
npm run qa:cuts -- native-agency
```
