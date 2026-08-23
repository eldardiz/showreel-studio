import React from 'react';
import type { SlideProps } from '../showreel/manifest';

/** Card chrome measured from 1442.png: outer hairline box + horizontal divider. */
export const HeadlineCardChrome: React.FC<SlideProps> = ({ brand }) => {
  const border = brand.border ?? '#d9d9d9';
  return (
    <>
      <div style={{ position: 'absolute', left: 51, top: 48, width: 1869 - 51, height: 1032 - 48, border: `1px solid ${border}` }} />
      <div style={{ position: 'absolute', left: 51, top: 554, width: 1869 - 51, height: 1, backgroundColor: border }} />
    </>
  );
};
