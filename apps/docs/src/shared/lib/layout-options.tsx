import type { BaseLayoutProps } from '@fumadocs/base-ui/layouts/shared';

export const REPOSITORY = { owner: 'minoong', name: 'design-monogatari' } as const;

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'design-monogatari' },
    githubUrl: `https://github.com/${REPOSITORY.owner}/${REPOSITORY.name}`,
  };
}
