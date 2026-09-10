'use client';

import { useEffect, useRef, useState } from 'react';

function observeTheme(read: () => void) {
  read();

  const observer = new MutationObserver(read);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  return () => observer.disconnect();
}

export function useLiveCssVar(cssVar: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    return observeTheme(() => {
      const node = ref.current;
      if (!node) {
        return;
      }
      setValue(getComputedStyle(node).getPropertyValue(cssVar).trim());
    });
  }, [cssVar]);

  return { ref, value };
}

export function useLiveStyle(property: keyof CSSStyleDeclaration) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    return observeTheme(() => {
      const node = ref.current;
      if (!node) {
        return;
      }
      const computed = getComputedStyle(node)[property];
      setValue(typeof computed === 'string' ? computed : '');
    });
  }, [property]);

  return { ref, value };
}
