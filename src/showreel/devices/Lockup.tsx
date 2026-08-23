import React from 'react';
import { AbsoluteFill, staticFile, useVideoConfig } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { ramp } from '../motion';

type S = Extract<Slide, { device: 'lockup' }>;

/**
 * Logo type-in (reference S2 / S28): the wordmark PNG is sliced per glyph,
 * slices appear one after another starting spread out (wide tracking) and
 * collapse into place. Slices are x-runs in source pixels (scripts/measure.py slices).
 */
export const Lockup: React.FC<SlideProps<S>> = ({ frame, slide, preset }) => {
  const { width, height } = useVideoConfig();
  const srcW = slide.srcWidth ?? width;
  const srcH = slide.srcHeight ?? height;
  const pad = 24;
  const mid = (slide.slices.length - 1) / 2;
  const perSlice = 1 / preset.text.charPerFrame;
  const collapseDur = preset.text.trackIn - 2;
  const spread = slide.spread ?? 48;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: srcW,
          height: srcH,
          transform: `scale(${(slide.scale ?? 1) * (width / srcW)})`,
          transformOrigin: '50% 50%',
        }}
      >
        {slide.slices.map(([x0, x1], i) => {
          const t0 = i * perSlice;
          const o = ramp(frame, t0, t0 + 3);
          const collapse = ramp(frame, 0, collapseDur, ease(preset.ease.enter));
          const dx = (i - mid) * spread * (1 - collapse);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x0,
                top: slide.top - pad,
                width: x1 - x0 + 1,
                height: slide.bottom - slide.top + pad * 2,
                backgroundImage: `url(${staticFile(slide.src)})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${srcW}px ${srcH}px`,
                backgroundPosition: `-${x0}px -${slide.top - pad}px`,
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
