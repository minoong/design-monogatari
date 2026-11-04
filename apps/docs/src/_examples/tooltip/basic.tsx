import { IconButton } from '@repo/ui/icon-button';
import { DownloadIcon } from '@repo/ui/icons/download';
import { HeartIcon } from '@repo/ui/icons/heart';
import { PrinterIcon } from '@repo/ui/icons/printer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';

const ACTIONS = [
  { label: '차량 이미지 저장', icon: <DownloadIcon /> },
  { label: '인쇄 · PDF 저장', icon: <PrinterIcon /> },
  { label: '관심 차량 담기', icon: <HeartIcon /> },
] as const;

export default function TooltipBasic() {
  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {ACTIONS.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <IconButton aria-label={action.label}>{action.icon}</IconButton>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
