import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { source } from '@/shared/lib/source';

export type DocsPageProps = { params: Promise<{ slug?: string[] }> };

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: DocsPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) {
    notFound();
  }
  return { title: page.data.title, description: page.data.description };
}
