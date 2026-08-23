import React from 'react';
import type { MotionPreset, TextEffect } from '../manifest';
import { ease } from '../easing';
import { lerp, ramp } from '../motion';

/**
 * Text effects library. Every effect is parametrised by preset.text and the
 * preset's enter/exit easings. `exitAt` (local frame) starts the exit; omit
 * for no exit. A trailing '.' is rendered as a separate, recolourable period.
 *
 * trackIn    reference S1: word stagger + letter-spacing collapse, exit by tracking-out + fade
 * wordRise   words rise from `rise` px with stagger
 * wordBlurIn words arrive from `blurIn` px blur
 * charBlurIn characters arrive from blur with `charStagger`
 * maskWipe   whole line revealed left→right by a clip mask
 * lineRise   each line rises out of an overflow mask (multi-line)
 */
export const AnimatedText: React.FC<{
  frame: number;
  text: string;
  lines?: string[];
  effect?: TextEffect;
  preset: MotionPreset;
  style: React.CSSProperties;
  periodColor?: string;
  exitAt?: number;
  start?: number;
}> = ({ frame, text, lines, effect = 'trackIn', preset, style, periodColor, exitAt, start = 0 }) => {
  const t = preset.text;
  const enterE = ease(preset.ease.enter);
  const exitE = ease(preset.ease.exit);
  const f = frame - start;
  const exit = exitAt === undefined ? 0 : ramp(frame, exitAt, exitAt + t.trackOut, exitE);

  const body = text.endsWith('.') ? text.slice(0, -1) : text;
  const hasPeriod = text.endsWith('.');
  const words = body.split(' ');
  // trackIn shows the period early and lets it slide in with the tracking (reference S1);
  // the stagger effects bring it in after the last word
  const periodAt = effect === 'trackIn' ? t.wordStagger : (words.length - 1) * t.wordStagger * 2 + t.wordFade * 2;
  const periodSpan = hasPeriod ? (
    <span style={{ opacity: ramp(f, periodAt, periodAt + t.wordFade), color: periodColor }}>.</span>
  ) : null;

  // ---- trackIn (the reference device) ----
  if (effect === 'trackIn') {
    const trackIn = ramp(f, 0, t.trackIn, enterE);
    const letterSpacing = 0.12 * (1 - trackIn) + 0.1 * exit;
    return (
      <div
        style={{
          ...style,
          letterSpacing: `${letterSpacing}em`,
          marginRight: `${-letterSpacing}em`,
          opacity: 1 - exit,
          whiteSpace: 'nowrap',
        }}
      >
        {words.map((w, i) => {
          const s = 1 + i * t.wordStagger;
          return (
            <span key={i} style={{ opacity: ramp(f, s, s + t.wordFade) }}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
        {periodSpan}
      </div>
    );
  }

  // ---- maskWipe ----
  if (effect === 'maskWipe') {
    const p = ramp(f, 0, t.trackIn * 1.5, enterE);
    return (
      <div
        style={{
          ...style,
          whiteSpace: 'nowrap',
          clipPath: `inset(-0.2em ${(1 - p) * 100}% -0.2em 0)`,
          opacity: 1 - exit,
          filter: exit > 0 ? `blur(${exit * t.blurIn * 0.5}px)` : undefined,
        }}
      >
        {body}
        {hasPeriod ? <span style={{ color: periodColor }}>.</span> : null}
      </div>
    );
  }

  // ---- lineRise ----
  if (effect === 'lineRise') {
    const ls = lines ?? text.split('\n');
    return (
      <div style={{ ...style, opacity: 1 - exit }}>
        {ls.map((line, i) => {
          const s = i * (t.wordStagger * 3);
          const p = ramp(f, s, s + t.trackIn, enterE);
          return (
            <div key={i} style={{ overflow: 'hidden', lineHeight: style.lineHeight ?? 1.1 }}>
              <div style={{ transform: `translateY(${lerp(105, 0, p)}%)`, opacity: p }}>{line}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---- charBlurIn ----
  if (effect === 'charBlurIn') {
    const chars = Array.from(body);
    return (
      <div style={{ ...style, whiteSpace: 'pre', opacity: 1 - exit }}>
        {chars.map((c, i) => {
          const s = i * t.charStagger;
          const p = ramp(f, s, s + t.wordFade * 3, enterE);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: p,
                filter: p < 1 ? `blur(${(1 - p) * t.blurIn}px)` : undefined,
                transform: `translateY(${(1 - p) * t.rise * 0.3}px)`,
              }}
            >
              {c}
            </span>
          );
        })}
        {hasPeriod ? (
          <span style={{ color: periodColor, opacity: ramp(f, chars.length * t.charStagger, chars.length * t.charStagger + t.wordFade * 3) }}>
            .
          </span>
        ) : null}
      </div>
    );
  }

  // ---- wordRise / wordBlurIn ----
  const blur = effect === 'wordBlurIn';
  return (
    <div style={{ ...style, whiteSpace: 'nowrap', opacity: 1 - exit }}>
      {words.map((w, i) => {
        const s = i * t.wordStagger * 2;
        const p = ramp(f, s, s + t.wordFade * 4, enterE);
        return (
          <React.Fragment key={i}>
          <span
           
            style={{
              display: 'inline-block',
              opacity: p,
              transform: blur ? undefined : `translateY(${(1 - p) * t.rise}px)`,
              filter: blur && p < 1 ? `blur(${(1 - p) * t.blurIn}px)` : undefined,
            }}
          >
            {w}
          </span>
            {i < words.length - 1 ? <span style={{ display: 'inline' }}> </span> : null}
          </React.Fragment>
        );
      })}
      {periodSpan}
    </div>
  );
};
