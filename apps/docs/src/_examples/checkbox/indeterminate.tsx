'use client';

import { Checkbox } from '@repo/ui/checkbox';
import { Label } from '@repo/ui/label';
import { useState } from 'react';

const ITEMS = ['바닥 매트', '블랙박스', '견인 장치'] as const;

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<readonly string[]>(['블랙박스']);
  const all = selected.length === ITEMS.length;
  const some = selected.length > 0 && !all;

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="text-foreground mb-3 p-0 text-sm font-semibold">액세서리</legend>
      <div className="flex items-center gap-2">
        <Checkbox
          id="checkbox-all"
          checked={all}
          indeterminate={some}
          onChange={() => {
            setSelected(all ? [] : ITEMS);
          }}
        />
        <Label htmlFor="checkbox-all" id="checkbox-all-label">
          전체 선택
        </Label>
      </div>
      <div role="group" aria-labelledby="checkbox-all-label" className="flex flex-col gap-3 pl-7">
        {ITEMS.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <Checkbox
              id={`checkbox-item-${index}`}
              checked={selected.includes(item)}
              onChange={(event) => {
                setSelected((current) =>
                  event.target.checked ? [...current, item] : current.filter((it) => it !== item),
                );
              }}
            />
            <Label htmlFor={`checkbox-item-${index}`}>{item}</Label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
