import { PackageRow } from '@repo/ui/package-row';

export default function PackageRowIncluded() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <PackageRow
        label="파퓰러 패키지"
        price="+₩3,600,000"
        items={['드라이빙 어시스턴스', '헤드업 디스플레이']}
        checked
        readOnly
      />
      <PackageRow
        label="헤드업 디스플레이"
        price="포함"
        includedIn="파퓰러 패키지에 포함"
        checked
        readOnly
      />
    </div>
  );
}
