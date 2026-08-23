import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { AudioConfig } from '../manifest';
import type { ResolvedTimeline } from '../timeline';

type Cue = { at: number; src: string; gain: number };

/** Resolves explicit per-slide cues and automatic transition cues into <Audio> sequences. */
export const collectCues = (tl: ResolvedTimeline, audio?: AudioConfig): Cue[] => {
  const lib = audio?.sfx?.library;
  if (!lib) return [];
  const auto = audio?.sfx?.auto ?? {};
  const cues: Cue[] = [];
  const push = (at: number, key: string | undefined, gain = 1) => {
    if (!key || !lib[key]) return;
    cues.push({ at: Math.max(0, Math.round(at)), src: lib[key], gain });
  };
  for (const rs of tl.slides) {
    const { slide } = rs;
    for (const c of slide.sfx ?? []) {
      const at = c.at === 'in' ? rs.cut : c.at === 'out' ? rs.from + rs.dur - tl.preset.transition.whip : rs.from + c.at;
      push(at, c.name, c.gain ?? 1);
    }
    if (slide.in?.kind === 'flash') push(rs.cut - 1, auto.flash);
    else if (slide.in?.kind === 'zoomEnter') push(rs.cut, auto.zoomEnter);
    else if (slide.in?.kind === 'blurReveal') push(rs.cut, auto.blurReveal);
    else if (!slide.in || slide.in.kind === 'cut') push(rs.cut, auto.cut);
    if (slide.out?.kind === 'whip') push(rs.from + rs.dur - (slide.out.dur ?? tl.preset.transition.whip), auto.whip);
  }
  return cues;
};

export const Sfx: React.FC<{ tl: ResolvedTimeline; audio?: AudioConfig }> = ({ tl, audio }) => {
  const cues = collectCues(tl, audio);
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={c.at}>
          <Audio src={staticFile(c.src)} volume={c.gain} />
        </Sequence>
      ))}
    </>
  );
};
