import Link from 'next/link';

export function HomeFooter() {
  return (
    <footer className="border-border mt-6 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6">
        <p className="m-0">design-monogatari · 비공식 포트폴리오이며 BMW와 무관합니다.</p>
        <nav aria-label="바닥글" className="flex flex-wrap gap-4">
          <Link href="/docs">문서</Link>
          <Link href="/docs/ai-workflow">AI 워크플로</Link>
          <Link href="/llms.txt">llms.txt</Link>
          <a href="https://github.com/minoong/design-monogatari">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
