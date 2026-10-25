'use client';

import { Stepper, StepperItem } from '@repo/ui/stepper';
import { useState } from 'react';

const STEPS = [
  { value: 'model', label: '모델' },
  { value: 'color', label: '외장 색상' },
  { value: 'wheel', label: '휠' },
  { value: 'seat', label: '시트' },
];

const INDICATORS = ['pill', 'underline', 'ring'] as const;

export default function StepperIndicators() {
  const [value, setValue] = useState('color');
  const currentIndex = STEPS.findIndex((step) => step.value === value);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      {INDICATORS.map((indicator) => (
        <div key={indicator} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{indicator}</p>
          <Stepper aria-label={`견적 단계 (${indicator})`} value={value} indicator={indicator}>
            {STEPS.map((step, index) => (
              <StepperItem
                key={step.value}
                value={step.value}
                completed={index < currentIndex}
                href={`#${indicator}-${step.value}`}
                onClick={(event) => {
                  event.preventDefault();
                  setValue(step.value);
                }}
              >
                {step.label}
              </StepperItem>
            ))}
          </Stepper>
        </div>
      ))}
    </div>
  );
}
