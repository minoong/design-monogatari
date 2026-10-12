import { llms, loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // 페이지 Markdown(llms.txt, 페이지별 .md)을 만들려면 처리된 본문을 보관해야 한다
    postprocess: { includeProcessedMarkdown: true },
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

/** 에이전트와 검색 도구가 읽는 형태: llms.txt 색인, 전체 본문, 페이지별 Markdown */
export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
