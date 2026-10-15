import { Notice, NoticeDescription, NoticeTitle } from '@repo/ui/notice';

export default function NoticeBasic() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Notice>
        <NoticeTitle>휠이 기본 휠로 바뀌었습니다</NoticeTitle>
        <NoticeDescription>
          선택하신 트림에서는 20인치 알로이 휠을 고를 수 없어 되돌렸습니다.
        </NoticeDescription>
      </Notice>
      <Notice variant="error">
        <NoticeTitle>탁송지를 선택해 주십시오</NoticeTitle>
        <NoticeDescription>견적을 완료하려면 탁송 지역이 필요합니다.</NoticeDescription>
      </Notice>
    </div>
  );
}
