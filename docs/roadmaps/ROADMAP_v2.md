# Notion CMS PM 포트폴리오 개발 로드맵 v2 (MVP 이후)

MVP가 배포된 Notion CMS 포트폴리오를 **운영 가능한 상태로 안정화**하고, 채용 담당자와의 접점(연락처)을 넓히며, 후속 요구를 트리거 조건과 함께 백로그로 관리한다.

> 이전 버전: [ROADMAP_v1.md](./ROADMAP_v1.md) — Phase 1~4(Task 001~017) 완료 기록. 이 문서는 Phase 5부터 다루며 Task 번호는 018부터 이어서 매긴다.

## 개요

### v1 요약·완료 상태

ROADMAP_v1의 Task 001~017이 전부 완료·배포됐다. 현재 운영 중인 사이트는 다음과 같다.

- **배포**: Vercel `https://notion-cms-project-kohl.vercel.app`, Next.js 16.3.4 App Router, TypeScript, TailwindCSS v4, shadcn/ui, next-themes
- **콘텐츠**: Notion Projects Database 하나(`@notionhq/client` `dataSources.query`), `lib/notion/*` 페치·매핑 계층(`any` 금지, 타입 가드)
- **캐싱**: ISR `revalidate = 60` + `generateStaticParams`, 온디맨드 재검증 `POST /api/revalidate`(Bearer 시크릿, `/projects` layout 타입 무효화)
- **화면**: `/`, `/projects`, `/projects/[slug]`, `/projects/tag/[tag]`(태그 필터 — R4 20건 미충족이었으나 사용자 지시로 진행), `/about`(하드코딩), 스켈레톤(`<Suspense>`), Cover·본문 `next/image`, OG 이미지 자동 생성, `sitemap.xml`·`robots.txt`
- **검증**: S1~S6 배포 환경에서 통과, `npx tsc --noEmit`·`npm run lint` 오류 0

### v2가 다루는 것

- **연락처 링크 (`/about`)**: 방명록 검토 결과를 대체하는 `SITE_CONFIG.contact` 기반 연락 섹션 — 채용 담당자가 바로 연락할 수 있는 접점
- **Cover 이미지 서명 URL 안정화**: Notion 파일 URL이 요청마다 바뀌고 1시간 뒤 만료되는 문제(R7)를 프록시 Route Handler로 흡수
- **운영 정리·결정**: 스타터 잔재 제거, `revalidate` 상향 여부 결정, 테스트 러너 도입 재논의(PRD N7)
- **백로그·보류 관리**: 트리거 조건이 명시된 낮은 우선순위 항목과, 보류된 방명록 설계 요지 보존

**기술 스택**: v1과 동일. 신규 의존성은 Task 022(Vitest) 착수 시에만 추가한다.

**비목표(PRD §2 유지)**: 콘텐츠 작성 UI, 인증·관리자 화면, 블로그 계층, 댓글·조회수·RSS·다국어. 방명록은 N1·N2·N6과 충돌해 **보류**(§"보류" 참조). Footer에 연락처를 노출하는 것도 Task 018 범위 밖이다.

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `docs/roadmaps/ROADMAP_v2.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `018-about-contact-links.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 현재 작업이 `018`이라면 `017`과 `016`을 예시로 참조.
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
- 신규 컴포넌트는 전부 서버 컴포넌트. 클라이언트 경계는 `error.tsx`와 기존 5개 파일 외에 만들지 않는다(보류된 방명록 폼은 예외 후보)
- 색은 `bg-background`, `text-muted-foreground` 같은 토큰만. 하드코딩 hex·`text-gray-*` 금지(OG 카드 `lib/og-card.tsx`만 예외)
- 컨테이너 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합 `cn()`
- 페이지마다 `export const metadata: Metadata`, 제목은 `` `${제목} | ${SITE_CONFIG.name}` ``
- 페이지 내 반복 데이터는 모듈 스코프 `UPPER_SNAKE_CASE` 상수 배열
- 사이트 정보(이름·설명·URL·메뉴·연락처)는 `lib/site-config.ts` 단일 출처. 다른 파일에 하드코딩하지 않는다
- 시크릿은 `NEXT_PUBLIC_` 접두사 없이 서버 전용. 개인정보를 수집하는 코드는 두지 않는다
- 응답·문서·주석·UI 문자열은 한국어, 코드 식별자는 영어

