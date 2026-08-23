import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadGeistMono } from '@remotion/google-fonts/GeistMono';
import {
  CARD_BORDER,
  DIM,
  EASE_IN,
  EASE_INOUT,
  EASE_NATIVE,
  EASE_OUT_EXPO,
  H,
  INK,
  RULE,
  SHOTS,
  W,
  WHITE,
} from './tokens';
import {
  Flash,
  ImageCam,
  LockupTypeIn,
  Slice,
  TitleCard,
  Trail,
  TypedHeadline,
  lerp,
  ramp,
} from './primitives';

const manrope = loadManrope('normal', { weights: ['400', '500', '600'], subsets: ['latin'] });
const inter = loadInter('normal', { weights: ['400'], subsets: ['latin'] });
const geistMono = loadGeistMono('normal', { weights: ['400'], subsets: ['latin'] });

// glyph boxes of the NATIVE lockup in 01.png (measured): mark, N, AT, I, V, E
const LOCKUP_SLICES: Slice[] = [
  [436, 581],
  [650, 800],
  [809, 1103],
  [1120, 1156],
  [1167, 1335],
  [1346, 1468],
];
const LOCKUP_TOP = 472;
const LOCKUP_BOTTOM = 606;

// colour stripes in 1443.png (measured x bounds, y 32→1046)
const STRIPES: Slice[] = [
  [32, 403],
  [404, 774],
  [775, 1145],
  [1146, 1516],
  [1517, 1888],
];
const STRIPE_TOP = 32;
const STRIPE_BOTTOM = 1046;

// ---------------------------------------------------------------------------
// S1 · "A new look."
// ---------------------------------------------------------------------------
const TitleShot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <TitleCard
      frame={frame}
      text="A new look."
      exitAt={SHOTS.title.dur - 8}
      fontFamily={manrope.fontFamily}
    />
  );
};

// ---------------------------------------------------------------------------
// S2 · lockup type-in on dark, slow push-in
// ---------------------------------------------------------------------------
const LockupShot: React.FC<{ scale?: number; fadeOutAt?: number }> = ({ scale = 1, fadeOutAt }) => {
  const frame = useCurrentFrame();
  const push = lerp(1, 1.06, ramp(frame, 12, SHOTS.lockup.dur, EASE_IN));
  const fade = fadeOutAt === undefined ? 1 : 1 - ramp(frame, fadeOutAt, fadeOutAt + 20);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, opacity: 1 }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <LockupTypeIn
          frame={frame}
          src="edits/native-agency/01.png"
          slices={LOCKUP_SLICES}
          top={LOCKUP_TOP}
          bottom={LOCKUP_BOTTOM}
          start={0}
          scale={scale * push}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S3 · N mark on dark, accelerating push-in into the cut
// ---------------------------------------------------------------------------
const MarkDarkShot: React.FC = () => {
  const frame = useCurrentFrame();
  const s = lerp(1, 1.25, ramp(frame, 0, SHOTS.markDark.dur, EASE_IN));
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <ImageCam src="edits/native-agency/02.png" scale={s} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S4 · inverted mark coming out of the flash
// ---------------------------------------------------------------------------
const MarkLightShot: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = lerp(1.03, 1, ramp(frame, 0, 8, EASE_NATIVE));
  const push = lerp(1, 1.05, ramp(frame, 8, SHOTS.markLight.dur, EASE_IN));
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE }}>
      <ImageCam src="edits/native-agency/1441.png" scale={settle * push} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S5 · headline card typed word-by-word, then deleted (reference S4)
