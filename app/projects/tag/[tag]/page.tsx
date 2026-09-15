import type { Metadata } from "next"
import { Suspense } from "react"

import { EmptyState } from "@/components/projects/empty-state"
import { ErrorState } from "@/components/projects/error-state"
import { ProjectGrid } from "@/components/projects/project-grid"
import { ProjectGridSkeleton } from "@/components/projects/project-grid-skeleton"
import { TagFilter, tagHref } from "@/components/projects/tag-filter"
import { collectTags } from "@/lib/notion/collect-tags"
import { getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

type TagPageProps = {
  params: Promise<{ tag: string }>
}

// 목록과 같은 주기로 재검증한다. ?tag= 대신 경로 세그먼트를 쓰는 이유는 tag-filter.tsx 참고
export const revalidate = 60

// 빌드 시점의 태그를 미리 생성하고, 그 뒤 생긴 태그는 dynamicParams 기본값으로 첫 요청 때 만든다
export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  return collectTags(projects ?? []).map((tag) => ({ tag }))
}

// 한글 태그는 URL 에서 퍼센트 인코딩된 채로 오므로 디코딩해서 비교한다
async function readTag(params: TagPageProps["params"]): Promise<string> {
  const { tag } = await params
  try {
    return decodeURIComponent(tag)
  } catch {
    return tag
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = await readTag(params)
  return {
    title: `${tag} 프로젝트 | ${SITE_CONFIG.name}`,
    description: `${tag} 태그가 붙은 프로젝트 목록`,
    alternates: { canonical: tagHref(tag) },
  }
}

async function TaggedProjectList({ tag }: { tag: string }) {
  const projects = await getPublishedProjects()
  if (projects === null) return <ErrorState />
  if (projects.length === 0) return <EmptyState />

  // getPublishedProjects 가 이미 정렬해 둔 배열을 filter 만 하므로 정렬 규칙이 그대로 유지된다
  const filtered = projects.filter((project) => project.tags.includes(tag))

  return (
    <>
      <TagFilter tags={collectTags(projects)} currentTag={tag} />
      {filtered.length === 0 ? (
        // 없는 태그는 404 가 아니라 빈 상태 — 초안이 새는 경로가 아니라 닫을 이유가 없고, 칩으로 바로 벗어날 수 있다
        <EmptyState message={`‘${tag}’ 태그의 프로젝트가 없습니다.`} />
      ) : (
        <ProjectGrid projects={filtered} />
      )}
    </>
  )
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await readTag(params)

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트</h1>
        <Suspense fallback={<ProjectGridSkeleton />}>
          <div className="space-y-8">
            <TaggedProjectList tag={tag} />
          </div>
        </Suspense>
      </div>
    </div>
  )
}
