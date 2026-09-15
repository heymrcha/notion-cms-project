import { cn } from "@/lib/utils"

type EmptyStateProps = {
  message?: string
  className?: string
}

export function EmptyState({
  message = "아직 발행된 프로젝트가 없습니다.",
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  )
}
