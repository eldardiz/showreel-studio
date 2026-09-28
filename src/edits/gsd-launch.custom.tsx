import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import type { SlideProps } from '../showreel/manifest';
import { ease } from '../showreel/easing';
import { lerp, ramp } from '../showreel/motion';
import { LOGO_VIEWBOX, MARK, WORD } from './gsd-launch.logo';

// GSD launch video (LinkedIn, 4:5 and 16:9). The clips are screen recordings of the live site, captured with
// scripts/capture/screencast.py (public/edits/gsd-launch/capture*.json). The cards copy the site's own language:
// DM Sans at -0.06em with a Playfair Display Italic emphasis, Smoky Black and the Night-to-Sky blues, white 8%
// container hairlines, the dark service nodes, the Steel "↗" pill and the footer's giant drifting wordmark.
const A = 'edits/gsd-launch';
const OFF = '#F4F4F4';
const STEEL = '#3683B1';
const SKY = '#6FB4E4';
const SMOKY = '#06090D';
const HAIR = 'rgba(255,255,255,.08)';
const OUT = ease('outCubic');
const { fontFamily: SERIF } = loadPlayfair('italic', { weights: ['400'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });

/** Layout numbers per format. The site's 1312 container, scaled to the frame. */
const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { width, height, portrait, margin: portrait ? 48 : Math.round((width - 1312 * 1.2) / 2) };
};

/** The footer band: Smoky Black at the top, Oxford into Steel low down. */
const Ground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(90% 55% at 50% 112%, rgba(42,138,196,.6) 0%, rgba(21,103,166,.28) 45%, rgba(21,103,166,0) 75%),
        linear-gradient(180deg, ${SMOKY} 0%, #0a1626 34%, #0b2c4c 66%, #0e4a7b 100%)`,
    }}
  />
);

/** Container hairlines, as on every section of the site. */
const Hairlines: React.FC<{ navY?: number; p?: number }> = ({ navY, p = 1 }) => {
  const { margin } = useLayout();
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: margin, width: 1, background: HAIR }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: margin, width: 1, background: HAIR }} />
      {navY !== undefined && <div style={{ position: 'absolute', left: 0, right: 0, top: navY, height: 1, background: HAIR }} />}
    </AbsoluteFill>
  );
};

