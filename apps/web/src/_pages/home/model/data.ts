export const BASE_PRICE = 62_900_000;

export const trims = [
  {
    id: 'standard',
    name: '스탠다드',
    price: 0,
    range: '520km',
    note: '일상 주행에 맞춰 듀얼 모터를 빼 둔 트림이에요.',
  },
  {
    id: 'long',
    name: '롱 레인지',
    price: 8_500_000,
    range: '620km',
    note: '한 번 충전으로 서울–부산을 여유 있게 가요.',
  },
  {
    id: 'performance',
    name: '퍼포먼스',
    price: 16_900_000,
    range: '560km',
    note: '가속과 댐핑을 스포츠로 조여 둔 트림이에요.',
  },
] as const;

export const paints = [
  {
    id: 'snow',
    name: '스노우',
    fill: 'var(--color-neutral-50)',
    stroke: true,
  },
  {
    id: 'fog',
    name: '포그',
    fill: 'var(--color-neutral-300)',
    stroke: false,
  },
  {
    id: 'ink',
    name: '잉크',
    fill: 'var(--color-neutral-900)',
    stroke: false,
  },
  {
    id: 'action',
    name: '액션 블루',
    fill: 'var(--color-blue-600)',
    stroke: false,
  },
] as const;

export const wheels = [
  { id: 'aero', name: '에어로 19"', price: 0 },
  { id: 'sport', name: '스포트 20"', price: 1_200_000 },
  { id: 'forged', name: '포지드 21"', price: 2_400_000 },
] as const;

export const extras = [
  { id: 'tow', name: '히치', price: 890_000 },
  { id: 'heat', name: '히트펌프', price: 1_100_000 },
  { id: 'audio', name: '스튜디오 사운드', price: 1_650_000 },
] as const;

export type TrimId = (typeof trims)[number]['id'];
export type PaintId = (typeof paints)[number]['id'];
export type WheelId = (typeof wheels)[number]['id'];
export type ExtraId = (typeof extras)[number]['id'];

export function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}