// ---------------------------------------------------------------------------
const HeadlineShot: React.FC = () => {
  const frame = useCurrentFrame();
  const push = lerp(1, 1.1, ramp(frame, 0, SHOTS.headline.dur, EASE_IN));
  const tokens = [
    { text: 'The', color: DIM },
    { text: 'web', color: INK },
    { text: '+', color: INK },
    { text: 'product', color: INK, br: true },
    { text: 'agency', color: DIM },
    { text: 'for', color: DIM },
    { text: 'the', color: DIM },
    { text: 'future.', color: DIM },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${push})`,
          transformOrigin: '30% 60%',
        }}
      >
        {/* card chrome measured from 1442.png */}
        <div
          style={{
            position: 'absolute',
            left: 51,
            top: 48,
            width: 1869 - 51,
            height: 1032 - 48,
            border: `1px solid ${CARD_BORDER}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 51,
            top: 554,
            width: 1869 - 51,
            height: 1,
            backgroundColor: CARD_BORDER,
          }}
        />
        <TypedHeadline
          frame={frame}
          tokens={tokens}
          start={2}
          deleteAt={40}
          style={{
            position: 'absolute',
            left: 108,
            top: 628,
            fontFamily: manrope.fontFamily,
            fontWeight: 500,
            fontSize: 156,
            lineHeight: 1.08,
            letterSpacing: '-0.045em',
            whiteSpace: 'nowrap',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S6 · colour stripes stagger-pop (reference S3 tiles), push-in to cut
// ---------------------------------------------------------------------------
const StripesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const push = lerp(1, 1.08, ramp(frame, 18, SHOTS.stripes.dur, EASE_IN));
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 50%' }}>
        {STRIPES.map(([x0, x1], i) => {
          const t0 = i * 3;
          const p = ramp(frame, t0, t0 + 6, EASE_NATIVE);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x0,
                top: STRIPE_TOP,
                width: x1 - x0 + 1,
                height: STRIPE_BOTTOM - STRIPE_TOP,
                backgroundImage: `url(${staticFile('edits/native-agency/1443.png')})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${W}px ${H}px`,
                backgroundPosition: `-${x0}px -${STRIPE_TOP}px`,
                opacity: p,
                transform: `scale(${lerp(0.9, 1, p)})`,
                transformOrigin: '50% 50%',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S7 · type specimen: lines stagger in, rules draw, pull-back to cut (ref S5)
// ---------------------------------------------------------------------------
const TypeShot: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { label: 'Manrope', family: manrope.fontFamily, size: 134, top: 236, rule: 400 },
    { label: 'Inter', family: inter.fontFamily, size: 134, top: 470, rule: 636 },
    { label: 'GEIST MONO', family: geistMono.fontFamily, size: 122, top: 712, rule: 872 },
  ];
  const pull = lerp(1, 0.9, ramp(frame, 20, SHOTS.type.dur, EASE_IN));
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${pull})`, transformOrigin: '60% 50%' }}>
        {rows.map((r, i) => {
          const t0 = 2 + i * 4;
          const p = ramp(frame, t0, t0 + 10, EASE_NATIVE);
          const rule = ramp(frame, t0 + 2, t0 + 14, EASE_NATIVE);
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: 472,
                  top: r.top,
                  fontFamily: r.family,
                  fontWeight: 400,
                  fontSize: r.size,
                  lineHeight: 1,
                  color: INK,
                  letterSpacing: r.label === 'GEIST MONO' ? '0.02em' : '-0.03em',
                  opacity: p,
                  transform: `translateY(${lerp(24, 0, p)}px)`,
                  whiteSpace: 'nowrap',
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 472,
                  top: r.rule,
                  width: 1448 - 472,
                  height: 2,
                  backgroundColor: RULE,
                  transform: `scaleX(${rule})`,
                  transformOrigin: '0% 50%',
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S8 · statue: blurred zoom-out reveal (reference S9), settle, push to cut
// ---------------------------------------------------------------------------
const StatueShot: React.FC = () => {
  const frame = useCurrentFrame();
  const scaleAt = (f: number) => {
    const land = lerp(3.2, 1, ramp(f, 0, 12, EASE_OUT_EXPO));
    const push = lerp(1, 1.06, ramp(f, 20, SHOTS.statue.dur, EASE_IN));
    return land * push;
  };
  const speed = Math.abs(scaleAt(frame + 1) - scaleAt(frame));
  const samples = speed > 0.01 ? 8 : 1;
  const blur = Math.min(14, speed * 60);
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE }}>
      <Trail
        frame={frame}
        samples={samples}
        shutter={0.8}
        render={(f) => <ImageCam src="edits/native-agency/1446.png" scale={scaleAt(f)} origin="20% 39%" blur={blur} />}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S9 · "Work with us": dark frame zooms up from 0.7 on white (reference S19),
// holds with push-in, whips out (reference S27)
// ---------------------------------------------------------------------------
const CtaShot: React.FC = () => {
  const frame = useCurrentFrame();
  const whipAt = SHOTS.cta.dur - 10;
  const scaleAt = (f: number) => {
    const enter = lerp(0.7, 1, ramp(f, 0, 15, EASE_OUT_EXPO));
    const push = lerp(1, 1.04, ramp(f, 15, whipAt, EASE_IN));
    const whip = lerp(1, 1.7, ramp(f, whipAt, SHOTS.cta.dur, EASE_IN));
    return enter * push * whip;
  };
  const speed = Math.abs(scaleAt(frame + 1) - scaleAt(frame));
  const samples = speed > 0.012 ? 8 : 1;
  const blur = Math.min(16, speed * 50);
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE }}>
      <Trail
        frame={frame}
        samples={samples}
        shutter={0.8}
        render={(f) => <ImageCam src="edits/native-agency/1445.png" scale={scaleAt(f)} blur={blur} />}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S10 · end card: lockup type-in at 0.85, hold, fade to black (reference S28/29)
// ---------------------------------------------------------------------------
const EndShot: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = 1 - ramp(frame, SHOTS.end.dur - 21, SHOTS.end.dur, EASE_INOUT);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <LockupTypeIn
          frame={frame}
          src="edits/native-agency/01.png"
          slices={LOCKUP_SLICES}
          top={LOCKUP_TOP}
          bottom={LOCKUP_BOTTOM}
          start={0}
          scale={0.85}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const NativeBrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={SHOTS.title.from} durationInFrames={SHOTS.title.dur}>
        <TitleShot />
      </Sequence>
      <Sequence from={SHOTS.lockup.from} durationInFrames={SHOTS.lockup.dur}>
        <LockupShot />
      </Sequence>
      <Sequence from={SHOTS.markDark.from} durationInFrames={SHOTS.markDark.dur}>
        <MarkDarkShot />
      </Sequence>
      <Sequence from={SHOTS.markLight.from} durationInFrames={SHOTS.markLight.dur}>
        <MarkLightShot />
      </Sequence>
      <Sequence from={SHOTS.headline.from} durationInFrames={SHOTS.headline.dur}>
        <HeadlineShot />
      </Sequence>
      <Sequence from={SHOTS.stripes.from} durationInFrames={SHOTS.stripes.dur}>
        <StripesShot />
      </Sequence>
      <Sequence from={SHOTS.type.from} durationInFrames={SHOTS.type.dur}>
        <TypeShot />
      </Sequence>
      <Sequence from={SHOTS.statue.from} durationInFrames={SHOTS.statue.dur}>
        <StatueShot />
      </Sequence>
      <Sequence from={SHOTS.cta.from} durationInFrames={SHOTS.cta.dur}>
        <CtaShot />
      </Sequence>
      <Sequence from={SHOTS.end.from} durationInFrames={SHOTS.end.dur}>
        <EndShot />
      </Sequence>
      <Flash frame={frame} at={SHOTS.flash.from} />
    </AbsoluteFill>
  );
};
