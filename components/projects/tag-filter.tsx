import Link from "next/link"

import { cn } from "@/lib/utils"

type TagFilterProps = {
  tags: readonly string[]
  // null 이면 "전체" 가 현재 항목
  currentTag: string | null
  className?: string
}

// 필터를 ?tag= 가 아니라 /projects/tag/[tag] 경로로 두는 이유: searchParams 는 Request-time API 라
// 페이지를 동적 렌더링으로 바꿔 ISR 이 풀리고 모든 방문이 Notion 을 직접 치게 된다 (PRD §8)
export function tagHref(tag: string): string {
  return `/projects/tag/${encodeURIComponent(tag)}`
}

function TagChip({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        current
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  )
}

export function TagFilter({ tags, currentTag, className }: TagFilterProps) {
  // 없는 태그로 직접 들어온 경우에도 그 태그를 칩에 보여 줘야 "현재 필터" 가 무엇인지 알 수 있다
  const visibleTags =
    currentTag !== null && !tags.includes(currentTag) ? [...tags, currentTag] : tags

  return (
    <nav aria-label="태그 필터" className={cn("flex flex-wrap gap-2", className)}>
      <TagChip href="/projects" label="전체" current={currentTag === null} />
      {visibleTags.map((tag) => (
        <TagChip key={tag} href={tagHref(tag)} label={tag} current={tag === currentTag} />
      ))}
    </nav>
  )
}
