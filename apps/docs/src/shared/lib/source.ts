import { remarkSteps } from 'fumadocs-core/mdx-plugins';
import { llms, loader } from 'fumadocs-core/source';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { defineDocs } from 'fumadocs-mdx/macro';

import { remarkDocBlocks } from './remark-doc-blocks';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // 문서 블록을 Markdown 출력에서 펼친다 (렌더링에는 영향 없음). 컬렉션에 mdxOptions 를 직접 주면
    // 기본 프리셋(검색용 구조화 데이터, 목차 등)이 통째로 빠지므로 applyMdxPreset 으로 감싼다
    // remarkSteps: `### 제목 [step]` 제목을 번호가 붙은 단계(본문과 목차)로 바꾼다. 제목 id를 만드는 프리셋보다 먼저 돌려야 id에 `-step`이 붙지 않는다
    mdxOptions: applyMdxPreset({
      remarkPlugins: (plugins) => [remarkSteps, ...plugins, remarkDocBlocks],
    }),
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

${(await page.data.getText('processed')).replaceAll(' [step]', '')}`,
});
