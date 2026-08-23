import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';
import { Trail } from '../primitives/Trail';
import { BrowserChrome, CHROME_H } from './BrowserChrome';

type S = Extract<Slide, { device: 'deviceZoom' }>;

/**
 * Page inside a device shell (CSS browser, or a supplied PNG such as an iMac),
 * scrolling slowly, then the camera pushes through the screen until the page
 * fills the frame. Reference S11 / S12.
 */
export const DeviceZoom: React.FC<SlideProps<S>> = ({ frame, dur, slide, preset }) => {
  const { width, height } = useVideoConfig();
  const zoomDur = slide.zoomDur ?? 9;
  const scrollPx = slide.scrollPx ?? 0;

  // screen rect in composition px
  let screen: { x: number; y: number; w: number; h: number };
  if (slide.shell === 'imac' && slide.screenRect) screen = slide.screenRect;
  else {
    const w = 1400;
    const h = 880;
    screen = { x: (width - w) / 2, y: (height - h) / 2 + CHROME_H / 2, w, h: h - CHROME_H };
  }
  const pageScale = screen.w / slide.srcWidth;
  const zoomTarget = width / screen.w; // scale at which the screen fills the frame
  const zoomAt = slide.zoomAt;
  const zoomE = ease(preset.ease.move);
  const scaleAt = (f: number) => lerp(1, zoomTarget, ramp(f, zoomAt, zoomAt + zoomDur, zoomE));
  const v = Math.abs(scaleAt(frame + 1) - scaleAt(frame));
  const samples = v > preset.blur.threshold ? preset.blur.samples : 1;
  const blur = v > preset.blur.threshold ? Math.min(preset.blur.maxPx, v * preset.blur.gain * 0.5) : 0;
  const scrollAt = (f: number) => lerp(0, scrollPx, ramp(f, 6, dur, ease('linear')));
  const originX = ((screen.x + screen.w / 2) / width) * 100;
  const originY = ((screen.y + screen.h / 2) / height) * 100;

  const render = (f: number) => (
    <AbsoluteFill style={{ transform: `scale(${scaleAt(f)})`, transformOrigin: `${originX}% ${originY}%` }}>
      {slide.shell === 'imac' && slide.shellSrc ? (
        <Img src={staticFile(slide.shellSrc)} style={{ position: 'absolute', left: 0, top: 0, width, height }} />
      ) : (
        <div style={{ position: 'absolute', left: screen.x, top: screen.y - CHROME_H, width: screen.w, height: screen.h + CHROME_H, borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 60px rgba(0,0,0,0.12)' }}>
          <BrowserChrome width={screen.w} dark={slide.dark} />
        </div>
      )}
      <div style={{ position: 'absolute', left: screen.x, top: screen.y, width: screen.w, height: screen.h, overflow: 'hidden' }}>
        <Img src={staticFile(slide.src)} style={{ position: 'absolute', left: 0, top: -scrollAt(f) * pageScale, width: screen.w, height: slide.srcHeight * pageScale }} />
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      <Trail frame={frame} samples={samples} shutter={preset.blur.shutter} render={render} />
    </AbsoluteFill>
  );
};
