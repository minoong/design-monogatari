import { cn } from '@repo/ui/cn';

const CASES: [string, string][] = [
  ['px-2 py-1', 'px-4'],
  ['text-body', 'text-caption'],
  ['text-foreground', 'text-title'],
  ['rounded-md', 'rounded-lg'],
];

export default function CnMerge() {
  return (
    <table className="w-full max-w-xl text-left text-sm">
      <thead>
        <tr className="text-muted-foreground">
          <th className="py-1 pr-4 font-semibold">cn(a, b)</th>
          <th className="py-1 font-semibold">결과</th>
        </tr>
      </thead>
      <tbody>
        {CASES.map(([a, b]) => (
          <tr key={`${a}|${b}`}>
            <td className="py-1 pr-4 font-mono">
              cn(&apos;{a}&apos;, &apos;{b}&apos;)
            </td>
            <td className="py-1 font-mono">{cn(a, b)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
