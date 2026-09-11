# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Context
- PRD 문서: @docs/PRD.md
- 개발 로드맵: @ROADMAP.md

## 개발 명령어

```bash
npm run dev        # 개발 서버 (Next 16 부터 Turbopack 이 기본, 포트 3000)
npm run build      # 프로덕션 빌드
npm run start      # 빌드 결과물로 프로덕션 서버 실행
npm run lint       # ESLint (flat config, eslint-config-next 16 이 직접 제공)
npx tsc --noEmit   # 타입 체크

npx shadcn@latest add [component-name]   # shadcn/ui 컴포넌트 추가
```

**테스트 스위트가 없습니다.** 테스트 러너도 설정도 설치되어 있지 않으므로, 검증은 `npx tsc --noEmit` + `npm run lint` + 개발 서버에서 직접 확인하는 것이 전부입니다. 테스트를 요청받으면 러너 도입부터 논의하세요.

## 아키텍처

Next.js 16 App Router 기반의 Notion CMS PM 포트폴리오 사이트입니다(요구사항은 `docs/PRD.md`). 백엔드·데이터베이스·인증·API 라우트가 아직 없고, 정적 페이지 2개(`/`, `/about`)와 레이아웃 셸만 존재합니다. `SITE_CONFIG.navLinks`의 `/projects`는 M2에서 라우트가 생기기 전까지 404입니다.

### 콘텐츠의 단일 출처: `lib/site-config.ts`

`SITE_CONFIG`(사이트 이름, 설명, 네비게이션 링크)를 `app/layout.tsx`의 `metadata`, `Navbar`, `Footer`, 그리고 각 페이지가 모두 참조합니다. **사이트 이름이나 메뉴를 바꾸라는 요청은 이 파일 한 곳만 고쳐서 끝나야 합니다.** 페이지를 추가하면 `navLinks`에도 넣어야 navbar와 모바일 드롭다운에 동시에 반영됩니다.

`Navbar`와 `Footer`에는 `SITE_CONFIG` 밖의 하드코딩 콘텐츠가 없습니다.

### 서버 컴포넌트가 기본

`"use client"`가 붙은 파일은 다섯 개뿐입니다 — `components/providers/theme-provider.tsx`, `components/layout/navbar.tsx`(`usePathname` 사용), `components/layout/theme-toggle.tsx`, 그리고 Radix 기반 `components/ui/dropdown-menu.tsx`·`label.tsx`. 나머지 페이지와 컴포넌트는 서버 컴포넌트이며, 새 코드도 클라이언트 훅이 실제로 필요할 때만 경계를 만드세요.

### 페이지 관례

각 페이지는 `export const metadata: Metadata`를 두고 제목을 `` `소개 | ${SITE_CONFIG.name}` `` 형태로 만듭니다. 페이지 안의 반복 데이터(기술 스택 목록, 스크립트 표 등)는 컴포넌트 밖 모듈 스코프의 `UPPER_SNAKE_CASE` 상수 배열로 두고 `.map()` 으로 렌더링합니다.

### TailwindCSS v4 설정

- **`tailwind.config` 파일이 없습니다.** 모든 설정이 `app/globals.css`에 있습니다.
- `@theme inline` 블록이 CSS 변수를 Tailwind 유틸리티 토큰으로 노출하고, `:root` / `.dark` 블록이 실제 OKLCH 값을 정의합니다. 새 색을 추가하려면 **두 곳 모두** 손대야 합니다.
- 다크 모드 variant: `@custom-variant dark (&:is(.dark *))`
- PostCSS는 `@tailwindcss/postcss` 플러그인만 사용합니다.
- Border radius는 `--radius`(0.625rem) 하나에서 `--radius-sm` ~ `--radius-xl`을 파생시킵니다.

### 테마 시스템

`next-themes`를 `attribute="class"`, `defaultTheme="system"`, `enableSystem`으로 사용합니다. 클래스 기반이라 서버 렌더 결과와 첫 클라이언트 렌더가 어긋나므로 `app/layout.tsx`의 `<html>`에 `suppressHydrationWarning`이 붙어 있습니다 — 제거하지 마세요.

### 스타일링 패턴

- 컨테이너 정렬은 `container mx-auto max-w-screen-2xl px-4`로 통일합니다.
- 클래스 조합은 항상 `cn()`(`lib/utils.ts`, clsx + tailwind-merge)을 씁니다.
- 색은 `bg-background`, `text-muted-foreground` 같은 토큰으로만 지정합니다. 하드코딩된 hex나 `text-gray-500` 류는 다크 모드에서 깨집니다.

## Import 별칭

TypeScript가 아는 별칭은 `tsconfig.json`의 `@/*` → `./*` **하나뿐**입니다. 즉 `@/components/ui/button`, `@/lib/utils`처럼 루트 기준 실제 경로를 그대로 씁니다.

`components.json`의 `aliases`(`ui`, `lib`, `hooks` 등)는 shadcn CLI가 컴포넌트를 어디에 설치할지 정하는 값일 뿐, 코드에서 `@/ui/button` 같은 import 는 해석되지 않습니다.

## 환경 설정

`.env.example`을 `.env.local`로 복사해 사용합니다. 데이터베이스·인증·API 키 항목은 주석 처리된 **예시일 뿐 아직 아무 코드도 읽지 않습니다.**

## 언어

응답·문서·커밋 메시지·UI 문자열·주석은 한국어, 코드 식별자는 영어입니다. HTML `lang="ko"`이며 테마 토글 라벨도 한국어(라이트/다크/시스템)입니다.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
