import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { SlideProps } from '../showreel/manifest';
import { EASINGS } from '../showreel/easing';

// "AI that listens" section brought to life. Base = flat crop of the section
// (source window: page.png y 12280..14440, x full, rendered at 0.75).
// Three live layers, all loop-perfect over 144 frames (4.8 s @ 30 fps):
//   card 1: horizontal marquee of the phone carousel (period 144)
//   card 2: light pulses along the lines (72), icon tile breathing (48), spinning loader arc (48)
//   card 3: bottom-to-top alert ticker (period 144) with fade masks
// Geometry: comp px = (source band px - 80) * 0.75; measured 2026-09-06.

const S = 0.75;
const A = 'edits/sitesherpa/ai';
const CARD_BG = '#004f50';
const LIME = '#d4f24b';

const cx = (band: number) => band * S;
const cy = (band: number) => (band - 80) * S;

// quadratic bezier point
const qb = (p0: [number, number], p1: [number, number], p2: [number, number], t: number): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

const TILE = { x: cx(1315), y: cy(1085), w: 246 * S, h: 246 * S };
const TILE_C: [number, number] = [cx(1438), cy(1208)];

const PULSE_PATHS: { p0: [number, number]; p1: [number, number]; p2: [number, number] }[] = [
  { p0: [cx(1030), cy(1120)], p1: [cx(1250), cy(1150)], p2: [cx(1330), cy(1195)] },
  { p0: [cx(1030), cy(1290)], p1: [cx(1250), cy(1265)], p2: [cx(1330), cy(1225)] },
  { p0: [cx(1850), cy(1120)], p1: [cx(1630), cy(1150)], p2: [cx(1548), cy(1195)] },
  { p0: [cx(1850), cy(1290)], p1: [cx(1630), cy(1265)], p2: [cx(1548), cy(1225)] },
];

const Dot: React.FC<{ x: number; y: number; o: number; r: number; color: string }> = ({ x, y, o, r, color }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: o,
    }}
  />
);

const PITCH1 = 229; // slider slot distance (comp px); rest slots at x 73 / 302 (hidden) / 531
const PHONE_W = 126;
const PITCH3 = 104; // ticker row pitch
const ROW_H = 88;
const FOCUS_Y = 158; // where a row is fully active (matches the design's highlighted slot)
const ROWS = [
  { text: 'PPE non-compliance flagged near loading zone.', caption: 'Issue logged automatically.' },
  { text: 'Guardrail missing on Level 2 scaffold.', caption: 'Detected moments ago.' },
  { text: 'Machinery operating outside defined safe zone.', caption: 'Live monitoring alert.' },
  { text: 'Hazard conditions changed due to weather.', caption: 'Issue logged automatically.' },
];

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  const pb = b.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

