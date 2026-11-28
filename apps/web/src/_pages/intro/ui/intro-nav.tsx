'use client';

import { AnimatedAmount } from '@repo/ui/animated-amount';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * 로컬 내비(Apple). 맨 위에서는 바탕이 투명해 히어로가 그대로 보이고, 조금이라도 내려가면 반투명 바탕과 흐림이 깔린다.
 * 높이는 `NAV_PX`(52px)와 같고, 고정 장면은 이 아래에 붙는다.
 */
export function IntroNav({ total, startHref }: { total: number; startHref: string }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const update = () => setFilled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header
      className={cn(
        'dark text-foreground sticky top-0 z-50 h-13 border-b transition-colors duration-300',
        filled
          ? 'border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center gap-4 px-5">
        <p className="m-0 text-xl font-semibold tracking-tight">X5</p>
        <p className="text-muted-foreground m-0 hidden text-xs md:block">
          비공식 포트폴리오 · 가격과 사양은 가상의 값입니다
        </p>
        <div className="ml-auto flex items-center gap-4">
          {/* 지금 사양의 총액. 숫자는 화면용이고, 읽어 주는 상태 영역은 `IntroApp`에 있다. */}
          <span aria-hidden className="flex items-baseline gap-2">
            <span className="text-muted-foreground hidden text-xs sm:inline">총 예상 금액</span>
            <AnimatedAmount value={total} prefix="₩" className="text-sm font-semibold" />
          </span>
          <Button asChild size="small" radius="pill">
            <Link href={startHref}>견적 시작</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
