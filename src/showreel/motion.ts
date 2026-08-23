import { interpolate } from 'remotion';
import type { MotionPreset } from './manifest';

type EasingFn = (t: number) => number;

/** 0 → 1 between two frames, clamped, optionally eased. */
export const ramp = (frame: number, from: number, to: number, easing?: EasingFn) =>
  to <= from
    ? frame >= to
      ? 1
      : 0
    : interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** |f(frame+1) - f(frame)|, used to drive motion blur from any scalar curve. */
export const velocityOf = (fn: (f: number) => number, frame: number) => Math.abs(fn(frame + 1) - fn(frame));

/** Trail samples + CSS blur px for a given scale-velocity. */
export const blurFor = (velocity: number, preset: MotionPreset) => {
  const moving = velocity > preset.blur.threshold;
  return {
    samples: moving ? preset.blur.samples : 1,
    shutter: preset.blur.shutter,
    px: moving ? Math.min(preset.blur.maxPx, velocity * preset.blur.gain) : 0,
  };
};
