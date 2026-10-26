import { getPaletteRows } from '@/shared/lib/token-info';

/** 값이 오래돼 틀어지지 않게 `registry.json`의 theme 항목에서 읽는다(문서의 색 페이지와 같은 출처). */
async function Scale({ name, label }: { name: 'blue' | 'neutral'; label: string }) {
  const rows = await getPaletteRows(name);
  return (
    <div>
      <p className="text-muted-foreground mb-2 text-sm">{label}</p>
      <ul className="m-0 flex list-none overflow-hidden rounded-lg border border-(--color-border) p-0">
        {rows.map((row) => (
          <li key={row.step} className="m-0 min-w-0 flex-1" title={`${row.tailwind} ${row.value}`}>
            <div className="h-14 md:h-20" style={{ backgroundColor: row.value }} />
            <p className="text-muted-foreground m-0 overflow-hidden px-0 py-1.5 text-center text-[9px] tracking-tighter md:px-1 md:text-xs md:tracking-normal">
              {row.step}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TYPE_SAMPLES = [
  { className: 'text-4xl font-semibold tracking-tight', label: 'Display', text: '차분한 화면' },
  {
    className: 'text-2xl font-semibold tracking-tight',
    label: 'Title',
    text: '외장 색상을 고르십시오',
  },
  {
    className: 'text-base',
    label: 'Body',
    text: '선택한 옵션은 견적 요약에서 다시 확인할 수 있습니다.',
  },
  {
    className: 'text-sm text-muted-foreground',
    label: 'Caption',
    text: '이미지는 실제 차량과 다를 수 있습니다.',
  },
] as const;

/** 토큰 견본: 파랑과 뉴트럴 스케일, 글자 크기. 문서의 색, 타이포그래피 페이지로 이어진다. */
export async function TokenSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="border-border bg-card flex flex-col gap-6 rounded-xl border p-6">
        <Scale label="Action Blue" name="blue" />
        <Scale label="Neutral" name="neutral" />
        <p className="text-muted-foreground m-0 text-sm leading-6">
          강조색은 Action Blue 하나입니다. 의미 토큰(<code>bg-primary</code>,{' '}
          <code>border-border</code>)이 이 스케일을 라이트와 다크에 맞춰 고릅니다.
        </p>
      </div>
      <div className="border-border bg-card flex flex-col justify-between gap-5 rounded-xl border p-6">
        {TYPE_SAMPLES.map((sample) => (
          <div key={sample.label} className="min-w-0">
            <p className="text-muted-foreground m-0 mb-1 font-mono text-xs">{sample.label}</p>
            <p className={`m-0 ${sample.className}`}>{sample.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
