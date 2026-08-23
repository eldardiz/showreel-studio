import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { Brand, SlideProps } from '../manifest';
import type { ResolvedSlide, ResolvedTimeline } from '../timeline';
import { ease } from '../easing';
import { blurFor, lerp, ramp, velocityOf } from '../motion';
import { Trail } from '../primitives/Trail';
import { DEVICES } from '../devices';

/**
 * Wraps every slide: background, in-transition (zoomEnter, blurReveal,
 * crossfade, blurDissolve), camera push that accelerates into the cut,
 * out-transition (whip, fade, fadeToBlack, blurDissolve) and velocity-driven
 * motion blur. The device only renders content for a (possibly fractional) frame.
 */
export const SlideShell: React.FC<{
  rs: ResolvedSlide;
  tl: ResolvedTimeline;
  next?: ResolvedSlide;
  brand: Brand;
  font: SlideProps['font'];
}> = ({ rs, tl, next, brand, font }) => {
  // useCurrentFrame() is already relative to the slide's <Sequence>
  const frame = useCurrentFrame();
  const { slide, dur } = rs;
  const preset = tl.preset;
  const tr = preset.transition;
  const e = { ...preset.ease, ...(slide.ease ?? {}) };

  // ---- enter ----
  const tin = slide.in ?? { kind: 'cut' as const };
  let enterScale = (_f: number) => 1;
  let enterOrigin = '50% 50%';
  let enterOpacity = 1;
  let enterBlur = 0;
  if (tin.kind === 'zoomEnter') {
    const d = tin.dur ?? tr.zoomEnter;
    const from = tin.from ?? 0.7;
    enterScale = (f) => lerp(from, 1, ramp(f, 0, d, ease(e.reveal)));
  } else if (tin.kind === 'blurReveal') {
    const d = tin.dur ?? tr.blurReveal;
    const from = tin.from ?? 3.2;
    enterOrigin = tin.origin ?? '50% 50%';
    enterScale = (f) => lerp(from, 1, ramp(f, 0, d, ease(e.reveal)));
  } else if (tin.kind === 'crossfade') {
    enterOpacity = ramp(frame, 0, rs.overlapIn || (tin.dur ?? tr.crossfade));
  } else if (tin.kind === 'blurDissolve') {
    const p = ramp(frame, 0, rs.overlapIn || (tin.dur ?? tr.blurDissolve), ease('outCubic'));
    enterOpacity = p;
    enterBlur = (1 - p) * preset.blur.maxPx;
  }
  const enterEnd = tin.kind === 'zoomEnter' ? tin.dur ?? tr.zoomEnter : tin.kind === 'blurReveal' ? tin.dur ?? tr.blurReveal : rs.overlapIn;

  // ---- camera push ----
  const cam = slide.camera;
  let pushScale = (_f: number) => 1;
  let pushOrigin = '50% 50%';
  if (cam !== false) {
    const target = cam?.push ?? preset.push.soft;
    const startAt = cam?.startAt ?? enterEnd;
    const pe = ease(cam?.easing ?? e.push);
    pushOrigin = cam?.origin ?? '50% 50%';
    pushScale = (f) => lerp(1, target, ramp(f, startAt, dur, pe));
  }

  // ---- exit ----
  const tout = slide.out ?? { kind: 'cut' as const };
  let exitScale = (_f: number) => 1;
  let exitOpacity = 1;
  let exitBlur = 0;
  let fadesWholeSlide = false;
  if (tout.kind === 'whip') {
    const d = tout.dur ?? tr.whip;
    const to = tout.to ?? 1.7;
    exitScale = (f) => lerp(1, to, ramp(f, dur - d, dur, ease(e.exit)));
  } else if (tout.kind === 'fade' || tout.kind === 'fadeToBlack') {
    const d = tout.dur ?? tr.fadeOut;
    exitOpacity = 1 - ramp(frame, dur - d, dur, ease('inOutCubic'));
    fadesWholeSlide = tout.kind === 'fadeToBlack';
  } else if (tout.kind === 'blurDissolve') {
    const d = next?.overlapIn || tout.dur || tr.blurDissolve;
    exitBlur = ramp(frame, dur - d, dur, ease('inQuad')) * preset.blur.maxPx;
  }

  const scaleAt = (f: number) => enterScale(f) * pushScale(f) * exitScale(f);
  const v = velocityOf(scaleAt, frame);
  const mb = blurFor(v, preset);
  const origin = tin.kind === 'blurReveal' && frame < enterEnd ? enterOrigin : pushOrigin;
  const totalBlur = mb.px + enterBlur + exitBlur;
  const bg = slide.bg ?? (slide.dark ? brand.bgDark : brand.bg);
  const Device = DEVICES[slide.device];

  const content = (f: number) => (
    <AbsoluteFill style={{ transform: `scale(${scaleAt(f)})`, transformOrigin: origin }}>
      <Device frame={f} dur={dur} slide={slide} preset={preset} brand={brand} font={font} />
    </AbsoluteFill>
  );

  return (
    // the whole slide (background included) fades in for crossfade / blurDissolve so the previous slide shows through
    <AbsoluteFill style={{ backgroundColor: bg, opacity: enterOpacity * (fadesWholeSlide ? exitOpacity : 1) }}>
      <AbsoluteFill
        style={{
          opacity: fadesWholeSlide ? 1 : exitOpacity,
          filter: totalBlur > 0.2 ? `blur(${totalBlur}px)` : undefined,
        }}
      >
        <Trail frame={frame} samples={mb.samples} shutter={mb.shutter} render={content} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
