import { TypeTable } from '@fumadocs/base-ui/components/type-table';

import { getPropsRows, type PropsSpec } from '@/shared/lib/props-info';

/** 컴포넌트의 props 표. 타입 값은 선언에서 읽고, 설명과 기본값은 문서에서 준다 */
export async function PropsTable(spec: PropsSpec) {
  const rows = await getPropsRows(spec);

  const type = Object.fromEntries(
    rows.map((row) => [
      row.name,
      {
        type: row.type,
        description: row.description,
        default: row.default,
        required: row.required,
      },
    ]),
  );

  return <TypeTable type={type} />;
}
