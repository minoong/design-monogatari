import { Button } from '@repo/ui/button';

export default function ButtonRadius() {
  return (
    <>
      <Button variant="primary" radius="md">
        md
      </Button>
      <Button variant="primary" radius="lg">
        lg
      </Button>
      <Button variant="primary" radius="pill">
        pill
      </Button>
    </>
  );
}
