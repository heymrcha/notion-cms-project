# Notion CMS PM 포트폴리오 개발 로드맵

Notion Database 하나를 CMS로 삼아, 코드 수정·재배포 없이 갱신되는 PM 프로젝트 포트폴리오 사이트를 만든다.

## 개요

Notion CMS PM 포트폴리오는 채용 담당자를 위한 읽기 전용 프로젝트 포트폴리오 사이트로, 포트폴리오 주인이 Notion에서 글을 쓰면 60초 안에 사이트에 반영된다. 다음 기능을 제공합니다:

- **프로젝트 목록 (`/projects`)**: `Published` 프로젝트 전량을 `Order` 내림차순 → `Period Start` 내림차순으로 카드 그리드에 나열
- **프로젝트 상세 (`/projects/[slug]`)**: 제목·Outcome·Role·기간·Tags 메타와 Notion 본문 블록(§6.3 7종) 렌더, 외부 링크 버튼
- **Notion 페치·매핑 계층 (`lib/notion/*`)**: `@notionhq/client`의 `dataSources.query`로 조회하고 타입 가드로 앱 전용 `Project` 타입에 매핑 (`any` 금지)
- **ISR 캐싱**: `export const revalidate = 60` + `generateStaticParams`로 정적 생성 후 60초 주기 재검증
- **사이트 셸 재사용**: 기존 Navbar / Footer / 다크 모드 / `SITE_CONFIG` 그대로 활용

**기술 스택**: Next.js 16 App Router, TypeScript, TailwindCSS v4(`app/globals.css`), shadcn/ui, next-themes, `@notionhq/client`(Notion API `2025-09-03`)

**비목표(PRD §2)**: 콘텐츠 작성 UI, 인증·관리자 화면, 검색·필터·페이지네이션, 블로그 계층, 전체 블록 지원, 댓글·조회수·RSS·다국어, 테스트 러너 도입. 이 항목들은 로드맵에 Task로 넣지 않는다.

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-routes-skeleton.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `012`라면 `011`과 `010`을 예시로 참조.
- 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업의 경우, 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조.

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- Next.js 16은 학습 데이터와 다르므로 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽는다
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 `npx tsc --noEmit` + `npm run lint` 오류 0 확인(S6), Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

## 코드 관례 (모든 Task 공통)

- `any` 금지. 외부 응답은 `unknown` + 타입 가드로 좁힌다
- 신규 컴포넌트는 전부 서버 컴포넌트. 클라이언트 훅이 필요한 경우가 MVP에는 없다
- 색은 `bg-background`, `text-muted-foreground` 같은 토큰만. 하드코딩 hex·`text-gray-*` 금지
- 컨테이너 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합 `cn()`
- 페이지마다 `export const metadata: Metadata`, 제목은 `` `${제목} | ${SITE_CONFIG.name}` ``
- 페이지 내 반복 데이터는 모듈 스코프 `UPPER_SNAKE_CASE` 상수 배열
- 응답·문서·주석·UI 문자열은 한국어, 코드 식별자는 영어

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- ✅ **Task 001: 프로젝트 라우트 골격 및 특수 파일 생성** - See: /tasks/001-routes-skeleton.md
  - `app/projects/page.tsx` 빈 껍데기 생성(`metadata` 제목 `` `프로젝트 | ${SITE_CONFIG.name}` ``, 컨테이너 클래스, 자리표시 문구)
  - `app/projects/[slug]/page.tsx` 빈 껍데기 생성(`params`는 Next.js 16 규약에 맞춰 Promise로 처리, 로컬 문서로 확인)
  - `app/projects/loading.tsx`, `app/projects/[slug]/loading.tsx` 자리 파일(내용은 Phase 4 F7에서 채움) — Task 005에서 R5로 삭제됨
  - `app/projects/[slug]/error.tsx`(클라이언트 컴포넌트 필수 — 유일한 예외), `app/projects/[slug]/not-found.tsx` 자리 파일
  - `SITE_CONFIG.navLinks`의 `/projects`가 더 이상 404가 아님을 개발 서버에서 확인
  - F5 잔여 확인: `/docs` 삭제·`v1.0.0` 배지 제거·스타터 문구 정리가 워킹 트리에 반영됐는지 재점검 후 커밋

