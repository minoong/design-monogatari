import { Button } from '@repo/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';

export default function TooltipDisabled() {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-start gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 비활성 버튼은 포커스를 받지 못해, 감싼 span이 대신 받는다 */
              tabIndex={0}
            >
              <Button disabled variant="secondary">
                차량 이미지 저장
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>차량 모델을 불러오는 중이라 아직 저장할 수 없습니다</TooltipContent>
        </Tooltip>
        <p className="text-muted-foreground text-caption m-0">차량 모델을 불러오는 중입니다.</p>
      </div>
    </TooltipProvider>
  );
}
