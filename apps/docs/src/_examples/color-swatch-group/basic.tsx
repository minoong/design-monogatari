'use client';

import { ColorSwatchGroup } from '@repo/ui/color-swatch-group';
import { useState } from 'react';

// 데모용 색입니다. 컴포넌트는 색을 정하지 않고 `color`로 받습니다.
const options = [
  { value: 'white', label: '화이트', color: '#f2f2f0', group: '글로시', price: '기본 포함' },
  { value: 'black', label: '블랙', color: '#1a1a1c', group: '글로시', price: '기본 포함' },
  { value: 'blue', label: '블루', color: '#27406b', group: '글로시', price: '기본 포함' },
  { value: 'pearl', label: '펄 화이트', color: '#e8e6df', group: '메탈릭', price: '+1,000,000원' },
  {
    value: 'bronze',
    label: '브론즈',
    color: '#7a5c3e',
    group: '메탈릭',
    price: '+1,000,000원',
    unavailableReason: '스포트 트림에서만 선택할 수 있습니다.',
  },
];

export default function ColorSwatchGroupBasic() {
  const [value, setValue] = useState('white');

  return (
    <ColorSwatchGroup
      legend="외장 색상"
      name="color-swatch-basic"
      value={value}
      onValueChange={setValue}
      options={options}
    />
  );
}
