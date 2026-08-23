import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Motion trail: renders the same content at several sub-frame offsets and
 * composites them with 1/j alpha so every sample has equal weight and the
 * background stays fully covered. Emulates camera-style motion blur during
 * fast zooms/scrolls. samples <= 1 renders once, no blur.
 */
export const Trail: React.FC<{
  frame: number;
  samples: number;
  shutter: number; // fraction of a frame the shutter stays open (0.5–1)
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
