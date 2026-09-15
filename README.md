# Notion CMS 포트폴리오

Notion을 CMS로 사용하는 개인 포트폴리오 웹사이트입니다. 프로젝트 기록을 Notion Database에서 관리하고, 웹사이트는 그것을 읽어 렌더링합니다. **콘텐츠를 고치기 위해 코드를 수정하거나 재배포할 필요가 없습니다.**

주 독자는 채용 담당자이며, "어떤 프로젝트에서 어떤 역할로 무슨 성과를 냈는가"를 빠르게 파악하는 것이 사이트의 목적입니다.

## 현재 상태

**MVP 구현 완료, 배포 단계입니다.** Notion Database 연동(`lib/notion/*`), 프로젝트 목록·상세 화면, Notion 블록 렌더러, ISR(60초 재검증), 스켈레톤·이미지 최적화, `/about`, `sitemap.xml`·`robots.txt`까지 구현되어 있습니다. 진행 상황은 [`ROADMAP.md`](ROADMAP.md), 요구사항은 [`docs/PRD.md`](docs/PRD.md), 작업별 기록은 [`tasks/`](tasks/)에 있습니다.

남은 것: Vercel 배포와 배포 환경 성능 측정(Task 014), 온디맨드 재검증·태그 필터·OG 이미지(P2).

## 기술 스택

