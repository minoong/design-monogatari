'use client';

import { Stepper, StepperItem } from '@repo/ui/stepper';
import { useState } from 'react';

const STEPS = [
  { value: 'model', label: '모델' },
  { value: 'color', label: '외장 색상' },
  { value: 'wheel', label: '휠' },
  { value: 'seat', label: '시트' },
  { value: 'interior', label: '내장' },
  { value: 'options', label: '선택 품목' },
  { value: 'accessory', label: '액세서리' },
  { value: 'result', label: '견적 결과' },
];

export default function StepperNarrow() {
  const [value, setValue] = useState('interior');

  return (
    <Stepper aria-label="견적 단계" value={value} className="w-72">
      {STEPS.map((step) => (
        <StepperItem
          key={step.value}
          value={step.value}
          href={`#${step.value}`}
          onClick={(event) => {
            event.preventDefault();
            setValue(step.value);
          }}
        >
          {step.label}
        </StepperItem>
      ))}
    </Stepper>
  );
}
