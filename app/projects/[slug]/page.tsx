import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { NotionBlocks } from "@/components/projects/notion-blocks"
import { ProjectHeader } from "@/components/projects/project-header"
import { getProjectBlocks, getProjectBySlug } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>
}

// getProjectBySlug 는 React cache 로 감싸져 있어 아래 페이지 본문과 합쳐 한 번만 호출된다
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: `프로젝트를 찾을 수 없습니다 | ${SITE_CONFIG.name}` }
  return {
    title: `${project.title} | ${SITE_CONFIG.name}`,
    description: project.summary,
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Next.js 16 에서 params 는 Promise 이므로 await 가 필요하다
  const { slug } = await params

  // 미발행·없는 slug 모두 null → 404. 페치 실패도 null 이라 초안이 새지 않는 쪽으로 기운다 (PRD §11)
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const blocks = await getProjectBlocks(project.id)

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <ProjectHeader project={project} />
        <NotionBlocks blocks={blocks} />
      </div>
    </div>
  )
}
