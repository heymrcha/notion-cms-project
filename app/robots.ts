import type { MetadataRoute } from "next"

import { SITE_CONFIG } from "@/lib/site-config"

// 전 페이지 공개(PRD N2)이므로 막을 경로가 없다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`,
  }
}
