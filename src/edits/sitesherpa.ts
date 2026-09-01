import type { EditManifest } from '../showreel/manifest';

// SiteSherpa (Zotyra x Eldar design) site scroll-through, in the Datawizz reference genre:
// one continuous full-bleed page scroll, hero hold, eased steps with motion blur per section,
// fade to black at the end. Source: SS - Tech.pdf rasterized at 2x (2880x18578).
// Reference analysis: video01.mp4 (38 s, 14 scroll steps, holds 1-2.8 s, no cuts, no audio).
const A = 'edits/sitesherpa';

export const siteSherpa: EditManifest = {
  id: 'sitesherpa',
  client: 'SiteSherpa (Zotyra)',
  fps: 30,
  width: 1920,
  height: 1080,
  brand: {
    bg: '#ffffff',
    bgDark: '#004144',
    ink: '#0c2a2b',
    inkOnDark: '#ffffff',
    dim: '#5f7a7a',
    pending: '#c9c8c3',
    accent: '#d4f24b',
    border: '#e4e8e6',
    fonts: { title: 'Manrope', body: 'Inter' },
  },
  preset: { extends: 'editorial', blur: { gain: 60, maxPx: 16 } },
  slides: [
    {
      id: 'scroll',
      device: 'pageScroll',
      hold: 990,
      src: `${A}/page.png`,
      srcWidth: 2880,
      srcHeight: 18578,
      frame: 'none',
      // scroll stops in source px (top of viewport); bands measured from the page
      steps: [0, 2100, 3760, 5200, 5900, 7150, 7750, 9350, 10620, 12220, 13180, 14780, 16958],
      stepDur: { move: 14, settle: 56 },
      startAt: 80,
      dark: true,
      bg: '#004144',
      out: { kind: 'fadeToBlack', dur: 24 },
      camera: false,
      focus: { x: 0.5, y: 0.25 },
    },
  ],
  tail: 8,
};
