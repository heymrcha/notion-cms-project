import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPeriod } from "@/lib/format-period"
import { CoverImage } from "./cover-image"
import type { Project } from "@/lib/notion/types"

type ProjectHeaderProps = {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { title, outcome, role, periodStart, periodEnd, tags, externalUrl, coverUrl } =
    project

  return (
    <header className="space-y-6">
      {/* 헤더 커버는 첫 화면의 LCP 후보이므로 priority 로 프리로드한다. 본문 폭(max-w-3xl=48rem)이 상한 */}
      {coverUrl && (
        <CoverImage src={coverUrl} alt={title} sizes="(max-width: 768px) 100vw, 48rem" priority />
      )}
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-lg font-medium text-foreground">{outcome}</p>
      <dl className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div>
          <dt className="text-sm text-muted-foreground">역할</dt>
          <dd className="text-foreground">{role}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">기간</dt>
          <dd className="text-foreground">
            <time dateTime={periodStart}>
              {formatPeriod(periodStart, periodEnd)}
            </time>
          </dd>
        </div>
      </dl>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {externalUrl && (
        <Button asChild>
          <a href={externalUrl} target="_blank" rel="noreferrer">
            프로젝트 보기
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Button>
      )}
    </header>
  )
}
