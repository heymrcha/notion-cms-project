import { ImageResponse } from "next/og"

import { formatPeriod } from "@/lib/format-period"
import { getProjectBySlug, getPublishedProjects } from "@/lib/notion/queries"
import { OG_SIZE, OgBadges, OgCard } from "@/lib/og-card"
import { SITE_CONFIG } from "@/lib/site-config"

type ImageProps = {
  params: Promise<{ slug: string }>
}

export const alt = `${SITE_CONFIG.name} 프로젝트`
export const size = OG_SIZE
export const contentType = "image/png"

// 페이지와 같은 주기로 재검증해 Notion 에서 제목·성과를 고치면 카드도 60초 안에 따라온다.
// opengraph-image 는 특수 Route Handler 라 세그먼트 설정을 그대로 받는다 (opengraph-image.md §Route Segment Config)
export const revalidate = 60

// 페이지와 같은 slug 목록을 미리 생성한다. 이것이 없으면 이 핸들러는 동적으로 취급돼 revalidate 가 무시되고
// 요청마다 Notion 을 호출한다(로컬 실측 ~0.4초/요청). 빌드 뒤 추가된 slug 는 첫 요청 때 생성·캐시된다
export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  return (projects ?? []).map((project) => ({ slug: project.slug }))
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  // getProjectBySlug 는 React cache 로 감싸져 있어 같은 렌더의 페이지·메타와 중복 호출되지 않는다
  const project = await getProjectBySlug(slug)

  // 없는·미발행 slug 는 페이지가 404 라 이 이미지를 참조하지 않는다. 그래도 직접 열었을 때 500 대신 기본 카드를 준다
  if (!project) {
    return new ImageResponse(
      <OgCard title={SITE_CONFIG.name} subtitle={SITE_CONFIG.description} />,
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <OgCard
        title={project.title}
        accent={project.outcome}
        footer={
          <>
            <div style={{ display: "flex" }}>
              {project.role} · {formatPeriod(project.periodStart, project.periodEnd)}
            </div>
            <OgBadges tags={project.tags} />
          </>
        }
      />
    ),
    { ...size }
  )
}
