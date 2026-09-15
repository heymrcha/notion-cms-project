import Image from "next/image"

import { isNotionFileUrl } from "@/lib/notion/file-host"
import { cn } from "@/lib/utils"

type CoverImageProps = {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}

// Notion 파일 URL 은 발급 1시간 뒤 만료되지만 ISR(60초)이 매번 새 서명 URL 로 HTML 을 갱신하므로
// 정상 조건에서는 만료 URL 이 서빙되지 않는다. 그래도 로드 실패 시 레이아웃이 내려앉지 않도록
// 비율을 컨테이너가 고정하고 이미지는 fill 로 채운다 (PRD §11)
export function CoverImage({ src, alt, sizes, priority = false, className }: CoverImageProps) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        unoptimized={!isNotionFileUrl(src)}
      />
    </div>
  )
}
