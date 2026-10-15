/**
 * 스토리 `argTypes`용 도우미. react-docgen이 ReactNode·함수·객체 props의 컨트롤을 추론하지 못하면
 * 컨트롤 칸에 "Setup controls" 링크가 뜬다. 컴포넌트마다 그 props만 골라 정해 둔다.
 */

/** 글자로 넘겨도 되는 props: 글자 입력 컨트롤 */
export function textControls(...names: string[]) {
  return Object.fromEntries(names.map((name) => [name, { control: 'text' as const }]));
}

/** 컨트롤로 다룰 수 없는 props(노드, 함수, 객체, 배열): 컨트롤 칸이 "-"로 보인다. */
export function noControls(...names: string[]) {
  return Object.fromEntries(names.map((name) => [name, { control: false as const }]));
}
