import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from '@fumadocs/base-ui/layouts/spacious/page';
import { createRelativeLink } from '@fumadocs/base-ui/mdx';
import { notFound } from 'next/navigation';

import { REPOSITORY } from '@/shared/lib/layout-options';
import { getPageMarkdownUrl } from '@/shared/lib/markdown-url';
import { source } from '@/shared/lib/source';
import { getMDXComponents } from '@/shared/ui/mdx-components';

import type { DocsPageProps } from '../model/metadata';

export async function DocsContentPage(props: DocsPageProps) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${REPOSITORY.owner}/${REPOSITORY.name}/blob/main/apps/docs/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}
