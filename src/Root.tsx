import React from 'react';
import { Composition } from 'remotion';
import { EDITS } from './edits';
import { Showreel } from './showreel/Showreel';
import { resolveTimeline } from './showreel/timeline';
import { NativeBrandReveal } from './legacy/NativeBrandReveal/NativeBrandReveal';
import { TOTAL_FRAMES as LEGACY_FRAMES } from './legacy/NativeBrandReveal/tokens';

// Remotion JSON round-trips defaultProps, which would drop functions in a manifest
// (chrome / custom components). Closing over the in-bundle manifest avoids that.
const EDIT_COMPONENTS: Record<string, React.FC> = Object.fromEntries(
  Object.values(EDITS).map((m) => [m.id, () => <Showreel manifest={m} />]),
);

export const Root: React.FC = () => {
  return (
    <>
      {Object.values(EDITS).map((m) => (
        <Composition
          key={m.id}
          id={`Showreel-${m.id}`}
          component={EDIT_COMPONENTS[m.id]}
          durationInFrames={resolveTimeline(m).total}
          fps={m.fps}
          width={m.width}
          height={m.height}
        />
      ))}
      <Composition id="NativeBrandRevealLegacy" component={NativeBrandReveal} durationInFrames={LEGACY_FRAMES} fps={30} width={1920} height={1080} />
    </>
  );
};