- ✅ **Task 002: Notion 타입 정의 및 페치 계층 파일 골격 작성** - See: /tasks/002-notion-types-and-fetch-skeleton.md
  - `lib/notion/types.ts`: PRD §7.1 `Project` 타입, `ProjectListItem`(카드에 필요한 필드 부분집합), `NotionBlock` 유니온(§6.3 7종 + `RichText` 인라인 서식: 굵게·기울임·인라인 코드·링크)
  - `lib/notion/client.ts`: 단일 인스턴스 export 시그니처(`server-only` import로 클라이언트 번들 유입 차단, 구현은 Phase 3)
  - `lib/notion/queries.ts`: `getPublishedProjects(): Promise<Project[]>`, `getProjectBySlug(slug): Promise<Project | null>`, `getProjectBlocks(pageId): Promise<NotionBlock[]>` 시그니처만 (본문은 `throw new Error("미구현")` 또는 빈 값)
  - `lib/notion/mappers.ts`: `mapPageToProject(page: unknown): Project | null`, `mapBlock(block: unknown): NotionBlock | null` 시그니처만
  - `.env.example`에 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID` 추가(설명 주석 한국어, `NEXT_PUBLIC_` 접두사 없음)
  - `npx tsc --noEmit` 통과

- ✅ **Task 003: 프로젝트 컴포넌트 골격 및 더미 데이터 유틸리티 작성** - See: /tasks/003-project-components-and-mock-data.md
  - `components/projects/project-card.tsx`, `components/projects/project-grid.tsx`, `components/projects/project-header.tsx`, `components/projects/notion-blocks.tsx`, `components/projects/empty-state.tsx`, `components/projects/error-state.tsx` 빈 껍데기(props 타입만 정의)
  - `lib/notion/mock-data.ts`: `Project` 타입을 따르는 더미 프로젝트 3건 + `NotionBlock[]` 더미 본문(7종 블록·인라인 서식·연속 리스트·미지원 블록 포함) — Phase 2 전용, Phase 3에서 제거
  - 각 컴포넌트가 서버 컴포넌트임을 확인(`"use client"` 없음)

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- ✅ **Task 004: 프로젝트 카드 및 목록 그리드 UI 구현** - See: /tasks/004-project-card-grid.md
  - `project-card.tsx`: shadcn `card` + `badge`로 제목·`Outcome`·기간(`Period End` 없으면 "진행 중")·`Tags` 배지 렌더. 제목 `<Link>`에 접근 가능한 이름 부여(카드 전체 링크 금지, §10 접근성)
  - 기간 포맷 유틸 `lib/format-period.ts`(ISO → `2025.03 – 2025.08` / `2025.03 – 진행 중`)
  - `project-grid.tsx`: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - `app/projects/page.tsx`에 더미 3건 연결, 정렬 규칙(`Order` desc → `Period Start` desc)을 `lib/notion/sort-projects.ts` 순수 함수로 구현해 더미에 적용
  - `empty-state.tsx`("아직 발행된 프로젝트가 없습니다"), `error-state.tsx`("프로젝트를 불러오지 못했습니다") 완성 및 목록 페이지에서 조건부 렌더 경로 확보
  - Playwright MCP로 375/768/1280에서 열 수·가로 스크롤 없음·다크 모드 대비 확인

- ✅ **Task 005: 프로젝트 상세 상단 메타 UI 구현** - See: /tasks/005-project-detail-header.md
  - `project-header.tsx`: `<h1>` 제목, `Outcome` 강조 문구, `Role`, 기간, `Tags` 배지
  - `External URL` 있을 때만 하단에 shadcn `button` 링크(`target="_blank" rel="noreferrer"`) 렌더
  - `Cover` 자리는 고정 비율 컨테이너(`aspect-video`)만 확보(이미지 자체는 Phase 4 F8)
  - `app/projects/[slug]/page.tsx`에 더미 연결, 더미에 없는 slug는 `notFound()` 호출
  - `not-found.tsx`: "프로젝트를 찾을 수 없습니다" + `/projects` 복귀 링크. `error.tsx`: 안내 문구 + `retry` 버튼(Next.js 16.3.4 로컬 문서 기준 prop 이름은 `reset`이 아니라 `retry`이며, Task 001에서 이미 `retry` 시그니처로 작성됨)
  - Playwright MCP로 목록 → 상세 → 외부 링크 → 뒤로 가기 흐름과 404 렌더 확인

- ✅ **Task 006: Notion 블록 렌더러 구현** - See: /tasks/006-notion-block-renderer.md
  - `notion-blocks.tsx`: `paragraph`→`<p>`, `heading_1/2/3`→`<h2>/<h3>/<h4>`, `quote`→`<blockquote>`, `divider`→`<hr>`, `code`→`<pre><code>`(하이라이팅 없음), `image`→고정 비율 컨테이너 + `alt`(실제 `next/image` 적용은 Phase 4 F8)
  - 연속 `bulleted_list_item` / `numbered_list_item`을 하나의 `<ul>` / `<ol>`로 묶는 그룹핑 로직(순수 함수로 분리, `lib/notion/group-blocks.ts`)
  - `rich-text.tsx`: 굵게·기울임·인라인 코드·링크 인라인 서식 렌더(`<strong>`, `<em>`, `<code>`, `<a>`)
  - 유니온에 없는 블록 타입은 `null` 반환으로 조용히 스킵, 중첩 블록은 한 단계만 처리
  - 본문 타이포그래피는 토큰 색만 사용, heading 레벨 건너뛰지 않음(§10)
  - Playwright MCP로 더미 본문의 7종 블록·인라인 서식·리스트 묶기·미지원 블록 스킵 시각 확인

- ✅ **Task 007: 홈 히어로 및 최근 프로젝트 3건 섹션 구현** - See: /tasks/007-home-recent-projects.md
  - `app/page.tsx` 히어로: 포트폴리오 소개 문구(`SITE_CONFIG.name`/`description` 참조) + `/projects` CTA 버튼
  - "최근 프로젝트" 섹션: Task 004의 `sortProjects`(`lib/notion/sort-projects.ts`)로 정렬한 상위 3건을 `project-card.tsx` 재사용으로 렌더 + "전체 보기" 링크(더미 데이터)
  - 0건이면 섹션 자체를 숨김(홈은 빈 상태 문구를 띄우지 않음)
  - F5 완료 항목 최종 점검: ✅ `SITE_CONFIG` 교체 / ✅ `/docs` 제거 / ✅ `v1.0.0` 배지 제거 / 히어로 + 최근 3건(이 Task에서 완료)
  - Playwright MCP로 375/1280 반응형 및 다크 모드 확인

### Phase 3: 핵심 기능 구현

- ✅ **Task 008: Notion Database 준비 및 SDK 설치 (M1 선행)** - See: /tasks/008-notion-database-setup.md
  - `npm i @notionhq/client` 설치 후 **설치된 버전의 타입 정의를 먼저 확인**(R1: `dataSources.query`가 존재하는지, `databases.query`는 쓰지 않음)
  - Context7로 `@notionhq/client` 최신 문서(`dataSources.query`, `blocks.children.list`, 페이지네이션, 에러 코드) 조회
  - Projects Database 페이지에 통합(Integration) 연결 권한 부여(사용자 수작업). 미완료 시 API가 `object_not_found`를 반환하므로 Task 009 착수 전 반드시 확인
  - ✅ 완료됨(세션 밖): Notion 통합 생성 및 API 키 발급, Projects Database를 §6.1 스키마(12개 속성)로 생성(Notion MCP 사용) — Task 착수 시 확인만
  - ✅ 완료됨(세션 밖): 더미 프로젝트 3건(`Published` 체크, `Order`·`Period Start` 값 분산, 1건 `Period End` 비움, 1건 `External URL` 포함, 본문에 §6.3 7종 블록·인라인 서식·토글 포함) + 미발행 1건 입력 — Task 착수 시 확인만
  - ✅ 완료됨(세션 밖): `.env.local`에 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID` 설정(Database ID가 아닌 data source ID임을 확인), `.gitignore`의 `.env*` 반영 확인 — Task 착수 시 확인만

