import { nextJsConfig } from '@repo/eslint-config/next-js';
import { withTailwindCss } from '@repo/eslint-config/tailwind';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    // React Bits에서 설치한 외부 컴포넌트(인트로 한정, components.json의 @react-bits 레지스트리). 원본 그대로 두는 코드라
    // 우리 린트 규칙(Tailwind 클래스 검사, 훅 규칙 등)을 적용하지 않는다. 타입 검사와 Prettier는 적용한다.
    ignores: ['src/_pages/intro/ui/react-bits/**'],
  },
  ...withTailwindCss(nextJsConfig, './src/_app/styles/globals.css'),
];
