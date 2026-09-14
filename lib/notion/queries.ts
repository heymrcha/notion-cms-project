import "server-only"

import type { NotionBlock, Project } from "./types"

// TODO: notion.dataSources.query 로 Published=true 전량 페치, Order desc → Period Start desc (Task 009)
export async function getPublishedProjects(): Promise<Project[]> {
  throw new Error("미구현: Task 009")
}

// TODO: Slug equals AND Published=true 필터 (Task 009)
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // Task 009 에서 사용할 매개변수. 미사용 경고를 막기 위한 임시 처리
  void slug
  throw new Error("미구현: Task 009")
}

// TODO: blocks.children.list 전량 페치 후 mapBlock 적용 (Task 009)
export async function getProjectBlocks(pageId: string): Promise<NotionBlock[]> {
  // Task 009 에서 사용할 매개변수. 미사용 경고를 막기 위한 임시 처리
  void pageId
  throw new Error("미구현: Task 009")
}
