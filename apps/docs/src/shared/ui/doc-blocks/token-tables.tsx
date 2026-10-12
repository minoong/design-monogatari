import {
  type ColorSpec,
  getColorRows,
  getPaletteRows,
  getRadiusRows,
  getTypeRows,
} from '@/shared/lib/token-info';

function Swatch({ value }: { value: string }) {
  // 값은 토큰 파일에서 읽은 실제 값이다. 컴포넌트에 색을 적는 것이 아니라 토큰을 보여 주는 용도
  return (
    <span
      aria-hidden
      className="border-fd-border mr-2 inline-block size-4 rounded-full border align-middle"
      style={{ background: value }}
    />
  );
}

function ratio(value: number | null | undefined) {
  return value == null ? '-' : `${value.toFixed(2)}:1`;
}

/** 원시 스케일 한 줄. 모드가 바뀌어도 값이 같다 */
export async function Palette({ name }: { name: 'neutral' | 'blue' }) {
  const rows = await getPaletteRows(name);

  return (
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {rows.map((row) => (
        <div key={row.step} className="border-fd-border overflow-hidden rounded-md border text-sm">
          <div aria-hidden className="h-12" style={{ background: row.value }} />
          <div className="p-2">
            <div className="font-medium">
              {name} {row.step}
            </div>
            <code className="text-fd-muted-foreground text-xs">{row.value}</code>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 의미 토큰 표: 라이트/다크 값, Tailwind 클래스, 용도, (글자 토큰은) 배경 대비 */
export async function ColorTokens(spec: ColorSpec) {
  const rows = await getColorRows(spec);
  const showContrast = rows.some((row) => row.contrast);

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>토큰</th>
            <th>라이트</th>
            <th>다크</th>
            {showContrast ? <th>대비 (라이트 / 다크)</th> : null}
            <th>용도</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.token}>
              <td>
                <code>{row.token}</code>
                <br />
                <code className="text-fd-muted-foreground text-xs">{row.tailwind}</code>
              </td>
              <td className="whitespace-nowrap">
                <Swatch value={row.light} />
                <code>{row.light}</code>
              </td>
              <td className="whitespace-nowrap">
                <Swatch value={row.dark} />
                <code>{row.dark}</code>
              </td>
              {showContrast ? (
                <td className="whitespace-nowrap">
                  {row.contrast
                    ? `${ratio(row.contrast.light)} / ${ratio(row.contrast.dark)} (${row.contrast.against} 위)`
                    : '-'}
                </td>
              ) : null}
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 글자 역할 토큰: 크기와 줄 높이 */
export async function TypeScale() {
  const rows = await getTypeRows();

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>클래스</th>
            <th>크기</th>
            <th>줄 높이</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.token}>
              <td>
                <code>{row.tailwind}</code>
              </td>
              <td>
                {row.px}px <code className="text-fd-muted-foreground text-xs">{row.size}</code>
              </td>
              <td>{row.lineHeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 모서리 반경 토큰 */
export async function RadiusScale({ descriptions }: { descriptions: Record<string, string> }) {
  const rows = await getRadiusRows();

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>클래스</th>
            <th>값</th>
            <th>용도</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.token}>
              <td>
                <code>{row.tailwind}</code>
              </td>
              <td>
                <code>{row.value}</code>
              </td>
              <td>{descriptions[row.tailwind] ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
