'use client';

import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { useState } from 'react';

const wheels = [
  { value: 'w19', label: '19인치 기본 휠', price: '기본 포함' },
  { value: 'w20', label: '20인치 알로이 휠', price: '+₩1,500,000' },
  { value: 'w21', label: '21인치 알로이 휠', price: '+₩3,200,000' },
];

export default function OptionRowBasic() {
  const [value, setValue] = useState('w19');

  return (
    <OptionGroup legend="휠" className="w-full max-w-md">
      {wheels.map((wheel) => (
        <OptionRow
          key={wheel.value}
          name="option-row-basic-wheel"
          value={wheel.value}
          label={wheel.label}
          price={wheel.price}
          checked={value === wheel.value}
          onChange={() => setValue(wheel.value)}
        />
      ))}
    </OptionGroup>
  );
}
