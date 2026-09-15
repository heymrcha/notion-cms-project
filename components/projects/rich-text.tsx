import type { RichText } from "@/lib/notion/types"

type RichTextSpansProps = {
  richText: RichText[]
}

function renderSpan(span: RichText, key: number) {
  let node: React.ReactNode = span.text
  if (span.code) node = <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{node}</code>
  if (span.italic) node = <em>{node}</em>
  if (span.bold) node = <strong>{node}</strong>
  if (span.href) {
    node = (
      <a
        href={span.href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-primary"
      >
        {node}
      </a>
    )
  }
  return <span key={key}>{node}</span>
}

// Notion rich text 는 서식별로 쪼개진 조각 배열이라 조각마다 래핑을 겹쳐 붙인다 (PRD §6.3 인라인 4종)
export function RichTextSpans({ richText }: RichTextSpansProps) {
  return <>{richText.map(renderSpan)}</>
}
