import type { NotionBlock } from "./types"

type ListItemBlock = Extract<
  NotionBlock,
  { type: "bulleted_list_item" | "numbered_list_item" }
>

export type ListGroup = {
  type: "list"
  ordered: boolean
  items: ListItemBlock[]
}

export type GroupedBlock = Exclude<NotionBlock, ListItemBlock> | ListGroup

function isListItem(block: NotionBlock): block is ListItemBlock {
  return (
    block.type === "bulleted_list_item" || block.type === "numbered_list_item"
  )
}

// Notion 은 리스트 항목을 낱개 블록으로 주므로, 인접한 같은 종류를 하나의 <ul>/<ol> 로 묶어야
// 시맨틱 마크업이 된다 (PRD §6.3). 입력 배열은 변경하지 않는다.
export function groupBlocks(blocks: NotionBlock[]): GroupedBlock[] {
  const result: GroupedBlock[] = []

  for (const block of blocks) {
    if (!isListItem(block)) {
      result.push(block)
      continue
    }

    const ordered = block.type === "numbered_list_item"
    const last = result[result.length - 1]
    if (last && last.type === "list" && last.ordered === ordered) {
      last.items.push(block)
    } else {
      result.push({ type: "list", ordered, items: [block] })
    }
  }

  return result
}
