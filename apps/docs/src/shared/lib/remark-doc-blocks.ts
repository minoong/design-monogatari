import { markdownTable, replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';

import { addCommand, getInstallInfo, PACKAGE_MANAGERS } from './install-info';
import { getPropsRows, type PropsSpec } from './props-info';
import { readExampleSource, readRepoFile } from './repo-file';
import {
  type ColorSpec,
  getColorRows,
  getPaletteRows,
  getRadiusRows,
  getTypeRows,
} from './token-info';

/**
 * 문서 블록(<ComponentPreview />, <InstallTabs />, <PropsTable />, <RepoFile />)을 에이전트가 읽는
 * Markdown(`/llms-full.txt`, 페이지별 `.md`, Copy Markdown)에서 펼친다.
 *
 * 블록은 렌더링 때 예시 파일, registry.json, 소스 타입을 읽어 화면을 만든다. 그 내용이 Markdown
 * 출력에는 `<ComponentPreview name="..." />` 태그로만 남으면 에이전트가 설치 명령도 예시 코드도
 * 볼 수 없다. `replaceSource`는 Markdown 출력만 바꾸고 MDX 렌더링은 건드리지 않는다.
 * 블록이 읽는 정보를 페이지와 같은 함수(install-info, props-info, repo-file)로 읽어서 둘이 어긋나지 않는다.
 */

type Attribute = {
  type: string;
  name?: string;
  value?: string | { value: string; data?: { estree?: unknown } } | null;
};
type Node = {
  type: string;
  name?: string | null;
  attributes?: Attribute[];
  children?: Node[];
};
type Estree = {
  type: string;
  name?: string;
  value?: unknown;
  elements?: (Estree | null)[];
  properties?: { key: Estree; value: Estree }[];
  quasis?: { value: { cooked: string } }[];
  expressions?: unknown[];
  body?: Estree[];
  expression?: Estree;
};

/** MDX 표현식 속성(`include={['a']}`)의 리터럴 값을 estree에서 읽는다. 리터럴이 아니면 오류 */
function literal(node: Estree): unknown {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'ArrayExpression':
      return (node.elements ?? []).map((element) => (element ? literal(element) : null));
    case 'ObjectExpression':
      return Object.fromEntries(
        (node.properties ?? []).map((property) => {
          const key = property.key.type === 'Identifier' ? property.key.name : property.key.value;
          return [key, literal(property.value)];
        }),
      );
    case 'TemplateLiteral':
      if (node.expressions?.length === 0) {
        return node.quasis?.[0]?.value.cooked ?? '';
      }
      throw new Error('문서 블록 속성에는 표현식이 없는 값만 쓸 수 있습니다');
    default:
      throw new Error(`문서 블록 속성에는 리터럴만 쓸 수 있습니다 (${node.type})`);
  }
}

function attribute(node: Node, name: string): unknown {
  const found = node.attributes?.find(
    (attr) => attr.type === 'mdxJsxAttribute' && attr.name === name,
  );
  if (!found || found.value == null) {
    return undefined;
  }
  if (typeof found.value === 'string') {
    return found.value;
  }
  const program = found.value.data?.estree as Estree | undefined;
  const expression = program?.body?.[0]?.expression;
  if (!expression) {
    throw new Error(`${node.name}.${name} 속성을 읽을 수 없습니다`);
  }
  return literal(expression);
}

function required(node: Node, name: string): string {
  const value = attribute(node, name);
  if (typeof value !== 'string') {
    throw new Error(`<${node.name} />에는 ${name} 속성이 필요합니다`);
  }
  return value;
}

