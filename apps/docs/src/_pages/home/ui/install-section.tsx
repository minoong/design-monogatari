import { CopyButton } from '@repo/ui/copy-button';

const STEPS = [
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

/** 설치 구역: 두 명령과 복사 버튼. 자세한 내용은 소개 문서로 이어진다. */
export function InstallSection() {
  return (
    <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
      {STEPS.map((step, index) => (
        <li key={step.title} className="border-border bg-card m-0 min-w-0 rounded-xl border p-5">
          <p className="m-0 mb-3 text-sm font-semibold">
            <span className="text-primary mr-2 font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            {step.title}
          </p>
          <div className="border-border bg-background flex items-center gap-2 overflow-hidden rounded-lg border py-1.5 pr-1.5 pl-3">
            <code className="min-w-0 flex-1 font-mono text-xs leading-6 wrap-anywhere">
              {step.command}
            </code>
            <CopyButton
              iconOnly
              label={`${step.title} 명령 복사`}
              size="small"
              value={step.command}
            />
          </div>
          <p className="text-muted-foreground m-0 mt-3 text-sm leading-6">{step.note}</p>
        </li>
      ))}
    </ol>
  );
}
