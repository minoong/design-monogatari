'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {
  type ComponentProps,
  forwardRef,
  type ReactNode,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';

import { useCheckPhase } from '@/lib/check-phase';
import { cn } from '@/lib/utils';

export type PackageRowProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  label: ReactNode;
  description?: ReactNode;
  price?: ReactNode;
  /** 패키지에 들어 있는 항목. 주면 "구성 보기" 버튼으로 펼쳐 보인다. */
  items?: readonly ReactNode[];
  /** 펼침 버튼 글자 */
  itemsLabel?: string;
  /**
   * 다른 패키지에 포함돼 이미 체크된 항목이면 그 사실을 적는다 (예: "파퓰러 패키지에 포함").
   * 체크와 해제는 막지 않는다: 호출하는 쪽이 패키지를 푸는 확인 안내를 띄운다.
   */
  includedIn?: ReactNode;
};

/** 체크박스 한 줄에 구성 항목을 펼쳐 보여 주는 선택 품목 행. */
export const PackageRow = forwardRef<HTMLInputElement, PackageRowProps>(function PackageRow(
  {
    label,
    description,
    price,
    items,
    itemsLabel = '구성 보기',
    includedIn,
    className,
    id,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  const phase = useCheckPhase(props.checked, innerRef);
  const autoId = useId();
  const inputId = id ?? autoId;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const priceId = `${inputId}-price`;
  const triggerId = `${inputId}-trigger`;
  const described =
    [describedBy, description ? descriptionId : null, price ? priceId : null]
      .filter(Boolean)
      .join(' ') || undefined;
  const hasItems = Boolean(items && items.length > 0);

  return (
    <AccordionPrimitive.Root type="single" collapsible asChild>
      <div
        data-included={includedIn ? '' : undefined}
        className={cn(
          'border-border bg-background text-foreground hover:bg-secondary-hover relative rounded-lg border font-sans',
          'has-[input:checked]:border-primary has-[input:checked]:ring-primary has-[input:checked]:ring-1',
          'has-[input:focus-visible]:outline-ring has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2',
          'data-included:bg-muted',
          className,
        )}
      >
        <AccordionPrimitive.Item value="items" asChild>
          <div>
            <div className="flex items-start gap-3 p-4">
              <label
                htmlFor={inputId}
                className="-m-4 flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-4"
              >
                <input
                  ref={innerRef}
                  id={inputId}
                  type="checkbox"
                  aria-labelledby={labelId}
                  aria-describedby={described}
                  className="peer sr-only"
                  {...props}
                />
                <span
                  aria-hidden
                  data-phase={phase}
                  // 체크되면 튀어 오르고(in), 해제되면 바로 줄어들며 사라진다(out). 처음 그려질 때는 움직이지 않는다.
                  className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary text-primary-foreground motion-safe:data-[phase=in]:animate-select-pop relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {/* 해제될 때만 보이는 "체크된 모습". 커지지 않고 바로 줄어들며 사라진다(select-out). */}
                  <span
                    aria-hidden
                    data-phase={phase}
                    className="bg-primary border-primary text-primary-foreground motion-safe:data-[phase=out]:animate-select-out pointer-events-none absolute -inset-px flex items-center justify-center rounded-md border opacity-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    id={labelId}
                    className="flex flex-wrap items-center gap-2 text-sm font-medium"
                  >
                    {label}
                    {includedIn ? (
                      <span className="border-border bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-semibold">
                        {includedIn}
                      </span>
                    ) : null}
                  </span>
                  {description ? (
                    <span id={descriptionId} className="text-caption text-muted-foreground">
                      {description}
                    </span>
                  ) : null}
                </span>
                {price ? (
                  <span id={priceId} className="shrink-0 text-sm font-medium tabular-nums">
                    {price}
                  </span>
                ) : null}
              </label>
              {hasItems ? (
                <AccordionPrimitive.Header asChild>
                  <div className="relative shrink-0">
                    <AccordionPrimitive.Trigger
                      id={triggerId}
                      aria-labelledby={`${triggerId} ${labelId}`}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring group flex h-10 cursor-pointer items-center gap-1 rounded-md px-2 text-sm outline-hidden focus-visible:ring-2"
                    >
                      {itemsLabel}
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </AccordionPrimitive.Trigger>
                  </div>
                </AccordionPrimitive.Header>
              ) : null}
            </div>
            {hasItems ? (
              <AccordionPrimitive.Content aria-labelledby={triggerId}>
                <ul className="border-border text-caption text-muted-foreground mx-4 mb-4 flex list-disc flex-col gap-1 border-t pt-3 pl-5">
                  {items!.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </AccordionPrimitive.Content>
            ) : null}
          </div>
        </AccordionPrimitive.Item>
      </div>
    </AccordionPrimitive.Root>
  );
});
