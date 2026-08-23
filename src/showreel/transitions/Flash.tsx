import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';

/** Full-frame flash: up in 1 frame, peaks at `at`, decays over `decay` frames. Reference S14. */
export const Flash: React.FC<{ frame: number; at: number; decay: number; color?: string }> = ({ frame, at, decay, color = '#ffffff' }) => {
  const o =
    frame < at - 1
      ? 0
      : interpolate(frame, [at - 1, at, at + decay], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: 'none' }} />;
};
