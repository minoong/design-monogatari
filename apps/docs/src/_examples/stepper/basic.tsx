'use client';

import { Stepper, StepperItem } from '@repo/ui/stepper';
import { useState } from 'react';

const STEPS = [
  { value: 'model', label: '모델' },
  { value: 'color', label: '외장 색상' },
  { value: 'wheel', label: '휠' },
  { value: 'seat', label: '시트' },
  { value: 'result', label: '견적 결과' },
];

export default function StepperBasic() {
  const [value, setValue] = useState('color');
  const currentIndex = STEPS.findIndex((step) => step.value === value);

  return (
    <Stepper aria-label="견적 단계" value={value} className="w-full max-w-xl">
      {STEPS.map((step, index) => (
        <StepperItem
          key={step.value}
          value={step.value}
          completed={index < currentIndex}
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
