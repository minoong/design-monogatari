'use client';

import { List, ListItem } from '@repo/ui/list';
import { useState } from 'react';

const LABELS: Record<string, string> = {
  black: '블랙 비건 가죽',
  cognac: '코냑 비건 가죽',
  ivory: '아이보리 화이트',
};

export default function ListBasic() {
  const [color, setColor] = useState('black');

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <List selectable aria-label="내장 색상" value={color} onValueChange={setColor}>
        <ListItem value="black">블랙 비건 가죽</ListItem>
        <ListItem value="cognac">코냑 비건 가죽</ListItem>
        <ListItem value="ivory">아이보리 화이트</ListItem>
        <ListItem value="tartufo" disabled>
          타르투포 (재고 없음)
        </ListItem>
      </List>
      <p className="text-muted-foreground text-caption">선택: {LABELS[color]}</p>
    </div>
  );
}
