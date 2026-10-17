import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { createGenerator } from 'fumadocs-typescript';

const TSCONFIG_PATH = path.resolve(process.cwd(), 'tsconfig.json');
const UI_SOURCE_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  '../../packages/ui/src',
);

let generator: ReturnType<typeof createGenerator> | undefined;
let generatorBuiltFor = 0;

/** 컴포넌트 소스 중 가장 늦게 바뀐 시각. props 타입은 `ButtonProps`처럼 다른 파일에서 이어받기도 해서 폴더 전체를 본다 */
function latestSourceChange() {
  let latest = 0;
  for (const entry of readdirSync(UI_SOURCE_DIR)) {
    if (entry.endsWith('.tsx')) {
      latest = Math.max(latest, statSync(path.join(UI_SOURCE_DIR, entry)).mtimeMs);
    }
  }
  return latest;
}

/**
 * 생성기는 처음 읽은 소스를 그대로 들고 있어서, 개발 서버를 켠 채 props 타입을 고치면 표가
 * "속성이 없습니다"로 깨진다. 소스가 바뀐 것을 알아채면 새로 만든다. 빌드에서는 소스가 고정이라
 * 처음 한 번만 만들어진다.
 */
function getGenerator() {
  const latest = latestSourceChange();
  if (!generator || latest > generatorBuiltFor) {
    generator = createGenerator({ tsconfigPath: TSCONFIG_PATH });
    generatorBuiltFor = latest;
  }
  return generator;
}

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
  const [doc] = await getGenerator().generateTypeTable({
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
