import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPeriod } from "@/lib/format-period"
import type { Project } from "@/lib/notion/types"

type ProjectHeaderProps = {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { title, outcome, role, periodStart, periodEnd, tags, externalUrl } =
    project

  return (
    <header className="space-y-6">
      {/* TODO(Task 012): Cover 이미지 — 지금은 비율만 확보 */}
      <div className="aspect-video w-full rounded-xl bg-muted" />
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
