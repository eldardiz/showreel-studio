import type { BeatGrid } from './manifest';

export type ResolvedGrid = { frames: number[]; framesPerBeat: number };

export const gridFromBpm = (bpm: number, offsetSec: number, fps: number, totalFrames: number): ResolvedGrid => {
  const framesPerBeat = (60 / bpm) * fps;
  const frames: number[] = [];
  for (let f = offsetSec * fps; f <= totalFrames + framesPerBeat; f += framesPerBeat) frames.push(Math.round(f));
  return { frames, framesPerBeat };
};

export const gridFromFile = (beatsSec: number[], fps: number): ResolvedGrid => {
  const frames = beatsSec.map((s) => Math.round(s * fps));
  const gaps = frames.slice(1).map((f, i) => f - frames[i]).sort((a, b) => a - b);
  const framesPerBeat = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 15;
  return { frames, framesPerBeat };
};

export const resolveGrid = (grid: BeatGrid | undefined, fps: number, totalFrames: number): ResolvedGrid | null => {
  if (!grid) return null;
  if (grid.kind === 'bpm') return gridFromBpm(grid.bpm, grid.offsetSec ?? 0, fps, totalFrames);
  return gridFromFile(grid.beats, fps);
};

/** Nearest beat within tolerance, else the original frame. */
export const snapToBeat = (frame: number, grid: ResolvedGrid | null, tolerance = 4) => {
  if (!grid || grid.frames.length === 0) return { frame, drift: 0, snapped: false };
  let best = grid.frames[0];
  for (const b of grid.frames) if (Math.abs(b - frame) < Math.abs(best - frame)) best = b;
  const drift = best - frame;
  return Math.abs(drift) <= tolerance ? { frame: best, drift, snapped: true } : { frame, drift, snapped: false };
};
