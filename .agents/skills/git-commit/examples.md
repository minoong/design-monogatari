# 커밋 메시지 예시

## 좋은 예

```
feat(ui): Modal 컴포넌트와 포커스 트랩 추가

ESC·오버레이 클릭으로 닫기. aria 속성 포함.
```

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
