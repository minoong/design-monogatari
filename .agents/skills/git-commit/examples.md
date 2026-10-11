# 커밋 메시지 예시

## 좋은 예: 본문이 필요한 변경

기능·동작·설정·하네스 변경은 배경, 변경과 이유, 검증, 한계를 문단으로 쓴다.

```
fix(docs): 문서 사이드바가 스크롤을 따라오지 않는 문제를 고친다

전역 CSS의 html, body { overflow-x: hidden }이 overflow-y를 auto로 계산하게 만들어
body가 스크롤 컨테이너가 된다. 그러면 position: sticky 요소가 viewport가 아니라 body에
붙어서, 스크롤 3000px에서 사이드바 top이 -3000으로 화면 밖으로 밀렸다 (1200, 1440,
640px 모두 재현).

overflow-x를 clip으로 바꿨다. clip은 가로 넘침은 막으면서 스크롤 컨테이너를 만들지
않는다. max-width: 100vw는 그대로 두었다. body에만 거는 방법도 검토했지만 html과 body가
함께 overflow를 갖는 구조가 원인이라 둘 다 바꾸는 편이 안전했다.

세 가지 너비에서 스크롤 3000과 6000px의 사이드바 top이 0으로 유지되고 가로 스크롤이
생기지 않음을 확인했다. 좁은 너비에서 모바일 헤더도 같은 방식으로 고정된다.
```

```
feat(harness): 훅 이벤트 로그와 트레이스 내보내기를 추가한다

Stop 게이트가 실제로 동작했다는 증거가 레포에 없었다. 훅은 모의 입력으로만 시험했고
세션에서 무엇이 표시되고 언제 차단됐는지는 기록되지 않았다.

- 판단마다 .claude/logs/hook-events.jsonl에 한 줄을 남긴다. 허용 목록으로만 통과시켜서
  프롬프트, 명령어 본문, 도구 출력은 저장하지 않고 경로는 상대 경로만 쓴다
- 모든 예외를 삼켜 로깅 실패가 Stop 차단 판단을 바꾸지 못하게 했다

비밀 문자열과 이메일을 일부러 넣어도 로그에 남지 않음을 확인했고, 로그 디렉터리를
막은 상태에서도 차단 결과가 같았다. 로그는 이후 세션부터 쌓이므로 문서용 트레이스는
실제 사례가 생긴 뒤에 뽑는다.
```

## 좋은 예: 본문이 짧아도 되는 변경

```
docs(readme): 개발 서버 포트 표기를 3000/3001로 바로잡는다
```

```
style: Prettier 포맷 일괄 적용
```

## 제목 형식 예 (본문은 위 기준대로 추가)

```
perf(web): ThemeImage 이중 Image 렌더 최적화
```

```
ci: PR에서 pnpm verify 실행 워크플로 추가
```

```
revert: "feat(ui): Modal 추가" 되돌림

접근성 이슈로 롤백. Refs #42
```

```
feat(ui)!: Button onClick 시그니처 변경

BREAKING CHANGE: appName prop 제거, children만 받음
```

## 나쁜 예

| 나쁜 예            | 수정                                        |
| ------------------ | ------------------------------------------- |
| `feat: add button` | `feat(ui): Button variant prop 추가`        |
| `update`           | `chore(turbo): build task description 추가` |
| `fix bug`          | `fix(docs): typegen 후 tsc 실패 수정`       |
| `WIP`              | 작업 완료 후 의미 있는 한글 제목            |

## 나쁜 본문

사소하지 않은 변경인데 본문이 변경 항목을 나열하기만 하는 경우다. 왜 그렇게 했는지, 무엇을
확인했는지가 없다.

```
chore(docs): 문서 앱 도구를 준비한다

- Prettier에 mdx 추가
- lint-staged 수정
- overflow-x를 clip으로 변경
- 링크 리셋 삭제
```

수정: 문제(sticky가 깨지는 측정값과 원인), 각 변경의 이유, 검증한 것(임시 mdx로 포맷 검사
실패/통과 확인, 생성물 무시 확인, 화면 회귀), 한계를 문단으로 쓴다.

## PR 제목 (squash merge)

커밋 규칙과 동일 (한글 Conventional Commits):

```
feat(ui): Storybook 앱 추가 및 Button 스토리 co-location
```

## 브랜치 예시

| 작업           | 브랜치                         |
| -------------- | ------------------------------ |
| Button variant | `feat/ui-button-variant`       |
| git skill 추가 | `chore/agent-git-commit-skill` |
| README 수정    | `docs/readme-verify`           |
