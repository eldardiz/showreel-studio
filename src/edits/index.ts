import type { EditManifest } from '../showreel/manifest';
import { nativeAgency } from './native-agency';
import { demoTall } from './demo-tall';
import { siteSherpa } from './sitesherpa';
import { siteSherpaCardAi, siteSherpaCardDark, siteSherpaCardFull, siteSherpaCardLight, siteSherpaCardPlatform } from './sitesherpa-cards';

/** Registry of client edits. Add a manifest here and Root.tsx registers `Showreel-<id>`. */
export const EDITS: Record<string, EditManifest> = {
  [nativeAgency.id]: nativeAgency,
  [demoTall.id]: demoTall,
  [siteSherpa.id]: siteSherpa,
  [siteSherpaCardLight.id]: siteSherpaCardLight,
  [siteSherpaCardDark.id]: siteSherpaCardDark,
  [siteSherpaCardAi.id]: siteSherpaCardAi,
  [siteSherpaCardFull.id]: siteSherpaCardFull,
  [siteSherpaCardPlatform.id]: siteSherpaCardPlatform,
};
