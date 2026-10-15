'use client';

import { Button } from '@repo/ui/button';
import { PriceBar, PriceBarActions, PriceBarTotal } from '@repo/ui/price-bar';
import { useState } from 'react';

export default function PriceBarBasic() {
  const [packageOn, setPackageOn] = useState(false);
  const amount = 82_900_000 + (packageOn ? 5_000_000 : 0);

  return (
    <div className="w-full max-w-2xl">
      <PriceBar className="border-border rounded-lg border">
        <PriceBarTotal amount={amount} note="취득세와 부대비용 별도" />
        <PriceBarActions>
          <Button
            variant="secondary"
            onClick={() => {
              setPackageOn((on) => !on);
            }}
          >
            {packageOn ? '파퓰러 패키지 빼기' : '파퓰러 패키지 더하기'}
          </Button>
          <Button variant="primary">다음 단계</Button>
        </PriceBarActions>
      </PriceBar>
    </div>
  );
}
