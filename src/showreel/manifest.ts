import type React from 'react';
import type { EasingName } from './easing';

export type PresetName = 'editorial' | 'snappy' | 'cinematic';

export type MotionPreset = {
  ease: {
    enter: EasingName; // text / element entrances
    exit: EasingName; // text exits, whips
    push: EasingName; // camera push during holds (accelerates into the cut)
    move: EasingName; // fast scrolls / step moves
    reveal: EasingName; // zoom reveals (zoomEnter, blurReveal)
  };
  hold: { short: number; base: number; long: number }; // frames
  transition: {
    flash: number; // frames the white overlay takes to decay (peak is 1 frame)
    crossfade: number;
    whip: number;
    zoomEnter: number;
    blurReveal: number;
    fadeOut: number;
    blurDissolve: number;
  };
  push: { soft: number; strong: number }; // scale multipliers, e.g. 1.06 / 1.25
  blur: {
    samples: number; // Trail samples during fast moves
    shutter: number; // fraction of a frame the shutter stays open
    maxPx: number; // cap for the additional CSS blur
    gain: number; // velocity → blur px multiplier
    threshold: number; // scale-velocity above which the Trail kicks in
  };
  text: {
    wordStagger: number; // frames between words (title)
    wordFade: number; // frames a word takes to fade in
    perWord: number; // typed headline: frames per word
    charPerFrame: number; // lockup type-in: chars per frame (1 = one char per frame)
    trackIn: number; // frames for letter-spacing collapse
    trackOut: number; // frames for the tracking-out exit
    charStagger: number; // charBlurIn / maskWipe stagger
    blurIn: number; // px of blur a word/char starts from
    rise: number; // px of translateY for wordRise / lineRise
  };
};

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** frames, or beats when audio.beats is set ("2b" = two beats) */
export type Hold = number | `${number}b`;

export type TransitionIn =
  | { kind: 'cut' }
  | { kind: 'flash'; color?: string }
  | { kind: 'crossfade'; dur?: number }
  | { kind: 'zoomEnter'; from?: number; dur?: number }
  | { kind: 'blurReveal'; from?: number; origin?: string; dur?: number }
  | { kind: 'blurDissolve'; dur?: number };

export type TransitionOut =
  | { kind: 'cut' }
  | { kind: 'whip'; to?: number; dur?: number }
  | { kind: 'fade'; dur?: number }
  | { kind: 'fadeToBlack'; dur?: number }
  | { kind: 'crossfade'; dur?: number }
  | { kind: 'blurDissolve'; dur?: number };

export type SfxCue = { at: number | 'in' | 'out'; name: string; gain?: number };

export type Camera = {
  push?: number; // target scale at the cut (default preset.push.soft)
  origin?: string; // transform-origin, e.g. '50% 50%'
  startAt?: number; // frame (local) the push starts
  easing?: EasingName;
};

export type SlideBase = {
  id: string;
  hold: Hold;
  in?: TransitionIn;
  out?: TransitionOut;
  bg?: string; // defaults to brand.bg (or brand.bgDark when dark: true)
  dark?: boolean;
  camera?: Camera | false; // false = no push at all
  focus?: { x: number; y: number }; // 0..1, reserved for 9:16 reframing
  sfx?: SfxCue[];
  ease?: Partial<MotionPreset['ease']>;
};

export type Slice = [number, number];

export type TextEffect = 'trackIn' | 'wordRise' | 'charBlurIn' | 'wordBlurIn' | 'maskWipe' | 'lineRise';

export type Token = { text: string; color: string; br?: boolean };

export type SlideProps<S = Slide> = {
  frame: number; // local, may be fractional (motion trail)
  dur: number;
  slide: S;
  preset: MotionPreset;
  brand: Brand;
  font: (role: keyof Brand['fonts']) => string; // resolved CSS font-family
};

