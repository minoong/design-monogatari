import { Button } from '@repo/ui/button';

export default function ButtonDisplay() {
  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <Button variant="primary" display="inline">
        inline
      </Button>
      <Button variant="primary" display="block">
        block
      </Button>
      <Button variant="primary" display="full">
        full
      </Button>
    </div>
  );
}
