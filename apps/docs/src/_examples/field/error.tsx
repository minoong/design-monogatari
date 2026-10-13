'use client';

import { Field, FieldError, FieldLabel } from '@repo/ui/field';
import { Input } from '@repo/ui/input';
import { useState } from 'react';

export default function FieldErrorExample() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const error = touched && value.trim() === '' ? '이름을 입력해 주십시오.' : undefined;

  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-error-name">이름</FieldLabel>
      <Input
        id="field-error-name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'field-error-name-error' : undefined}
        placeholder="입력하지 않고 벗어나 보십시오"
      />
      <FieldError id="field-error-name-error">{error}</FieldError>
    </Field>
  );
}
