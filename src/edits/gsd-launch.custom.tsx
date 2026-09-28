import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, staticFile } from 'remotion';
import type { SlideProps } from '../showreel/manifest';
import { ease } from '../showreel/easing';
import { lerp, ramp } from '../showreel/motion';
import { LOGO_VIEWBOX, MARK, WORD } from './gsd-launch.logo';

// GSD launch video (LinkedIn, 4:5). The clips are screen recordings of the live site at 1080 x 1350, dpr 2,
// captured with scripts/capture/screencast.py (see public/edits/gsd-launch/capture.json).
const A = 'edits/gsd-launch';
const OFF = '#F4F4F4';
const STEEL = '#3683B1';
const SKY = '#6FB4E4';

/** The dark half of the site's Night-to-Sky gradient, stretched over the frame, with a Steel haze low down. */
const Ground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 60% at 50% 108%, rgba(42,138,196,.55) 0%, rgba(21,103,166,.25) 40%, rgba(21,103,166,0) 70%),
        linear-gradient(180deg, #06090d 0%, #0a1626 30%, #0b2c4c 62%, #0e4a7b 100%)`,
    }}
  />
);

/** The logo as inline SVG. `p` (0..1) drives the build: the mark pops, then the glyphs arrive while the tracking closes. */
const Logo: React.FC<{ width: number; p: number; markP: number }> = ({ width, p, markP }) => {
  const n = WORD.length;
  const mScale = lerp(0.55, 1, Easing.out(Easing.back(1.7))(markP));
  return (
    <svg width={width} height={(width * LOGO_VIEWBOX.h) / LOGO_VIEWBOX.w} viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`} style={{ overflow: 'visible' }}>
      <g style={{ opacity: Math.min(1, markP * 2), transform: `scale(${mScale})`, transformOrigin: '12px 12px' }}>
        {MARK.map((d, i) => (
          <path key={i} d={d} fill={OFF} />
        ))}
      </g>
      {WORD.map((d, i) => {
        // glyph i arrives over 10% of the run, staggered left to right
        const g = ramp(p, (i / n) * 0.7, (i / n) * 0.7 + 0.3, ease('outCubic'));
        const spread = (1 - ramp(p, 0, 1, ease('outCubic'))) * i * 1.6; // tracking collapse, in viewBox units
        return (
          <path key={i} d={d} fill={OFF} style={{ opacity: g, transform: `translate(${spread + (1 - g) * 3}px, 0)` }} />
        );
      })}
    </svg>
  );
};

export const LogoIntro: React.FC<SlideProps> = ({ frame, font }) => {
  const markP = ramp(frame, 4, 20, (t) => t);
  const p = ramp(frame, 14, 44, (t) => t);
  const tag = ramp(frame, 40, 54, ease('outCubic'));
  return (
    <AbsoluteFill>
      <Ground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44 }}>
        <Logo width={640} p={p} markP={markP} />
        <div
          style={{
            fontFamily: font('title'),
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'rgba(244,244,244,.62)',
            opacity: tag,
            transform: `translateY(${(1 - tag) * 14}px)`,
          }}
        >
          New website
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A chip in the lower left: step number, a Steel dot, the service name. */
const Label: React.FC<{ frame: number; num?: string; text: string; font: SlideProps['font'] }> = ({ frame, num, text, font }) => {
  const t = ramp(frame, 6, 18, ease('outCubic'));
  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        bottom: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 64,
        padding: '0 28px 0 24px',
        borderRadius: 32,
        background: 'rgba(6,9,13,.82)',
        boxShadow: `inset 0 0 0 1px rgba(111,180,228,.35), 0 18px 40px rgba(6,9,13,.25)`,
        backdropFilter: 'blur(12px)',
        fontFamily: font('title'),
        fontSize: 26,
        letterSpacing: -0.6,
        color: OFF,
        opacity: t,
        transform: `translateY(${(1 - t) * 20}px)`,
      }}
    >
      {num && <span style={{ fontFamily: font('mono'), fontSize: 18, color: SKY, letterSpacing: 0 }}>{num}</span>}
      <span style={{ width: 10, height: 10, borderRadius: 5, background: STEEL, boxShadow: `0 0 0 4px rgba(54,131,177,.25)` }} />
      <span>{text}</span>
    </div>
  );
};

/** A recorded clip, full bleed. `from` is the source second to start on, `rate` the playback speed. */
export const clip = (o: { name: string; from: number; rate?: number; num?: string; label?: string }): React.FC<SlideProps> => {
  const C: React.FC<SlideProps> = ({ frame, font }) => (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(`${A}/clips/${o.name}.mp4`)}
        startFrom={Math.round(o.from * 30)}
        playbackRate={o.rate ?? 1}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {o.label && <Label frame={frame} num={o.num} text={o.label} font={font} />}
    </AbsoluteFill>
  );
  C.displayName = `Clip(${o.name})`;
  return C;
};

export const EndCard: React.FC<SlideProps> = ({ frame, font }) => {
  const logo = ramp(frame, 0, 16, ease('outCubic'));
  const words = ['New', 'site', 'is', 'live'];
  const url = ramp(frame, 26, 40, ease('outCubic'));
  const credit = ramp(frame, 36, 50, ease('outCubic'));
  return (
    <AbsoluteFill>
      <Ground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ opacity: logo, transform: `translateY(${(1 - logo) * 16}px)` }}>
          <Logo width={380} p={1} markP={1} />
        </div>
        <div style={{ marginTop: 88, fontFamily: font('title'), fontSize: 104, lineHeight: 1.05, letterSpacing: -5.2, color: OFF, whiteSpace: 'nowrap' }}>
          {words.map((w, i) => {
            const t = ramp(frame, 8 + i * 3, 22 + i * 3, ease('outCubic'));
            return (
              <span key={w} style={{ display: 'inline-block', marginRight: i < words.length - 1 ? 26 : 0, opacity: t, transform: `translateY(${(1 - t) * 28}px)`, filter: `blur(${(1 - t) * 10}px)` }}>
                {w}
                {i === words.length - 1 && <span style={{ color: STEEL }}>.</span>}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 40, fontFamily: font('title'), fontSize: 36, letterSpacing: -0.8, color: 'rgba(244,244,244,.82)', opacity: url, transform: `translateY(${(1 - url) * 14}px)` }}>
          getstuffdigital.co
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 72,
          textAlign: 'center',
          fontFamily: font('title'),
          fontSize: 20,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(244,244,244,.5)',
          opacity: credit,
        }}
      >
        Designed with native.agency
      </div>
    </AbsoluteFill>
  );
};
