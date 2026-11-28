'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

import { cn } from './lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type ScrollImageSequenceProps = {
  /** 프레임 이미지 URL. 순서가 곧 재생 순서다. */
  frames: readonly string[];
  /** 좁은 화면(`smallQuery`)에서 쓸 프레임. 없으면 `frames`를 쓴다. 개수는 `frames`와 달라도 된다. */
  smallFrames?: readonly string[];
  /** `smallFrames`를 쓰는 미디어 쿼리. 기본 `(max-width: 47.999rem)` */
  smallQuery?: string;
  /** 화면에 그리는 이름(스크린 리더용). 캔버스 자체는 `aria-hidden`이다. */
  alt?: string;
  /**
   * `scroll`(기본): 패널을 고정하고 스크롤 진행도로 프레임을 넘긴다.
   * `play`: 고정하지 않고, 처음 화면에 들어올 때 `playSeconds` 동안 한 번 재생한다(히어로용).
   */
  mode?: 'scroll' | 'play';
  /** 고정 구간의 길이(화면 높이의 배수). `scroll`에서만 쓴다. */
  pinDistance?: number;
  /** 위에 붙은 요소(머리말 등)의 높이(px). 패널이 그 아래에 고정되고 높이도 그만큼 줄어든다. */
  pinOffset?: number;
  /** 고정 구간 중 프레임이 넘어가는 진행도 범위. 기본 `[0, 1]`. 앞뒤에 여유를 두면 글자가 들어오고 나갈 틈이 생긴다. */
  frameRange?: readonly [number, number];
  /** `play`의 재생 시간(초). 기본 2.4 */
  playSeconds?: number;
  /** 감소 모션에서 보일 진행도(0–1). 기본 0(첫 프레임). 마지막 장면에 글이 붙으면 1로 둔다. */
  restingProgress?: number;
  /** 이미지를 칸에 맞추는 방식. 기본 `contain` */
  fit?: 'contain' | 'cover';
  /**
   * 칸이 세로로 길 때(폭 < 높이) 맞춘 이미지를 이만큼 더 키운다. 가로로 긴 장면을 휴대폰에서 `contain`으로 그리면 주인공이 작아지는데,
   * 양옆 여백을 잘라 크게 보이게 한다. 기본 1
   */
  portraitZoom?: number;
  /** 확대의 세로 기준점(0 위 – 1 아래). 주인공이 이미지 아래쪽에 있으면 크게 둔다. 기본 0.5 */
  focusY?: number;
  /**
   * 오버레이 모양. `card`(기본): 아래쪽 반투명 카드에 `children`을 담는다. `none`: 패널 전체를 덮는 빈 층에 그대로 둔다
   * (배치와 배경은 소비자가 정한다). 오버레이는 `--sequence-progress`(0–1)를 읽어 스크롤에 맞춰 움직일 수 있다. 이 변수는 감소
   * 모션과 스크립트 실행 전에는 비어 있으므로 `var(--sequence-progress, …)`에 기본값을 줘서 그때 보일 모습을 정한다.
   */
  overlay?: 'card' | 'none';
  children?: ReactNode;
  className?: string;
};

const DEFAULT_SMALL_QUERY = '(max-width: 47.999rem)';

/**
 * 스크롤(또는 한 번 재생)에 맞춰 이미지 프레임을 캔버스에 그린다. 진행도는 루트의 CSS 변수 `--sequence-progress`로도 내보내므로
 * 오버레이 글자를 `calc()`로 스크롤에 묶을 수 있다(상태를 프레임마다 바꾸지 않는다). 첫 프레임만 바로 불러오고 나머지는 패널이
 * 화면 근처에 오면 불러온다. 감소 모션에서는 고정·재생 없이 `restingProgress`의 한 장면만 보인다.
 */
