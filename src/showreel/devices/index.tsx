import React from 'react';
import type { DeviceKind, SlideProps } from '../manifest';
import { Title } from './Title';
import { Lockup } from './Lockup';
import { KenBurns } from './KenBurns';
import { Typed } from './Typed';
import { StaggerPop } from './StaggerPop';
import { Specimen } from './Specimen';
import { PageScroll } from './PageScroll';
import { DeviceZoom } from './DeviceZoom';
import { HoverButton } from './HoverButton';
import { Custom } from './Custom';

export const DEVICES: Record<DeviceKind, React.FC<SlideProps<any>>> = {
  title: Title,
  lockup: Lockup,
  kenBurns: KenBurns,
  typed: Typed,
  staggerPop: StaggerPop,
  specimen: Specimen,
  pageScroll: PageScroll,
  deviceZoom: DeviceZoom,
  hoverButton: HoverButton,
  custom: Custom,
};
