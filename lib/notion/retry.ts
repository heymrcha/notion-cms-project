import "server-only"

import { isNotionClientError } from "@notionhq/client"

// 페치 실패가 빌드나 페이지 렌더를 무너뜨리지 않도록 예외를 삼키고 빈 값을 돌려준다 (PRD §11, R3).
// 재시도 자체는 SDK 내장 로직이 이미 끝낸 뒤이므로 여기서는 기록만 한다.
export async function safeFetch<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const detail = isNotionClientError(error)
      ? `${error.code}: ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error)
    console.error(`[notion] ${label} 실패 — ${detail}`)
    return fallback
  }
}
