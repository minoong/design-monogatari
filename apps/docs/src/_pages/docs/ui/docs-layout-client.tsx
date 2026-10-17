'use client';

import type { LayoutTab } from '@fumadocs/base-ui/layouts/shared';
import { DocsLayout } from '@fumadocs/base-ui/layouts/spacious';
import { HeaderActions } from '@fumadocs/base-ui/layouts/spacious/slots/actions';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { usePathname } from 'next/navigation';
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

const AI_WORKFLOW_URL = '/docs/ai-workflow';

function isAiWorkflowUrl(url: string) {
  return url === AI_WORKFLOW_URL || url.startsWith(`${AI_WORKFLOW_URL}/`);
}

/** 트리 안의 모든 문서 주소 */
function collectUrls(nodes: Node[], urls: string[] = []) {
  for (const node of nodes) {
    if (node.type === 'page') urls.push(node.url);
    else if (node.type === 'folder') {
      if (node.index) urls.push(node.index.url);
      collectUrls(node.children, urls);
    }
  }
  return urls;
}

/**
 * 탭은 두 개다. AI 워크플로는 `content/docs/ai-workflow/`(`root: true`)이고, 디자인 시스템은 그 밖의 모든 문서다.
 * 기존 주소를 옮기지 않으려고 폴더로 감싸지 않고 문서 주소로 활성 탭을 판별한다. 두 탭 모두 직접 만든다:
 * `getLayoutTabs`는 지금 보는 사이드바 트리 기준이라 디자인 시스템 쪽 페이지에서 AI 탭을 빠뜨린다.
 * 주소만 보고 가르므로 Fumadocs가 어떤 부분 트리를 넘겨도 활성 탭이 같다.
 */
function buildTabs(tree: Root, pathname: string): LayoutTab[] {
  // `root: true` 폴더는 `tree.children`이 아니라 `tree.fallback`에 들어 있다.
  const urls = collectUrls([...tree.children, ...(tree.fallback?.children ?? [])]);
  const inAiWorkflow = isAiWorkflowUrl(pathname);
  // 드롭다운은 현재 항목을 체크 아이콘으로만 보여 주므로, 스크린 리더용으로 `aria-current`를 직접 단다.
  return [
    {
      title: '디자인 시스템',
      description: '토큰, 컴포넌트, 유틸리티',
      url: '/docs',
      urls: new Set(['/docs', ...urls.filter((url) => !isAiWorkflowUrl(url))]),
      props: inAiWorkflow ? undefined : { 'aria-current': 'page' },
    },
    {
      title: 'AI 워크플로',
      description: '지침, 에이전트, 스킬, 훅, 루프',
      url: AI_WORKFLOW_URL,
      urls: new Set([AI_WORKFLOW_URL, ...urls.filter(isAiWorkflowUrl)]),
      props: inAiWorkflow ? { 'aria-current': 'page' } : undefined,
    },
  ];
}

/**
 * Spacious 레이아웃은 클라이언트 컴포넌트라 함수(slots)를 서버 컴포넌트에서 넘길 수 없다.
 * 서버에서 만든 페이지 트리만 받아 여기서 레이아웃을 조립한다.
 */
export function DocsLayoutClient({ tree, children }: { tree: Root; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <DocsLayout
      tree={tree}
      tabs={buildTabs(tree, pathname)}
      {...baseOptions()}
      slots={{ actions: Actions }}
    >
      {children}
    </DocsLayout>
  );
}