- ✅ **Task 009: Notion 클라이언트 및 쿼리·매퍼 구현 (M1)** - See: /tasks/009-notion-queries-mappers.md
  - `client.ts`: `server-only` + 환경 변수 누락 시 명확한 에러 메시지, `Client` 단일 인스턴스
  - `queries.ts`: `notion.dataSources.query({ data_source_id, filter: Published = true, sorts: [Order desc, Period Start desc] })`; `has_more`/`next_cursor`로 전량 페치; `getProjectBySlug`는 `Slug` equals 필터 + `Published` 필터를 AND로 적용; `getProjectBlocks`는 `blocks.children.list` 전량 페치
  - 재시도: SDK 5.26 내장 로직(`Client({ retry: { maxRetries: 3 } })` — `Retry-After` 존중, 지수 백오프+지터, 429/529 대상)을 사용. `lib/notion/retry.ts`는 예외를 빈 배열/`null`로 바꾸는 `safeFetch`만 담당 (throw 금지, 빌드 실패 방지). 자체 루프를 겹치면 대기가 곱으로 늘어나 채택하지 않음
  - `mappers.ts`: `isFullPage` 등 SDK 타입 가드 + 속성별 `unknown` 가드로 `Project` 변환. 필수 속성 누락·타입 불일치 행은 `null` 반환 + `console.warn`(페이지 ID·누락 속성명). `Slug` 중복 시 정렬 기준 첫 행 채택 + 경고. `Order` 비면 0
  - 블록 매퍼: §6.3 7종만 `NotionBlock`으로 변환, 그 외는 `null`. rich text 배열의 `annotations`(bold/italic/code)와 `href` 반영
  - `NOTION_API_KEY`가 클라이언트 번들에 없는지 확인(`npm run build` 후 `.next/static` grep)
  - **완료 판정(M1)**: 임시 서버 컴포넌트에서 `getPublishedProjects()` 출력 시 3건이 정렬 규칙대로, 미발행 1건 제외, `npx tsc --noEmit` 통과. Playwright MCP로 화면 출력 확인

