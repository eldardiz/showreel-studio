import React from 'react';
import { Audio, interpolate, staticFile, useVideoConfig } from 'remotion';
import type { AudioConfig } from '../manifest';

/** Music bed with a fade-out at the end. Renders nothing when no music is configured. */
export const Soundtrack: React.FC<{ audio?: AudioConfig; total: number }> = ({ audio, total }) => {
  const { fps } = useVideoConfig();
  const m = audio?.music;
  if (!m) return null;
  const fade = m.fadeOutFrames ?? 30;
  const vol = m.volume ?? 0.8;
  return (
    <Audio
      src={staticFile(m.src)}
      startFrom={Math.round((m.startSec ?? 0) * fps)}
      volume={(f) => vol * interpolate(f, [total - fade, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
    />
  );
};
