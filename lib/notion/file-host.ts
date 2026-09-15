// Notion 에 업로드된 파일은 서명된 S3 URL 로 내려온다 (Task 012 에서 API 응답으로 확인).
// next.config 의 remotePatterns 와 렌더러가 같은 값을 보게 한 곳에 둔다. server-only 를 붙이면
// next.config 에서 import 할 수 없으므로 붙이지 않는다 (비밀 값이 없는 상수뿐이다).
export const NOTION_FILE_HOST = "prod-files-secure.s3.us-west-2.amazonaws.com"

// remotePatterns 밖의 호스트를 next/image 에 넣으면 400 이 나므로, 외부 이미지 블록은 unoptimized 로 우회한다
export function isNotionFileUrl(url: string): boolean {
  try {
    return new URL(url).hostname === NOTION_FILE_HOST
  } catch {
    return false
  }
}
