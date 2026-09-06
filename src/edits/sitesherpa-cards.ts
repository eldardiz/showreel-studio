import type { Brand, EditManifest } from '../showreel/manifest';
import { AiSection } from './sitesherpa-ai.custom';
import { PlatformFlow } from './sitesherpa-platform.custom';

// Two step-scroll clips that live INSIDE Eldar's Jitter showcase cards (1080x810 card, rendered 2x).
// 114 frames = 3.8 s each: hold 27, glide 20, rest 20, glide 20, rest 27. Ends on a still.
// Source: the Sep 1 SiteSherpa page (2880x18578). Viewport shows 2160 source px per screen.
const A = 'edits/sitesherpa';

const brand: Brand = {
  bg: '#ffffff',
  bgDark: '#004144',
  ink: '#0c2a2b',
  inkOnDark: '#ffffff',
  dim: '#5f7a7a',
  pending: '#c9c8c3',
  accent: '#d4f24b',
  border: '#e4e8e6',
  fonts: { title: 'Manrope', body: 'Inter' },
};

const card = (id: string, steps: number[], hold = 114): EditManifest => ({
  id,
  client: 'SiteSherpa (Zotyra)',
  fps: 30,
  width: 2160,
  height: 1620,
  brand,
  // blur scaled up for the 2x resolution; higher gain keeps the smear rich at glide speeds
  preset: { extends: 'editorial', blur: { maxPx: 28, gain: 95 } },
  slides: [
    {
      id: 'scroll',
      device: 'pageScroll',
      hold,
      src: `${A}/page.png`,
      srcWidth: 2880,
      srcHeight: 18578,
      frame: 'none',
      steps,
      stepDur: { move: 20, settle: 20 },
      curve: 'glide',
      startAt: 27,
      dark: true,
      bg: '#004144',
      camera: false,
    },
  ],
});

// hero → industries grid → banner + compliance cards
export const siteSherpaCardLight = card('sitesherpa-card-light', [0, 2136, 4650]);

// "AI that listens" section held centered, three live layers, seamless 4.8 s loop
export const siteSherpaCardAi: EditManifest = {
  id: 'sitesherpa-card-ai',
  client: 'SiteSherpa (Zotyra)',
  fps: 30,
  width: 2160,
  height: 1620,
  brand,
  preset: 'editorial',
  slides: [
    { id: 'ai', device: 'custom', component: AiSection, hold: 144, dark: true, bg: '#004144', camera: false },
  ],
};
// platform diagram → productivity + stats → AI listens cards
export const siteSherpaCardDark = card('sitesherpa-card-dark', [7128, 9350, 12220]);

// platform diagram with pulses flowing through the connectors, seamless 4.8 s loop
export const siteSherpaCardPlatform: EditManifest = {
  id: 'sitesherpa-card-platform',
  client: 'SiteSherpa (Zotyra)',
  fps: 30,
  width: 2160,
  height: 1620,
  brand,
  preset: 'editorial',
  slides: [
    { id: 'platform', device: 'custom', component: PlatformFlow, hold: 144, dark: true, bg: '#004144', camera: false },
  ],
};

// every section, top to bottom: 8 stations, same glide + crisp gate, ~10.5 s
export const siteSherpaCardFull = card(
  'sitesherpa-card-full',
  [0, 2136, 4400, 7128, 9372, 12240, 14700, 16418],
  314,
);