export type Slide = SlideBase &
  (
    | {
        device: 'title';
        text: string; // a trailing '.' renders as the accent period
        effect?: TextEffect;
        fontSize?: number; // px at 1080p (default 120)
        fontWeight?: number;
        periodColor?: string;
        exit?: boolean; // tracking-out + fade before the cut (default true for cut/flash outs)
        lines?: string[]; // multi-line variant for lineRise
      }
    | {
        device: 'lockup';
        src: string;
        slices: Slice[]; // x-runs of the glyphs in source pixels
        top: number;
        bottom: number;
        srcWidth?: number; // natural size of src (default: composition size)
        srcHeight?: number;
        scale?: number;
        spread?: number; // px of extra tracking at t=0
      }
    | {
        device: 'kenBurns';
        src: string;
        from?: number; // settle-from scale (1.03 after a flash)
        settle?: number; // frames
        origin?: string;
        blurIn?: number; // px, image enters from blur
        fit?: 'cover' | 'contain';
      }
    | {
        device: 'typed';
        tokens: Token[];
        start?: number;
        deleteAt?: number | false;
        style: React.CSSProperties;
        chrome?: React.FC<SlideProps>;
        effect?: 'typed' | 'wordRise' | 'wordBlurIn';
      }
    | {
        device: 'staggerPop';
        src: string;
        slices: Slice[] | { cols: number; rows: number; left: number; right: number };
        top: number;
        bottom: number;
        srcWidth?: number;
        srcHeight?: number;
        stagger?: number;
        order?: 'ltr' | 'center' | 'random';
        fromScale?: number;
      }
    | {
        device: 'specimen';
        rows: { label: string; font: string; size: number; top: number; rule: number; weight?: number; letterSpacing?: string }[];
        left?: number;
        ruleWidth?: number;
        ruleColor?: string;
        stagger?: number;
      }
    | {
        device: 'pageScroll';
        src: string;
        srcWidth: number; // natural pixel size of the screenshot
        srcHeight: number;
        frame?: 'none' | 'thin' | 'browser';
        viewportWidth?: number; // rendered width of the page (default 1600 at 1080p)
        steps: number[] | 'auto'; // scroll positions in source px; 'auto' = even steps
        stepDur?: { move: number; settle: number };
        startAt?: number;
      }
    | {
        device: 'deviceZoom';
        src: string;
        srcWidth: number;
        srcHeight: number;
        shell: 'browser' | 'imac';
        shellSrc?: string; // PNG for 'imac'
        screenRect?: { x: number; y: number; w: number; h: number }; // for imac shell, in shell px
        zoomAt: number; // local frame the push-through-the-screen starts
        zoomDur?: number;
        scrollPx?: number; // how far the page scrolls during the hold
      }
    | {
        device: 'hoverButton';
        label: string;
        fill: string;
        hover: string;
        iconFill: string;
        textColor?: string;
        hoverTextColor?: string;
        hoverAt?: number;
        burst?: boolean;
        width?: number;
        height?: number;
      }
    | {
        device: 'custom';
        component: React.FC<SlideProps>;
      }
  );

export type DeviceKind = Slide['device'];

export type Brand = {
  bg: string;
  bgDark: string;
  ink: string;
  inkOnDark?: string;
  dim: string;
  pending: string;
  accent?: string;
  border?: string;
  fonts: { title: string; body?: string; mono?: string }; // Google Fonts family names (see fonts.ts)
};

export type BeatGrid = { kind: 'bpm'; bpm: number; offsetSec?: number } | { kind: 'file'; beats: number[] };

export type AudioConfig = {
  music?: { src: string; volume?: number; startSec?: number; fadeOutFrames?: number };
  beats?: BeatGrid;
  snapTolerance?: number; // frames, default 4
  sfx?: {
    library: Record<string, string>; // key → staticFile path
    auto?: { whip?: string; flash?: string; zoomEnter?: string; blurReveal?: string; cut?: string };
  };
};

export type EditManifest = {
  id: string;
  client: string;
  fps: 30;
  width: 1920;
  height: 1080;
  brand: Brand;
  preset: PresetName | ({ extends: PresetName } & DeepPartial<MotionPreset>);
  audio?: AudioConfig;
  slides: Slide[];
  /** frames of black appended after the last slide (default 0) */
  tail?: number;
};
