# Notion CMS 포트폴리오

Notion을 CMS로 사용하는 개인 포트폴리오 웹사이트입니다. 프로젝트 기록을 Notion Database에서 관리하고, 웹사이트는 그것을 읽어 렌더링합니다. **콘텐츠를 고치기 위해 코드를 수정하거나 재배포할 필요가 없습니다.**

주 독자는 채용 담당자이며, "어떤 프로젝트에서 어떤 역할로 무슨 성과를 냈는가"를 빠르게 파악하는 것이 사이트의 목적입니다.

## 현재 상태

**기획 단계입니다.** MVP 요구사항은 [`docs/PRD.md`](docs/PRD.md)에 정의되어 있고, Notion 연동 구현은 아직 시작하지 않았습니다. 저장소에는 Next.js 스타터 킷의 레이아웃 셸(Navbar / Footer / 다크 모드)과 정적 페이지 3개(`/`, `/about`, `/docs`)만 있습니다.

구현 순서는 PRD의 마일스톤을 따릅니다.

1. **M1 데이터 계층** — Notion Database 생성, `lib/notion/*` 페치·매핑 계층
2. **M2 화면** — `/projects` 목록, `/projects/[slug]` 상세, 블록 렌더러
3. **M3 셸 정리 + ISR** — `SITE_CONFIG` 교체, `revalidate` 적용

## 기술 스택

- **[Next.js 16](https://nextjs.org)** — App Router, 서버 컴포넌트 기본
- **[React 19](https://react.dev)**
- **[TypeScript](https://www.typescriptlang.org)** — `any` 금지
- **[TailwindCSS v4](https://tailwindcss.com)** — 설정 파일 없이 `app/globals.css`에서 관리
- **[shadcn/ui](https://ui.shadcn.com)** + [Radix UI](https://www.radix-ui.com)
- **[Lucide React](https://lucide.dev)** — 아이콘
- **[next-themes](https://github.com/pacocoursey/next-themes)** — 클래스 기반 다크 모드
- **[Notion API](https://developers.notion.com)** — 콘텐츠 소스 (도입 예정)

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # 환경변수 설정
npm run dev                  # http://localhost:3000
```

## 환경변수

`.env.local`에 설정합니다. **실제 값은 저장소에 커밋하지 마세요.**

| 키 | 설명 |
|---|---|
| `NOTION_API_KEY` | Notion 통합(Integration) 시크릿. 서버 전용 |
| `NOTION_PROJECTS_DATA_SOURCE_ID` | Projects Database의 data source ID |

> 최신 Notion API(`2025-09-03`)는 `databases.query`가 아니라 **`dataSources.query({ data_source_id })`** 를 사용합니다. 웹에 흔한 `database_id` 예제는 구버전이므로 주의하세요. 자세한 근거는 PRD §7.2에 있습니다.

Notion 쪽에서는 통합을 생성한 뒤, 대상 Database 페이지에 그 통합의 연결 권한을 부여해야 합니다. 권한이 없으면 API가 Database를 찾지 못합니다.

## 프로젝트 구조

```
├── app/                    # App Router
│   ├── globals.css        # Tailwind 설정 전체 (@theme inline / :root / .dark)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # Navbar, Footer, ThemeToggle
│   └── providers/         # ThemeProvider
├── lib/
│   ├── site-config.ts     # 사이트 이름·설명·네비게이션의 단일 출처
│   └── utils.ts           # cn()
├── docs/
│   ├── PRD.md             # MVP 요구사항 정의
│   └── prd-meta-prompt.md # PRD 생성에 사용한 메타 프롬프트
└── public/
```

### 콘텐츠의 단일 출처

사이트 이름, 설명, 네비게이션 링크는 `lib/site-config.ts`의 `SITE_CONFIG` 한 곳에만 존재합니다. `app/layout.tsx`의 메타데이터, Navbar, Footer, 각 페이지가 모두 이 값을 참조하므로 **이름이나 메뉴를 바꿀 때는 이 파일만 고치면 됩니다.**

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (Turbopack, 포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과물로 프로덕션 서버 실행 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입 체크 |

**테스트 러너가 없습니다.** 검증 수단은 타입 체크 + 린트 + 개발 서버 수동 확인입니다.

## UI 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

## 배포

Vercel을 기본 대상으로 가정합니다. ISR(`revalidate`) 동작 방식이 호스팅에 따라 달라지므로, 다른 플랫폼을 쓴다면 PRD §8의 렌더링 전략을 재검토해야 합니다.

## 출처

[gymcoding/claude-nextjs-starterkit](https://github.com/gymcoding/claude-nextjs-starterkit)을 기반으로 시작했습니다. 이후 변경사항은 원본과 동기화되지 않습니다.
