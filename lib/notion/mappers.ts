import type { NotionBlock, Project } from "./types"

// TODO: 타입 가드로 Notion 페이지 객체를 Project 로 변환. 필수 속성 누락 시 null + console.warn (Task 009)
export function mapPageToProject(page: unknown): Project | null {
  // Task 009 에서 사용할 매개변수. 미사용 경고를 막기 위한 임시 처리
  void page
  return null
}

// TODO: §6.3 7종만 NotionBlock 으로 변환, 그 외는 null (Task 009)
export function mapBlock(block: unknown): NotionBlock | null {
  // Task 009 에서 사용할 매개변수. 미사용 경고를 막기 위한 임시 처리
  void block
  return null
}
