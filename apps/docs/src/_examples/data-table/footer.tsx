import { DataTable, type DataTableColumn } from '@repo/ui/data-table';

type Item = { name: string; amount: number };

const ITEMS: readonly Item[] = [
  { name: '취득세', amount: 5_803_000 },
  { name: '공채 매입', amount: 1_200_000 },
  { name: '번호판·증지대', amount: 62_000 },
];

const won = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;

const COLUMNS: readonly DataTableColumn<Item>[] = [
  { key: 'name', header: '항목', rowHeader: true },
  { key: 'amount', header: '금액', numeric: true, cell: (row) => won(row.amount) },
];

export default function DataTableFooter() {
  return (
    <div className="w-full max-w-lg">
      <DataTable
        caption="등록에 드는 비용"
        columns={COLUMNS}
        rows={ITEMS}
        getRowKey={(row) => row.name}
        footer={{ name: '합계', amount: won(7_065_000) }}
      />
    </div>
  );
}
