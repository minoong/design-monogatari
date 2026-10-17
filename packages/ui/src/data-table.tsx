import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from './lib/cn';

export type DataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  /** 셀에 보일 값. 없으면 `row[key]`를 그대로 보입니다. */
  cell?: (row: Row) => ReactNode;
  /** 금액처럼 오른쪽에 맞추고 자릿수를 가지런히 합니다. */
  numeric?: boolean;
  /** 이 열을 행의 이름으로 씁니다(`th scope="row"`). 행마다 하나만 둡니다. */
  rowHeader?: boolean;
};

export type DataTableProps<Row> = Omit<ComponentProps<'div'>, 'children'> & {
  /** 표의 이름. 스크린 리더가 표에 들어갈 때 먼저 읽습니다. */
  caption: ReactNode;
  /** 화면에서는 숨기고 스크린 리더에만 읽힙니다. */
  captionHidden?: boolean;
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row, index: number) => string;
  /** 합계 줄. 열 `key`별로 값을 줍니다. */
  footer?: Partial<Record<string, ReactNode>>;
};

/**
 * 부대비용·등록비처럼 행과 열로 읽는 자료를 보여 주는 시맨틱 표입니다. 표 이름(`caption`)이 필수이고,
 * 금액 같은 숫자 칸은 줄바꿈하지 않고, 칸이 모자라면 표가 가로로 스크롤됩니다.
 */
export function DataTable<Row>({
  caption,
  captionHidden = false,
  columns,
  rows,
  getRowKey,
  footer,
  className,
  ...props
}: DataTableProps<Row>) {
  const captionId = useId();
  const valueOf = (row: Row, column: DataTableColumn<Row>): ReactNode =>
    column.cell ? column.cell(row) : ((row as Record<string, unknown>)[column.key] as ReactNode);
  const alignment = (column: DataTableColumn<Row>) =>
    column.numeric ? 'text-right tabular-nums whitespace-nowrap' : 'text-left';

  return (
    // 좁은 화면에서 표가 넘치면 가로로 스크롤한다. 키보드로 스크롤할 수 있게 초점을 받고, 표 이름을 영역 이름으로 쓴다.
    <div
      role="region"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 넘칠 때 스크롤되는 영역은 키보드 초점을 받아야 한다 (axe scrollable-region-focusable)
      tabIndex={0}
      aria-labelledby={captionId}
      className={cn(
        'border-border bg-card focus-visible:outline-ring overflow-x-auto rounded-lg border font-sans focus-visible:outline-2 focus-visible:-outline-offset-2',
        className,
      )}
      {...props}
    >
      <table
        aria-labelledby={captionHidden ? captionId : undefined}
        className="w-full border-collapse text-sm"
      >
        <caption
          id={captionId}
          className={cn(
            captionHidden
              ? 'sr-only'
              : 'border-border text-foreground border-b px-4 py-3 text-left font-semibold',
          )}
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-border bg-muted text-muted-foreground border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-2.5 font-medium wrap-break-word break-keep',
                  alignment(column),
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)} className="border-border border-b last:border-b-0">
              {columns.map((column) =>
                column.rowHeader ? (
                  <th
                    key={column.key}
                    scope="row"
                    className={cn(
                      'px-4 py-3 font-medium wrap-break-word break-keep',
                      alignment(column),
                    )}
                  >
                    {valueOf(row, column)}
                  </th>
                ) : (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 wrap-break-word break-keep', alignment(column))}
                  >
                    {valueOf(row, column)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot>
            <tr className="border-border bg-muted border-t font-semibold">
              {columns.map((column) =>
                column.rowHeader && footer[column.key] != null ? (
                  <th
                    key={column.key}
                    scope="row"
                    className={cn('px-4 py-3 wrap-break-word break-keep', alignment(column))}
                  >
                    {footer[column.key]}
                  </th>
                ) : (
                  <td key={column.key} className={cn('px-4 py-3', alignment(column))}>
                    {footer[column.key]}
                  </td>
                ),
              )}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
