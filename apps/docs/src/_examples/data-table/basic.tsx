import { DataTable, type DataTableColumn } from '@repo/ui/data-table';

type Fee = { region: string; delivery: number; registration: number };

const FEES: readonly Fee[] = [
  { region: '서울', delivery: 450_000, registration: 180_000 },
  { region: '부산', delivery: 520_000, registration: 165_000 },
  { region: '제주', delivery: 910_000, registration: 140_000 },
];

const won = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;

const COLUMNS: readonly DataTableColumn<Fee>[] = [
  { key: 'region', header: '탁송 지역', rowHeader: true },
  { key: 'delivery', header: '탁송료', numeric: true, cell: (row) => won(row.delivery) },
  { key: 'registration', header: '등록비', numeric: true, cell: (row) => won(row.registration) },
];

export default function DataTableBasic() {
  return (
    <div className="w-full max-w-lg">
      <DataTable
        caption="지역별 탁송료와 등록비"
        columns={COLUMNS}
        rows={FEES}
        getRowKey={(row) => row.region}
      />
    </div>
  );
}
