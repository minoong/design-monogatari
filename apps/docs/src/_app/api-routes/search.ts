import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/shared/lib/source';

const { GET } = createFromSource(source);

export { GET as searchGET };
