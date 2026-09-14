// Notion SDK 응답 타입을 UI 까지 끌고 가지 않기 위한 앱 전용 타입 (PRD §7.1)
// 이 파일은 Phase 2(UI)와 Phase 3(페치)이 공유하는 계약이다.

export type Project = {
  id: string
  slug: string
  title: string
  summary: string
  outcome: string
  role: string
  periodStart: string // ISO 8601
  periodEnd: string | null // null 이면 진행 중
  tags: string[]
  coverUrl: string | null
  externalUrl: string | null
  order: number
}

// 카드(목록·홈 최근 3건)에 필요한 필드만 (PRD F1)
export type ProjectListItem = Pick<
  Project,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "outcome"
  | "periodStart"
  | "periodEnd"
  | "tags"
  | "coverUrl"
>

// 인라인 서식은 굵게·기울임·인라인 코드·링크만 반영한다 (PRD §6.3)
export type RichText = {
  text: string
  bold: boolean
  italic: boolean
  code: boolean
  href: string | null
}

// MVP 지원 블록 7종 (PRD §6.3). 이 밖의 블록은 매퍼가 null 을 돌려 조용히 건너뛴다.
export type NotionBlock =
  | { id: string; type: "paragraph"; richText: RichText[] }
  | {
      id: string
      type: "heading_1" | "heading_2" | "heading_3"
      richText: RichText[]
    }
  | {
      id: string
      type: "bulleted_list_item" | "numbered_list_item"
      richText: RichText[]
    }
  | { id: string; type: "quote"; richText: RichText[] }
  | { id: string; type: "code"; code: string; language: string }
  | { id: string; type: "image"; url: string; alt: string }
  | { id: string; type: "divider" }

export type NotionBlockType = NotionBlock["type"]
