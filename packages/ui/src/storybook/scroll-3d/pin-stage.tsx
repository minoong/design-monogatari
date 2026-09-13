'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useEffect, useRef } from 'react';

import { PIN_DISTANCE } from './constants';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollPinStage({
  alt,
  overlay,
  onProgress,
  children,
}: {
  alt: string;
  overlay: ReactNode;
  onProgress: (progress: number) => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: root,
          pin: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * PIN_DISTANCE}`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            onProgressRef.current(self.progress);
          },
          onRefresh: (self) => {
            onProgressRef.current(self.progress);
          },
        });

        return () => {
          trigger.kill();
        };
      });

      return () => {
        media.revert();
      };
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="bg-background relative">
      <div className="relative h-svh w-full overflow-hidden">
        {children}
        <p className="sr-only">{alt}</p>
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-start justify-start p-4">
          <div className="bg-background/55 pointer-events-auto max-w-56 rounded-lg p-3 backdrop-blur-sm">
            {overlay}
          </div>
        </div>
      </div>
    </div>
  );
}
