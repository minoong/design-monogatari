import { redirect } from 'next/navigation';

/** 랜딩 페이지가 생기기 전까지 문서 첫 페이지로 보낸다 */
export function HomePage(): never {
  redirect('/docs');
}
