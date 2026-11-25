import { remarkSteps } from 'fumadocs-core/mdx-plugins';
import { llms, loader } from 'fumadocs-core/source';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { defineDocs } from 'fumadocs-mdx/macro';

import { iconFor } from '@/shared/ui/section-icons';

import { remarkDocBlocks } from './remark-doc-blocks';

/** 검색 레코드에 태그로 남기는 요소. 나머지 요소는 안쪽 내용만 색인한다 */
const SEARCH_KEPT_ELEMENTS = new Set(['File', 'TypeTable', 'Callout', 'Card']);

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // 문서 블록을 Markdown 출력에서 펼친다 (렌더링에는 영향 없음). 컬렉션에 mdxOptions 를 직접 주면
    // 기본 프리셋(검색용 구조화 데이터, 목차 등)이 통째로 빠지므로 applyMdxPreset 으로 감싼다
    // remarkSteps: `### 제목 [step]` 제목을 번호가 붙은 단계(본문과 목차)로 바꾼다. 제목 id를 만드는 프리셋보다 먼저 돌려야 id에 `-step`이 붙지 않는다
    mdxOptions: applyMdxPreset({
      // fumadocs-mdx 15.6부터 `fumadocs-mdx/macro` 컬렉션의 검색 레코드는 모든 컴포넌트 요소를 기본으로 남긴다. 그러면 `<InstallTabs name="toast" />` 같은
      // 태그 글자가 레코드가 되어 실제 본문 레코드를 밀어낸다. 이전 기본값(안쪽 글자만 색인하는 요소 넷)으로 되돌린다.
      remarkStructureOptions: {
        filterElement: (node) => SEARCH_KEPT_ELEMENTS.has(String(node.name)),
      },
      remarkPlugins: (plugins) => [remarkSteps, ...plugins, remarkDocBlocks],
    }),
    // 페이지 Markdown(llms.txt, 페이지별 .md)을 만들려면 처리된 본문을 보관해야 한다.
    // `output: 'string'`: fumadocs-mdx 15.6부터 `fumadocs-mdx/macro`의 컬렉션은 처리된 Markdown을 런타임에 컴포넌트로 렌더링하고,
    // 대문자 JSX 요소를 `replaceSource`보다 나중에 자기 규칙으로 덮어쓴다. 그러면 문서 블록과 Callout이 펼쳐지지 않은 채 태그로 남는다.
    // 문자열(정적) 출력으로 고정하면 `remark-doc-blocks`의 치환이 그대로 적용된다. `<show>`는 정적 출력에서 오류라 쓰지 않는다.
    postprocess: { includeProcessedMarkdown: { output: 'string' } },
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  // 프런트매터와 meta.json의 `icon`(이름 문자열)을 사이드바 아이콘으로 바꾼다.
  icon: iconFor,
});

/** 에이전트와 검색 도구가 읽는 형태: llms.txt 색인, 전체 본문, 페이지별 Markdown */
export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${(await page.data.getText('processed')).replaceAll(' [step]', '')}`,
});
