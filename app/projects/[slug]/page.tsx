import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { NotionBlocks } from "@/components/projects/notion-blocks"
import { ProjectHeader } from "@/components/projects/project-header"
import { MOCK_BLOCKS, MOCK_PROJECTS } from "@/lib/notion/mock-data"
import { SITE_CONFIG } from "@/lib/site-config"

// TODO: generateMetadata 로 Title·Summary 반영 (PRD §10 SEO, Task 010)
export const metadata: Metadata = {
  title: `프로젝트 상세 | ${SITE_CONFIG.name}`,
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Next.js 16 에서 params 는 Promise 이므로 await 가 필요하다
  const { slug } = await params

  // TODO: Task 010 에서 getProjectBySlug(slug) 로 교체
  const project = MOCK_PROJECTS.find((item) => item.slug === slug)
  if (!project) notFound()

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <ProjectHeader project={project} />
        {/* TODO: Task 010 에서 getProjectBlocks(project.id) 로 교체 */}
        <NotionBlocks blocks={MOCK_BLOCKS} />
      </div>
    </div>
  )
}
