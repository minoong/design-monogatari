/**
 * Fumadocs UI 문구를 한국어로 바꾸는 사전. `RootProvider`의 `i18n.translations`에 넘긴다.
 *
 * 키는 영어 원문 뒤에 쓰이는 자리 표기가 붙은 형태(예: `On this page(table of contents)`)여야 맞는다. 원문만 적으면 어느 문구와도 맞지 않아
 * 영어로 남는다. 라이브러리가 실제로 부르는 키 목록은 `node_modules/@fumadocs/base-ui/dist/.translations/keys.js`에 있다
 * (버전을 올리면 이 목록과 다시 맞춘다). 사전에 없는 키는 영어로 남는다.
 */
export const KO_TRANSLATIONS: Record<string, string> = {
  // 목차
  'On this page(table of contents)': '이 페이지의 내용',
  'No Headings(table of contents)': '제목이 없습니다',
  'Table of Contents(inline table of contents)': '목차',
  // 검색
  'Search(search trigger)': '검색',
  'Search(search dialog)': '검색',
  'Open Search(search trigger)(aria-label)': '검색 열기',
  'Close Search(search dialog)(aria-label)': '검색 닫기',
  'No results found(search dialog)': '검색 결과가 없습니다',
  // 쪽 이동과 바닥글
  'Previous Page(pagination)': '이전 문서',
  'Next Page(pagination)': '다음 문서',
  'Last updated on(page footer)': '마지막 수정',
  'Edit on GitHub(edit page)': 'GitHub에서 편집',
  // 페이지 액션
  'Ask AI(AI chat button)': 'AI에게 묻기',
  'View as Markdown(page actions)': 'Markdown으로 보기',
  'Copy Markdown(page actions)': 'Markdown 복사',
  'Copied Markdown(page actions)': 'Markdown을 복사했습니다',
  'Open(page actions)': '열기',
  'Open in GitHub(page actions)': 'GitHub에서 열기',
  'Open in ChatGPT(page actions)': 'ChatGPT에서 열기',
  'Open in Claude(page actions)': 'Claude에서 열기',
  'Open in Cursor(page actions)': 'Cursor에서 열기',
  'Open in Scira AI(page actions)': 'Scira AI에서 열기',
  'Read {url}, I want to ask questions about it.(page actions)':
    '{url}을(를) 읽어 주십시오. 이 내용에 대해 질문하고 싶습니다.',
  // 사이드바와 메뉴
  'Open Sidebar(aria-label)': '사이드바 열기',
  'Open Sidebar(sidebar)(aria-label)': '사이드바 열기',
  'Close Sidebar(aria-label)': '사이드바 닫기',
  'Close Sidebar(sidebar)(aria-label)': '사이드바 닫기',
  'Collapse Sidebar(sidebar)(aria-label)': '사이드바 접기',
  'Show Sidebar(sidebar)': '사이드바 보이기',
  'Hide Sidebar(sidebar)': '사이드바 숨기기',
  'Layout Tab(layout tab trigger)': '레이아웃 탭',
  'Options(aria-label)': '옵션',
  'Toggle Menu(home layout header)(aria-label)': '메뉴 열기 또는 닫기',
  'Close Banner(banner)(aria-label)': '배너 닫기',
  // 테마
  'Theme(site menu)': '테마',
  'Toggle Theme(theme switcher)(aria-label)': '테마 전환',
  'Light(theme switcher)(aria-label)': '라이트',
  'Dark(theme switcher)(aria-label)': '다크',
  'System(theme switcher)(aria-label)': '시스템',
  // 언어
  'Language(language switcher)': '언어',
  'Choose a language(language switcher)': '언어 선택',
  'Choose a language(language switcher)(aria-label)': '언어 선택',
  // 코드와 링크 복사
  'Copy Text(code block)(aria-label)': '코드 복사',
  'Copied Text(code block)(aria-label)': '복사했습니다',
  'Copy Anchor Link(heading anchor)(aria-label)': '링크 복사',
  'Copied Anchor Link(heading anchor)(aria-label)': '링크를 복사했습니다',
  'Copy Link(accordion)(aria-label)': '링크 복사',
  'Copied Link(accordion)(aria-label)': '링크를 복사했습니다',
  // 타입 표
  'Type(type table)': '유형',
  'Prop(type table)': '속성',
  'Default(type table)': '기본값',
  'Parameters(type table)': '매개변수',
  'Returns(type table)': '반환값',
  // 404
  'Page Not Found(404 not found page)': '페이지를 찾을 수 없습니다',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    '찾으시는 페이지가 삭제되었거나 이름이 바뀌었거나 일시적으로 이용할 수 없습니다.',
  'Back to Home(404 not found page)': '홈으로 돌아가기',
};
