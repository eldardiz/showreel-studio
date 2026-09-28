import type { EditManifest, Slide } from '../showreel/manifest';
import { EndCard, LogoIntro, SystemsCard, clip } from './gsd-launch.custom';

// Get Stuff Digital launch video for LinkedIn, silent, ~24 s, in 4:5 (1080 x 1350) and 16:9 (1920 x 1080).
// Logo intro, the homepage hero, "Four systems working as one." with the four service nodes, the four service
// heroes as recorded on the live site, end card. Every line on screen is the site's own copy.
// 4:5 clips: 1080 x 1350 viewport (clips/). 16:9 clips: 1920 x 1080 viewport with a small scroll (clips-16x9/).

type Take = { from: number; rate: number };
type Format = { id: string; width: number; height: number; dir: string; takes: Record<'home' | 'seo' | 'ai' | 'authority' | 'dev', Take> };

const brand: EditManifest['brand'] = {
  bg: '#F4F4F4',
  bgDark: '#06090D',
  ink: '#111111',
  inkOnDark: '#F4F4F4',
  dim: '#4C5A63',
  pending: '#8B969C',
  accent: '#3683B1',
  fonts: { title: 'DMSans', body: 'DMSans', mono: 'Inter' },
};

const SERVICES = [
  { key: 'seo', name: 'seo-hero', num: '01', label: 'SEO' },
  { key: 'ai', name: 'ai-hero', num: '02', label: 'AI Search' },
  { key: 'authority', name: 'auth-hero', num: '03', label: 'Authority Building' },
  { key: 'dev', name: 'dev-hero', num: '04', label: 'Development' },
] as const;

const endSlide = (hold: number): Slide => ({
  id: 'end',
  device: 'custom',
  component: EndCard,
  hold,
  dark: true,
  in: { kind: 'blurDissolve', dur: 12 },
  camera: { push: 1.03 },
  out: { kind: 'fadeToBlack', dur: 18 },
});

const launch = (f: Format): EditManifest => ({
  id: f.id,
  client: 'Get Stuff Digital',
  fps: 30,
  width: f.width,
  height: f.height,
  brand,
  preset: 'editorial',
  slides: [
    { id: 'logo', device: 'custom', component: LogoIntro, hold: 80, dark: true, camera: { push: 1.05 }, out: { kind: 'blurDissolve', dur: 10 } },
    {
      id: 'home',
      device: 'custom',
      component: clip({ dir: f.dir, name: 'home-hero', ...f.takes.home }),
      hold: 104,
      in: { kind: 'blurDissolve', dur: 10 },
      camera: { push: 1.04, origin: '50% 30%' },
      out: { kind: 'blurDissolve', dur: 10 },
    },
    { id: 'systems', device: 'custom', component: SystemsCard, hold: 84, dark: true, in: { kind: 'blurDissolve', dur: 10 }, camera: { push: 1.03 } },
    ...SERVICES.map(
      (s, i): Slide => ({
        id: s.key,
        device: 'custom',
        component: clip({ dir: f.dir, name: s.name, ...f.takes[s.key], num: s.num, label: s.label }),
        hold: 90,
        in: { kind: 'flash' },
        camera: { push: 1.04, origin: '50% 40%' },
        ...(i === SERVICES.length - 1 ? { out: { kind: 'blurDissolve', dur: 12 } } : {}),
      }),
    ),
    endSlide(120),
  ],
  tail: 4,
});

const FORMAT_4x5: Format = {
  id: 'gsd-launch',
  width: 1080,
  height: 1350,
  dir: 'clips',
  takes: { home: { from: 1.1, rate: 1.15 }, seo: { from: 2.2, rate: 1.5 }, ai: { from: 1.6, rate: 1.6 }, authority: { from: 1.3, rate: 1.6 }, dev: { from: 3.7, rate: 1 } },
};
const FORMAT_16x9: Format = {
  id: 'gsd-launch-16x9',
  width: 1920,
  height: 1080,
  dir: 'clips-16x9',
  takes: { home: { from: 1.1, rate: 1.15 }, seo: { from: 2.0, rate: 1.5 }, ai: { from: 1.6, rate: 1.6 }, authority: { from: 1.5, rate: 1.6 }, dev: { from: 3.0, rate: 1 } },
};

export const gsdLaunch = launch(FORMAT_4x5);
export const gsdLaunch16x9 = launch(FORMAT_16x9);

// Per-service cut-downs (~9.5 s, 4:5): one service hero at real speed, then the end card.
const service = (s: (typeof SERVICES)[number], from: number): EditManifest => ({
  ...gsdLaunch,
  id: `gsd-launch-${s.key}`,
  slides: [
    {
      id: s.key,
      device: 'custom',
      component: clip({ dir: 'clips', name: s.name, from, rate: 1, num: s.num, label: s.label }),
      hold: 180,
      camera: { push: 1.05, origin: '50% 40%' },
      out: { kind: 'blurDissolve', dur: 12 },
    },
    endSlide(100),
  ],
});
export const gsdLaunchServices: EditManifest[] = [service(SERVICES[0], 2.2), service(SERVICES[1], 1.6), service(SERVICES[2], 1.3), service(SERVICES[3], 3.4)];
