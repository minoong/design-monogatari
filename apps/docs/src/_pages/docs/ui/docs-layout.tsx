import type { ReactNode } from 'react';

import { source } from '@/shared/lib/source';

import { DocsLayoutClient } from './docs-layout-client';

export function DocsShell({ children }: { children: ReactNode }) {
  return <DocsLayoutClient tree={source.getPageTree()}>{children}</DocsLayoutClient>;
}