- **Task 010: 더미 데이터를 실제 Notion 데이터로 교체 및 에러 처리 연결** - 우선순위
  - `app/projects/page.tsx`: Task 004에서 만든 `Project[] | null` 분기(`null` → `ErrorState`, `[]` → `EmptyState`, 404 아님)를 유지한 채 `MOCK_PROJECTS` 대입만 `getPublishedProjects()` 호출로 교체
  - `app/projects/[slug]/page.tsx`: `getProjectBySlug()` → 없거나 미발행이면 `notFound()`, 있으면 `getProjectBlocks()`로 본문 렌더. 페치 예외는 `error.tsx`가 받도록 처리
  - `app/page.tsx`: 최근 3건을 실제 데이터로 교체(실패 시 섹션 숨김)
  - `lib/notion/mock-data.ts` 삭제 및 참조 제거
  - `generateMetadata`: 제목 `` `${Title} | ${SITE_CONFIG.name}` ``, `description`은 `Summary`
  - Playwright MCP로 실제 데이터 목록·상세·404(없는 slug / 미발행 slug)·외부 링크 확인

- **Task 011: ISR 적용 및 프로덕션 빌드 검증 (M3)**
  - `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`에 `export const revalidate = 60`
  - `generateStaticParams`가 발행된 slug 목록 반환. Notion 실패 시 빈 배열 반환(R3: 빌드 실패시키지 않음), `dynamicParams` 기본값(허용) 유지로 빌드 후 추가된 프로젝트도 첫 요청에 생성
  - `generateStaticParams`는 재검증 시 재호출되지 않음을 문서로 확인하고 주석에 "왜" 남김
  - `npm run build` → `npm run start`로 프로덕션 실행, 빌드 로그에서 `/projects`와 `/projects/[slug]`가 ISR로 표기되는지 확인
  - Notion에서 제목 수정 → 60초 대기 → 2회 새로고침으로 반영 실측(S1·S2), `Published` 해제 → 목록에서 사라지고 상세 404(S3)
  - `npm run lint` 오류 0(S6)

