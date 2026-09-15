import "server-only"

import type {
  QueryDataSourceParameters,
  QueryDataSourceResponse,
} from "@notionhq/client"

import { getNotionClient, getNotionEnv } from "./client"
import { mapBlock, mapPageToProject } from "./mappers"
import { safeFetch } from "./retry"
import type { NotionBlock, Project } from "./types"

type DataSourceFilter = NonNullable<QueryDataSourceParameters["filter"]>
type DataSourceSorts = NonNullable<QueryDataSourceParameters["sorts"]>

const PUBLISHED_FILTER = {
  property: "Published",
  checkbox: { equals: true },
} as const satisfies DataSourceFilter

// PRD §6.1: Order 내림차순 → Period Start 내림차순
const DEFAULT_SORTS = [
  { property: "Order", direction: "descending" },
  { property: "Period Start", direction: "descending" },
] as const satisfies DataSourceSorts

// has_more/next_cursor 를 따라 전량을 가져온다 (PRD F3: 100건 초과 대비)
async function queryAllPages(
  filter: DataSourceFilter,
  sorts: DataSourceSorts
): Promise<QueryDataSourceResponse["results"]> {
  const notion = getNotionClient()
  const dataSourceId = getNotionEnv("NOTION_PROJECTS_DATA_SOURCE_ID")
  const results: QueryDataSourceResponse["results"] = []
  let cursor: string | undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter,
      sorts,
      start_cursor: cursor,
    })
    results.push(...response.results)
    cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined
  } while (cursor)

  return results
}

// Slug 가 겹치면 정렬 기준 첫 행만 남긴다. 상세 URL 이 하나의 페이지만 가리켜야 하기 때문 (PRD §11)
function dedupeBySlug(projects: Project[]): Project[] {
  const seen = new Set<string>()
  return projects.filter((project) => {
    if (seen.has(project.slug)) {
      console.warn(`[notion] Slug 중복 — "${project.slug}" 는 첫 행(${project.id} 이전)만 사용합니다`)
      return false
    }
    seen.add(project.slug)
    return true
  })
}

// 실패 시 null(오류 상태), 0건이면 [](빈 상태) — 호출부가 두 경우를 구분해 렌더한다 (PRD F6)
export async function getPublishedProjects(): Promise<Project[] | null> {
  return safeFetch(
    "getPublishedProjects",
    async () => {
      const pages = await queryAllPages(PUBLISHED_FILTER, DEFAULT_SORTS)
      const projects = pages
        .map(mapPageToProject)
        .filter((project): project is Project => project !== null)
      return dedupeBySlug(projects)
    },
    null
  )
}

// 미발행 초안이 URL 추측으로 노출되지 않도록 Published 필터를 AND 로 함께 건다 (PRD §6.1)
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return safeFetch(
    `getProjectBySlug(${slug})`,
    async () => {
      const pages = await queryAllPages(
        {
          and: [PUBLISHED_FILTER, { property: "Slug", rich_text: { equals: slug } }],
        },
        DEFAULT_SORTS
      )
      const projects = pages
        .map(mapPageToProject)
        .filter((project): project is Project => project !== null)
      return dedupeBySlug(projects)[0] ?? null
    },
    null
  )
}

export async function getProjectBlocks(pageId: string): Promise<NotionBlock[]> {
  return safeFetch(
    `getProjectBlocks(${pageId})`,
    async () => {
      const notion = getNotionClient()
      const blocks: NotionBlock[] = []
      let cursor: string | undefined

      do {
        const response = await notion.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        })
        for (const block of response.results) {
          const mapped = mapBlock(block)
          if (mapped) blocks.push(mapped)
        }
        cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined
      } while (cursor)

      return blocks
    },
    []
  )
}