## 개발 단계

### Phase 5: 운영 안정화·신규 요구

- ✅ **Task 018: `/about` 연락처 링크 추가 (방명록 대체)** - See: /tasks/018-about-contact-links.md
  - 배경: 방문자가 글을 남기는 기능(방명록) 검토 요청 → PRD N1·N2·N6 충돌과 채용용 포트폴리오에서의 실효성 부족으로 **보류**하고 연락처 링크로 대체(§"보류" 참조). shrimp ID `2aa9cb04-58af-4ed0-8831-80cf14f775aa`
  - `lib/site-config.ts`에 `contact: { email, linkedin, github }` 추가(각 선택, 빈 문자열 = 미설정). `as const` 유지, 사이트 정보 단일 출처 원칙. 실제 값은 사용자가 채운다
  - `app/about/page.tsx` 하단 "연락" 섹션: 값이 있는 항목만 모듈 스코프 상수 배열 + `.map()`으로 렌더. 이메일은 `mailto:`, LinkedIn·GitHub는 `target="_blank" rel="noreferrer"`. lucide 아이콘(`Mail`, 외부 링크는 `ExternalLink` — lucide-react 1.x 에 브랜드 아이콘 없음) + shadcn `Button asChild variant="outline"`
  - 세 값이 전부 비면 섹션 자체를 숨긴다(자리 표본 노출 금지). 클라이언트 훅 없음, 개인정보 수집 없음, Footer 노출은 범위 밖
  - 검증: `npx tsc --noEmit`·`npm run lint` 오류 0. Playwright MCP로 (1) 값 설정 시 링크 3개의 `href`·`target`·`rel` 확인, (2) 일부만 설정 시 해당 항목만 렌더, (3) 전부 빈 값 시 섹션 미렌더, (4) 375/1280 가로 스크롤 없음·다크 모드 대비·접근성 스냅샷에서 링크에 접근 가능한 이름 확인

- **Task 019: Cover 이미지 서명 URL 프록시 Route Handler 구현 (R7)** - 우선순위
  - 문제: Notion 파일 URL은 요청마다 `X-Amz-Signature`가 바뀌고 1시간 뒤 만료. ISR 재생성마다 새 URL이 HTML에 들어가 `next/image`가 매번 다른 원본으로 취급 → Vercel Image Optimization transformations 누적(무료 월 5,000). 1시간 이상 미방문 페이지는 STALE 응답에 만료 URL이 남아 깨진 이미지가 1회 노출됨
  - 착수 전 Vercel Image Optimization 과금 규칙(transformations 산정 단위, 동일 원본 판정 기준)을 Context7·공식 문서로 재확인하고 작업 파일에 근거를 남긴다
  - `app/api/cover/[pageId]/route.ts`: `pageId`로 Notion 페이지의 `Cover` 파일 URL을 재조회해 이미지 바이트를 스트리밍하거나 302로 전달. 응답 `Cache-Control`은 만료(1시간)보다 짧게(예: `s-maxage=3000`). 잘못된 `pageId`·Cover 없음은 404, Notion 실패는 502(흰 화면·빌드 실패 없음). `pageId` 형식 검증(UUID) 후에만 Notion 호출
  - `project-card.tsx`·`project-header.tsx`의 `next/image` `src`를 안정된 `/api/cover/[pageId]`로 교체. `lib/notion/file-host.ts`·`next.config.ts`의 `remotePatterns`는 본문 `image` 블록에 아직 필요하므로 유지하되, 본문 이미지도 같은 방식으로 풀지 여부를 작업 파일에 결정으로 남긴다
  - 대안 검토 기록: Cover를 Notion 업로드 대신 **외부 URL로만 쓰는 운영 규칙**이면 프록시 없이도 해결됨. 사용자가 이 규칙을 택하면 Route Handler 대신 README 운영 규칙 추가로 Task를 종료한다
  - 검증: `npx tsc --noEmit`·`npm run lint` 오류 0. `curl -I /api/cover/<pageId>` 200·`content-type: image/*`·`Cache-Control` 확인, 잘못된 pageId 404. Playwright MCP로 목록·상세 카드 이미지 로드 확인, 재검증 2회 후 HTML의 `<img src>`가 동일한지(서명 쿼리 미포함) 확인. Vercel 대시보드에서 배포 후 transformations 증가폭 비교

