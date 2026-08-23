// Static registry of Google Fonts we can load deterministically via @remotion/google-fonts.
// Manifest brand.fonts.* use the family's importName (PascalCase, e.g. 'Manrope', 'GeistMono', 'DMSans').
// Add a family: import it here and add it to FONTS. Loads all weights, latin subset.
import * as Manrope from '@remotion/google-fonts/Manrope';
import * as Inter from '@remotion/google-fonts/Inter';
import * as GeistMono from '@remotion/google-fonts/GeistMono';
import * as Geist from '@remotion/google-fonts/Geist';
import * as PlayfairDisplay from '@remotion/google-fonts/PlayfairDisplay';
import * as DMSans from '@remotion/google-fonts/DMSans';
import * as SpaceGrotesk from '@remotion/google-fonts/SpaceGrotesk';
import * as Poppins from '@remotion/google-fonts/Poppins';
import * as Montserrat from '@remotion/google-fonts/Montserrat';
import * as Syne from '@remotion/google-fonts/Syne';
import * as Sora from '@remotion/google-fonts/Sora';
import * as Outfit from '@remotion/google-fonts/Outfit';
import * as Figtree from '@remotion/google-fonts/Figtree';
import * as Fraunces from '@remotion/google-fonts/Fraunces';
import * as Lora from '@remotion/google-fonts/Lora';
import * as IBMPlexMono from '@remotion/google-fonts/IBMPlexMono';
import * as JetBrainsMono from '@remotion/google-fonts/JetBrainsMono';
import * as Roboto from '@remotion/google-fonts/Roboto';
import * as OpenSans from '@remotion/google-fonts/OpenSans';
import * as Lato from '@remotion/google-fonts/Lato';
import * as Archivo from '@remotion/google-fonts/Archivo';
import * as BricolageGrotesque from '@remotion/google-fonts/BricolageGrotesque';
import * as InstrumentSerif from '@remotion/google-fonts/InstrumentSerif';
import * as CormorantGaramond from '@remotion/google-fonts/CormorantGaramond';
import * as EBGaramond from '@remotion/google-fonts/EBGaramond';
import * as InstrumentSans from '@remotion/google-fonts/InstrumentSans';
import * as Urbanist from '@remotion/google-fonts/Urbanist';
import * as PlusJakartaSans from '@remotion/google-fonts/PlusJakartaSans';
import * as Onest from '@remotion/google-fonts/Onest';
import * as Epilogue from '@remotion/google-fonts/Epilogue';

type FontModule = { loadFont: (...args: any[]) => { fontFamily: string }; getInfo: () => { fontFamily: string } };

export const FONTS: Record<string, FontModule> = {
  Manrope,
  Inter,
  GeistMono,
  Geist,
  PlayfairDisplay,
  DMSans,
  SpaceGrotesk,
  Poppins,
  Montserrat,
  Syne,
  Sora,
  Outfit,
  Figtree,
  Fraunces,
  Lora,
  IBMPlexMono,
  JetBrainsMono,
  Roboto,
  OpenSans,
  Lato,
  Archivo,
  BricolageGrotesque,
  InstrumentSerif,
  CormorantGaramond,
  EBGaramond,
  InstrumentSans,
  Urbanist,
  PlusJakartaSans,
  Onest,
  Epilogue,
};

const cache = new Map<string, string>();

/** Returns the CSS font-family for a registered family, loading it on first use. */
export const resolveFont = (name: string): string => {
  const hit = cache.get(name);
  if (hit) return hit;
  const mod = FONTS[name];
  if (!mod) {
    // unknown family: fall back to system sans but keep rendering
    // eslint-disable-next-line no-console
    console.warn(`[showreel] font "${name}" is not in fonts.ts registry, falling back to system-ui`);
    cache.set(name, 'system-ui, sans-serif');
    return 'system-ui, sans-serif';
  }
  const { fontFamily } = mod.loadFont('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  cache.set(name, fontFamily);
  return fontFamily;
};

export const listFonts = () => Object.keys(FONTS);
