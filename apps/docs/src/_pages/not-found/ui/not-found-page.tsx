import { HomeLayout } from '@fumadocs/base-ui/layouts/home';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { baseOptions } from '@/shared/lib/layout-options';

/** 없는 주소의 안내 화면. Next 기본 영어 404 대신, 소개 페이지와 같은 헤더 아래에 한국어로 보이고 돌아갈 길을 준다. */
export function NotFoundPage() {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { text: '문서', url: '/docs', active: 'nested-url' },
        { text: '컴포넌트', url: '/docs/components/button', active: 'nested-url' },
        { text: 'AI 워크플로', url: '/docs/ai-workflow', active: 'nested-url' },
      ]}
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center break-keep">
        <p className="text-primary m-0 font-mono text-sm font-medium">404</p>
        <h1 className="m-0 mt-3 text-3xl font-medium tracking-tight text-balance md:text-4xl">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-muted-foreground mt-4 mb-0 text-base leading-7 text-pretty">
          찾으시는 페이지가 삭제되었거나 이름이 바뀌었거나 일시적으로 이용할 수 없습니다. 주소를
          다시 확인하시거나 아래에서 이동하십시오.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild radius="pill" variant="primary">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
          <Button asChild radius="pill" variant="secondary">
            <Link href="/docs">문서 보기</Link>
          </Button>
        </div>
      </div>
    </HomeLayout>
  );
}
