import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import { EASE_IN, EASE_NATIVE, H, INK, PENDING, W, WHITE } from './tokens';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

type EasingFn = (t: number) => number;

/** 0 → 1 between two frames, clamped, optionally eased. */
export const ramp = (frame: number, from: number, to: number, easing?: EasingFn) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Motion trail: renders the same content at several sub-frame offsets and
 * composites them with 1/j alpha so every sample has equal weight and the
 * background stays fully covered. Emulates the camera-style motion blur of
 * the reference during fast zooms/scrolls. samples=1 means no blur.
 */
export const Trail: React.FC<{
  frame: number;
  samples: number;
  shutter: number; // fraction of a frame the "shutter" stays open (0.5–1)
  render: (f: number) => React.ReactNode;
}> = ({ frame, samples, shutter, render }) => {
  if (samples <= 1) return <>{render(frame)}</>;
  const layers: React.ReactNode[] = [];
  for (let k = 0; k < samples; k++) {
    const f = frame - shutter * (k / (samples - 1));
    layers.push(
      <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
        {render(f)}
      </AbsoluteFill>,
    );
  }
  return <>{layers}</>;
};

/** Full-frame image with a scale/translate camera applied. */
export const ImageCam: React.FC<{
  src: string;
  scale: number;
  origin?: string;
  x?: number;
  y?: number;
  blur?: number;
  opacity?: number;
}> = ({ src, scale, origin = '50% 50%', x = 0, y = 0, blur = 0, opacity = 1 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <Img
      src={staticFile(src)}
      style={{
        width: W,
        height: H,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: origin,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Title card: "A new look."  (reference S1 / S7 / S18)
// Enter: 2-frame word stagger, 3-frame word fade, letter-spacing 0.12em → 0
// over 14 frames. Exit: letter-spacing 0 → 0.10em + fade over 7 frames.
// ---------------------------------------------------------------------------
export const TitleCard: React.FC<{
  frame: number;
  text: string;
  exitAt: number;
  fontFamily: string;
  fontSize?: number;
  color?: string;
  periodColor?: string;
  bg?: string;
}> = ({ frame, text, exitAt, fontFamily, fontSize = 120, color = INK, periodColor = INK, bg = WHITE }) => {
  const words = text.replace(/\.$/, '').split(' ');
  const hasPeriod = text.endsWith('.');
  const trackIn = ramp(frame, 0, 14, EASE_NATIVE);
  const exit = ramp(frame, exitAt, exitAt + 7, EASE_IN);
  const letterSpacing = 0.12 * (1 - trackIn) + 0.1 * exit;
  const opacityAll = 1 - exit;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontFamily,
          fontWeight: 500,
          fontSize,
          color,
          letterSpacing: `${letterSpacing}em`,
          opacity: opacityAll,
          whiteSpace: 'nowrap',
          // compensate the trailing letter-spacing so the line stays optically centered
          marginRight: `${-letterSpacing}em`,
        }}
      >
        {words.map((w, i) => {
          const start = 1 + i * 2;
          const o = ramp(frame, start, start + 3);
          return (
            <span key={i} style={{ opacity: o }}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
        {hasPeriod && (
          <span style={{ opacity: ramp(frame, 2, 5), color: periodColor }}>.</span>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Lockup type-in (reference S2 / S28): the wordmark PNG is sliced per glyph,
// each slice appears 1 frame after the previous, starting spread out (wide
// tracking) and collapsing into place over 12 frames.
// ---------------------------------------------------------------------------
export type Slice = [number, number]; // x0, x1 in source pixels

export const LockupTypeIn: React.FC<{
  frame: number;
  src: string;
  slices: Slice[];
  top: number; // source y of glyph box
  bottom: number;
  start: number;
  scale?: number;
  spread?: number; // px of extra tracking at t=0
}> = ({ frame, src, slices, top, bottom, start, scale = 1, spread = 48 }) => {
  const pad = 24;
  const mid = (slices.length - 1) / 2;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: '50% 50%',
        }}
      >
        {slices.map(([x0, x1], i) => {
          const t0 = start + i; // 1 frame per glyph
          const o = ramp(frame, t0, t0 + 3);
          const collapse = ramp(frame, start, start + 12, EASE_NATIVE);
          const dx = (i - mid) * spread * (1 - collapse);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x0,
                top: top - pad,
                width: x1 - x0 + 1,
                height: bottom - top + pad * 2,
                backgroundImage: `url(${staticFile(src)})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${W}px ${H}px`,
                backgroundPosition: `-${x0}px -${top - pad}px`,
                opacity: o,
                transform: `translateX(${dx}px)`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Typed headline (reference S4): word-by-word at 3 frames per word, newest
// word renders in PENDING grey then darkens; deletes from the end at the same
// rate after `deleteAt`.
// ---------------------------------------------------------------------------
export type Token = { text: string; color: string; br?: boolean };

export const TypedHeadline: React.FC<{
  frame: number;
  tokens: Token[];
  start: number;
  deleteAt: number;
  perWord?: number;
  style: React.CSSProperties;
}> = ({ frame, tokens, start, deleteAt, perWord = 3, style }) => {
  const n = tokens.length;
  return (
    <div style={style}>
      {tokens.map((tk, i) => {
        const appear = start + i * perWord;
        const gone = deleteAt + (n - 1 - i) * perWord; // last word leaves first
        const visible = frame >= appear && frame < gone + perWord;
        const typing = frame < appear + 2;
        const deleting = frame >= gone;
        const color = typing || deleting ? PENDING : tk.color;
        return (
          <React.Fragment key={i}>
            <span style={{ color, opacity: visible ? 1 : 0 }}>{tk.text}</span>
            {tk.br ? <br /> : <span style={{ opacity: visible ? 1 : 0 }}> </span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Flash (reference S14): up in 1 frame, down over 2.
// ---------------------------------------------------------------------------
export const Flash: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const o =
    frame < at
      ? 0
      : interpolate(frame, [at, at + 1, at + 4], [0, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  return <AbsoluteFill style={{ backgroundColor: WHITE, opacity: o, pointerEvents: 'none' }} />;
};
