import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import type { EditManifest } from './manifest';
import { resolveTimeline } from './timeline';
import { resolveFont } from './fonts';
import { SlideShell } from './transitions/SlideShell';
import { Flash } from './transitions/Flash';
import { Soundtrack } from './audio/Soundtrack';
import { Sfx } from './audio/Sfx';

/** Manifest-driven showreel composition. One <Sequence> per resolved slide, flashes + audio on top. */
export const Showreel: React.FC<{ manifest: EditManifest }> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => resolveTimeline(manifest), [manifest]);
  const { brand } = manifest;
  const font = (role: keyof typeof brand.fonts) => resolveFont(brand.fonts[role] ?? brand.fonts.title);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {tl.slides.map((rs, i) => (
        <Sequence key={rs.slide.id} from={rs.from} durationInFrames={rs.dur} name={rs.slide.id}>
          <SlideShell rs={rs} tl={tl} next={tl.slides[i + 1]} brand={brand} font={font} />
        </Sequence>
      ))}
      {tl.flashes.map((at, i) => {
        const s = tl.slides.find((x) => x.cut === at)?.slide;
        const color = s?.in?.kind === 'flash' ? s.in.color : undefined;
        return <Flash key={i} frame={frame} at={at} decay={tl.preset.transition.flash} color={color} />;
      })}
      <Soundtrack audio={manifest.audio} total={tl.total} />
      <Sfx tl={tl} audio={manifest.audio} />
    </AbsoluteFill>
  );
};
