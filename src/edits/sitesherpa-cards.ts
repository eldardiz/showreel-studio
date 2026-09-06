import type { Brand, EditManifest } from '../showreel/manifest';

// Two step-scroll clips that live INSIDE Eldar's Jitter showcase cards (1080x810 card, rendered 2x).
// 84 frames = 2.8 s each: hold 18, move 11, settle 22, move 11, settle 22. Ends on a still.
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

const card = (id: string, steps: number[]): EditManifest => ({
  id,
  client: 'SiteSherpa (Zotyra)',
  fps: 30,
  width: 2160,
  height: 1620,
  brand,
  // blur scaled up for the 2x resolution
  preset: { extends: 'editorial', blur: { maxPx: 28, gain: 60 } },
  slides: [
    {
      id: 'scroll',
      device: 'pageScroll',
      hold: 84,
      src: `${A}/page.png`,
      srcWidth: 2880,
      srcHeight: 18578,
      frame: 'none',
      steps,
      stepDur: { move: 11, settle: 22 },
      startAt: 18,
      dark: true,
      bg: '#004144',
      camera: false,
    },
  ],
});

// hero → industries grid → banner + compliance cards
export const siteSherpaCardLight = card('sitesherpa-card-light', [0, 2136, 4650]);
// platform diagram → productivity + stats → AI listens cards
export const siteSherpaCardDark = card('sitesherpa-card-dark', [7128, 9350, 12220]);
