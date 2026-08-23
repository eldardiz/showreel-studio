// PURE: no remotion imports, so scripts/qa/timeline.ts can run it under tsx.
import type { EditManifest, Hold, MotionPreset, Slide } from './manifest';
import { resolvePreset } from './presets';
import { resolveGrid, snapToBeat, type ResolvedGrid } from './beats';

export type ResolvedSlide = {
  slide: Slide;
  index: number;
  from: number; // absolute frame the slide starts rendering
  dur: number; // frames it renders (includes any in-transition overlap)
  overlapIn: number; // frames this slide overlaps the previous one (crossfade / blurDissolve)
  cut: number; // the perceptual cut frame (for QA + beat snapping)
  drift: number; // beat-snap drift applied to this cut
};

export type ResolvedTimeline = {
  preset: MotionPreset;
  total: number;
  slides: ResolvedSlide[];
  cuts: number[];
  flashes: number[]; // absolute frames where a Flash overlay peaks
  grid: ResolvedGrid | null;
};

const holdFrames = (hold: Hold, grid: ResolvedGrid | null, preset: MotionPreset): number => {
  if (typeof hold === 'number') return Math.round(hold);
  const beats = parseFloat(hold);
  const fpb = grid?.framesPerBeat ?? preset.hold.base / 2;
  return Math.round(beats * fpb);
};

const overlapFor = (slide: Slide, preset: MotionPreset): number => {
  const t = slide.in;
  if (!t) return 0;
  if (t.kind === 'crossfade') return t.dur ?? preset.transition.crossfade;
  if (t.kind === 'blurDissolve') return t.dur ?? preset.transition.blurDissolve;
  return 0;
};

export const resolveTimeline = (m: EditManifest): ResolvedTimeline => {
  const preset = resolvePreset(m.preset);
  // first pass: rough total for the beat grid
  const rough = m.slides.reduce((acc, s) => acc + holdFrames(s.hold, null, preset), 0) + (m.tail ?? 0);
  const grid = resolveGrid(m.audio?.beats, m.fps, rough * 1.5);
  const tol = m.audio?.snapTolerance ?? 4;

  const slides: ResolvedSlide[] = [];
  const cuts: number[] = [];
  const flashes: number[] = [];
  let cursor = 0; // where the next slide would start on a hard cut

  m.slides.forEach((slide, index) => {
    const overlapIn = index === 0 ? 0 : overlapFor(slide, preset);
    let hold = holdFrames(slide.hold, grid, preset);
    // beat snapping moves the END of this slide (the next cut) onto a beat
    let drift = 0;
    if (grid) {
      const end = cursor + hold;
      const snapped = snapToBeat(end, grid, tol);
      if (snapped.snapped) {
        hold += snapped.drift;
        drift = snapped.drift;
      }
    }
    const from = cursor - overlapIn;
    const dur = hold + overlapIn;
    const cut = cursor;
    if (slide.in?.kind === 'flash') flashes.push(cut);
    slides.push({ slide, index, from, dur, overlapIn, cut, drift });
    cuts.push(cut);
    cursor += hold;
  });

  return { preset, total: cursor + (m.tail ?? 0), slides, cuts, flashes, grid };
};
