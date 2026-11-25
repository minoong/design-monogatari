/** 설치 구역의 두 명령과 설명. */
export const INSTALL_STEPS = [
  {
    title: '프로젝트 준비',
    command: 'pnpm dlx shadcn@latest init -b radix',
    note: 'Tailwind CSS v4와 Radix 기반이 필요합니다. 기본값(-d)은 Base UI라 Dialog가 깨집니다.',
  },
  {
    title: '컴포넌트 추가',
    command: 'pnpm dlx shadcn@latest add minoong/design-monogatari/switch-field',
    note: '의존하는 컴포넌트와 테마가 함께 설치됩니다. 파일이 복사되므로 자유롭게 고칠 수 있습니다.',
  },
] as const;