- **[Next.js 16](https://nextjs.org)** — App Router, 서버 컴포넌트 기본
- **[React 19](https://react.dev)**
- **[TypeScript](https://www.typescriptlang.org)** — `any` 금지
- **[TailwindCSS v4](https://tailwindcss.com)** — 설정 파일 없이 `app/globals.css`에서 관리
- **[shadcn/ui](https://ui.shadcn.com)** + [Radix UI](https://www.radix-ui.com)
- **[Lucide React](https://lucide.dev)** — 아이콘
- **[next-themes](https://github.com/pacocoursey/next-themes)** — 클래스 기반 다크 모드
- **[Notion API](https://developers.notion.com)** — 콘텐츠 소스. `@notionhq/client` 5.x, API 버전 `2025-09-03`

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
| `NOTION_REVALIDATE_SECRET` | (선택) 온디맨드 재검증 시크릿. 비우면 `/api/revalidate`가 503으로 닫힘 |

> 최신 Notion API(`2025-09-03`)는 `databases.query`가 아니라 **`dataSources.query({ data_source_id })`** 를 사용합니다. 웹에 흔한 `database_id` 예제는 구버전이므로 주의하세요. 자세한 근거는 PRD §7.2에 있습니다.

### Notion 설정 절차

1. **통합 생성** — [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 내부 통합(Internal Integration)을 만들고 시크릿을 복사해 `NOTION_API_KEY`에 넣습니다. 권한은 "콘텐츠 읽기"만 있으면 됩니다.
2. **Database 생성** — PRD §6.1 스키마(속성 12개: `Title`, `Slug`, `Published`, `Summary`, `Outcome`, `Role`, `Period Start`, `Period End`, `Tags`, `Cover`, `External URL`, `Order`)로 Projects Database를 만듭니다. 속성 이름은 코드가 그대로 읽으므로 정확히 맞춰야 합니다.
3. **통합 연결** — Database 페이지 우상단 `···` → **연결** → 1번에서 만든 통합을 추가합니다. 이 단계를 빼먹으면 API가 `object_not_found`를 돌려줍니다.
4. **data source ID 확인** — Database ID가 아니라 **data source ID**가 필요합니다. 아래 명령으로 Database에 속한 data source를 조회할 수 있습니다(`<database_id>`는 Database URL의 32자리 ID).

   ```bash
   curl -s https://api.notion.com/v1/databases/<database_id> \
     -H "Authorization: Bearer $NOTION_API_KEY" \
     -H "Notion-Version: 2025-09-03" | jq '.data_sources[].id'
   ```

   출력된 ID를 `NOTION_PROJECTS_DATA_SOURCE_ID`에 넣습니다.
5. **확인** — `npm run dev` 후 `/projects`에 `Published` 체크된 행이 보이면 끝입니다. 오류 안내가 보이면 서버 로그의 `[notion] … 실패 — <code>` 줄에서 원인(`unauthorized`: 키 오류, `object_not_found`: 연결 권한 또는 ID 오류)을 확인하세요.

### 콘텐츠 작성 규칙

- `Published`를 체크한 행만 사이트에 나옵니다. 초안은 체크를 비워 두면 URL로도 노출되지 않습니다.
- 본문 최상위 제목은 **제목 1**(`heading_1`)로 시작하세요. 페이지 `<h1>`은 `Title`이 차지하므로 본문 제목이 한 단계씩 내려가며, 제목 2부터 시작하면 접근성 검사에서 heading 건너뜀이 잡힙니다.
- 지원 블록: 문단, 제목 1~3, 글머리·번호 목록, 인용, 구분선, 코드, 이미지. 토글·표·컬럼 등은 조용히 건너뜁니다.
- 링크 미리보기(OG 카드)에는 `Title`과 `Outcome`이 크게 들어갑니다. `Title`은 40자, `Outcome`은 48자를 넘기면 말줄임표로 잘립니다.
- `Order`는 대표작을 위로 올릴 때만 씁니다. 비우면 0으로 취급되고 `Period Start` 최신순으로 정렬됩니다.
- 수정 후 사이트 반영까지 최대 60초(ISR) 걸립니다. 아래 "즉시 반영"을 설정하면 다음 요청부터 바로 반영됩니다.

### 즉시 반영 (선택, Notion 자동화 웹훅)

`POST /api/revalidate`가 `/`, `/projects` 아래 전체(상세·OG 카드 포함), `/sitemap.xml`의 캐시를 무효화합니다. Notion 자동화의 웹훅 액션(유료 플랜)이 이 주소를 호출하게 하면 60초를 기다리지 않아도 됩니다.

1. `openssl rand -hex 32` 등으로 시크릿을 만들어 `.env.local`과 Vercel 환경 변수 `NOTION_REVALIDATE_SECRET`에 넣고 재배포합니다.
2. Projects Database 우상단 **⚡ 자동화** → 새 자동화 → 트리거: **속성 편집됨**(`Published`, `Title`, `Summary`, `Outcome` 등 사이트에 보이는 속성) 또는 **페이지 추가됨**.
3. 작업: **웹훅 보내기** → URL `https://notion-cms-project-kohl.vercel.app/api/revalidate` → **커스텀 헤더 추가**: 키 `Authorization`, 값 `Bearer <시크릿>`.
4. Notion에서 속성을 고친 뒤 사이트를 새로고침하면 바로 반영됩니다. 웹훅 없이 손으로 호출하려면:

   ```bash
   curl -X POST https://notion-cms-project-kohl.vercel.app/api/revalidate \
     -H "Authorization: Bearer $NOTION_REVALIDATE_SECRET"
   ```

- 시크릿은 헤더로만 받습니다(쿼리 파라미터는 접근 로그에 남음). 틀리면 401, 시크릿이 설정되지 않은 배포에서는 503입니다.
- 본문 블록만 고친 경우는 속성이 바뀌지 않아 자동화가 발동하지 않습니다. 이때는 60초 ISR을 기다리거나 아무 속성이나 한 번 바꾸세요.
- 웹훅이 안정적으로 발동하는 것을 확인한 뒤 `revalidate`를 60에서 3600으로 늘려 Notion 호출 횟수를 줄이는 선택지가 남아 있습니다(ROADMAP Task 015 후속).

## 프로젝트 구조

```
├── app/
│   ├── globals.css              # Tailwind 설정 전체 (@theme inline / :root / .dark)
│   ├── layout.tsx               # 루트 레이아웃 (폰트·테마·Navbar·Footer)
│   ├── page.tsx                 # 홈 — 히어로 + 최근 프로젝트 3건 (ISR 60초)
│   ├── about/page.tsx           # 소개 — 하드코딩 상수
│   ├── api/revalidate/route.ts  # 온디맨드 재검증 (POST, Bearer 시크릿)
│   ├── opengraph-image.tsx      # 사이트 OG 카드 (/projects·/about 이 상속)
│   ├── projects/
│   │   ├── page.tsx             # 목록 (ISR 60초, Suspense 스켈레톤)
│   │   └── [slug]/
│   │       ├── page.tsx         # 상세 (generateStaticParams + ISR, generateMetadata)
│   │       ├── opengraph-image.tsx  # Title·Outcome OG 카드 (ISR 60초)
│   │       ├── error.tsx        # 페치 예외 안내 (유일한 클라이언트 페이지 컴포넌트)
│   │       └── not-found.tsx    # 404
│   ├── sitemap.ts               # 정적 + 발행 프로젝트 URL (1시간 재검증)
│   └── robots.ts
├── components/
│   ├── ui/                      # shadcn/ui
│   ├── layout/                  # Navbar, Footer, ThemeToggle
│   ├── providers/               # ThemeProvider
│   └── projects/                # 카드·그리드·헤더·블록 렌더러·스켈레톤·빈/오류 상태
├── lib/
│   ├── site-config.ts           # 사이트 이름·설명·siteUrl·네비게이션의 단일 출처
│   ├── format-period.ts         # 기간 표기
│   ├── og-card.tsx              # OG 카드 레이아웃 (ImageResponse 용, hex 하드코딩 예외)
│   ├── utils.ts                 # cn()
│   └── notion/
│       ├── client.ts            # Notion Client 단일 인스턴스 (server-only, 재시도 3회)
│       ├── queries.ts           # getPublishedProjects / getProjectBySlug / getProjectBlocks
│       ├── mappers.ts           # Notion 응답 → Project / NotionBlock (타입 가드)
│       ├── types.ts             # 앱 전용 타입
│       ├── sort-projects.ts     # Order desc → Period Start desc
│       ├── group-blocks.ts      # 연속 리스트 항목 묶기
│       ├── file-host.ts         # Notion 파일 호스트 (next.config remotePatterns 와 공유)
│       └── retry.ts             # safeFetch — 예외를 빈 값으로
├── docs/PRD.md                  # MVP 요구사항
├── tasks/                       # 작업별 명세·검증 기록
└── ROADMAP.md                   # 개발 로드맵
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

## 배포 (Vercel)

1. [vercel.com/new](https://vercel.com/new)에서 이 GitHub 저장소를 Import 합니다. 프레임워크는 Next.js로 자동 감지되고 빌드 설정은 기본값 그대로 둡니다.
2. **Environment Variables**에 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID`를 등록합니다(Production·Preview 모두). 즉시 반영을 쓰려면 `NOTION_REVALIDATE_SECRET`도 함께 등록합니다.
3. Deploy. 빌드 로그에서 `/projects`·`/projects/[slug]`가 `Revalidate 1m`으로 표시되고 발행된 slug가 프리렌더되면 정상입니다.
4. 배포 도메인이 정해지면 `lib/site-config.ts`의 `siteUrl`을 그 값으로 바꿉니다. `sitemap.xml`·`robots.txt`가 이 값을 씁니다.
5. 배포 URL(현재 https://notion-cms-project-kohl.vercel.app)에서 Notion 제목을 수정하고 60초 뒤 새로고침 2회로 반영을 확인합니다(PRD S1~S3).

### 호스팅을 바꾸는 경우

ISR(`export const revalidate = 60`)과 `next/image` 최적화는 Node.js 서버 또는 그에 준하는 어댑터가 필요합니다. 정적 내보내기(`output: "export"`)나 이미지 최적화가 없는 플랫폼으로 옮긴다면 PRD §8의 렌더링 전략과 `next.config.ts`의 `images` 설정을 함께 재검토해야 합니다. 여러 인스턴스를 띄우는 자체 호스팅에서는 ISR 캐시가 인스턴스별로 나뉘므로 공유 캐시 핸들러가 필요합니다.

## 출처

[gymcoding/claude-nextjs-starterkit](https://github.com/gymcoding/claude-nextjs-starterkit)을 기반으로 시작했습니다. 이후 변경사항은 원본과 동기화되지 않습니다.
