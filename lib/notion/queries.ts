import "server-only"

import { cache } from "react"
import type {
  QueryDataSourceParameters,
  QueryDataSourceResponse,
} from "@notionhq/client"

import { getNotionClient, getNotionEnv } from "./client"
import { mapBlock, mapPageToProject } from "./mappers"
import { safeFetch } from "./retry"
import { sortProjects } from "./sort-projects"
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

// Notion 의 서버 정렬은 Order 가 빈 행을 방향과 무관하게 맨 뒤로 보내므로, 매퍼가 빈 값을 0 으로
// 채운 뒤 앱 쪽에서 다시 정렬해야 "비어 있으면 0 취급"(PRD §6.1)이 지켜진다. 서버 정렬은 안정 정렬의
// 동점 순서를 결정적으로 만들기 위해 그대로 둔다
function toSortedProjects(pages: QueryDataSourceResponse["results"]): Project[] {
  const projects = pages
    .map(mapPageToProject)
    .filter((project): project is Project => project !== null)
  return dedupeBySlug(sortProjects(projects))
}

// Slug 가 겹치면 정렬 기준 첫 행만 남긴다. 상세 URL 이 하나의 페이지만 가리켜야 하기 때문 (PRD §11)
function dedupeBySlug(projects: Project[]): Project[] {
  const kept = new Map<string, string>()
  return projects.filter((project) => {
    const keptId = kept.get(project.slug)
    if (keptId) {
      console.warn(`[notion] Slug 중복 — "${project.slug}" 는 ${keptId} 를 채택하고 ${project.id} 는 제외합니다`)
      return false
    }
    kept.set(project.slug, project.id)
    return true
  })
}

// 실패 시 null(오류 상태), 0건이면 [](빈 상태) — 호출부가 두 경우를 구분해 렌더한다 (PRD F6).
// SDK 호출은 fetch 처럼 자동 메모이즈되지 않으므로 React cache 로 같은 렌더 안의 중복 호출을 막는다
// (generateMetadata 와 페이지가 같은 데이터를 읽는다 — Next 문서 generate-metadata.md)
export const getPublishedProjects = cache(async (): Promise<Project[] | null> => {
  return safeFetch(
    "getPublishedProjects",
    async () => {
      const pages = await queryAllPages(PUBLISHED_FILTER, DEFAULT_SORTS)
      return toSortedProjects(pages)
    },
    null
  )
})

// 미발행 초안이 URL 추측으로 노출되지 않도록 Published 필터를 AND 로 함께 건다 (PRD §6.1)
export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  return safeFetch(
    `getProjectBySlug(${slug})`,
    async () => {
      const pages = await queryAllPages(
        {
          and: [PUBLISHED_FILTER, { property: "Slug", rich_text: { equals: slug } }],
        },
        DEFAULT_SORTS
      )
      return toSortedProjects(pages)[0] ?? null
    },
    null
  )
})

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
