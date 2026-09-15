import { groupBlocks, type GroupedBlock } from "@/lib/notion/group-blocks"
import type { NotionBlock } from "@/lib/notion/types"
import { RichTextSpans } from "./rich-text"

type NotionBlocksProps = {
  blocks: NotionBlock[]
}

function renderBlock(block: GroupedBlock) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={block.id}>
          <RichTextSpans richText={block.richText} />
        </p>
      )
    // 페이지 <h1> 은 Title 이 차지하므로 Notion heading 은 한 단계씩 내린다 (PRD §6.3)
    case "heading_1":
      return (
        <h2 key={block.id} className="mt-10 text-2xl font-bold tracking-tight first:mt-0">
          <RichTextSpans richText={block.richText} />
        </h2>
      )
    case "heading_2":
      return (
        <h3 key={block.id} className="mt-8 text-xl font-semibold tracking-tight first:mt-0">
          <RichTextSpans richText={block.richText} />
        </h3>
      )
    case "heading_3":
      return (
        <h4 key={block.id} className="mt-6 text-lg font-semibold first:mt-0">
          <RichTextSpans richText={block.richText} />
        </h4>
      )
    case "list": {
      const items = block.items.map((item) => (
        <li key={item.id}>
          <RichTextSpans richText={item.richText} />
        </li>
      ))
      const key = block.items[0].id
      return block.ordered ? (
        <ol key={key} className="list-decimal space-y-1 pl-6">
          {items}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-1 pl-6">
          {items}
        </ul>
      )
    }
    case "quote":
      return (
        <blockquote key={block.id} className="border-l-4 border-border pl-4 italic text-muted-foreground">
          <RichTextSpans richText={block.richText} />
        </blockquote>
      )
    case "code":
      return (
        <pre key={block.id} data-language={block.language} className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code className="font-mono">{block.code}</code>
        </pre>
      )
    case "image":
      return (
        <figure key={block.id} className="my-6">
          {/* TODO(Task 012): next/image 적용. 지금은 비율만 고정해 레이아웃 흔들림을 막는다 */}
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.url} alt={block.alt} className="size-full object-cover" />
          </div>
        </figure>
      )
    case "divider":
      return <hr key={block.id} className="my-8 border-border" />
    default:
      // 매퍼가 §6.3 밖의 블록을 걸러 주지만, 타입이 늘어나도 렌더러가 터지지 않도록 방어한다
      return null
  }
}

export function NotionBlocks({ blocks }: NotionBlocksProps) {
  return (
    <div className="space-y-4 text-base leading-7 text-foreground">
      {groupBlocks(blocks).map(renderBlock)}
    </div>
  )
}