/** The logo as inline SVG. `p` (0..1) drives the build: the mark pops, then the glyphs arrive while the tracking closes. */
const Logo: React.FC<{ width: number; p?: number; markP?: number; fill?: string }> = ({ width, p = 1, markP = 1, fill = OFF }) => {
  const n = WORD.length;
  const mScale = lerp(0.55, 1, Easing.out(Easing.back(1.7))(markP));
  return (
    <svg width={width} height={(width * LOGO_VIEWBOX.h) / LOGO_VIEWBOX.w} viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`} style={{ overflow: 'visible', display: 'block' }}>
      <g style={{ opacity: Math.min(1, markP * 2), transform: `scale(${mScale})`, transformOrigin: '12px 12px' }}>
        {MARK.map((d, i) => (
          <path key={i} d={d} fill={fill} />
        ))}
      </g>
      {WORD.map((d, i) => {
        const g = ramp(p, (i / n) * 0.7, (i / n) * 0.7 + 0.3, OUT);
        const spread = (1 - ramp(p, 0, 1, OUT)) * i * 1.6; // tracking collapse, in viewBox units
        return <path key={i} d={d} fill={fill} style={{ opacity: g, transform: `translate(${spread + (1 - g) * 3}px, 0)` }} />;
      })}
    </svg>
  );
};

/** One word of a headline rising out of a clip mask, the site's heading reveal. */
const Rise: React.FC<{ t: number; children: React.ReactNode; serif?: boolean }> = ({ t, children, serif }) => (
  <span style={{ display: 'inline-block', overflow: 'clip', paddingBottom: '0.14em', marginBottom: '-0.14em', verticalAlign: 'top' }}>
    <span
      style={{
        display: 'inline-block',
        transform: `translateY(${(1 - t) * 105}%)`,
        fontFamily: serif ? SERIF : undefined,
        fontStyle: serif ? 'italic' : undefined,
        letterSpacing: serif ? '-0.02em' : undefined,
      }}
    >
      {children}
    </span>
  </span>
);

/** A headline in the site's style: DM Sans words, then the Playfair italic tail. Words rise 2 frames apart from `at`. */
const Headline: React.FC<{ frame: number; at: number; roman: string; italic: string; size: number; font: string; breakAfter?: number }> = ({
  frame,
  at,
  roman,
  italic,
  size,
  font,
  breakAfter,
}) => {
  const words = [...roman.split(' ').map((w) => ({ w, serif: false })), ...italic.split(' ').map((w) => ({ w, serif: true }))];
  return (
    <div style={{ fontFamily: font, fontWeight: 400, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.06em', color: OFF, textAlign: 'center' }}>
      {words.map(({ w, serif }, i) => (
        <React.Fragment key={i}>
          <Rise t={ramp(frame, at + i * 2, at + i * 2 + 16, ease('native'))} serif={serif}>
            {w}
          </Rise>
          {breakAfter === i ? <br /> : i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const Eyebrow: React.FC<{ t: number; font: string; size: number; children: React.ReactNode }> = ({ t, font, size, children }) => (
  <div
    style={{
      fontFamily: font,
      fontWeight: 300,
      fontSize: size,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'rgba(244,244,244,.7)',
      opacity: t,
      transform: `translateY(${(1 - t) * 10}px)`,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------------------------------------------

export const LogoIntro: React.FC<SlideProps> = ({ frame, font }) => {
  const { portrait } = useLayout();
  const markP = ramp(frame, 4, 20, (t) => t);
  const p = ramp(frame, 14, 44, (t) => t);
  return (
    <AbsoluteFill>
      <Ground />
      <Hairlines p={ramp(frame, 0, 12)} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: portrait ? 44 : 40 }}>
        <Logo width={portrait ? 640 : 720} p={p} markP={markP} />
        <Eyebrow t={ramp(frame, 40, 54, OUT)} font={font('title')} size={portrait ? 22 : 22}>
          New website
        </Eyebrow>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- "Four systems working as one." ------------------------------------------------------------------------------

const ICONS: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </>
  ),
  spark: <path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9-1.9 6.6-1.9-6.6-6.6-1.9 6.6-1.9z" fill={OFF} stroke="none" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
      <path d="M13.2 6.5l-2.4 11" />
    </>
  ),
  trend: (
    <>
      <path d="M4 16.5l5-5 3.2 3.2L20 7" />
      <path d="M15 7h5v5" />
    </>
  ),
};

/** The site's service node: dark pill, icon ring, label, a Sky dot on the right. */
const Node: React.FC<{ x: number; y: number; w: number; h: number; icon: string; label: string; t: number; font: string; lit?: number }> = ({
  x,
  y,
  w,
  h,
  icon,
  label,
  t,
  font,
  lit = 0,
}) => {
  const ring = h - 32;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: t,
        transform: `translateY(${(1 - t) * 18}px) scale(${lerp(0.96, 1, t)})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: h / 2,
          background: 'linear-gradient(160deg,#0B1B29,#062C40)',
          boxShadow: `inset 0 0 0 1px rgba(127,178,214,${0.18 + lit * 0.5}), 0 0 ${lit * 40}px rgba(54,131,177,${lit * 0.35})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 16,
          width: ring,
          height: ring,
          borderRadius: '50%',
          boxShadow: 'inset 0 0 0 1px rgba(244,244,244,.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={ring * 0.46} height={ring * 0.46} viewBox="0 0 24 24" fill="none" stroke={OFF} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          {ICONS[icon]}
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: ring + 34,
          top: 0,
          height: h,
          display: 'flex',
          alignItems: 'center',
          fontFamily: font,
          fontSize: h * 0.29,
          letterSpacing: '-0.03em',
          color: OFF,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div style={{ position: 'absolute', right: 26, top: h / 2 - 5, width: 10, height: 10, borderRadius: 5, background: SKY, boxShadow: `0 0 0 4px rgba(111,180,228,.18)` }} />
    </div>
  );
};

/** An orthogonal polyline with rounded elbows (radius r), like the connector lines on the site. */
const ortho = (pts: [number, number][], r = 22): string => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const a = Math.min(r, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
    const ux = Math.sign(x - px), uy = Math.sign(y - py), vx = Math.sign(nx - x), vy = Math.sign(ny - y);
    d += ` L ${x - ux * a} ${y - uy * a} Q ${x} ${y} ${x + vx * a} ${y + vy * a}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return d + ` L ${lx} ${ly}`;
};

const SERVICES = [
  { icon: 'search', label: 'SEO' },
  { icon: 'spark', label: 'AI Search' },
  { icon: 'link', label: 'Authority Building' },
  { icon: 'code', label: 'Development' },
];

export const SystemsCard: React.FC<SlideProps> = ({ frame, font }) => {
  const { width, height, portrait } = useLayout();
  const f = font('title');
  // node boxes + the line each one sends into "Organic Growth" (orthogonal, rounded elbows as on the site)
  const L = portrait
    ? (() => {
        const w = 560, h = 88, g = 22, x0 = (width - w) / 2, y0 = 560;
        const nodes = SERVICES.map((_, i) => ({ x: x0, y: y0 + i * (h + g), w, h }));
        const og = { w: 420, h: 96, x: (width - 420) / 2, y: y0 + 4 * h + 3 * g + 92 };
        const cy = og.y + og.h / 2, lx = x0 - 44, rx = x0 + w + 44;
        const lines = nodes.flatMap((n) => [
          ortho([[n.x, n.y + h / 2], [lx, n.y + h / 2], [lx, cy], [og.x, cy]]),
          ortho([[n.x + w, n.y + h / 2], [rx, n.y + h / 2], [rx, cy], [og.x + og.w, cy]]),
        ]);
        return { nodes, og, lines, head: { top: 214, size: 104, breakAfter: 1 as number | undefined }, rule: 500 };
      })()
    : (() => {
        const w = 372, h = 96, g = 28, x0 = (width - (4 * w + 3 * g)) / 2, y = 500;
        const nodes = SERVICES.map((_, i) => ({ x: x0 + i * (w + g), y, w, h }));
        const og = { w: 380, h: 96, x: (width - 380) / 2, y: 830 };
        const cy = og.y + og.h / 2;
        const lines = nodes.map((n, i) => {
          const cx = n.x + w / 2;
          if (i === 0) return ortho([[cx, y + h], [cx, cy], [og.x, cy]]);
          if (i === 3) return ortho([[cx, y + h], [cx, cy], [og.x + og.w, cy]]);
          const tx = width / 2 + (i === 1 ? -70 : 70);
          return ortho([[cx, y + h], [cx, og.y - 60], [tx, og.y - 60], [tx, og.y]]);
        });
        return { nodes, og, lines, head: { top: 196, size: 112, breakAfter: undefined as number | undefined }, rule: 400 };
      })();
  const lineP = ramp(frame, 30, 52, ease('inOutCubic'));
  const ogT = ramp(frame, 46, 60, OUT);
  const lit = (i: number) => ramp(frame, 52 + i * 3, 60 + i * 3, OUT) * (1 - ramp(frame, 66 + i * 3, 80 + i * 3));
  return (
    <AbsoluteFill style={{ background: SMOKY }}>
      <Hairlines navY={L.rule} p={ramp(frame, 0, 12)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: L.head.top }}>
        <Headline frame={frame} at={2} roman="Four systems" italic="working as one." size={L.head.size} font={f} breakAfter={L.head.breakAfter} />
      </div>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="gsd-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(244,244,244,.16)" />
            <stop offset="1" stopColor={STEEL} />
          </linearGradient>
        </defs>
        {L.lines.map((d, i) => (
          <path key={i} d={d} pathLength={1} fill="none" stroke={STEEL} strokeOpacity={0.9} strokeWidth={2} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - lineP} />
        ))}
      </svg>
      {L.nodes.map((n, i) => (
        <Node key={i} {...n} icon={SERVICES[i].icon} label={SERVICES[i].label} t={ramp(frame, 14 + i * 4, 30 + i * 4, OUT)} font={f} lit={lit(i)} />
      ))}
      <Node {...L.og} icon="trend" label="Organic Growth" t={ogT} font={f} lit={ramp(frame, 60, 72, OUT)} />
    </AbsoluteFill>
  );
};

