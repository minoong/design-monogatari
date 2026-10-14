# Git 워크플로

코드 변경 시 `git-commit` skill(`.agents/skills/git-commit/SKILL.md`)을 따른다.

1. **작업 시작**: `main`에서 feature 브랜치 생성 (`feat/…`, `fix/…`, `chore/…`). 기본 브랜치는 `main`(master 아님).
2. **`main`에 직접 작업·커밋 금지**
3. **커밋**: diff 분석 → 한글 Conventional Commit, 본문에 배경·변경 이유·검증·한계
4. **push / PR**: 검증(`pnpm verify`, UI는 `ui-verifier`)이 끝나면 에이전트가 직접 한다. PR은 **한 번에 하나**: 사용자가 머지했다고 알린 뒤 다음 PR을 연다. `main` 직접 push·force push·브랜치 삭제는 요청 없이 하지 않는다
5. PR 제목·본문 한글, test plan에 `pnpm verify`
6. **PR 머지 알림** (「머지했어」 등): 에이전트가 `git checkout main && git pull origin main` 실행 — 사용자에게 명령만 안내하지 않음
