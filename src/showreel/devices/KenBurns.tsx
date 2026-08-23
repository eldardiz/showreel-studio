import React from 'react';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';
import { ImageCam } from '../primitives/ImageCam';

type S = Extract<Slide, { device: 'kenBurns' }>;

/**
 * A still that settles in (optionally from a slight over-scale or from blur)
 * and then lets the slide shell push into the cut. Reference S3 / S4 / S15-17.
 */
export const KenBurns: React.FC<SlideProps<S>> = ({ frame, slide, preset }) => {
  const settleDur = slide.settle ?? 8;
  const p = ramp(frame, 0, settleDur, ease(preset.ease.enter));
  const scale = lerp(slide.from ?? 1, 1, p);
  const blur = slide.blurIn ? (1 - p) * slide.blurIn : 0;
  return <ImageCam src={slide.src} scale={scale} origin={slide.origin} blur={blur} fit={slide.fit} />;
};
