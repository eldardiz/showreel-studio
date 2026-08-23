import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { AnimatedText } from '../text/AnimatedText';

type S = Extract<Slide, { device: 'title' }>;

/** Centered title card. Reference S1 / S7 / S18. */
export const Title: React.FC<SlideProps<S>> = ({ frame, dur, slide, preset, brand, font }) => {
  const color = slide.dark ? brand.inkOnDark ?? brand.bg : brand.ink;
  const outKind = slide.out?.kind ?? 'cut';
  const wantsExit = slide.exit ?? outKind === 'cut';
  const exitAt = wantsExit ? dur - preset.text.trackOut - 1 : undefined;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AnimatedText
        frame={frame}
        text={slide.text}
        lines={slide.lines}
        effect={slide.effect}
        preset={preset}
        exitAt={exitAt}
        periodColor={slide.periodColor ?? brand.accent ?? color}
        style={{
          fontFamily: font('title'),
          fontWeight: slide.fontWeight ?? 500,
          fontSize: slide.fontSize ?? 120,
          color,
          textAlign: 'center',
          lineHeight: 1.05,
        }}
      />
    </AbsoluteFill>
  );
};
