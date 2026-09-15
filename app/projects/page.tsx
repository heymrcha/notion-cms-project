import type { Metadata } from "next"
import { Suspense } from "react"

import { EmptyState } from "@/components/projects/empty-state"
import { ErrorState } from "@/components/projects/error-state"
import { ProjectGrid } from "@/components/projects/project-grid"
import { ProjectGridSkeleton } from "@/components/projects/project-grid-skeleton"
import { TagFilter } from "@/components/projects/tag-filter"
import { collectTags } from "@/lib/notion/collect-tags"
import { getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `프로젝트 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저가 참여한 프로젝트 목록",
}

// 방문자 요청이 Notion 을 직접 치지 않도록 정적 생성하고, PRD 가 요구한 "1분 이내 반영"에 맞춰 60초마다 재검증한다 (PRD §8)
export const revalidate = 60

// 페치를 자식으로 내려 제목은 즉시 내려보내고 그리드만 스트리밍한다. loading.tsx 대신 페이지 안 Suspense 를
// 쓰는 이유는 R5 — 라우트 단위 로딩 경계는 notFound() 의 404 를 200 으로 바꾼다
async function ProjectList() {
  const projects = await getPublishedProjects()
  if (projects === null) return <ErrorState />
  if (projects.length === 0) return <EmptyState />
  return (
    <>
      <TagFilter tags={collectTags(projects)} currentTag={null} />
      <ProjectGrid projects={projects} />
    </>
  )
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트</h1>
        <Suspense fallback={<ProjectGridSkeleton />}>
          <div className="space-y-8">
            <ProjectList />
          </div>
        </Suspense>
      </div>
    </div>
  )
}
