'use client';

import { useGSAP } from '@gsap/react';
import { AnimatedAmount } from '@repo/ui/animated-amount';
import { cn } from '@repo/ui/cn';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useId, useRef, useState } from 'react';

import {
  BASE_PRICE,
  type ExtraId,
  extras,
  formatWon,
  type PaintId,
  paints,
  type TrimId,
  trims,
  type WheelId,
  wheels,
} from '../model/data';
import { CarSilhouette } from './car-silhouette';
import { ExteriorSequence } from './exterior-sequence';
import { ThemeToggle } from './theme-toggle';

gsap.registerPlugin(useGSAP);

export function EstimateApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const [trimId, setTrimId] = useState<TrimId>('long');
  const [paintId, setPaintId] = useState<PaintId>('ink');
  const [wheelId, setWheelId] = useState<WheelId>('aero');
  const [extraIds, setExtraIds] = useState<Set<ExtraId>>(() => new Set());

  const trim = trims.find((item) => item.id === trimId) ?? trims[0];
  const paint = paints.find((item) => item.id === paintId) ?? paints[0];
  const wheel = wheels.find((item) => item.id === wheelId) ?? wheels[0];
  const extraTotal = extras
    .filter((item) => extraIds.has(item.id))
    .reduce((sum, item) => sum + item.price, 0);
  const total = BASE_PRICE + trim.price + wheel.price + extraTotal;

  useGSAP(
    () => {
      const car = carRef.current;
      const stage = stageRef.current;
      if (!car || !stage) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(car, { transformPerspective: 1200, transformOrigin: '50% 60%' });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
            },
          })
          .fromTo(
            car,
            { rotationY: -26, xPercent: 8, scale: 0.92 },
            { rotationY: 6, xPercent: 0, scale: 1, ease: 'none' },
          )
          .to(car, { rotationY: 28, xPercent: -6, scale: 1.06, ease: 'none' });
      });

      return () => media.revert();
    },
    { scope: rootRef },
  );

  function toggleExtra(id: ExtraId) {
    setExtraIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div ref={rootRef} className="bg-background text-foreground min-h-svh">
      <header className="border-border bg-background/80 sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md">
        <div>
          <p className="text-muted-foreground text-sm">design-monogatari</p>
          <p className="font-semibold tracking-tight">Kite Coupe 견적</p>
        </div>
        <div className="flex items-center gap-4">
          <p aria-atomic="true" aria-live="polite">
            <AnimatedAmount className="font-sans text-sm font-semibold" value={total} />
          </p>
          <ThemeToggle />
        </div>
      </header>

      <ExteriorSequence />

      <div ref={stageRef} className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <div className="bg-background sticky top-18 z-10 lg:top-18 lg:h-[calc(100svh-4.5rem)] lg:overflow-hidden">
          <div className="flex h-[42vh] items-center justify-center px-6 lg:h-full">
            <div ref={carRef} className="w-full max-w-3xl transform-3d">
              <CarSilhouette fill={paint.fill} stroke={paint.stroke} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-24 px-6 py-10 pb-36 lg:gap-32 lg:py-16">
          <section className="flex flex-col gap-3">
            <p className="text-muted-foreground text-caption">전기 쿠페</p>
            <h1 className="text-title font-semibold tracking-tight">
              원하는 면을 고르면, 차가 함께 돌아요
            </h1>
            <p className="text-foreground text-body">
              스크롤하면 차체가 각도를 바꿔요. 트림·색·휠을 고르면 오른쪽 합계가 바로 바뀌어요.
              숫자는 더미예요.
            </p>
          </section>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-foreground text-lg font-semibold tracking-tight">트림</legend>
            <div className="flex flex-col gap-3">
              {trims.map((item) => {
                const selected = item.id === trimId;
                return (
                  <label
                    key={item.id}
                    className={cn(
                      'border-border rounded-lg border p-4',
                      selected && 'border-primary',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${formId}-trim`}
                      value={item.id}
                      checked={selected}
                      onChange={() => setTrimId(item.id)}
                      className="sr-only"
                    />
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-muted-foreground font-mono text-sm">
                        {item.price === 0 ? '기본' : `+${formatWon(item.price)}`}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.range} · {item.note}
                    </p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-foreground text-lg font-semibold tracking-tight">외장</legend>
            <div className="flex flex-wrap gap-3">
              {paints.map((item) => {
                const selected = item.id === paintId;
                return (
                  <label key={item.id} className="flex cursor-pointer flex-col items-center gap-2">
                    <input
                      type="radio"
                      name={`${formId}-paint`}
                      value={item.id}
                      checked={selected}
                      onChange={() => setPaintId(item.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'border-border size-11 rounded-full border',
                        selected && 'ring-ring ring-offset-background ring-2 ring-offset-2',
                      )}
                      style={{ background: item.fill }}
                      aria-hidden
                    />
                    <span className="text-muted-foreground text-xs">{item.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-foreground text-lg font-semibold tracking-tight">휠</legend>
            <div className="flex flex-col gap-3">
              {wheels.map((item) => {
                const selected = item.id === wheelId;
                return (
                  <label
                    key={item.id}
                    className={cn(
                      'border-border flex items-center justify-between rounded-lg border px-4 py-3',
                      selected && 'border-primary',
                    )}
                  >
                    <span>
                      <input
                        type="radio"
                        name={`${formId}-wheel`}
                        value={item.id}
                        checked={selected}
                        onChange={() => setWheelId(item.id)}
                        className="sr-only"
                      />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground font-mono text-sm">
                      {item.price === 0 ? '기본' : `+${formatWon(item.price)}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-foreground text-lg font-semibold tracking-tight">옵션</legend>
            <div className="flex flex-col gap-3">
              {extras.map((item) => {
                const selected = extraIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      'border-border flex items-center justify-between rounded-lg border px-4 py-3',
                      selected && 'border-primary',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleExtra(item.id)}
                        className="accent-primary size-4"
                      />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground font-mono text-sm">
                      +{formatWon(item.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <section className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
            <h2 className="text-lg font-semibold tracking-tight">합계</h2>
            <p className="text-muted-foreground text-caption">
              {trim.name} · {paint.name} · {wheel.name}
            </p>
            <p aria-atomic="true" aria-live="polite">
              <AnimatedAmount
                className="text-title font-semibold tracking-tight"
                inView
                value={total}
              />
            </p>
            <button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring focus-visible:ring-offset-background rounded-pill inline-flex h-12 w-full cursor-pointer items-center justify-center px-5 font-sans text-base font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              이 견적으로 상담하기
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
