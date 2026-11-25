/** 랜딩 장면이 쓰는 견적 데모용 색 목록. */
// 데모용 색과 가격입니다. 실제 차량 정보가 아니며, 컴포넌트는 색을 정하지 않고 `color`로 받습니다.
export const ESTIMATE_COLORS = [
  {
    value: 'white',
    label: '화이트',
    color: '#f2f2f0',
    group: '글로시',
    price: '기본 포함',
    extra: 0,
  },
  {
    value: 'black',
    label: '블랙',
    color: '#1a1a1c',
    group: '글로시',
    price: '기본 포함',
    extra: 0,
  },
  { value: 'blue', label: '블루', color: '#27406b', group: '글로시', price: '기본 포함', extra: 0 },
  {
    value: 'pearl',
    label: '펄 화이트',
    color: '#e8e6df',
    group: '메탈릭',
    price: '+₩1,000,000',
    extra: 1_000_000,
  },
  {
    value: 'bronze',
    label: '브론즈',
    color: '#7a5c3e',
    group: '메탈릭',
    price: '+₩1,000,000',
    extra: 1_000_000,
  },
] as const;
