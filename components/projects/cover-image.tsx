import Image from "next/image"

import { isNotionFileUrl } from "@/lib/notion/file-host"
import { cn } from "@/lib/utils"

type CoverImageProps = {
  src: string
  alt: string
  sizes: string
  // LCP 후보(첫 카드·헤더 커버)만 true. Next 16 은 priority 를 deprecated 하고
  // loading="eager" + fetchPriority="high" 를 권한다 (image.md §preload)
  eager?: boolean
  className?: string
}

// Notion 파일 URL 은 발급 1시간 뒤 만료되지만 ISR(60초)이 매번 새 서명 URL 로 HTML 을 갱신하므로
// 정상 조건에서는 만료 URL 이 서빙되지 않는다. 그래도 로드 실패 시 레이아웃이 내려앉지 않도록
// 비율을 컨테이너가 고정하고 이미지는 fill 로 채운다 (PRD §11)
export function CoverImage({ src, alt, sizes, eager = false, className }: CoverImageProps) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        className="object-cover"
        unoptimized={!isNotionFileUrl(src)}
      />
    </div>
  )
}
