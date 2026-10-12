'use client';

import { DocsLayout } from '@fumadocs/base-ui/layouts/spacious';
import { HeaderActions } from '@fumadocs/base-ui/layouts/spacious/slots/actions';
import type { Root } from 'fumadocs-core/page-tree';
import type { ComponentProps, ReactNode } from 'react';

import { baseOptions } from '@/shared/lib/layout-options';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

/** 헤더 오른쪽 액션: 눈에 띄는 테마 전환 버튼 + 기본 액션(검색 외 링크, 옵션 메뉴) */
function Actions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`}>
      <ThemeToggle />
      <HeaderActions {...props} />
    </div>
  );
}

/**
 * Spacious 레이아웃은 클라이언트 컴포넌트라 함수(slots)를 서버 컴포넌트에서 넘길 수 없다.
 * 서버에서 만든 페이지 트리만 받아 여기서 레이아웃을 조립한다.
 */
export function DocsLayoutClient({ tree, children }: { tree: Root; children: ReactNode }) {
  return (
    <DocsLayout tree={tree} {...baseOptions()} slots={{ actions: Actions }}>
      {children}
    </DocsLayout>
  );
}
