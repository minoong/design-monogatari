import { List, ListItem } from '@repo/ui/list';

export default function ListPlain() {
  return (
    <List className="w-full max-w-sm">
      <ListItem>어댑티브 LED 헤드라이트</ListItem>
      <ListItem>파노라마 글라스 루프</ListItem>
      <ListItem>어댑티브 M 서스펜션</ListItem>
      <ListItem>하만카돈 사운드 시스템</ListItem>
    </List>
  );
}
