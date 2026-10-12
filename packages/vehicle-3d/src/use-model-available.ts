'use client';

import { useEffect, useState } from 'react';

export function useModelAvailable(url: string) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(url, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        const type = response.headers.get('content-type') ?? '';
        const availableNow = response.ok && !type.includes('text/html');
        setAvailable(availableNow);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setAvailable(false);
      });

    return () => controller.abort();
  }, [url]);

  return available;
}
