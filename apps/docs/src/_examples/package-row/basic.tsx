'use client';

import { PackageRow } from '@repo/ui/package-row';
import { useState } from 'react';

export default function PackageRowBasic() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="w-full max-w-md">
      <PackageRow
        label="파퓰러 패키지"
        description="드라이빙 어시스턴스와 헤드업 디스플레이를 함께 담았습니다."
        price="+₩3,600,000"
        items={['드라이빙 어시스턴스', '헤드업 디스플레이']}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
    </div>
  );
}
