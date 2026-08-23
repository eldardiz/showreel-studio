// Prints the resolved timeline of an edit: `npm run qa:timeline -- <id>`
import { EDITS } from '../../src/edits';
import { resolveTimeline } from '../../src/showreel/timeline';

const id = process.argv[2];
const m = id ? EDITS[id] : undefined;
if (!m) {
  console.error(`unknown edit "${id}". known: ${Object.keys(EDITS).join(', ')}`);
  process.exit(1);
}
const tl = resolveTimeline(m);
console.log(`# ${m.id} (${m.client}) preset holds ${JSON.stringify(tl.preset.hold)}`);
console.log(`total ${tl.total} frames = ${(tl.total / m.fps).toFixed(2)} s${tl.grid ? `, beat grid ${tl.grid.framesPerBeat.toFixed(2)} f/beat` : ''}`);
console.log('idx  id              device       from   dur   cut   in           out          drift');
for (const s of tl.slides) {
  const r = (v: unknown, n: number) => String(v ?? '').padEnd(n);
  console.log(`${r(s.index, 4)} ${r(s.slide.id, 15)} ${r(s.slide.device, 12)} ${r(s.from, 6)} ${r(s.dur, 5)} ${r(s.cut, 5)} ${r(s.slide.in?.kind ?? 'cut', 12)} ${r(s.slide.out?.kind ?? 'cut', 12)} ${s.drift}`);
}
console.log(`cuts: ${tl.cuts.join(',')}  flashes: ${tl.flashes.join(',') || '-'}`);
if (process.argv.includes('--json')) console.log(JSON.stringify({ total: tl.total, cuts: tl.cuts, flashes: tl.flashes, slides: tl.slides.map((s) => ({ id: s.slide.id, from: s.from, dur: s.dur, cut: s.cut })) }));
