/**
 * 견적 슬라이스의 두 번째 공개 진입점: 규칙·가격 모델(순수 TypeScript)만 내보낸다.
 *
 * 인트로(`_pages/intro`)가 같은 사양 규칙과 가격 계산, 같은 선택→3D 매핑을 쓰려고 가져간다. 같은 층의 다른 슬라이스를 가져오는
 * 일이라 원칙에는 어긋나지만, 규칙을 인트로에 복사하면 두 화면의 규칙이 어긋나므로 의도한 선택이다(FSD cross-import 전략 D:
 * 슬라이스 내부 파일이 아니라 공개 진입점으로만 접근). `index.ts`와 따로 둔 이유는 `index.ts`가 서버 페이지와 클라이언트 앱을
 * 끌고 와서, 클라이언트 모듈에서 가져오면 번들이 커지고 서버 전용 코드가 섞이기 때문이다.
 * 나중에 세 번째 소비자가 생기면 `entities/estimate`로 올리는 것이 맞다.
 */
export { caliperSwatchOf } from './model/caliper-map';
export { CATALOG } from './model/catalog';
export { encodeEstimate } from './model/codec';
export { describeEffect } from './model/describe';
export { formatWon } from './model/format';
export { interiorSwatchOf } from './model/interior-map';
export { paintSwatchOf } from './model/paint-map';
export { calculateQuote, type Quote } from './model/quote';
export { createDefaultSelection, resolveSelection } from './model/resolve';
export { rimFinishSwatchOf } from './model/rim-map';
export { hasSunroof } from './model/roof-map';
export { getAvailability, singleRef } from './model/selection';
export { STEPS } from './model/steps';
export type { CatalogItem, ColorId, Intent, Selection, SingleSlot } from './model/types';
export { WHEEL_INCH } from './model/wheel-map';
export { DEFAULT_OPTIONS } from './model/wizard';
