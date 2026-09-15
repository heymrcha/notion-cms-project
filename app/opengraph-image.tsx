import { ImageResponse } from "next/og"

import { OG_SIZE, OgCard } from "@/lib/og-card"
import { SITE_CONFIG } from "@/lib/site-config"

// 루트 세그먼트의 카드는 /projects, /about 처럼 자체 opengraph-image 가 없는 경로가 상속한다.
// 이력서에는 보통 / 를 붙이므로 상세 카드만으로는 가장 많이 공유되는 링크에 카드가 없다
export const alt = SITE_CONFIG.name
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <OgCard title={SITE_CONFIG.name} subtitle={SITE_CONFIG.description} />,
    { ...size }
  )
}
