import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Slide, SlideProps } from '../manifest';
import { ease } from '../easing';
import { ramp } from '../motion';

type S = Extract<Slide, { device: 'typed' }>;

/**
 * Headline typed word-by-word (reference S4): `perWord` frames per word, the
 * newest word renders in brand.pending then takes its colour; deletes from the
 * end after `deleteAt` unless false. `effect: 'wordRise' | 'wordBlurIn'` swaps
 * the typing for a stagger entrance (no delete). Optional `chrome` renders
 * card borders / dividers behind the text.
 */
export const Typed: React.FC<SlideProps<S>> = (props) => {
  const { frame, slide, preset, brand } = props;
  const t = preset.text;
  const start = slide.start ?? 2;
  const n = slide.tokens.length;
  const effect = slide.effect ?? 'typed';
  const enterE = ease(preset.ease.enter);
  const Chrome = slide.chrome;

  return (
    <AbsoluteFill>
      {Chrome ? <Chrome {...props} /> : null}
      <div style={slide.style}>
        {slide.tokens.map((tk, i) => {
          let color = tk.color;
          let visible = true;
          let extra: React.CSSProperties = {};
          if (effect === 'typed') {
            const appear = start + i * t.perWord;
            const del = slide.deleteAt === false || slide.deleteAt === undefined ? Infinity : slide.deleteAt;
            const gone = del + (n - 1 - i) * t.perWord;
            visible = frame >= appear && frame < gone + t.perWord;
            const typing = frame < appear + 2;
            const deleting = frame >= gone;
            color = typing || deleting ? brand.pending : tk.color;
          } else {
            const s = start + i * t.wordStagger * 2;
            const p = ramp(frame, s, s + t.wordFade * 4, enterE);
            extra = {
              display: 'inline-block',
              opacity: p,
              transform: effect === 'wordRise' ? `translateY(${(1 - p) * t.rise}px)` : undefined,
              filter: effect === 'wordBlurIn' && p < 1 ? `blur(${(1 - p) * t.blurIn}px)` : undefined,
            };
          }
          return (
            <React.Fragment key={i}>
              <span style={{ color, opacity: visible ? 1 : 0, ...extra }}>{tk.text}</span>
              {tk.br ? <br /> : <span style={{ opacity: visible ? 1 : 0 }}> </span>}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
