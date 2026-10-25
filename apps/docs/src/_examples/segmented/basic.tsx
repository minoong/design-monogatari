'use client';

import { Segmented, SegmentedItem } from '@repo/ui/segmented';
import { useState } from 'react';

export default function SegmentedBasic() {
  const [tax, setTax] = useState('taxed');

  return (
    <div className="flex flex-col items-start gap-3">
      <Segmented aria-label="과세 구분" value={tax} onValueChange={setTax}>
        <SegmentedItem value="taxed">과세</SegmentedItem>
        <SegmentedItem value="exempt">면세</SegmentedItem>
      </Segmented>
      <p className="text-muted-foreground text-caption">
        선택: {tax === 'taxed' ? '과세' : '면세'}
      </p>
    </div>
  );
}