// ---- service clips -------------------------------------------------------------------------------------------------

/** A chip in the lower left: step number, a Steel dot, the service name. */
const Label: React.FC<{ frame: number; num?: string; text: string; font: SlideProps['font'] }> = ({ frame, num, text, font }) => {
  const t = ramp(frame, 6, 18, OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        bottom: 48,
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
        letterSpacing: '-0.03em',
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
export const clip = (o: { dir: string; name: string; from: number; rate?: number; num?: string; label?: string }): React.FC<SlideProps> => {
  const C: React.FC<SlideProps> = ({ frame, font }) => (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(`${A}/${o.dir}/${o.name}.mp4`)}
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

// ---- end card ------------------------------------------------------------------------------------------------------

/** The Steel "↗" pill from the site's hero, carrying the URL. */
const UrlButton: React.FC<{ t: number; font: string; size: number }> = ({ t, font, size }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.5,
      height: size * 2.6,
      padding: `0 ${size * 1.2}px`,
      borderRadius: size * 1.3,
      background: STEEL,
      fontFamily: font,
      fontSize: size,
      letterSpacing: '-0.04em',
      color: OFF,
      opacity: t,
      transform: `translateY(${(1 - t) * 14}px) scale(${lerp(0.94, 1, t)})`,
      boxShadow: `0 20px 50px rgba(21,103,166,${0.35 * t})`,
    }}
  >
    getstuffdigital.co
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 10 10" fill="none" stroke={OFF} strokeWidth={1.3} strokeLinecap="round">
      <path d="M2 8L8 2M3.2 2H8v4.8" />
    </svg>
  </div>
);

export const EndCard: React.FC<SlideProps> = ({ frame, font }) => {
  const { width, height, portrait, margin } = useLayout();
  const f = font('title');
  const navH = portrait ? 96 : 88;
  const S = portrait
    ? { logo: 200, credit: 17, h1: 108, sub: 28, btn: 26, mark: 190, top: 430, gap: 32 }
    : { logo: 210, credit: 17, h1: 124, sub: 28, btn: 24, mark: 250, top: 270, gap: 30 };
  // footer wordmark: the full logo, repeated, drifting left; rises into place first
  const markW = (S.mark * LOGO_VIEWBOX.w) / LOGO_VIEWBOX.h;
  const gapW = S.mark * 1.1;
  const drift = (frame * (portrait ? 1.4 : 2)) % (markW + gapW);
  const rise = ramp(frame, 8, 40, ease('native'));
  const nav = ramp(frame, 0, 12, OUT);
  return (
    <AbsoluteFill>
      <Ground />
      <Hairlines navY={navH} p={nav} />
      {/* nav row: logo left, credit right */}
      <div style={{ position: 'absolute', left: margin + (portrait ? 0 : 0), right: margin, top: 0, height: navH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: portrait ? '0 8px' : '0 4px', opacity: nav }}>
        <Logo width={S.logo} />
        <span style={{ fontFamily: f, fontWeight: 300, fontSize: S.credit, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,244,.6)' }}>
          Designed with native.agency
        </span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: S.top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: S.gap }}>
        <Headline frame={frame} at={4} roman="New site is" italic="live." size={S.h1} font={f} />
        <div
          style={{
            fontFamily: f,
            fontSize: S.sub,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,.75)',
            opacity: ramp(frame, 18, 30, OUT),
            transform: `translateY(${(1 - ramp(frame, 18, 30, OUT)) * 12}px)`,
          }}
        >
          Your organic growth partner for the AI era.
        </div>
        <div style={{ marginTop: S.gap * 0.4 }}>
          <UrlButton t={ramp(frame, 24, 38, OUT)} font={f} size={S.btn} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: -drift,
          top: height - S.mark * 0.86 + (1 - rise) * S.mark,
          display: 'flex',
          gap: gapW,
          opacity: rise,
          WebkitMaskImage: 'linear-gradient(180deg,#000 30%,rgba(0,0,0,.35) 100%)',
          maskImage: 'linear-gradient(180deg,#000 30%,rgba(0,0,0,.35) 100%)',
        }}
      >
        {Array.from({ length: Math.ceil(width / (markW + gapW)) + 2 }).map((_, i) => (
          <Logo key={i} width={markW} fill="rgba(244,244,244,.9)" />
        ))}
      </div>
    </AbsoluteFill>
  );
};
