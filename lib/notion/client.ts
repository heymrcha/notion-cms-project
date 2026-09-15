// 클라이언트 번들에 NOTION_API_KEY 가 섞이지 않도록 서버 전용으로 고정한다 (PRD F3)
import "server-only"

import { Client } from "@notionhq/client"

export const NOTION_ENV_KEYS = [
  "NOTION_API_KEY",
  "NOTION_PROJECTS_DATA_SOURCE_ID",
] as const

type NotionEnvKey = (typeof NOTION_ENV_KEYS)[number]

export function getNotionEnv(key: NotionEnvKey): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `환경 변수 ${key} 가 설정되지 않았습니다. .env.example 을 .env.local 로 복사해 값을 채우세요.`
    )
  }
  return value
}

let client: Client | null = null

// 모듈 스코프에 한 번만 만들어 요청마다 인스턴스를 새로 만들지 않는다.
// 429/529 재시도는 SDK 5.x 에 내장돼 있어(Retry-After 존중, 지수 백오프+지터) 따로 감싸지 않는다.
// 두 겹으로 재시도하면 대기 시간이 곱으로 늘어난다 (PRD §10: 최대 3회).
export function getNotionClient(): Client {
  if (!client) {
    client = new Client({
      auth: getNotionEnv("NOTION_API_KEY"),
      retry: { maxRetries: 3 },
    })
  }
  return client
}
