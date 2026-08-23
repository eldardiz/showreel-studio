import React from 'react';
import { AbsoluteFill, staticFile, useVideoConfig } from 'remotion';
import type { Slice, Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';

type S = Extract<Slide, { device: 'staggerPop' }>;

const seeded = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * One image split into tiles (x-slices, or a cols×rows grid) that pop in with
 * a stagger: opacity 0→1 + scale fromScale→1. Reference S3 colour tiles, S6
 * texture swatches; native colour stripes.
 */
export const StaggerPop: React.FC<SlideProps<S>> = ({ frame, slide, preset }) => {
  const { width, height } = useVideoConfig();
  const srcW = slide.srcWidth ?? width;
  const srcH = slide.srcHeight ?? height;
  const stagger = slide.stagger ?? 3;
  const enterE = ease(preset.ease.enter);

  // build tile rects in source px
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  if (Array.isArray(slide.slices)) {
    (slide.slices as Slice[]).forEach(([x0, x1]) => rects.push({ x: x0, y: slide.top, w: x1 - x0 + 1, h: slide.bottom - slide.top }));
  } else {
    const g = slide.slices;
    const cw = (g.right - g.left) / g.cols;
    const ch = (slide.bottom - slide.top) / g.rows;
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) rects.push({ x: g.left + c * cw, y: slide.top + r * ch, w: cw, h: ch });
  }
  const n = rects.length;
  const orderIndex = (i: number) => {
    if (slide.order === 'center') return Math.abs(i - (n - 1) / 2);
    if (slide.order === 'random') return seeded(i) * n;
    return i;
  };

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: srcW, height: srcH, transform: `scale(${width / srcW})`, transformOrigin: '50% 50%' }}>
        {rects.map((r, i) => {
          const t0 = orderIndex(i) * stagger;
          const p = ramp(frame, t0, t0 + 6, enterE);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: r.x,
                top: r.y,
                width: r.w,
                height: r.h,
                backgroundImage: `url(${staticFile(slide.src)})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${srcW}px ${srcH}px`,
                backgroundPosition: `-${r.x}px -${r.y}px`,
                opacity: p,
                transform: `scale(${lerp(slide.fromScale ?? 0.9, 1, p)})`,
                transformOrigin: '50% 50%',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
