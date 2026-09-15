import { cn } from "@/lib/utils"

type EmptyStateProps = {
  className?: string
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground",
        className
      )}
    >
      아직 발행된 프로젝트가 없습니다.
    </div>
  )
}
