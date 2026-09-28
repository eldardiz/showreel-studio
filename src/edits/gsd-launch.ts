import type { EditManifest } from '../showreel/manifest';
import { EndCard, LogoIntro, clip } from './gsd-launch.custom';

// Get Stuff Digital launch video for LinkedIn: 4:5, silent, ~26 s.
// Logo intro, the homepage hero, "Four systems working as one.", the four service heroes as recorded on the
// live site, two slices of the homepage scroll, end card. Every line on screen is the site's own copy.
export const gsdLaunch: EditManifest = {
  id: 'gsd-launch',
  client: 'Get Stuff Digital',
  fps: 30,
  width: 1080,
  height: 1350,
  brand: {
    bg: '#F4F4F4',
    bgDark: '#06090D',
    ink: '#111111',
    inkOnDark: '#F4F4F4',
    dim: '#4C5A63',
    pending: '#8B969C',
    accent: '#3683B1',
    fonts: { title: 'DMSans', body: 'DMSans', mono: 'Inter' },
  },
  preset: 'editorial',
  slides: [
    { id: 'logo', device: 'custom', component: LogoIntro, hold: 80, dark: true, camera: { push: 1.05 }, out: { kind: 'blurDissolve', dur: 10 } },
    {
      id: 'home',
      device: 'custom',
      component: clip({ name: 'home-hero', from: 1.1, rate: 1.15 }),
      hold: 104,
      in: { kind: 'blurDissolve', dur: 10 },
      camera: { push: 1.05, origin: '50% 30%' },
    },
    {
      id: 'systems',
      device: 'title',
      text: 'Four systems working as one.',
      lines: ['Four systems', 'working as one.'],
      effect: 'lineRise',
      fontSize: 128,
      dark: true,
      hold: 44,
      in: { kind: 'flash' },
    },
    {
      id: 'seo',
      device: 'custom',
      component: clip({ name: 'seo-hero', from: 2.2, rate: 1.5, num: '01', label: 'SEO' }),
      hold: 90,
      in: { kind: 'flash' },
      camera: { push: 1.05, origin: '50% 40%' },
    },
    {
      id: 'ai',
      device: 'custom',
      component: clip({ name: 'ai-hero', from: 1.6, rate: 1.6, num: '02', label: 'AI Search' }),
      hold: 90,
      in: { kind: 'flash' },
      camera: { push: 1.05, origin: '50% 40%' },
    },
    {
      id: 'authority',
      device: 'custom',
      component: clip({ name: 'auth-hero', from: 1.3, rate: 1.6, num: '03', label: 'Authority Building' }),
      hold: 90,
      in: { kind: 'flash' },
      camera: { push: 1.05, origin: '50% 40%' },
    },
    {
      id: 'dev',
      device: 'custom',
      component: clip({ name: 'dev-hero', from: 3.7, rate: 1, num: '04', label: 'Development' }),
      hold: 90,
      in: { kind: 'flash' },
      camera: { push: 1.05, origin: '50% 60%' },
      out: { kind: 'blurDissolve', dur: 10 },
    },
    {
      // "Our growth strategy in 3 steps": the Launch / Sprint / Compound chart. Starts after the Rylo band (needs Nik's OK).
      id: 'steps',
      device: 'custom',
      component: clip({ name: 'home-scroll', from: 10.55, rate: 0.8 }),
      hold: 42,
      in: { kind: 'blurDissolve', dur: 10 },
      camera: false,
    },
    {
      // the closing CTA into the footer wordmark; skips the team photos
      id: 'cta',
      device: 'custom',
      component: clip({ name: 'home-scroll', from: 14.3, rate: 0.8 }),
      hold: 50,
      in: { kind: 'flash' },
      camera: false,
      out: { kind: 'blurDissolve', dur: 12 },
    },
    { id: 'end', device: 'custom', component: EndCard, hold: 110, dark: true, in: { kind: 'blurDissolve', dur: 12 }, camera: { push: 1.04 }, out: { kind: 'fadeToBlack', dur: 18 } },
  ],
  tail: 4,
};

// Per-service cut-downs (~9.5 s each): one service hero at real speed, then the end card.
// For the comments under the launch post, or for Nik's follow-up posts.
const service = (key: string, name: string, from: number, num: string, label: string): EditManifest => ({
  ...gsdLaunch,
  id: `gsd-launch-${key}`,
  slides: [
    {
      id: key,
      device: 'custom',
      component: clip({ name, from, rate: 1, num, label }),
      hold: 180,
      camera: { push: 1.05, origin: '50% 40%' },
      out: { kind: 'blurDissolve', dur: 12 },
    },
    { id: 'end', device: 'custom', component: EndCard, hold: 100, dark: true, in: { kind: 'blurDissolve', dur: 12 }, camera: { push: 1.04 }, out: { kind: 'fadeToBlack', dur: 18 } },
  ],
});
export const gsdLaunchServices: EditManifest[] = [
  service('seo', 'seo-hero', 2.2, '01', 'SEO'),
  service('ai', 'ai-hero', 1.6, '02', 'AI Search'),
  service('authority', 'auth-hero', 1.3, '03', 'Authority Building'),
  service('dev', 'dev-hero', 3.4, '04', 'Development'),
];