- **Task 020: 스타터 잔재·자리 표본 정리**
  - `public/file.svg`·`globe.svg`·`next.svg`·`vercel.svg`·`window.svg` 미사용 확인(`rg` 전수 검색) 후 삭제
  - `favicon.ico`(26KB) 경량화 또는 `app/icon.tsx`/SVG 아이콘으로 교체(Next.js 16 로컬 문서 `app-icons` 규약 확인). 크기 목표 5KB 이하
  - `app/about/page.tsx`의 `TODO(사용자 확인)` 상수(`INTRO_PARAGRAPHS`·`CAREER`·`SKILLS`)를 실제 내용으로 교체 — **내용은 사용자 제공 필요**. 미제공 시 이 항목만 남기고 Task 종료
  - `README.md` 구조 트리에서 삭제·추가된 파일 반영
  - 검증: `npx tsc --noEmit`·`npm run lint` 오류 0, `npm run build` 성공. Playwright MCP로 `/`·`/about` 렌더와 favicon 요청 200 확인

- **Task 021: `revalidate` 60 → 3600 상향 결정**
  - 착수 조건: **Task 019 완료 후**. 프록시 없이 상향하면 만료 이미지 노출 창이 60초 → 1시간으로 커진다(R7)
  - 웹훅 안정성 측정: Notion 자동화 → `POST /api/revalidate` 호출 성공률·지연을 1~2주 관찰(Vercel 로그). 실패 사례가 있으면 원인과 재시도 방안을 작업 파일에 기록
  - 결정 기준을 문서화: 웹훅이 안정적이면 `app/page.tsx`·`app/projects/**`·`opengraph-image.tsx`의 `revalidate`를 3600으로 통일하고 PRD §8 표의 "탈락한 대안" 절 갱신. 불안정하면 60 유지로 결정하고 Task 종료
  - R6(재발행 직후 한 주기 `noindex`) 재확인: 상향 시 창이 1시간으로 늘어나므로 재발행 절차에 "즉시 웹훅/수동 POST"를 README에 명시
  - 검증: `npm run build` 로그에서 ISR 주기 표기 확인. Playwright MCP로 Notion 수정 → 웹훅 → 즉시 반영(S1·S2 상당), 웹훅 없이 시간 경과 후 반영 확인

- **Task 022: 테스트 러너 도입 (PRD N7 재논의)**
  - 착수 전 사용자 결정: PRD N7("테스트 러너를 도입하지 않는다")을 해제할지. 해제 시 PRD §2 비목표와 §15에 변경 이력을 남긴다
  - Vitest 도입(Context7로 최신 설정 확인). `vitest.config.ts`, `npm test` 스크립트, `tsconfig` 포함 경로 조정. React 컴포넌트 테스트·E2E 러너(Playwright 패키지)는 범위 밖 — E2E는 계속 Playwright MCP 수동 수행
  - 순수 함수 단위 테스트: `sortProjects`(`Order` desc → `Period Start` desc, `Order` 비면 0), `groupBlocks`(연속 리스트 묶기·미지원 블록 스킵), `collectTags`, `mappers`(필수 속성 누락 → `null` + 경고, `Slug` 중복 → 첫 행 채택), `clampText`(`lib/og-card.tsx`), `dedupeBySlug`, `formatPeriod`
  - `mappers` 테스트용 Notion 응답 픽스처는 실제 API 응답을 채취해 `tests/fixtures/`에 두되 시크릿·워크스페이스 ID를 제거한다
  - `CLAUDE.md`의 "테스트 스위트가 없습니다" 문구와 `shrimp-rules.md` 검증 절차에 `npm test` 추가(이 Task에서 수정)
  - 검증: `npm test` 전부 통과, `npx tsc --noEmit`·`npm run lint` 오류 0, `npm run build`가 테스트 파일을 번들에 포함하지 않음

