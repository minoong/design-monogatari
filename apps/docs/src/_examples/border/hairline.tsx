const ITEMS = ['보내는 계좌', '받는 분', '이체 금액'];

export default function BorderHairline() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-background border-border size-16 rounded-md border" />
          <code className="text-xs">border-border</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-background border-primary size-16 rounded-md border" />
          <code className="text-xs">border-primary</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-background ring-ring size-16 rounded-md ring-2" />
          <code className="text-xs">ring-2 ring-ring</code>
        </div>
      </div>
      <div className="border-border bg-card overflow-hidden rounded-md border">
        {ITEMS.map((item) => (
          <div
            key={item}
            className="border-border text-foreground border-b px-4 py-3 text-sm last:border-b-0"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