function codeBlock(code: string, lang: string, title?: string) {
  // 코드 안에 ``` 가 있어도 깨지지 않게 울타리를 늘린다
  const fence = '`'.repeat(Math.max(3, ...(code.match(/`+/g) ?? []).map((run) => run.length + 1)));
  return `${fence}${lang}${title ? ` title="${title}"` : ''}\n${code}\n${fence}`;
}

async function repoFile(path: string, lines?: string, title?: string) {
  const file = await readRepoFile(path, lines);
  return codeBlock(file.code, file.lang, title ?? (lines ? `${path}:${lines}` : path));
}

const expanders: Record<string, (node: Node) => Promise<string>> = {
  async ComponentPreview(node) {
    const name = required(node, 'name');
    const source = await readExampleSource(name);
    return codeBlock(source.code, source.lang, `${name}.tsx`);
  },

  async RepoFile(node) {
    const lines = attribute(node, 'lines');
    const title = attribute(node, 'title');
    return repoFile(
      required(node, 'path'),
      typeof lines === 'string' ? lines : undefined,
      typeof title === 'string' ? title : undefined,
    );
  },

  async InstallTabs(node) {
    const name = required(node, 'name');
    const { dependencies, needsTheme, files } = await getInstallInfo(name);
    const commands = (command: (pm: (typeof PACKAGE_MANAGERS)[number]) => string) =>
      codeBlock(PACKAGE_MANAGERS.map(command).join('\n'), 'bash');

    const sections = [
      `**CLI 설치** (패키지 매니저 중 하나를 고르십시오)`,
      commands((pm) => addCommand(pm, name)),
      `**수동 설치**: 1. 의존성을 설치합니다.`,
      commands((pm) => `${pm.add} ${dependencies.join(' ')}`),
      ...(needsTheme
        ? [
            `2. 테마 토큰(CSS 변수와 키프레임)을 설치합니다.`,
            commands((pm) => addCommand(pm, 'theme')),
          ]
        : []),
      `${needsTheme ? 3 : 2}. 아래 파일을 프로젝트에 복사합니다. \`@/lib/utils\`와 \`@/ui/…\`는 shadcn이 쓰는 별칭입니다.`,
    ];
    for (const file of files) {
      sections.push(await repoFile(file.path, undefined, file.title));
    }
    return sections.join('\n\n');
  },

  async PropsTable(node) {
    const spec: PropsSpec = {
      file: required(node, 'file'),
      name: required(node, 'name'),
      include: attribute(node, 'include') as string[],
      descriptions: attribute(node, 'descriptions') as Record<string, string>,
      defaults: attribute(node, 'defaults') as Record<string, string> | undefined,
    };
    const rows = await getPropsRows(spec);
    const cell = (value: string) => value.replace(/\|/g, '\\|');
    return markdownTable([
      ['속성', '타입', '기본값', '설명'],
      ...rows.map((row) => [
        `\`${row.name}\`${row.required ? ' (필수)' : ''}`,
        `\`${cell(row.type)}\``,
        row.default ? `\`${cell(row.default)}\`` : '-',
        cell(row.description),
      ]),
    ]);
  },
};

const cell = (value: string) => value.replace(/\|/g, '\\|');

expanders.Palette = async (node) => {
  const name = required(node, 'name') as 'neutral' | 'blue';
  const rows = await getPaletteRows(name);
  return markdownTable([
    ['단계', '값', 'Tailwind'],
    ...rows.map((row) => [`${name} ${row.step}`, `\`${row.value}\``, `\`${row.tailwind}\``]),
  ]);
};

expanders.ColorTokens = async (node) => {
  const spec: ColorSpec = {
    tokens: attribute(node, 'tokens') as string[],
    descriptions: attribute(node, 'descriptions') as Record<string, string>,
    classes: attribute(node, 'classes') as Record<string, string> | undefined,
    contrast: attribute(node, 'contrast') as Record<string, string> | undefined,
  };
  const rows = await getColorRows(spec);
  const ratio = (value: number | null) => (value == null ? '-' : `${value.toFixed(2)}:1`);
  const showContrast = rows.some((row) => row.contrast);
  return markdownTable([
    ['토큰', '라이트', '다크', ...(showContrast ? ['대비 (라이트 / 다크)'] : []), '용도'],
    ...rows.map((row) => [
      `\`${row.token}\` (\`${row.tailwind}\`)`,
      `\`${row.light}\``,
      `\`${row.dark}\``,
      ...(showContrast
        ? [
            row.contrast
              ? `${ratio(row.contrast.light)} / ${ratio(row.contrast.dark)} (${row.contrast.against} 위)`
              : '-',
          ]
        : []),
      cell(row.description),
    ]),
  ]);
};

expanders.TypeScale = async () => {
  const rows = await getTypeRows();
  return markdownTable([
    ['클래스', '크기', '줄 높이'],
    ...rows.map((row) => [`\`${row.tailwind}\``, `${row.px}px (\`${row.size}\`)`, row.lineHeight]),
  ]);
};

expanders.RadiusScale = async (node) => {
  const descriptions = attribute(node, 'descriptions') as Record<string, string>;
  const rows = await getRadiusRows();
  return markdownTable([
    ['클래스', '값', '용도'],
    ...rows.map((row) => [
      `\`${row.tailwind}\``,
      `\`${row.value}\``,
      descriptions[row.tailwind] ?? '-',
    ]),
  ]);
};

export function remarkDocBlocks() {
  return async (tree: Node, file: Parameters<typeof replaceSource>[0]) => {
    const found: Node[] = [];
    const visit = (node: Node) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Callout') {
        // 안쪽 Markdown은 그대로 두고 인용문으로 바꾼다
        const title = attribute(node, 'title');
        replaceSource(file, node as Parameters<typeof replaceSource>[1], (s) => {
          const body = s.inner(node as Parameters<typeof replaceSource>[1]).trim();
          const heading = typeof title === 'string' ? `**${title}**\n\n` : '';
          return `${heading}${body}`
            .split('\n')
            .map((line) => (line ? `> ${line}` : '>'))
            .join('\n');
        });
        return;
      }
      if (node.type === 'mdxJsxFlowElement' && node.name && node.name in expanders) {
        found.push(node);
      }
      node.children?.forEach(visit);
    };
    visit(tree);

    for (const node of found) {
      const markdown = await expanders[node.name as string]!(node);
      replaceSource(file, node as Parameters<typeof replaceSource>[1], markdown);
    }
  };
}
