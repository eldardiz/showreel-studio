import React from 'react';
import type { Slide, SlideProps } from '../manifest';

type S = Extract<Slide, { device: 'custom' }>;

/** Escape hatch: a hand-written slide component that still gets the shell (transitions, camera, blur). */
export const Custom: React.FC<SlideProps<S>> = (props) => {
  const C = props.slide.component;
  return <C {...(props as unknown as SlideProps)} />;
};