- **Task 011-1: 핵심 기능 통합 테스트 (Playwright MCP)**
  - S1: Notion에 프로젝트 1건 추가·`Published` 체크 → 60초 후 목록·상세 노출
  - S2: 제목·요약 수정 → 60초 후 반영
  - S3: `Published` 해제 → 목록 제외, 상세 URL 404
  - S5: 잘못된 `NOTION_API_KEY`로 개발 서버 기동 → 목록에 오류 안내, 상세에 `error.tsx`, 흰 화면 없음. 잘못된 `NOTION_PROJECTS_DATA_SOURCE_ID`도 동일 확인
  - S6: `npx tsc --noEmit` + `npm run lint` 오류 0
  - 엣지 케이스: 필수 속성 누락 행 추가 → 해당 행만 제외 + 서버 경고 로그; `Slug` 중복 행 추가 → 첫 행 채택 + 경고; 0건 상태 → 빈 상태 문구; 미지원 블록 → 스킵되고 오류 없음
  - 사용자 플로우: `/` → `/projects` → 상세 → 외부 링크(새 탭) → 뒤로 가기 → 다른 상세, 375/768/1280 가로 스크롤 없음, 다크 모드 대비

### Phase 4: 고급 기능 및 최적화

- **Task 012: 로딩 스켈레톤 및 Cover 이미지 적용 (F7·F8)**
  - 스켈레톤은 `loading.tsx`가 아니라 **페이지 내부 `<Suspense>`** 로 구현(R5: `loading.tsx`는 `notFound()`의 404를 막음). 상세는 `getProjectBySlug` → `notFound()`를 Suspense 밖에서 끝낸 뒤 본문(`getProjectBlocks`)만 Suspense로 감싸 스켈레톤(`animate-pulse`, 토큰 색) 노출. CLS 방지를 위해 실제 레이아웃과 동일한 치수
  - R2 해소: Next.js 16 로컬 문서(`node_modules/next/dist/docs/`)로 `images.remotePatterns` 스키마 확인, 실제 Notion 파일 URL 호스트·경로 패턴을 API 응답에서 채취해 `next.config.ts`에 등록
  - `project-card.tsx`·`project-header.tsx`에 `next/image` 적용, `alt`는 `Title`, 고정 비율 컨테이너 유지(이미지 실패 시 레이아웃 불변)
  - `notion-blocks.tsx`의 `image` 블록에 `next/image` 적용(`sizes` 지정)
  - Notion 파일 URL 1시간 만료 vs 캐시 60초 관계를 주석으로 남기고, 만료 URL 시나리오를 Playwright MCP로 확인(깨진 이미지가 레이아웃을 무너뜨리지 않음)

- **Task 013: `/about` 페이지 재작성 및 sitemap·robots 생성 (F9·F10)**
  - U1 결정 반영: `/about`은 하드코딩. 소개·경력 요약을 모듈 스코프 `UPPER_SNAKE_CASE` 상수로 두고 `.map()` 렌더
  - `SITE_CONFIG`에 `siteUrl` 추가(U3: 도메인 확정 선행, 미확정 시 Vercel 기본 도메인으로 임시)
  - `app/sitemap.ts`: 정적 라우트(`/`, `/projects`, `/about`) + `getPublishedProjects()` 기반 상세 URL, `lastModified` 포함
  - `app/robots.ts`: 전체 허용 + sitemap 경로
  - Playwright MCP로 `/sitemap.xml`, `/robots.txt` 응답 및 `/about` 반응형 확인

- **Task 014: 성능 검증 및 Vercel 배포 (S4·U2)**
  - U2 확정: Vercel 배포. 환경 변수(`NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID`) 프로젝트 설정에 등록
  - 프로덕션 빌드 기준 Lighthouse 모바일 프리셋으로 `/projects` LCP 2.5초 이내·CLS 0.1 이하 측정(S4), 미달 시 이미지 `priority`/`sizes`·폰트 로딩·카드 수 조정
  - 배포 환경에서 S1~S3 재검증(ISR이 Vercel에서 기대대로 동작하는지)
  - `README.md`에 Notion 설정 절차(통합 생성·권한 부여·data source ID 확인)와 배포 절차 한국어로 정리
  - 비-Vercel 호스팅 전환 시 §8 재검토 필요 사항을 리스크 절에 유지

