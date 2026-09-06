import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { SlideProps } from '../showreel/manifest';

// Platform diagram section with light pulses flowing outward from the hub
// along all ten connectors (matches the design's arrow direction).
// Base: page.png y 7128..9288 at 0.75. Anchors measured 2026-09-06.
// Loop-perfect over 144 frames.

const S = 0.75;
const A = 'edits/sitesherpa/ai';

const pt = (x: number, y: number): [number, number] => [x * S, y * S];

// rounded polyline sampled by arc length, so pulses ride the drawn connectors exactly
type P = [number, number];
const buildPath = (raw: P[], cornerR = 40 * S): { pts: P[]; len: number[] } => {
  const pts: P[] = [raw[0]];
  for (let i = 1; i < raw.length - 1; i++) {
    const a = raw[i - 1], b = raw[i], c = raw[i + 1];
    const inV: P = [b[0] - a[0], b[1] - a[1]];
    const outV: P = [c[0] - b[0], c[1] - b[1]];
    const inL = Math.hypot(...inV), outL = Math.hypot(...outV);
    const r = Math.min(cornerR, inL / 2, outL / 2);
    const p1: P = [b[0] - (inV[0] / inL) * r, b[1] - (inV[1] / inL) * r];
    const p2: P = [b[0] + (outV[0] / outL) * r, b[1] + (outV[1] / outL) * r];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      pts.push([u * u * p1[0] + 2 * u * t * b[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * b[1] + t * t * p2[1]]);
    }
  }
  pts.push(raw[raw.length - 1]);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len };
};
const posAt = (path: { pts: P[]; len: number[] }, t: number): P => {
  const target = Math.max(0, Math.min(1, t)) * path.len[path.len.length - 1];
  let i = 1;
  while (i < path.len.length - 1 && path.len[i] < target) i++;
  const seg = path.len[i] - path.len[i - 1] || 1;
  const u = (target - path.len[i - 1]) / seg;
  const a = path.pts[i - 1], b = path.pts[i];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
};

const HUB_L = pt(1300, 1330);
const HUB_R = pt(1592, 1330);
// measured from the artwork: shared vertical bundles at x 1224 (left) and 1680 / 1800 (right)
const PATHS = [
  buildPath([HUB_L, pt(1224, 1330), pt(1224, 926), pt(1156, 926)]),
  buildPath([HUB_L, pt(1224, 1330), pt(1224, 1122), pt(856, 1122)]),
  buildPath([pt(1300, 1358), pt(696, 1358)]),
  buildPath([HUB_L, pt(1224, 1330), pt(1224, 1596), pt(859, 1596)]),
  buildPath([HUB_L, pt(1224, 1330), pt(1224, 1790), pt(1156, 1790)]),
  buildPath([HUB_R, pt(1680, 1330), pt(1680, 935), pt(1747, 935)]),
  buildPath([HUB_R, pt(1800, 1330), pt(1800, 1122), pt(1972, 1122)]),
  buildPath([HUB_R, pt(2154, 1330)]),
  buildPath([HUB_R, pt(1800, 1330), pt(1800, 1533), pt(1977, 1533)]),
  buildPath([HUB_R, pt(1680, 1330), pt(1680, 1718), pt(1750, 1718)]),
];

const pathD = (path: { pts: P[] }) =>
  path.pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const PATH_DS = PATHS.map(pathD);
const PATH_LENS = PATHS.map((p) => p.len[p.len.length - 1]);

export const PlatformFlow: React.FC<SlideProps> = ({ frame, dur }) => {
  const f = ((frame % dur) + dur) % dur;
  return (
    <AbsoluteFill style={{ backgroundColor: '#004144' }}>
      <Img src={staticFile(`${A}/platform-base.png`)} style={{ position: 'absolute', left: 0, top: 0, width: 2160, height: 1620 }} />
      {/* glow-flow: a soft white segment of the line itself travels through each vein */}
      <svg width={2160} height={1620} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <filter id="glowWide" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="glowMid" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        {PATHS.map((_, i) => {
          const L = PATH_LENS[i];
          const dash = Math.max(90, L * 0.32);
          const cycle = dash + L;
          const t = ((f + i * 14) % 72) / 72;
          const offset = dash - cycle * t; // dash slides start → end, seamless per 72 f
          const common = {
            d: PATH_DS[i],
            fill: 'none' as const,
            strokeLinecap: 'round' as const,
            strokeDasharray: `${dash} ${L + dash}`,
            strokeDashoffset: offset,
          };
          return (
            <g key={i}>
              <path {...common} stroke="#eafffb" strokeWidth={11} opacity={0.28} filter="url(#glowWide)" />
              <path {...common} stroke="#f2fffc" strokeWidth={5} opacity={0.75} filter="url(#glowMid)" />
              <path {...common} stroke="#ffffff" strokeWidth={2.4} opacity={0.95} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
