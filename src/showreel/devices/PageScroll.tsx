import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';
import { Trail } from '../primitives/Trail';
import { BrowserChrome, CHROME_H } from './BrowserChrome';

type S = Extract<Slide, { device: 'pageScroll' }>;

/**
 * A tall page screenshot scrolled in steps: fast blurred move, then a slow
 * settle with residual drift. Reference S10 and the dark-mode S20-S27 pattern.
 * `steps` are scroll offsets in source px; 'auto' spaces them by viewport height.
 */
export const PageScroll: React.FC<SlideProps<S>> = ({ frame, dur, slide, preset, brand }) => {
  const { width, height } = useVideoConfig();
  const frameKind = slide.frame ?? 'thin';
  const vw = frameKind === 'none' ? width : slide.viewportWidth ?? 1600;
  const scale = vw / slide.srcWidth;
  const top = frameKind === 'none' ? 0 : 40;
  const chromeH = frameKind === 'browser' ? CHROME_H : 0;
  const vh = height - top * (frameKind === 'none' ? 0 : 1) - chromeH; // viewport height in render px
  const vhSrc = vh / scale;
  const maxScroll = Math.max(0, slide.srcHeight - vhSrc);
  const move = slide.stepDur?.move ?? 10;
  const settle = slide.stepDur?.settle ?? 24;
  const startAt = slide.startAt ?? 12;

  let steps: number[];
  if (slide.steps === 'auto') {
    const n = Math.max(1, Math.floor((dur - startAt) / (move + settle)) + 1);
    const stepSrc = Math.min(vhSrc * 0.9, n > 1 ? maxScroll / (n - 1) : 0);
    steps = Array.from({ length: n }, (_, i) => Math.min(maxScroll, i * stepSrc));
  } else steps = slide.steps.map((s) => Math.min(maxScroll, s));

  const glide = slide.curve === 'glide';
  const moveE = glide ? ease('glide') : ease(preset.ease.move);
  const settleE = ease('outCubic');
  const mainShare = glide ? 0.97 : 0.94; // glide keeps almost all travel on the single curve
  const yAt = (f: number) => {
    let y = steps[0] ?? 0;
    for (let i = 1; i < steps.length; i++) {
      const t0 = startAt + (i - 1) * (move + settle);
      const delta = steps[i] - steps[i - 1];
      const fast = ramp(f, t0, t0 + move, moveE);
      const drift = ramp(f, t0 + move, t0 + move + settle, settleE);
      y += delta * mainShare * fast + delta * (1 - mainShare) * drift;
    }
    return y;
  };
  const vPx = Math.abs(yAt(frame + 1) - yAt(frame)) * scale;
  // crisp gate: below this speed the frame renders fully sharp, so blur only
  // exists mid-flight and a composed section is never smeared
  const CRISP_PX = 6;
  const samples = vPx > CRISP_PX ? preset.blur.samples : 1;
  const blur = vPx > CRISP_PX ? Math.min(preset.blur.maxPx, (vPx - CRISP_PX) * 0.35) : 0;

  const page = (f: number) => (
    <Img
      src={staticFile(slide.src)}
      style={{
        position: 'absolute',
        left: 0,
        top: -yAt(f) * scale,
        width: vw,
        height: slide.srcHeight * scale,
      }}
    />
  );

  const frameStyle: React.CSSProperties =
    frameKind === 'thin'
      ? { border: `1px solid ${brand.border ?? '#e6e6e6'}`, boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }
      : frameKind === 'browser'
        ? { borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 60px rgba(0,0,0,0.12)' }
        : {};

  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ position: 'absolute', top, width: vw, height: vh + chromeH, ...frameStyle }}>
        {frameKind === 'browser' ? <BrowserChrome width={vw} dark={slide.dark} /> : null}
        <div style={{ position: 'absolute', top: chromeH, left: 0, width: vw, height: vh, overflow: 'hidden', filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
          <Trail frame={frame} samples={samples} shutter={preset.blur.shutter} render={page} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