- **Task 015: 온디맨드 재검증 Route Handler 구현 (F11, P2)**
  - `app/api/revalidate/route.ts`: `NOTION_REVALIDATE_SECRET` 검증 후 `revalidatePath("/projects")`·`revalidatePath("/projects/[slug]", "page")`·`revalidatePath("/")` 호출
  - Notion 자동화(웹훅)에서 호출하도록 설정 절차 문서화, `.env.example`에 시크릿 키 추가
  - `revalidate`를 60 → 3600으로 늘릴지 여부는 웹훅 안정성 확인 후 결정
  - Playwright MCP + 직접 요청으로 잘못된 시크릿 401, 올바른 시크릿 200 및 즉시 반영 확인

- **Task 016: 태그 필터링 구현 (F12, P2 — R4 트리거 시)**
  - 착수 조건: 발행 프로젝트 20건 도달(R4). 그 전에는 착수하지 않음
  - URL 검색 파라미터(`?tag=`) 기반 서버 사이드 필터로 클라이언트 훅 없이 구현, 태그 목록은 `Tags` 집계
  - 필터 적용 상태에서도 정렬 규칙·빈 상태 유지
  - Playwright MCP로 필터 선택·해제·직접 URL 접근 확인

- **Task 017: OG 이미지 자동 생성 (F13, P2)**
  - `app/projects/[slug]/opengraph-image.tsx`로 `Title`·`Outcome` 기반 OG 이미지 생성(Next.js 16 로컬 문서로 API 확인)
  - `generateMetadata`에 `openGraph`·`twitter` 메타 연결
  - Playwright MCP로 `/projects/[slug]/opengraph-image` 응답 및 메타 태그 확인

## 리스크·미결 사항

| ID | 내용 | 반영 위치 | 대응 |
|---|---|---|---|
| R1 | Notion API `databases` → `data sources` 전환 직후라 웹 예제·SDK 타입 세대가 섞여 있음 | Task 008, 009 | 설치된 `@notionhq/client` 타입 정의와 Context7 문서를 먼저 확인. `dataSources.query({ data_source_id })`만 사용, `databases.query` 금지 |
| R2 | `images.remotePatterns` 스키마와 Notion S3 URL 호스트·경로 패턴 미검증 | Task 012 | F8 착수 시 Next.js 16 로컬 문서 재확인. MVP(P0)는 `Cover` 없이 성립 |
| R3 | 빌드 시 Notion 실패로 `generateStaticParams`가 빈 배열을 반환할 수 있음 | Task 009, 011 | 페치 계층이 throw하지 않고 빈 값 반환, `dynamicParams` 기본값 유지로 런타임 생성 |
| R4 | 프로젝트 20건 초과 시 필터·페이지네이션 부재가 실제 문제 | Task 016 | 20건 도달 시 F12 착수 재평가 |
| U1 | `/about` 경력 정보의 출처(Notion vs 하드코딩) | Task 013 | MVP는 하드코딩으로 확정. 갱신 빈도가 낮아 CMS화 이득이 작음 |
| U2 | 배포 대상을 Vercel로 가정 | Task 014 | 다른 호스팅이면 ISR 동작이 달라지므로 PRD §8 재검토 |
| U3 | 도메인 연결 여부·주소 미정 | Task 013 | F10(sitemap) 착수 전 확정 필요. 미정 시 Vercel 기본 도메인으로 임시 진행 |
| R5 | `loading.tsx`가 있으면 응답이 스트리밍되어 `notFound()`가 HTTP 404 대신 200 + `noindex` 메타로 내려감(Next 문서 `loading.md` §Status Codes) | Task 005(결정 완료), 012 | **결정: 두 `loading.tsx` 삭제**(Task 005). 개발·프로덕션·ISR 모두 404 확인. Task 012 스켈레톤은 `loading.tsx` 대신 페이지 내부 `<Suspense>`로 본문만 감싸고, `notFound()` 존재 확인은 Suspense 밖(스트리밍 전)에서 수행 |

## Phase 간 병렬 작업 가능성

- Phase 2(Task 004~007)와 Phase 3의 Task 008~009는 서로 의존하지 않는다. `types.ts`(Task 002)가 계약이므로 UI와 페치 계층을 동시에 진행할 수 있다.
- Task 010은 Phase 2 전체와 Task 009가 끝나야 착수 가능하다.
- Task 012~014는 Task 011-1 이후 순서 무관하게 진행 가능하다. Task 015~017은 필요 시점에 착수한다.