export const AiSection: React.FC<SlideProps> = ({ frame, dur, font }) => {
  const fontBody = font('body');
  const f = ((frame % dur) + dur) % dur;

  // ---- card 1: stepped slider (dwell 24, glide 12, one slot per 36 f; 4 slots = seamless loop) ----
  const stepK = Math.floor(f / 36);
  const stepU = f - stepK * 36;
  const glide = stepU < 24 ? 0 : EASINGS.native((stepU - 24) / 12);
  const off1 = (stepK + glide) * PITCH1;

  // ---- card 2 ----
  const breathe = 1 + 0.03 * Math.sin((2 * Math.PI * f) / 48);
  const spin = (360 * (f % 48)) / 48;

  // ---- card 3: constant-speed ticker, one full 4-row cycle per loop ----
  const off3 = (f / dur) * PITCH3 * ROWS.length;

  const mask = (x0: number, y0: number, x1: number, y1: number): React.CSSProperties => ({
    position: 'absolute',
    left: cx(x0),
    top: cy(y0),
    width: cx(x1) - cx(x0),
    height: cy(y1) - cy(y0),
    overflow: 'hidden',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#004144' }}>
      <Img src={staticFile(`${A}/base.png`)} style={{ position: 'absolute', left: 0, top: 0, width: 2160, height: 1620 }} />

      {/* card 1: stepped slider; the deck glides one slot at a time behind the fixed active card */}
      <div style={{ ...mask(154, 960, 976, 1520), backgroundColor: CARD_BG }}>
        {[-2, -1, 0, 1, 2, 3, 4, 5].map((j) => {
          const x = 531 + j * PITCH1 - off1;
          if (x < -PHONE_W || x > 616.5 + PHONE_W) return null;
          const flipped = ((j % 2) + 2) % 2 === 1;
          return (
            <Img
              key={j}
              src={staticFile(`${A}/phone-side.png`)}
              style={{
                position: 'absolute',
                left: x - PHONE_W / 2,
                top: 41,
                width: PHONE_W,
                height: 307.5,
                transform: flipped ? 'scaleX(-1)' : undefined,
              }}
            />
          );
        })}
        <Img
          src={staticFile(`${A}/phone-active.png`)}
          style={{ position: 'absolute', left: 180, top: 6, width: 253.5, height: 380.25 }}
        />
      </div>

      {/* card 2: light pulses along the lines */}
      {PULSE_PATHS.map((p, i) => {
        const t = ((f + i * 18) % 72) / 72;
        const [x, y] = qb(p.p0, p.p1, p.p2, t);
        const fade = Math.sin(Math.PI * t); // ease in/out of existence at both ends
        const trail = Math.max(0, t - 0.08);
        const [tx, ty] = qb(p.p0, p.p1, p.p2, trail);
        return (
          <React.Fragment key={i}>
            <Dot x={tx} y={ty} o={0.25 * fade} r={10} color="#d9a677" />
            <Dot x={x} y={y} o={0.75 * fade} r={7} color="#e8bd8f" />
            <Dot x={x} y={y} o={0.9 * fade} r={3} color="#ffe9cf" />
          </React.Fragment>
        );
      })}

      {/* card 2: icon tile breathing (sprite covers the baked tile) */}
      <Img
        src={staticFile(`${A}/icon.png`)}
        style={{
          position: 'absolute',
          left: TILE.x,
          top: TILE.y,
          width: TILE.w,
          height: TILE.h,
          transform: `scale(${breathe})`,
          transformOrigin: '50% 50%',
        }}
      />

      {/* card 2: spinning loader arc over the baked ring */}
      <svg
        width={26}
        height={26}
        viewBox="0 0 26 26"
        style={{ position: 'absolute', left: cx(1308) - 13, top: cy(1342) - 13, transform: `rotate(${spin}deg)` }}
      >
        <circle cx={13} cy={13} r={8} fill="none" stroke={CARD_BG} strokeWidth={3.4} />
        <circle
          cx={13}
          cy={13}
          r={8}
          fill="none"
          stroke={LIME}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 8 * 0.28} ${2 * Math.PI * 8}`}
        />
      </svg>

      {/* card 3: smooth ticker of rebuilt alert rows; the row passing the focus line lights up */}
      <div style={{ ...mask(1956, 960, 2670, 1560), background: 'linear-gradient(#014948, #00403f)' }}>
        {Array.from({ length: 10 }, (_, k) => k - 2).map((k) => {
          const top = k * PITCH3 - off3 + 24;
          if (top < -ROW_H || top > 450 + ROW_H) return null;
          const row = ROWS[((k % ROWS.length) + ROWS.length) % ROWS.length];
          const d = Math.abs(top + ROW_H / 2 - FOCUS_Y);
          const t = Math.max(0, 1 - d / 90);
          const w = t * t * (3 - 2 * t); // smoothstep
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 0,
                top,
                width: '100%',
                height: ROW_H,
                borderRadius: 10,
                backgroundColor: `rgba(0, 45, 42, ${0.12 + 0.78 * w})`,
                padding: '16px 20px 0 33px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontFamily: fontBody,
                  fontSize: 21,
                  lineHeight: 1.2,
                  color: mix('#5a9191', '#f2f6f5', w),
                  whiteSpace: 'nowrap',
                }}
              >
                {row.text}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, opacity: 0.5 + 0.5 * w }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mix('#7da3a2', '#ebb164', w) }} />
                <div style={{ fontFamily: fontBody, fontSize: 14, color: mix('#47807f', '#a9c4c2', w) }}>{row.caption}</div>
              </div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 48, background: 'linear-gradient(#014948, transparent)' }} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 48, background: 'linear-gradient(transparent, #00403f)' }} />
      </div>
    </AbsoluteFill>
  );
};
