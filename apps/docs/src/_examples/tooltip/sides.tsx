import { Button } from '@repo/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';

const SIDES = [
  ['top', '위'],
  ['right', '오른쪽'],
  ['bottom', '아래'],
  ['left', '왼쪽'],
] as const;

export default function TooltipSides() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-3">
        {SIDES.map(([side, label]) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="secondary">{label}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>{label}에 열립니다</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
