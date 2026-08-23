import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';

type S = Extract<Slide, { device: 'hoverButton' }>;

/**
 * Isolated CTA button with a hover micro-interaction (fill swap, icon slides
 * to the other edge) over a blooming halftone burst. Reference S8.
 */
export const HoverButton: React.FC<SlideProps<S>> = ({ frame, slide, font, brand }) => {
  const w = slide.width ?? 750;
  const h = slide.height ?? 170;
  const inset = Math.round(h * 0.115);
  const icon = h - inset * 2;
  const hoverAt = slide.hoverAt ?? 12;
  const hv = ramp(frame, hoverAt, hoverAt + 9, ease('inOutCubic'));
  const grow = lerp(1, 1.05, ramp(frame, 0, 12, ease('outCubic')));
  const burstP = ramp(frame, hoverAt - 9, hoverAt + 21);
  const burstO = Math.sin(burstP * Math.PI) * 0.35;
  const mix = (a: string, b: string, t: number) => {
    const pa = a.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    const pb = b.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
  };
  const fill = mix(slide.fill, slide.hover, hv);
  const iconFill = mix(slide.iconFill, '#ffffff', hv);
  const textColor = mix(slide.textColor ?? '#ffffff', slide.hoverTextColor ?? '#ffffff', hv);
  const arrowColor = mix('#0a0a0c', '#0a0a0c', hv);
  const iconX = lerp(inset, w - inset - icon, hv);
  const labelShift = lerp(0, -(icon + inset) / 2, hv);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {slide.burst !== false ? (
        <div
          style={{
            position: 'absolute',
            width: w * 2.4,
            height: w * 2.4,
            borderRadius: '50%',
            opacity: burstO,
            transform: `scale(${lerp(0.6, 1.4, burstP)})`,
            backgroundImage: `radial-gradient(${brand.ink} 1.6px, transparent 1.8px)`,
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(circle, black 0%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 60%)',
          }}
        />
      ) : null}
      <div style={{ position: 'relative', width: w, height: h, backgroundColor: fill, transform: `scale(${grow})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: iconX, top: inset, width: icon, height: icon, backgroundColor: iconFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={icon * 0.46} height={icon * 0.46} viewBox="0 0 24 24" fill="none" stroke={arrowColor} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
        <div style={{ fontFamily: font('body'), fontWeight: 500, fontSize: h * 0.33, color: textColor, transform: `translateX(${labelShift + icon / 2}px)`, whiteSpace: 'nowrap' }}>
          {slide.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
