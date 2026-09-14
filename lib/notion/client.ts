// 클라이언트 번들에 NOTION_API_KEY 가 섞이지 않도록 서버 전용으로 고정한다 (PRD F3)
import "server-only"

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

// TODO: @notionhq/client 의 Client 단일 인스턴스 반환 (Task 009, SDK 설치는 Task 008)
export function getNotionClient(): never {
  throw new Error("미구현: Task 009 에서 Notion Client 를 생성합니다.")
}
