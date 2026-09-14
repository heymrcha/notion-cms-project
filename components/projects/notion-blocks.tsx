import type { NotionBlock } from "@/lib/notion/types"

type NotionBlocksProps = {
  blocks: NotionBlock[]
}

// TODO: 블록 7종 → JSX, 연속 리스트 그룹핑, rich-text 인라인 서식 (PRD §6.3, Task 006)
export function NotionBlocks({ blocks }: NotionBlocksProps) {
  return <div data-block-count={blocks.length} />
}
