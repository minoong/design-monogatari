import { SILHOUETTE_PATH, SUV_H, SUV_VIEW_BOX, SUV_W } from './suv';

/**
 * 표현 ①: 도트 격자. 자바스크립트 없이 SVG 패턴 하나로 그린다.
 * 같은 간격의 점이 화면 전체에 옅게 깔려 있고, SUV 실루엣 안쪽만 진하게 켜진다.
 * 서버 컴포넌트라 첫 화면부터 보이고, 라이트/다크는 `currentColor`가 따라간다.
 */
export function SuvLattice() {
  return (
    <svg
      aria-hidden
      className="text-foreground block h-auto w-full"
      viewBox={SUV_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern height="8" id="lp-lattice" patternUnits="userSpaceOnUse" width="8">
          <circle cx="4" cy="4" fill="currentColor" r="2.1" />
        </pattern>
        <radialGradient id="lp-fade">
          <stop offset="0.5" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask id="lp-fade-mask">
          <rect fill="url(#lp-fade)" height={SUV_H} width={SUV_W} />
        </mask>
        <clipPath id="lp-suv-clip">
          <path clipRule="evenodd" d={SILHOUETTE_PATH} />
        </clipPath>
      </defs>
      <rect
        fill="url(#lp-lattice)"
        height={SUV_H}
        mask="url(#lp-fade-mask)"
        opacity="0.16"
        width={SUV_W}
      />
      <rect clipPath="url(#lp-suv-clip)" fill="url(#lp-lattice)" height={SUV_H} width={SUV_W} />
    </svg>
  );
}
