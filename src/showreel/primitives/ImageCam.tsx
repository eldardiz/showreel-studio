import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';

/** Full-frame image (cover or contain) with a scale/translate camera applied. */
export const ImageCam: React.FC<{
  src: string;
  scale?: number;
  origin?: string;
  x?: number;
  y?: number;
  blur?: number;
  opacity?: number;
  fit?: 'cover' | 'contain';
}> = ({ src, scale = 1, origin = '50% 50%', x = 0, y = 0, blur = 0, opacity = 1, fit = 'cover' }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width,
          height,
          objectFit: fit,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: origin,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
