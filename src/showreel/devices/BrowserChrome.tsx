import React from 'react';

/** Minimal CSS browser chrome: three dots + url pill. Heights in px at 1080p. */
export const CHROME_H = 56;

export const BrowserChrome: React.FC<{ width: number; dark?: boolean; url?: string }> = ({ width, dark, url = '' }) => {
  const bg = dark ? '#232326' : '#f3f3f3';
  const dot = dark ? '#4a4a4f' : '#d2d2d2';
  const pill = dark ? '#2e2e33' : '#ffffff';
  const text = dark ? '#8a8a90' : '#8d8d8d';
  return (
    <div style={{ width, height: CHROME_H, backgroundColor: bg, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 10, boxSizing: 'border-box' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: dot }} />
      ))}
      <div style={{ flex: 1, marginLeft: 18, height: 32, borderRadius: 8, backgroundColor: pill, display: 'flex', alignItems: 'center', paddingLeft: 14, fontFamily: 'system-ui, sans-serif', fontSize: 16, color: text }}>
        {url}
      </div>
    </div>
  );
};
