import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { NotionBlocks } from "@/components/projects/notion-blocks"
import { NotionBlocksSkeleton } from "@/components/projects/notion-blocks-skeleton"
import { ProjectHeader } from "@/components/projects/project-header"
import { getProjectBlocks, getProjectBySlug, getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>
}

// 방문자 요청이 Notion 을 직접 치지 않도록 정적 생성하고, PRD 가 요구한 "1분 이내 반영"에 맞춰 60초마다 재검증한다 (PRD §8)
export const revalidate = 60

// 빌드 시점에 발행된 slug 만 미리 생성한다. ISR 재검증 때는 이 함수가 다시 불리지 않으므로
// (generate-static-params.md "During revalidation (ISR), generateStaticParams will not be called again")
// 빌드 뒤 Notion 에 추가된 프로젝트는 dynamicParams 기본값(true)에 기대어 첫 요청 때 생성되게 둔다.
// Notion 이 실패하면 null 이 오는데, 그때 throw 하면 빌드가 깨지므로 빈 배열로 넘긴다 (R3)
export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  return (projects ?? []).map((project) => ({ slug: project.slug }))
}

// getProjectBySlug 는 React cache 로 감싸져 있어 아래 페이지 본문과 합쳐 한 번만 호출된다
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: `프로젝트를 찾을 수 없습니다 | ${SITE_CONFIG.name}` }
  // og:image 는 같은 세그먼트의 opengraph-image.tsx 가 자동으로 붙이므로 여기서 images 를 지정하지 않는다
  return {
    title: `${project.title} | ${SITE_CONFIG.name}`,
    description: project.summary,
    // openGraph 객체는 루트 layout 의 값과 병합되지 않고 통째로 대체되므로 siteName·locale 을 다시 적는다
    openGraph: {
      title: project.title,
      description: project.summary,
      siteName: SITE_CONFIG.name,
      locale: "ko_KR",
      type: "article",
      url: `/projects/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
    },
  }
}

async function ProjectBody({ pageId }: { pageId: string }) {
  const blocks = await getProjectBlocks(pageId)
  return <NotionBlocks blocks={blocks} />
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Next.js 16 에서 params 는 Promise 이므로 await 가 필요하다
  const { slug } = await params

  // 미발행·없는 slug 모두 null → 404. 페치 실패도 null 이라 초안이 새지 않는 쪽으로 기운다 (PRD §11)
  // 존재 확인은 반드시 Suspense 밖에서 끝낸다 — 스트리밍이 시작된 뒤의 notFound() 는 200 으로 내려간다 (R5)
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <ProjectHeader project={project} />
        <Suspense fallback={<NotionBlocksSkeleton />}>
          <ProjectBody pageId={project.id} />
        </Suspense>
      </div>
    </div>
  )
}
