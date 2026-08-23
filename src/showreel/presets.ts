import type { DeepPartial, EditManifest, MotionPreset, PresetName } from './manifest';

/**
 * editorial: the reference edit's feel (native bezier, calm holds, push into every cut).
 * snappy: shorter holds, harder whips, more blur.
 * cinematic: longer holds, gentler pushes, slower dissolves.
 */
export const PRESETS: Record<PresetName, MotionPreset> = {
  editorial: {
    ease: { enter: 'native', exit: 'inQuad', push: 'inQuad', move: 'inOutCubic', reveal: 'outExpo' },
    hold: { short: 34, base: 45, long: 62 },
    transition: { flash: 4, crossfade: 8, whip: 10, zoomEnter: 15, blurReveal: 12, fadeOut: 21, blurDissolve: 10 },
    push: { soft: 1.06, strong: 1.25 },
    blur: { samples: 8, shutter: 0.8, maxPx: 16, gain: 55, threshold: 0.01 },
    text: { wordStagger: 2, wordFade: 3, perWord: 3, charPerFrame: 1, trackIn: 14, trackOut: 7, charStagger: 1, blurIn: 12, rise: 24 },
  },
  snappy: {
    ease: { enter: 'outExpo', exit: 'inQuad', push: 'inQuad', move: 'inOutCubic', reveal: 'outExpo' },
    hold: { short: 24, base: 34, long: 48 },
    transition: { flash: 3, crossfade: 6, whip: 8, zoomEnter: 12, blurReveal: 10, fadeOut: 18, blurDissolve: 8 },
    push: { soft: 1.08, strong: 1.3 },
    blur: { samples: 10, shutter: 0.9, maxPx: 24, gain: 80, threshold: 0.008 },
    text: { wordStagger: 1, wordFade: 2, perWord: 2, charPerFrame: 2, trackIn: 10, trackOut: 5, charStagger: 1, blurIn: 16, rise: 32 },
  },
  cinematic: {
    ease: { enter: 'outExpo', exit: 'inOutCubic', push: 'inQuad', move: 'inOutCubic', reveal: 'outExpo' },
    hold: { short: 45, base: 60, long: 80 },
    transition: { flash: 6, crossfade: 14, whip: 14, zoomEnter: 20, blurReveal: 16, fadeOut: 30, blurDissolve: 16 },
    push: { soft: 1.04, strong: 1.15 },
    blur: { samples: 8, shutter: 0.7, maxPx: 12, gain: 45, threshold: 0.012 },
    text: { wordStagger: 3, wordFade: 5, perWord: 4, charPerFrame: 1, trackIn: 20, trackOut: 10, charStagger: 2, blurIn: 10, rise: 20 },
  },
};

const merge = <T extends object>(base: T, patch?: DeepPartial<T>): T => {
  if (!patch) return base;
  const out: any = { ...base };
  for (const k of Object.keys(patch) as (keyof T)[]) {
    const v = patch[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = merge((base as any)[k], v as any);
    else if (v !== undefined) out[k] = v;
  }
  return out;
};

export const resolvePreset = (p: EditManifest['preset']): MotionPreset => {
  if (typeof p === 'string') return PRESETS[p];
  const { extends: base, ...patch } = p;
  return merge(PRESETS[base], patch as DeepPartial<MotionPreset>);
};
