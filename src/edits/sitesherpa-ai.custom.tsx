import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { SlideProps } from '../showreel/manifest';

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

export const AiSection: React.FC<SlideProps> = ({ frame, dur }) => {
  const f = ((frame % dur) + dur) % dur;

  // ---- card 1: marquee ----
  const stripW = 822 * S;
  const gap = 36;
  const loopW = stripW + gap;
  const off1 = (f / dur) * loopW;

  // ---- card 2 ----
  const breathe = 1 + 0.03 * Math.sin((2 * Math.PI * f) / 48);
  const spin = (360 * (f % 48)) / 48;

  // ---- card 3: ticker ----
  const rowsH = 600 * S;
  const gap3 = 30;
  const loopH = rowsH + gap3;
  const off3 = (f / dur) * loopH;

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

      {/* card 1: auto-looping carousel */}
      <div style={{ ...mask(154, 960, 976, 1520), backgroundColor: CARD_BG }}>
        {[0, 1, 2].map((k) => (
          <Img
            key={k}
            src={staticFile(`${A}/strip1.png`)}
            style={{ position: 'absolute', left: k * loopW - off1, top: 0, width: stripW, height: 560 * S }}
          />
        ))}
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

      {/* card 3: infinite bottom-to-top ticker */}
      <div style={{ ...mask(1956, 960, 2670, 1560), backgroundColor: CARD_BG }}>
        {[0, 1, 2].map((k) => (
          <Img
            key={k}
            src={staticFile(`${A}/rows.png`)}
            style={{ position: 'absolute', left: 0, top: k * loopH - off3, width: 714 * S, height: rowsH }}
          />
        ))}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 54, background: `linear-gradient(${CARD_BG}, transparent)` }} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 54, background: `linear-gradient(transparent, ${CARD_BG})` }} />
      </div>
    </AbsoluteFill>
  );
};
