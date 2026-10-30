import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ChangeDiffRow = {
  /** 바뀌는 항목의 이름 (예: "휠") */
  label: ReactNode;
  /** 이전 선택. 없으면 새로 추가되는 항목입니다. */
  before?: ReactNode;
  /** 변경 후 선택. 없으면 삭제되는 항목입니다. */
  after?: ReactNode;
};

export type ChangeDiffProps = Omit<ComponentProps<'div'>, 'children'> & {
  rows: readonly ChangeDiffRow[];
  /** 스크린 리더용 표 이름 */
  caption?: string;
  itemLabel?: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** 합계 줄에 보일 값 (예: "+₩1,500,000") */
  summary?: ReactNode;
  summaryLabel?: string;
  /** 상태 표식과 빈 칸에 쓰는 글자 */
  statusLabels?: { added: string; removed: string; changed: string; empty: string };
};

const DEFAULT_STATUS = { added: '추가', removed: '삭제', changed: '변경', empty: '없음' };

function statusOf(row: ChangeDiffRow) {
  if (row.before === undefined && row.after !== undefined) return 'added';
  if (row.after === undefined) return 'removed';
  return 'changed';
}

/**
 * 선택을 바꾸면 무엇이 달라지는지 이전 선택과 변경 후를 두 열로 보여 줍니다. 추가·삭제·변경은 색이 아니라 글자 표식으로
 * 구분합니다. 확인 모달 안에 넣어 쓰고, 확인하기 전까지 URL과 가격은 바뀌지 않아야 합니다.
 */
export function ChangeDiff({
  rows,
  caption = '변경 내용',
  itemLabel = '항목',
  beforeLabel = '이전 선택',
  afterLabel = '변경 후',
  summary,
  summaryLabel = '가격 변동',
  statusLabels = DEFAULT_STATUS,
  className,
  ...props
}: ChangeDiffProps) {
  const cell = (value: ReactNode | undefined) =>
    value === undefined ? (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">{statusLabels.empty}</span>
      </>
    ) : (
      value
    );

  return (
    <div
      className={cn('border-border bg-card overflow-hidden rounded-lg border font-sans', className)}
      {...props}
    >
      <table className="w-full table-fixed border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-border bg-muted text-muted-foreground border-b text-left">
            <th scope="col" className="w-[34%] px-4 py-2.5 font-medium wrap-break-word">
              {itemLabel}
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium wrap-break-word">
              {beforeLabel}
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium wrap-break-word">
              {afterLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const status = statusOf(row);
            return (
              <tr key={index} className="border-border border-b align-top last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left font-medium wrap-break-word">
                  <span className="block">{row.label}</span>
                  <span className="border-border bg-muted text-muted-foreground mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold">
                    {statusLabels[status]}
                  </span>
                </th>
                <td className="text-muted-foreground px-4 py-3 wrap-break-word">
                  {cell(row.before)}
                </td>
                <td className="text-foreground px-4 py-3 font-medium wrap-break-word">
                  {cell(row.after)}
                </td>
              </tr>
            );
          })}
        </tbody>
        {summary !== undefined ? (
          <tfoot>
            <tr className="border-border bg-muted border-t">
              <th
                scope="row"
                className="text-muted-foreground px-4 py-3 text-left font-normal wrap-break-word"
              >
                {summaryLabel}
              </th>
              <td colSpan={2} className="px-4 py-3 text-right font-semibold tabular-nums">
                {summary}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
