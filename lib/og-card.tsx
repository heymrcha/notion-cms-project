import type { ReactNode } from "react"

import { SITE_CONFIG } from "./site-config"

// ImageResponse(Satori)는 CSS 변수·Tailwind 토큰·다크 모드를 읽지 못하고 flexbox 와 CSS 일부만 지원한다.
// 그래서 이 파일에 한해 hex 를 직접 쓴다 — globals.css 의 라이트 팔레트를 손으로 옮긴 값이다
export const OG_SIZE = { width: 1200, height: 630 } as const

const COLORS = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#737373",
  accent: "#1d4ed8",
  badge: "#f5f5f5",
  border: "#e5e5e5",
} as const

type OgCardProps = {
  eyebrow?: string
  title: string
  // 강조색으로 찍는 한 줄 성과(상세 카드)
  accent?: string
  // 회색으로 찍는 보조 설명(루트 카드)
  subtitle?: string
  footer?: ReactNode
}

// Satori 는 -webkit-line-clamp 를 지원하지 않아 글자 수로 자른다. 제목 2줄, 성과 1줄 안에 들어오는 길이
export function clampText(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function OgCard({ eyebrow = SITE_CONFIG.name, title, accent, subtitle, footer }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: COLORS.background,
        color: COLORS.foreground,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: COLORS.muted, letterSpacing: -0.5 }}>{eyebrow}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.2, letterSpacing: -1.5 }}>
          {clampText(title, 40)}
        </div>
        {accent && (
          <div style={{ display: "flex", fontSize: 36, fontWeight: 600, color: COLORS.accent, lineHeight: 1.3 }}>
            {clampText(accent, 48)}
          </div>
        )}
        {subtitle && (
          <div style={{ display: "flex", fontSize: 30, color: COLORS.muted, lineHeight: 1.5 }}>
            {clampText(subtitle, 80)}
          </div>
        )}
      </div>
      {/* footer 가 없어도 빈 칸을 두어 space-between 이 제목을 세로 가운데에 놓게 한다 */}
      {footer ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            paddingTop: 32,
            borderTop: `2px solid ${COLORS.border}`,
            fontSize: 26,
            color: COLORS.muted,
          }}
        >
          {footer}
        </div>
      ) : (
        <div style={{ display: "flex", height: 60 }} />
      )}
    </div>
  )
}

export function OgBadges({ tags }: { tags: readonly string[] }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {tags.slice(0, 4).map((tag) => (
        <div
          key={tag}
          style={{
            display: "flex",
            padding: "8px 18px",
            borderRadius: 999,
            background: COLORS.badge,
            color: COLORS.foreground,
            fontSize: 22,
          }}
        >
          {tag}
        </div>
      ))}
    </div>
  )
}
