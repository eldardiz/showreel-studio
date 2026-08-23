import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
// no-op without Three.js, but harmless and keeps parity with remotion-experiments
Config.setChromiumOpenGlRenderer('angle');
