import { CopyButton } from '@repo/ui/copy-button';
import type { CSSProperties } from 'react';

import { INSTALL_STEPS } from '../install-steps';
import { Stage } from './stage';

/**
 * 설치 구역의 장면: 터미널 창에 두 명령이 스크롤에 맞춰 왼쪽부터 찍힌다(`.lp-type`, 글자 수만큼 끊어서).
 * 글자는 처음부터 문서에 있고 보이는 범위만 잘라 두므로 낭독과 복사에는 영향이 없다.
 */
export function SceneInstall() {
  return (
    <Stage caption="설치 명령 두 줄" file="terminal">
      <ol className="m-0 flex list-none flex-col gap-6 p-4 md:p-8">
        {INSTALL_STEPS.map((step, index) => (
          <li key={step.title} className="m-0 min-w-0">
            <p className="text-muted-foreground m-0 mb-2 font-mono text-xs">
              {String(index + 1).padStart(2, '0')} · {step.title}
            </p>
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className="text-primary dark:text-primary-on-dark pt-0.5 font-mono text-sm"
              >
                $
              </span>
              <code
                className="lp-type min-w-0 flex-1 font-mono text-sm leading-6 wrap-anywhere"
                style={{ '--lp-steps': step.command.length } as CSSProperties}
              >
                {step.command}
              </code>
              <CopyButton
                iconOnly
                label={`${step.title} 명령 복사`}
                size="small"
                value={step.command}
              />
            </div>
            <p className="text-muted-foreground m-0 mt-2 pl-5 text-sm leading-6">{step.note}</p>
          </li>
        ))}
      </ol>
    </Stage>
  );
}
