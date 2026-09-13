'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

import { cn } from './lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollImageSequence({
  frames,
  alt,
  pinDistance = 2.4,
  children,
  className,
}: {
  frames: readonly string[];
  alt?: string;
  pinDistance?: number;
  children?: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesKey = frames.join('\0');

  useGSAP(
    () => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || frames.length === 0) {
        return;
      }

      const images = frames.map((src) => {
        const image = new Image();
        image.src = src;
        return image;
      });

      let lastIndex = -1;
      let progress = 0;

      function resize() {
        const node = canvasRef.current;
        if (!node) {
          return;
        }

        const dpr = window.devicePixelRatio || 1;
        const rect = node.getBoundingClientRect();
        node.width = Math.max(1, Math.round(rect.width * dpr));
        node.height = Math.max(1, Math.round(rect.height * dpr));
        lastIndex = -1;
      }

      function draw(nextProgress: number) {
        const node = canvasRef.current;
        const ctx = node?.getContext('2d');
        if (!node || !ctx) {
          return;
        }

        const index = Math.round(Math.min(1, Math.max(0, nextProgress)) * (images.length - 1));
        const image =
          images
            .slice(index)
            .concat(images.slice(0, index).reverse())
            .find((item) => item.complete && item.naturalWidth > 0) ?? null;

        if (!image || (index === lastIndex && node.width > 1)) {
          return;
        }

        lastIndex = index;
        const { width, height } = node;
        ctx.clearRect(0, 0, width, height);

        const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        ctx.drawImage(
          image,
          (width - drawWidth) / 2,
          (height - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );
      }

      function paint() {
        resize();
        draw(progress);
      }

      for (const image of images) {
        if (!image.complete) {
          image.addEventListener(
            'load',
            () => {
              lastIndex = -1;
              draw(progress);
            },
            { once: true },
          );
        }
      }

      paint();

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: root,
          pin: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * pinDistance}`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress = self.progress;
            draw(progress);
          },
          onRefresh: (self) => {
            progress = self.progress;
            paint();
          },
        });

        return () => {
          trigger.kill();
        };
      });

      const onResize = () => {
        paint();
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        media.revert();
      };
    },
    { scope: rootRef, dependencies: [framesKey, pinDistance], revertOnUpdate: true },
  );

  if (frames.length === 0) {
    return null;
  }

  return (
    <div ref={rootRef} className={cn('bg-background relative', className)}>
      <div className="relative h-svh w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
        {alt ? <p className="sr-only">{alt}</p> : null}
        {children ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-6 pb-12 sm:p-10">
            <div className="bg-background/80 max-w-xl rounded-lg p-5">{children}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
