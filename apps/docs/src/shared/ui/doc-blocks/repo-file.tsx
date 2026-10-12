import { ServerCodeBlock } from '@fumadocs/base-ui/components/codeblock.rsc';

import { readRepoFile } from '@/shared/lib/repo-file';

type RepoFileProps = {
  /** 저장소 루트 기준 경로 */
  path: string;
  /** "12-30" 처럼 줄 범위. 생략하면 파일 전체 */
  lines?: string;
  lang?: string;
  title?: string;
};

/** 저장소 파일을 빌드 시 읽어 코드 블록으로 보여 준다 */
export async function RepoFile({ path, lines, lang, title }: RepoFileProps) {
  const file = await readRepoFile(path, lines);

  return (
    <ServerCodeBlock
      code={file.code}
      lang={lang ?? file.lang}
      codeblock={{ title: title ?? (lines ? `${path}:${lines}` : path) }}
    />
  );
}
