import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPeriod } from "@/lib/format-period"
import type { ProjectListItem } from "@/lib/notion/types"

type ProjectCardProps = {
  project: ProjectListItem
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { slug, title, summary, outcome, periodStart, periodEnd, tags } = project

  return (
    // 카드 전체를 링크로 감싸면 접근 가능한 이름이 본문 전체가 되므로 제목만 링크로 둔다(PRD §10)
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/projects/${slug}`}
            className="hover:underline focus-visible:underline"
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <p className="font-medium text-foreground">{outcome}</p>
        <p className="text-sm text-muted-foreground">
          <time dateTime={periodStart}>{formatPeriod(periodStart, periodEnd)}</time>
        </p>
      </CardContent>
      {tags.length > 0 && (
        <CardFooter className="flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
