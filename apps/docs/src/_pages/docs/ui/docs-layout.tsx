import { DocsLayout } from '@fumadocs/base-ui/layouts/spacious';
import type { ReactNode } from 'react';

import { baseOptions } from '@/shared/lib/layout-options';
import { source } from '@/shared/lib/source';

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
