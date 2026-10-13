'use client';

import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { useState } from 'react';

export default function OptionRowUnavailable() {
  const [value, setValue] = useState('w19');
  const [message, setMessage] = useState('');

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <OptionGroup legend="휠">
        <OptionRow
          name="option-row-unavailable-wheel"
          value="w19"
          label="19인치 기본 휠"
          price="기본 포함"
          checked={value === 'w19'}
          onChange={() => setValue('w19')}
        />
        <OptionRow
          name="option-row-unavailable-wheel"
          value="w21"
          label="21인치 알로이 휠"
          price="+3,200,000원"
          unavailableReason="가솔린 스포트 트림에서만 선택할 수 있습니다."
          checked={value === 'w21'}
          onChange={() =>
            setMessage('선택 불가 행을 눌렀습니다. 여기서 트림 변경 같은 대안을 안내합니다.')
          }
        />
        <OptionRow
          name="option-row-unavailable-wheel"
          value="w22"
          label="22인치 단조 휠"
          price="+5,000,000원"
          disabled
        />
      </OptionGroup>
      <p role="status" className="text-caption text-muted-foreground min-h-6">
        {message}
      </p>
    </div>
  );
}
