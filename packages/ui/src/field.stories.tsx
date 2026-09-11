import type { Meta, StoryObj } from '@storybook/react';

import { Field, FieldError, FieldLabel } from './field';
import { Input } from './input';

const meta = {
  title: '컴포넌트/필드',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Field`는 라벨·입력·오류를 한 세트로 묶어요. `FieldLabel`의 `htmlFor`와 입력 `id`를 짝짓고, 오류가 있으면 입력 `aria-describedby`와 `FieldError`의 `id`를 연결해 주세요.',
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-email">이메일</FieldLabel>
      <Input id="field-email" type="email" placeholder="you@example.com" />
    </Field>
  ),
};

export const 오류: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-email-invalid">이메일</FieldLabel>
      <Input
        id="field-email-invalid"
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        aria-describedby="field-email-invalid-error"
      />
      <FieldError id="field-email-invalid-error">올바른 이메일을 입력해 주세요.</FieldError>
    </Field>
  ),
};
