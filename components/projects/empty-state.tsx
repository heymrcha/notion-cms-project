import { cn } from "@/lib/utils"

type EmptyStateProps = {
  className?: string
}

// TODO: 문구·여백 다듬기 (PRD F6, Task 004)
export function EmptyState({ className }: EmptyStateProps) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      아직 발행된 프로젝트가 없습니다.
    </p>
  )
}