### 백로그 (트리거 조건)

착수 여부는 사용자가 결정한다. 트리거가 충족되기 전에는 Task 파일을 만들지 않는다.

| 항목 | 트리거 조건 | 요지 |
|---|---|---|
| 블록 타입 확장(콜아웃·토글·표) | 실제 프로젝트 본문에 해당 블록을 쓰기 시작할 때 | `lib/notion/types.ts` 유니온·`mappers.ts`·`notion-blocks.tsx` 확장. PRD §6.3 표 갱신. 토글은 `<details>`로 서버 렌더 |
| 카드 태그 배지를 필터 링크로 | `/projects/tag/[tag]` 유입이 필요하다고 판단할 때 | `project-card.tsx`의 `Badge`를 `<Link href="/projects/tag/…">`로. 카드 전체 링크 금지 원칙 유지 |
| 미사용 Radix JS(~49KB) 정리 | Lighthouse 성능 점수 하락 또는 번들 분석 시 | `dropdown-menu`·`label` 사용처 확인 후 미사용 shadcn 컴포넌트 삭제 |
| Vercel Analytics | 채용 시즌 등 방문 추이 확인이 필요할 때 | `@vercel/analytics` 추가. 개인정보 고지 문구 검토 |
| 페이지네이션(R4) | 발행 프로젝트 20건 도달 | 태그 필터는 Task 016으로 선반영. 목록 분할 방식(경로 세그먼트 `/projects/page/[n]`)은 ISR 유지 조건으로 결정 |

### 보류: 방명록

**결정**: 보류. PRD N1(쓰기 UI 없음)·N2(인증 없음)·N6(댓글 없음)과 충돌하고, 채용 담당자가 글을 남길 동기가 낮아 실효성이 작다. Task 018(연락처 링크)로 대체한다.

재개 시 설계 요지(사용자 지시가 있을 때만 Task로 승격):

- **저장소**: Notion "Guestbook" 데이터 소스. Projects와 **별도 통합·별도 DB**로 격리해 기존 읽기 전용 통합의 권한을 넓히지 않는다
- **승인제**: `Approved` 체크박스. 승인 전에는 노출하지 않는다. 이메일은 수집하지 않는다(닉네임·본문만)
- **쓰기 경로**: Server Function + honeypot 필드 + 서명된 시간 토큰(제출 최소 소요 시간 검증) + Notion 조회 기반 rate limit(최근 N분 내 동일 IP 해시 건수). 폼만 클라이언트 경계(`useActionState`) 허용 — 코드 관례의 명시적 예외
- **Task 분할(4개)**: (1) 문서·스키마·통합 생성 → (2) 읽기 경로 + `/guestbook` 페이지(ISR) → (3) Server Function + 폼 → (4) rate limit·개인정보 고지·Playwright MCP 테스트
- **하지 않는 것**: Giscus(GitHub 로그인 마찰), 외부 폼 서비스, 자체 DB 도입

## 리스크·미결 사항

