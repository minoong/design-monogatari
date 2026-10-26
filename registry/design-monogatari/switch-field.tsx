'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '@/ui/label';
import { cn } from '@/lib/utils';
import { Switch, type SwitchProps } from '@/ui/switch';
import { TextRoll } from '@/ui/text-roll';

export type SwitchFieldProps = Omit<SwitchProps, 'children'> & {
  /**
   * 눈에 보이는 이름. 스위치의 접근성 이름이 된다(상태에 따라 바꾸지 않는다).
   * 이름표 안에 링크나 버튼을 넣지 않는다: `label` 안에 누를 수 있는 요소가 겹친다.
   */
  label: ReactNode;
  /**
   * 이름표 옆에 보이는 상태 글자(예: `{ on: '열림', off: '닫힘' }`). 켜면 위로, 끄면 아래로 굴러서 바뀐다.
   * 스위치가 이미 켜짐/꺼짐을 알리므로 낭독기에는 읽히지 않는다(`aria-hidden`).
   */
  status?: { on: string; off: string };
  /** 스위치와 이름표를 감싼 `label`에 붙는다. 나머지 속성은 스위치(`input`)로 간다. */
  className?: string;
};

/**
 * 스위치와 이름표를 한 `label`로 묶어 사이 간격까지 눌리게 한다. 높이 32px로 옆의 작은 버튼과 맞춘다.
 * 이름은 상태와 상관없이 고정이다: 상태에 따라 이름표 글자가 바뀌면 낭독기가 이름과 상태를 어긋나게 읽고, 음성 제어에서도 이름이 어긋난다.
 * 상태를 글자로 보이고 싶으면 `status`를 쓴다.
 */
export function SwitchField({
  label,
  status,
  className,
  onChange,
  disabled,
  ref,
  ...props
}: SwitchFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inner, setInner] = useState(props.defaultChecked ?? false);
  const checked = props.checked ?? inner;

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // 상태 글자는 React `onChange`가 아니라 입력의 실제 값을 읽어 맞춘다. `form.reset()`은 `change`를 일으키지 않고 스위치만 처음 값으로 돌리는데,
  // 그 뒤 React가 첫 클릭의 `onChange`를 삼켜서(값 추적기가 리셋을 모른다) 글자가 한 번 뒤처진다. 브라우저의 `change`는 삼켜지지 않는다.
  // `reset` 이벤트는 값을 되돌리기 전에 오므로 한 틱 미룬다(마이크로태스크는 사용자가 누른 리셋 버튼에서는 되돌리기 전에 돈다).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const form = input.form;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      setInner(input.checked);
    };
    const onReset = () => {
      timer = setTimeout(sync, 0);
    };
    input.addEventListener('change', sync);
    form?.addEventListener('reset', onReset);
    return () => {
      input.removeEventListener('change', sync);
      form?.removeEventListener('reset', onReset);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Label
      className={cn(
        // 비활성은 스위치가 제 색(`bg-muted` 등)으로 알리므로 투명도를 겹치지 않고 글자만 옅게 한다.
        'has-disabled:text-muted-foreground inline-flex h-8 cursor-pointer items-center gap-2 px-1 has-disabled:cursor-not-allowed',
        className,
      )}
    >
      <Switch {...props} ref={setRef} disabled={disabled} onChange={onChange} />
      <span className="whitespace-nowrap">{label}</span>
      {status ? (
        <span aria-hidden className="text-muted-foreground text-caption inline-grid">
          {/* 두 글자를 같은 칸에 보이지 않게 깔아 폭을 긴 쪽에 맞춘다(글자 수가 아니라 실제 폭). */}
          <span className="invisible col-start-1 row-start-1">{status.on}</span>
          <span className="invisible col-start-1 row-start-1">{status.off}</span>
          <TextRoll className="col-start-1 row-start-1" direction={checked ? 'up' : 'down'}>
            {checked ? status.on : status.off}
          </TextRoll>
        </span>
      ) : null}
    </Label>
  );
}
