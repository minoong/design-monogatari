import path from 'node:path';

import { createGenerator } from 'fumadocs-typescript';

const generator = createGenerator({ tsconfigPath: path.resolve(process.cwd(), 'tsconfig.json') });

export type PropsSpec = {
  /** 타입이 선언된 파일. 저장소 루트 기준 */
  file: string;
  /** 내보낸 타입 이름 (예: ButtonProps) */
  name: string;
  /**
   * 표에 올릴 props. HTML 속성을 상속하는 컴포넌트는 수백 개가 나오므로 우리가 정의한
   * props만 이름으로 고른다. 타입 값은 선언에서 자동으로 읽는다.
   */
  include: string[];
  /** props별 한국어 설명 */
  descriptions: Record<string, string>;
  /** props별 기본값. cva `defaultVariants`와 어긋나지 않게 컴포넌트 변경 때 함께 고친다 */
  defaults?: Record<string, string>;
};

export type PropsRow = {
  name: string;
  type: string;
  description: string;
  default?: string;
  required: boolean;
};

/** `| null | undefined`는 optional 표기와 겹쳐서 뺀다 */
function cleanType(type: string) {
  return type
    .split(' | ')
    .filter((part) => part !== 'null' && part !== 'undefined')
    .join(' | ');
}

/** props 표의 행. 타입 값은 선언에서 읽고, 설명과 기본값은 문서에서 준다 */
export async function getPropsRows({
  file,
  name,
  include,
  descriptions,
  defaults = {},
}: PropsSpec): Promise<PropsRow[]> {
  const [doc] = await generator.generateTypeTable({
    // 빌드 때만 실행된다 (repo-file.ts 의 같은 주석 참고)
    path: path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', file),
    name,
  });
  const entries = new Map(doc?.entries.map((entry) => [entry.name, entry]));

  return include.map((prop) => {
    const entry = entries.get(prop);
    if (!entry) {
      throw new Error(`${name} 에 ${prop} 속성이 없습니다`);
    }
    const description = descriptions[prop];
    if (!description) {
      throw new Error(`${name}.${prop} 의 설명이 없습니다`);
    }
    return {
      name: prop,
      type: cleanType(entry.type),
      description,
      default: defaults[prop],
      required: entry.required,
    };
  });
}
