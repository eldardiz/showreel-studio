import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';
import { resolveFont } from '../fonts';

type S = Extract<Slide, { device: 'specimen' }>;

/** Type specimen rows: label rises in, rule draws left→right, staggered. Reference S5. */
export const Specimen: React.FC<SlideProps<S>> = ({ frame, slide, preset, brand }) => {
  const enterE = ease(preset.ease.enter);
  const stagger = slide.stagger ?? 4;
  const left = slide.left ?? 472;
  const ruleW = slide.ruleWidth ?? 976;
  const color = slide.dark ? brand.inkOnDark ?? brand.bg : brand.ink;
  return (
    <AbsoluteFill>
      {slide.rows.map((r, i) => {
        const t0 = 2 + i * stagger;
        const p = ramp(frame, t0, t0 + 10, enterE);
        const rule = ramp(frame, t0 + 2, t0 + 14, enterE);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left,
                top: r.top,
                fontFamily: resolveFont(r.font),
                fontWeight: r.weight ?? 400,
                fontSize: r.size,
                lineHeight: 1,
                color,
                letterSpacing: r.letterSpacing ?? '-0.03em',
                opacity: p,
                transform: `translateY(${lerp(preset.text.rise, 0, p)}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                position: 'absolute',
                left,
                top: r.rule,
                width: ruleW,
                height: 2,
                backgroundColor: slide.ruleColor ?? color,
                transform: `scaleX(${rule})`,
                transformOrigin: '0% 50%',
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
