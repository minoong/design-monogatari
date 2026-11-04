import { Button } from '@repo/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';

export default function ButtonAriaDisabled() {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-start gap-2">
        <Tooltip>
          <TooltipTrigger aria-describedby="button-aria-disabled-reason" asChild>
            <Button aria-disabled variant="secondary">
              차량 이미지 저장
            </Button>
          </TooltipTrigger>
          <TooltipContent>차량 모델을 불러오는 중이라 아직 저장할 수 없습니다</TooltipContent>
        </Tooltip>
        <p className="text-muted-foreground text-caption m-0" id="button-aria-disabled-reason">
          차량 모델을 불러오는 중입니다.
        </p>
      </div>
    </TooltipProvider>
  );
}
