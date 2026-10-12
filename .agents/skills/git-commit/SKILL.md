---
name: git-commit
description: >-
  Git 브랜치·커밋·PR 워크플로. 작업 전 main에서 feature 브랜치, 한글 Conventional Commits.
  사용자가 커밋·push·PR·머지했어라고 하면 묻지 말고 실행. 기본 브랜치는 main(master 아님).
license: MIT
---

# Git 워크플로 (브랜치 · 커밋 · PR)

[awesome-copilot git-commit](https://github.com/github/awesome-copilot/tree/main/skills/git-commit) 워크플로를 따른다.
**커밋 메시지·PR 제목은 한글.** `main`에 직접 작업하지 않는다.

## 0. 작업 시작 — 브랜치 생성

코드 변경 **전에** `main`에서 feature 브랜치를 만든다.

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b <타입>/<짧은-설명>
```

### 브랜치 이름

```
<타입>/<kebab-case-설명>
```

| 접두사   | 예                       |
| -------- | ------------------------ |
| `feat/`  | `feat/ui-button-variant` |
| `fix/`   | `fix/web-dark-logo`      |
| `chore/` | `chore/agent-git-rules`  |
| `docs/`  | `docs/readme-verify`     |

- 영어 kebab-case, 짧고 구체적으로
- 이미 `main`에 커밋한 변경이 있으면 새 브랜치로 옮기거나 사용자에게 확인

### 금지

- `main` / `master`에서 바로 기능 개발
- 사용자 요청 없이 브랜치 삭제·force push

## 1. diff 분석

```bash
git diff --staged    # staged 있으면 우선
git diff             # 없으면 working tree
git status --porcelain
```

## 커밋 메시지 형식

```text
<타입>[선택 범위]: <한글 설명>

[본문: 사소하지 않은 변경은 필수 — 아래 "본문 작성 기준"]

[선택 footer]
```

### 본문 작성 기준

커밋 이력은 읽히는 산출물이다. 사소하지 않은 변경은 제목만으로 끝내지 말고, **PR 본문만큼 내용이 있는 본문**을 쓴다. 항목 나열이 아니라 "왜 이렇게 했는가"가 읽혀야 한다.

| 변경 종류                                                         | 본문                            |
| ----------------------------------------------------------------- | ------------------------------- |
| 기능 추가, 동작 변경, 버그 수정, 설정·인프라, 의존성, 하네스 변경 | **필수** (아래 구조)            |
| 오탈자, 포맷만 변경, 기계적 이름 변경                             | 제목만 또는 한 줄 설명으로 충분 |

본문은 빈 줄로 나눈 문단으로 쓴다. 해당 없는 문단은 빼도 된다.

1. **배경·문제**: 무엇이 왜 문제였는가. 재현 방법이나 측정값(수치, 에러 문구)이 있으면 넣는다
2. **변경과 이유**: 무엇을 어떻게 바꿨고 각각 왜 그렇게 했는가. 검토하고 버린 대안이 있으면 이유와 함께 한 줄
3. **검증**: 실행한 명령, 확인한 동작, 실패 경로를 시험한 결과. "확인했다"가 아니라 무엇을 확인했는지
4. **한계·후속**: 이번에 하지 않은 것, 알려진 제약, 이어질 작업

규칙:

- 제목은 위 형식 그대로(한글 Conventional Commits). 본문은 제목을 되풀이하지 않는다
- 줄바꿈은 읽기 좋게 약 100자 안팎. 문단 안의 목록(`-`)은 변경 항목이 여럿일 때만
- 개인 경로, 이메일, 세션 정보, 시크릿은 쓰지 않는다
- PR 본문과 겹쳐도 괜찮다. 커밋은 PR 없이도 이력만으로 이해되어야 한다

### 타입

| 타입       | 용도                         |
| ---------- | ---------------------------- |
| `feat`     | 새 기능                      |
| `fix`      | 버그 수정                    |
| `docs`     | 문서만                       |
| `style`    | 포맷·스타일 (로직 변경 없음) |
| `refactor` | 리팩터 (기능/버그 수정 아님) |
| `perf`     | 성능 개선                    |
| `test`     | 테스트 추가·수정             |
| `build`    | 빌드·의존성                  |
| `ci`       | CI 설정                      |
| `chore`    | 기타 유지보수                |
| `revert`   | 커밋 되돌림                  |

## 범위 (이 monorepo)

| scope         | 대상                                             |
| ------------- | ------------------------------------------------ |
| `ui`          | `packages/ui`                                    |
| `web`, `docs` | `apps/*`                                         |
| `turbo`       | `turbo.json`, Turborepo                          |
| `agent`       | `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.agents/` |
| `config`      | eslint/typescript/prettier 공유 설정             |

## Breaking change

```text
feat(ui)!: Button API 변경

BREAKING CHANGE: appName prop 제거, onPress로 대체
```

### 2. stage (필요 시)

```bash
git add path/to/file
git add -p           # 논리 단위로 나눌 때
```

**시크릿 금지**: `.env`, credentials, `.pnpm-store`, private keys

### 3. 메시지 생성

diff에서 판단:

- **타입**: 변경 종류
- **범위**: 영향 모듈
- **설명**: 한 줄, **한글**, 명령형·현재형, 72자 이내
- **본문**: 사소하지 않은 변경이면 "본문 작성 기준"의 문단 구조로 쓴다. diff에서 왜(원인, 측정, 대안)를 읽어 낼 수 없으면 대화 맥락과 검증 결과에서 가져온다

### 4. 커밋 실행

```bash
git commit -m "$(cat <<'EOF'
build(ui): build-storybook 결과물에서 3D 모델·HDR을 제외한다

.storybook/public은 storybook-static에 통째로 복사되므로, copy:car로 받아 둔 모델과
HDR이 로컬에 있으면 정적 빌드(배포물)에 그대로 들어간다. 모델 재배포는 라이선스
고지가 따라야 하고 HDR은 로컬 전용 방침이라, 의도치 않게 배포되면 안 된다.

- scripts/prune-storybook-models.mjs 추가: 빌드 후 storybook-static/models를 지우고,
  .gltf/.glb/.fbx/.hdr/.exr/.bin이 하나라도 남으면 실패한다
- build-storybook 스크립트 끝에 후처리를 연결해 사람이 잊어도 막히게 했다

모델이 있는 로컬에서 빌드해 17개 파일이 제외되고 로컬 원본은 그대로임을 확인했다.
후처리를 반복 실행해도 안전하고, 다른 위치에 에셋을 남기면 종료 코드 1로 실패한다.
배포된 Storybook의 3D 스토리 안내 문구는 호스팅이 정해진 뒤에 바꾼다.
EOF
)"
```

## 5. push (사용자 요청 시)

커밋 후 push는 **사용자가 명시적으로 요청했을 때만**.

```bash
git push -u origin HEAD
```

- `main` 직접 push는 사용자 요청·리뷰 없이 하지 않음
- force push to `main`/`master` 금지

## 6. PR (사용자 요청 시)

PR 생성도 **사용자 요청 시에만**. push 후 `gh` 사용.

```bash
git push -u origin HEAD

gh pr create --title "<한글 PR 제목 — 커밋 규칙과 동일>" --body "$(cat <<'EOF'
## Summary
- 변경 요약 (한글)

## Test plan
- [ ] pnpm verify
- [ ] (해당 시) 수동 확인 항목
EOF
)"
```

### PR 체크리스트

1. `git status`, `git diff`, `git log main...HEAD`로 PR 범위 확인
2. PR 제목: Conventional Commits 형식 + **한글**
3. base branch: `main`
4. Test plan에 `pnpm verify` 포함
5. PR URL을 사용자에게 반환

PR만 요청하고 push는 안 한 경우 → 먼저 push, 실패 시 사용자에게 알림.

## 7. PR 머지 후 — 로컬 `main` 동기화 (에이전트 실행)

사용자가 **「머지했어」**, **「PR 머지함」** 등 PR/브랜치 머지를 알리면, 안내 문구만 남기지 말고 **에이전트가 즉시** 아래를 실행한다.

```bash
git fetch origin
git checkout main
git pull origin main
```

그다음 `git status`와 `git log -1 --oneline`으로 동기화 결과를 짧게 확인·보고한다.

- working tree가 깨끗하고 `origin/main`과 일치하면 OK
- uncommitted 변경이 있으면 stash/커밋 여부를 사용자에게 확인
- feature 브랜치 삭제는 **사용자 요청 시에만**

## Git 안전 프로토콜

- git config 변경 금지
- `--force`, `reset --hard` 등 파괴적 명령은 사용자 명시 요청 시만
- `--no-verify` 등 hook skip은 사용자 요청 시만
- main/master force push 금지 (경고)
- hook 실패 시 amend 금지 → 문제 수정 후 **새 커밋**
- `Co-authored-by` 등 trailer는 임의로 추가하지 않는다. 단, 하네스(시스템 지침)가 커밋/PR에 붙이라고 지정한 귀속 문구가 있으면 그것은 따른다
- **사용자 요청 없이 commit / push / PR 생성 금지**
- **`main`에서 직접 작업 금지** — feature 브랜치에서 진행

## 모범 사례

- 커밋 하나 = 논리적 변경 하나
- 제목은 diff 나열하지 말고 **무엇·왜**
- 본문은 배경·변경과 이유·검증·한계를 문단으로 ("본문 작성 기준"). 변경 항목만 나열한 불릿 요약은 부족하다
- 이슈 참조 footer: `Closes #123`, `Refs #456` (번호 있을 때)
- `@repo/ui` 변경이 앱에 영향 있으면 본문에 명시

## 제목 예시

제목만 예시로 든다. 사소하지 않은 변경은 [examples.md](examples.md)처럼 본문까지 쓴다.

```
fix(web): 다크 모드 로고 미표시 문제 수정
```

```
chore(agent): git-commit skill과 한글 커밋 규칙 추가
```

```
build(config): @repo/prettier-config 패키지 추가
```

```
style: Prettier 포맷 일괄 적용
```

## 추가 예시

- [examples.md](examples.md)
