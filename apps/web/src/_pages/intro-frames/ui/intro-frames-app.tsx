'use client';

import dynamic from 'next/dynamic';

const IntroFramesCapture = dynamic(() => import('./intro-frames-capture'), { ssr: false });

export function IntroFramesApp() {
  return <IntroFramesCapture />;
}