export function ScrollImageSequence({
  frames,
  smallFrames,
  smallQuery = DEFAULT_SMALL_QUERY,
  alt,
  mode = 'scroll',
  pinDistance = 2.4,
  pinOffset = 0,
  frameRange = [0, 1],
  playSeconds = 2.4,
  restingProgress = 0,
  fit = 'contain',
  portraitZoom = 1,
  focusY = 0.5,
  overlay = 'card',
  children,
  className,
}: ScrollImageSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesKey = frames.join('\0');
  const smallKey = smallFrames?.join('\0') ?? '';
  const [rangeStart, rangeEnd] = frameRange;

  useGSAP(
    () => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || frames.length === 0) {
        return;
      }

      const small = smallFrames && smallFrames.length > 0 ? window.matchMedia(smallQuery) : null;
      const sources = small?.matches && smallFrames ? smallFrames : frames;
      const images: HTMLImageElement[] = sources.map(() => new Image());
      let loadedAll = false;

      let lastIndex = -1;
      let progress = 0;

      const load = (index: number) => {
        const image = images[index];
        const src = sources[index];
        if (!image || !src || image.src) return;
        image.decoding = 'async';
        image.addEventListener(
          'load',
          () => {
            // 지금 보여야 할 프레임이 막 도착했으면 다시 그린다.
            lastIndex = -1;
            draw(progress);
          },
          { once: true },
        );
        image.src = src;
      };

      const loadAll = () => {
        if (loadedAll) return;
        loadedAll = true;
        sources.forEach((_, index) => load(index));
      };

      function resize() {
        const node = canvasRef.current;
        if (!node) {
          return;
        }

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const rect = node.getBoundingClientRect();
        node.width = Math.max(1, Math.round(rect.width * dpr));
        node.height = Math.max(1, Math.round(rect.height * dpr));
        lastIndex = -1;
      }

      /** 고정 진행도 → 프레임 진행도(`frameRange` 밖은 처음·끝 프레임에 머문다) */
      function frameProgress(value: number) {
        const span = Math.max(0.0001, rangeEnd - rangeStart);
        return Math.min(1, Math.max(0, (value - rangeStart) / span));
      }

      function draw(nextProgress: number) {
        const node = canvasRef.current;
        const ctx = node?.getContext('2d');
        if (!node || !ctx) {
          return;
        }

        const index = Math.round(frameProgress(nextProgress) * (images.length - 1));
        // 아직 도착하지 않은 프레임이면 가장 가까운 도착한 프레임을 그린다.
        let image: HTMLImageElement | null = null;
        for (let offset = 0; offset < images.length; offset += 1) {
          const before = images[index - offset];
          const after = images[index + offset];
          if (before?.complete && before.naturalWidth > 0) {
            image = before;
            break;
          }
          if (after?.complete && after.naturalWidth > 0) {
            image = after;
            break;
          }
        }

        if (!image || (index === lastIndex && node.width > 1)) {
          return;
        }

        lastIndex = index;
        const { width, height } = node;
        ctx.clearRect(0, 0, width, height);
        const pick = fit === 'cover' ? Math.max : Math.min;
        const zoom = width < height ? portraitZoom : 1;
        const scale = pick(width / image.naturalWidth, height / image.naturalHeight) * zoom;
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        // 확대한 만큼은 `focusY` 높이를 칸의 같은 높이에 두고 키운다(주인공이 칸 밖으로 밀려나지 않게).
        const baseHeight = drawHeight / zoom;
        const top = (height - baseHeight) / 2 + focusY * baseHeight - focusY * drawHeight;
        ctx.drawImage(image, (width - drawWidth) / 2, top, drawWidth, drawHeight);
      }

      function setProgress(value: number, expose = true) {
        progress = value;
        if (expose) root?.style.setProperty('--sequence-progress', value.toFixed(4));
        else root?.style.removeProperty('--sequence-progress');
        draw(value);
      }

      function paint() {
        resize();
        draw(progress);
      }

      // 첫 프레임(그리고 감소 모션에서 보일 프레임)은 바로, 나머지는 패널이 화면 1.5개 거리 안에 오면 불러온다.
      load(0);
      load(Math.round(frameProgress(restingProgress) * (images.length - 1)));
      const near = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadAll();
            near.disconnect();
          }
        },
        { rootMargin: '150% 0px' },
      );
      near.observe(root);

      paint();

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        setProgress(0);
        if (mode === 'play') {
          const state = { value: 0 };
          const tween = gsap.to(state, {
            value: 1,
            duration: playSeconds,
            ease: 'power2.out',
            paused: true,
            onUpdate: () => setProgress(state.value),
          });
          const trigger = ScrollTrigger.create({
            trigger: root,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              loadAll();
              tween.play();
            },
          });
          return () => {
            trigger.kill();
            tween.kill();
          };
        }

        const trigger = ScrollTrigger.create({
          trigger: root,
          pin: true,
          start: `top top+=${pinOffset}`,
          end: () => `+=${window.innerHeight * pinDistance}`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
          onRefresh: (self) => {
            setProgress(self.progress);
            paint();
          },
        });

        return () => {
          trigger.kill();
        };
      });

      media.add('(prefers-reduced-motion: reduce)', () => {
        loadAll();
        // 감소 모션: 한 장면만 보이고, 오버레이는 진행도 변수 없이(기본값으로) 완성된 모습이다.
        setProgress(restingProgress, false);
      });

      const onResize = () => {
        paint();
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        near.disconnect();
        media.revert();
      };
    },
    {
      scope: rootRef,
      dependencies: [
        framesKey,
        smallKey,
        smallQuery,
        mode,
        pinDistance,
        pinOffset,
        rangeStart,
        rangeEnd,
        playSeconds,
        restingProgress,
        fit,
        portraitZoom,
        focusY,
      ],
      revertOnUpdate: true,
    },
  );

  if (frames.length === 0) {
    return null;
  }

  return (
    <div ref={rootRef} className={cn('bg-background relative', className)}>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: mode === 'play' ? '100svh' : `calc(100svh - ${pinOffset}px)` }}
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
        {alt ? <p className="sr-only">{alt}</p> : null}
        {children && overlay === 'card' ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-6 pb-12 sm:p-10">
            <div className="bg-background/80 max-w-xl rounded-lg p-5">{children}</div>
          </div>
        ) : null}
        {children && overlay === 'none' ? (
          <div className="absolute inset-0 z-10">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
