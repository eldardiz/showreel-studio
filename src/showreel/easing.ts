import { Easing } from 'remotion';

export type EasingName = 'native' | 'outCubic' | 'outExpo' | 'inQuad' | 'inOutCubic' | 'linear';

export const EASINGS: Record<EasingName, (t: number) => number> = {
  // native.agency's signature decel curve, also the reference edit's feel
  native: Easing.bezier(0.16, 1, 0.3, 1),
  outCubic: Easing.out(Easing.cubic),
  outExpo: Easing.out(Easing.exp),
  inQuad: Easing.in(Easing.quad),
  inOutCubic: Easing.inOut(Easing.cubic),
  linear: (t) => t,
};

export const ease = (name: EasingName) => EASINGS[name];
