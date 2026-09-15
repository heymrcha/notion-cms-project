import type { MetadataRoute } from "next"

import { getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

// sitemap 은 기본적으로 캐시되는 특수 Route Handler 라, 재검증이 없으면 빌드 뒤 발행한 프로젝트가
// 영영 실리지 않는다. 크롤러는 분 단위 갱신이 필요 없으므로 페이지(60초)보다 느슨하게 둔다
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_CONFIG.siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_CONFIG.siteUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_CONFIG.siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]

  // Notion 실패(null)여도 정적 경로만으로 응답한다 — 빌드를 실패시키지 않는다 (R3)
  const projects = (await getPublishedProjects()) ?? []
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_CONFIG.siteUrl}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...projectRoutes]
}
