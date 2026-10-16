import { decodeEstimate } from '../model/codec';
import { isStepId } from '../model/steps';
import { createWizardState } from '../model/wizard';
import { EstimateApp } from './estimate-app';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * 견적 화면. 주소의 쿼리에서 선택과 단계를 복원해 같은 화면으로 시작한다.
 * 해석하지 못한 값은 기본값으로 되돌리고 화면에 알린다.
 */
export async function EstimatePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { step: rawStep, ...rest } = await searchParams;
  const step = Array.isArray(rawStep) ? rawStep[0] : rawStep;
  const decoded = decodeEstimate(rest);

  return (
    <EstimateApp
      initial={createWizardState(decoded, isStepId(step) ? step : undefined)}
      restoreIssueCount={decoded.issues.length}
    />
  );
}