| ID | 내용 | 반영 위치 | 대응 |
|---|---|---|---|
| R1 | Notion API `databases` → `data sources` 전환기, 예제·SDK 타입 세대 혼재 | v1 Task 008·009(해소) | `dataSources.query({ data_source_id })`만 사용. Task 019에서 파일 재조회 시 같은 원칙 |
| R2 | `images.remotePatterns`·Notion S3 URL 패턴 미검증 | v1 Task 012(해소) | 호스트 `prod-files-secure.s3.us-west-2.amazonaws.com`, `lib/notion/file-host.ts`. Task 019 후 본문 이미지에만 필요 |
| R3 | 빌드 시 Notion 실패로 `generateStaticParams` 빈 배열 | v1 Task 009·011(해소) | 페치 계층 throw 금지, `dynamicParams` 기본값. Task 019 Route Handler도 같은 원칙 |
| R4 | 20건 초과 시 필터·페이지네이션 부재 | v1 Task 016(필터 선반영) | 페이지네이션은 백로그(20건 트리거) |
| U1 | `/about` 출처 | v1 Task 013(확정: 하드코딩) | Task 018·020에서 하드코딩 상수 확장·교체 |
| U2 | 배포 대상 | v1 Task 014(확정: Vercel) | Task 019·021은 Vercel 과금·로그를 전제. 호스팅 변경 시 재검토 |
| U3 | 도메인 | v1 Task 013·014(확정: Vercel 기본 도메인) | `SITE_CONFIG.siteUrl` 한 곳. 커스텀 도메인 연결 시 교체 |
| R5 | `loading.tsx`가 `notFound()` 404를 막음 | v1 Task 005·012(결정 완료) | `loading.tsx` 금지 유지, 스켈레톤은 페이지 내부 `<Suspense>` |
| R6 | 시간 기반 재검증 시 재발행 직후 한 주기 `noindex` | v1 Task 011·015(관찰) | 웹훅·수동 POST로 우회. Task 021 상향 시 README 절차 명시 |
| **R7** | Notion Cover 서명 URL이 요청마다 바뀌고 1시간 만료 → `next/image` transformations 누적(무료 월 5,000), 미방문 페이지 STALE 응답에 만료 URL로 깨진 이미지 1회 노출 | Task 019, 021 | 안정된 `/api/cover/[pageId]` 프록시 또는 외부 URL 운영 규칙. **프록시 전에는 `revalidate` 상향 금지** |
| **U4** | Task 018 연락처 실제 값(이메일·LinkedIn·GitHub) 미확정 | Task 018 | 사용자가 `SITE_CONFIG.contact`에 채움. 전부 비면 섹션 미노출이라 배포에 지장 없음 |
| **U5** | PRD N7(테스트 러너 미도입) 해제 여부 | Task 022 | 사용자 결정 후 착수. 해제 시 PRD §2·§15 이력 기록 |
| **U6** | `/about` 자리 표본 실제 내용 | Task 020 | 사용자 제공 필요. 미제공 시 해당 항목만 남기고 Task 종료 |
| **R8** | Task 019 Route Handler가 방문자 요청마다 Notion을 호출하면 rate limit(초당 3회)에 닿을 수 있음 | Task 019 | 응답 `Cache-Control` `s-maxage`로 Vercel CDN 캐시, 캐시 수명은 파일 만료(1시간)보다 짧게. SDK 내장 재시도 유지 |

## Phase 간 병렬 작업 가능성

- Task 018은 다른 Task와 의존이 없어 즉시 착수 가능하다.
- Task 019와 020은 서로 독립이다. 단 020의 `README.md` 구조 트리 갱신은 019가 추가한 파일을 포함해야 하므로 019 이후가 깔끔하다.
- Task 021은 **반드시 Task 019 이후**(R7). 웹훅 관찰 기간(1~2주)이 필요하므로 019 완료 직후 관찰을 시작하고 022와 병행한다.
- Task 022는 U5 결정만 있으면 언제든 착수 가능하며 018~021과 독립이다.
- 백로그 항목은 트리거 충족 시 Task 023부터 번호를 이어 붙인다.

## 문서 갱신 이력

`ROADMAP.md`가 `docs/roadmaps/ROADMAP_v1.md`로 이동하고 이 문서(v2)가 현행 로드맵이 되면서, 루트 `ROADMAP.md`를 가리키던 참조를 함께 갱신했다(2026-09-15).

| 파일 | 갱신 내용 |
|---|---|
| `CLAUDE.md` | `@docs/roadmaps/ROADMAP_v2.md`(현행) + v1 링크 |
| `shrimp-rules.md` | 운영 규칙의 로드맵 경로를 v2로, 완료 기록은 v1 |
| `README.md` | "현재 상태" 링크와 구조 트리(`docs/roadmaps/`) |
| `tasks/000-sample.md` | 7단계 문구를 "현행 로드맵"으로 |
| `.claude/agents/dev/ui-markup-specialist.md` | 코드 관례 참조는 v2, Task 005 예시는 v1 |

루트에 리다이렉트용 `ROADMAP.md`는 두지 않는다 — `CLAUDE.md`가 현행 경로를 가리키므로 중복 문서가 어긋날 여지만 남긴다.
