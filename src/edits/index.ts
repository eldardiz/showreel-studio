import type { EditManifest } from '../showreel/manifest';
import { nativeAgency } from './native-agency';

/** Registry of client edits. Add a manifest here and Root.tsx registers `Showreel-<id>`. */
export const EDITS: Record<string, EditManifest> = {
  [nativeAgency.id]: nativeAgency,
};
