import { Easing } from 'remotion';

// native.agency tokens (docs/DESIGN-TOKENS.md) + values measured from the supplied frames
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const INK = '#1a1a1a';
export const WHITE = '#ffffff';
export const DIM = '#85857f'; // tertiary warm grey, used for the two-tone headline
export const PENDING = '#c9c8c3'; // "just typed" word before it darkens
export const CARD_BORDER = '#d9d9d9'; // measured on 1442.png
export const RULE = '#000000'; // measured on 1444.png

// native's signature decel curve: cubic-bezier(.16, 1, .3, 1)
export const EASE_NATIVE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.in(Easing.quad);
export const EASE_INOUT = Easing.inOut(Easing.cubic);
export const EASE_OUT_EXPO = Easing.out(Easing.exp);

// Shot boundaries (frames, 30 fps). Derived from the Omni Lab reference rhythm.
export const SHOTS = {
  title: { from: 0, dur: 34 }, // "A new look."           0.00–1.10
  lockup: { from: 34, dur: 57 }, // lockup type-in, dark   1.13–3.00
  markDark: { from: 91, dur: 41 }, // N mark push-in        3.03–4.37
  flash: { from: 131, dur: 5 }, // 1-frame white flash    4.37–4.50
  markLight: { from: 132, dur: 34 }, // inverted mark (takes over at the flash peak) 4.40–5.50
  headline: { from: 166, dur: 70 }, // typed headline card  5.53–7.83
  stripes: { from: 236, dur: 45 }, // color stripes         7.87–9.33
  type: { from: 281, dur: 42 }, // type specimen           9.37–10.73
  statue: { from: 323, dur: 61 }, // blurred zoom-out       10.77–12.77
  cta: { from: 384, dur: 62 }, // "Work with us"           12.80–14.83
  end: { from: 446, dur: 75 }, // end lockup + fade         14.87–17.37
} as const;

export const TOTAL_FRAMES = SHOTS.end.from + SHOTS.end.dur; // 521
