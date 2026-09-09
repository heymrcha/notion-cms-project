# MVP PRD — Notion CMS 기반 PM 포트폴리오 사이트

| 항목 | 값 |
|---|---|
| 작성일 | 2026-09-09 |
| 상태 | MVP 정의 (구현 착수 전) |
| 기반 저장소 | `claude-code-my-product-starter-kit` (Next.js 16 App Router 스타터 킷) |

---

## 1. 개요

프로덕트 매니저 개인의 **프로젝트 포트폴리오**를 공개 웹사이트로 노출한다. 주 독자는 채용 담당자이며, 이들이 짧은 시간 안에 "이 사람이 어떤 프로젝트에서 어떤 역할로 무슨 성과를 냈는가"를 파악하는 것이 사이트의 유일한 목적이다.

콘텐츠 원본은 Notion Database다. PM은 이미 Notion에서 프로젝트 기록을 관리하고 있고, 글을 쓰기 위해 마크다운 파일을 만들고 커밋·배포하는 흐름은 갱신을 막는 마찰이다. Notion을 CMS로 두면 **콘텐츠 갱신이 코드 변경·배포 없이 끝난다**. 이것이 별도 CMS(Contentful, Sanity)나 MDX 파일 방식 대신 Notion을 택한 이유다.

## 2. 목표와 비목표

### 목표

- G1. 프로젝트 목록과 상세를 Notion Database 하나에서 렌더링한다.
- G2. Notion에서 프로젝트를 추가·수정하면 **코드 수정과 재배포 없이** 사이트에 반영된다.
- G3. 기존 스타터 킷의 레이아웃 셸(Navbar / Footer / 다크 모드 / `SITE_CONFIG`)을 그대로 재사용한다.
- G4. 채용 담당자가 모바일에서 열어도 목록 → 상세 → 외부 링크 흐름이 끊기지 않는다.

### 비목표 (MVP에서 명시적으로 하지 않는 것)

- N1. **콘텐츠 작성 UI를 웹에서 제공하지 않는다.** 쓰기는 전부 Notion에서 일어나며 사이트는 읽기 전용이다.
- N2. **인증·로그인·관리자 화면을 만들지 않는다.** 전 페이지 공개.
- N3. **검색·태그 필터링·페이지네이션을 넣지 않는다.** 프로젝트 수가 20건 미만이라고 가정하고 전량을 한 페이지에 나열한다.
- N4. **아티클/블로그 계층을 만들지 않는다.** Database는 Projects 하나뿐이며, 페치 계층을 여러 Database에 대응하도록 일반화하지 않는다.
- N5. **Notion의 모든 블록 타입을 지원하지 않는다.** 지원 범위는 §6.3에 한정하고, 그 외 블록은 조용히 건너뛴다.
- N6. **댓글·조회수·RSS·다국어·OG 이미지 자동 생성을 넣지 않는다.**
- N7. **테스트 러너를 도입하지 않는다.** 저장소에 테스트 설정이 없고, 도입은 별도 논의 대상이다.

## 3. 성공 기준

| ID | 기준 | 측정 방법 |
|---|---|---|
| S1 | Notion에서 프로젝트 1건을 추가하고 `Published`를 체크하면, 코드 변경 없이 **60초 경과 후 다음 요청**에서 목록과 상세에 나타난다 | 브라우저에서 추가 → 60초 대기 → 2회 새로고침 |
| S2 | Notion에서 제목·요약을 수정하면 같은 조건으로 반영된다 | 위와 동일 |
| S3 | `Published`를 해제하면 목록에서 사라지고, 해당 상세 URL은 404를 반환한다 | 직접 URL 접근 |
| S4 | 프로젝트 목록 페이지 LCP가 모바일 기준 2.5초 이내 | Chrome DevTools Lighthouse (모바일 프리셋, 프로덕션 빌드) |
| S5 | Notion API가 실패해도 사이트가 흰 화면이 되지 않고 오류 안내를 렌더한다 | 잘못된 `NOTION_API_KEY`로 개발 서버 기동 |
| S6 | `npx tsc --noEmit`과 `npm run lint`가 오류 0으로 통과한다 | 명령 실행 |

## 4. 사용자 시나리오

### 4.1 방문자 — 채용 담당자

1. 검색 또는 이력서 링크를 통해 `/projects`에 진입한다.
2. 카드 목록에서 프로젝트명·한 줄 성과·기간·태그를 훑고 관심 있는 항목을 클릭한다.
3. `/projects/[slug]` 상세에서 배경, 본인 역할, 진행 과정, 결과를 읽는다.
4. 필요하면 상세 하단의 외부 링크(서비스 URL, 발표 자료)로 이동한다.
5. 뒤로 가 다른 프로젝트를 본다.

### 4.2 편집자 — 포트폴리오 주인

1. Notion에서 Projects Database에 새 행을 만든다.
2. `Title`, `Slug`, `Summary`, `Outcome`, `Role`, `Period Start`를 채우고 본문을 작성한다.
3. 초안 동안 `Published`는 비워 둔다 — 사이트에 노출되지 않는다.
4. 완성되면 `Published`를 체크한다.
5. 60초 뒤 사이트를 새로고침해 반영을 확인한다. 잘못 쓴 부분은 Notion에서 고치면 같은 방식으로 갱신된다.

## 5. 정보 구조 & 라우트

| 경로 | 유형 | 내용 |
|---|---|---|
| `/` | 기존 페이지 수정 | 히어로 문구를 포트폴리오 소개로 교체하고, 최근 프로젝트 3건을 카드로 노출 + `/projects` 링크 |
| `/projects` | 신규 | `Published` 프로젝트 전량을 카드 그리드로 나열 |
| `/projects/[slug]` | 신규 | 프로젝트 상세. 메타 정보 + Notion 본문 렌더 |
| `/about` | 기존 페이지 수정 | PM 소개·경력 요약. **MVP에서는 하드코딩** (§14 U1 참고) |
| `/docs` | 삭제 | 스타터 킷 잔재이며 포트폴리오와 무관 |

`SITE_CONFIG.navLinks`를 다음으로 교체한다 — 이 한 곳만 고치면 Navbar와 모바일 드롭다운에 동시에 반영된다.

```
{ href: "/", label: "홈" }
{ href: "/projects", label: "프로젝트" }
{ href: "/about", label: "소개" }
```

`SITE_CONFIG`의 `name`, `description`, `githubUrl`도 포트폴리오 값으로 교체한다. `app/layout.tsx`의 `metadata`가 이 값을 참조하므로 별도 수정은 필요 없다.

> Navbar 우측의 `v1.0.0` 배지는 `SITE_CONFIG`가 아니라 JSX에 하드코딩되어 있다. 포트폴리오에는 의미가 없으므로 제거한다.

## 6. Notion 데이터 모델

### 6.1 Projects Database 속성

Notion에 아래 스키마로 Database를 새로 만든다. `Notion 타입`은 Notion UI의 속성 유형이다.

| 속성명 | Notion 타입 | 필수 | 사이트에서의 용도 | 예시값 |
|---|---|---|---|---|
| `Title` | Title | ✅ | 카드 제목, 상세 `<h1>`, `<title>` | `구독 결제 전환율 개선` |
| `Slug` | Rich text | ✅ | URL 경로 `/projects/[slug]`. 소문자·숫자·하이픈만 | `subscription-checkout` |
| `Published` | Checkbox | ✅ | 발행 여부. 체크된 행만 사이트에 노출 | `true` |
| `Summary` | Rich text | ✅ | 카드 본문 2줄 요약, `description` 메타태그 | `이탈 지점을 재설계해 결제 완료율을 개선한 프로젝트` |
| `Outcome` | Rich text | ✅ | 카드·상세 상단의 한 줄 성과. 채용 담당자가 가장 먼저 보는 값 | `결제 완료율 42% → 61%` |
| `Role` | Rich text | ✅ | 본인이 맡은 역할 | `PM (기획·지표 설계·QA)` |
| `Period Start` | Date | ✅ | 기간 표기, 기본 정렬 키 | `2025-03-01` |
| `Period End` | Date | ❌ | 기간 표기. 비어 있으면 "진행 중" | `2025-08-31` |
| `Tags` | Multi-select | ❌ | 카드의 배지. MVP에서 필터링에는 쓰지 않음 | `B2C`, `결제`, `그로스` |
| `Cover` | Files & media | ❌ | 카드 썸네일, 상세 헤더 이미지 | (업로드 파일 1개) |
| `External URL` | URL | ❌ | 상세 하단 외부 링크 | `https://example.com` |
| `Order` | Number | ❌ | 수동 노출 우선순위. 값이 클수록 먼저. 비어 있으면 0 취급 | `10` |

**정렬 규칙**: `Order` 내림차순 → `Period Start` 내림차순. 대표작을 위로 올리고 싶을 때만 `Order`를 쓰고, 평소엔 최신순으로 자동 정렬된다.

**필터 규칙**: `Published` = `true` 인 행만 조회한다. 초안이 URL 추측으로 노출되지 않도록 상세 페이지도 같은 필터를 거친다.

### 6.2 본문

프로젝트 상세 본문은 Notion 페이지의 블록으로 작성한다. 별도 속성을 두지 않고 페이지 자체를 본문으로 쓴다.

### 6.3 MVP 지원 블록 타입

| 블록 | 렌더 결과 |
|---|---|
| `paragraph` | `<p>` |
| `heading_1` / `heading_2` / `heading_3` | `<h2>` / `<h3>` / `<h4>` (페이지 `<h1>`은 `Title`이 차지) |
| `bulleted_list_item` / `numbered_list_item` | `<ul>` / `<ol>` (연속 항목을 하나로 묶음) |
| `image` | `next/image` |
| `quote` | `<blockquote>` |
| `divider` | `<hr>` |
| `code` | `<pre><code>` (하이라이팅 없음) |

지원 목록 밖의 블록(테이블, 토글, 컬럼, 임베드, 데이터베이스 뷰)은 **렌더하지 않고 건너뛴다**. 중첩 블록(자식이 있는 블록)도 MVP에서는 한 단계만 처리하고 하위는 무시한다. 인라인 서식은 굵게·기울임·인라인 코드·링크만 반영한다.

## 7. 데이터 흐름

```
Notion Database
  ↓ @notionhq/client (서버에서만 실행, NOTION_API_KEY 사용)
lib/notion/client.ts        Notion 클라이언트 단일 인스턴스
  ↓
lib/notion/queries.ts       getPublishedProjects() / getProjectBySlug() / getProjectBlocks()
  ↓ 응답을 앱 전용 타입으로 변환 (Notion 응답 타입을 UI까지 끌고 가지 않는다)
lib/notion/mappers.ts       Notion 페이지 객체 → Project, 블록 → NotionBlock
  ↓
lib/notion/types.ts         Project, ProjectListItem, NotionBlock
  ↓
app/projects/page.tsx               서버 컴포넌트, 목록 렌더
app/projects/[slug]/page.tsx        서버 컴포넌트, 상세 렌더
components/projects/project-card.tsx    카드 (서버 컴포넌트)
components/projects/notion-blocks.tsx   블록 → JSX 렌더러 (서버 컴포넌트)
```

### 7.1 타입 정의

`any`를 쓰지 않는다. Notion SDK 응답은 유니온 타입이므로, `mappers.ts`에서 **타입 가드로 좁힌 뒤** 앱 타입으로 변환한다. 속성 하나를 읽을 때마다 `unknown` + 가드를 거치고, 실패하면 해당 프로젝트를 목록에서 제외한다.

```ts
type Project = {
  id: string
  slug: string
  title: string
  summary: string
  outcome: string
  role: string
  periodStart: string          // ISO 8601
  periodEnd: string | null     // null이면 진행 중
  tags: string[]
  coverUrl: string | null
  externalUrl: string | null
  order: number
}
```

### 7.2 확인된 API 사실 (근거 필수 항목)

| 사실 | 근거 |
|---|---|
| 최신 Notion API(버전 `2025-09-03`)에서 조회 엔드포인트는 `POST /v1/data_sources/{data_source_id}/query`이며, SDK 호출은 **`notion.dataSources.query({ data_source_id, filter, sorts })`** 다. 널리 퍼진 `notion.databases.query({ database_id })` 예제는 구버전이다 | Context7 / `developers.notion.com/reference/query-a-data-source` |
| 정렬은 속성 기준(`property` + `direction`) 또는 타임스탬프 기준(`created_time`·`last_edited_time`)을 배열로 지정한다 | 동 문서 `post-database-query-sort` |
| Notion에 업로드된 파일의 URL은 **1시간 후 만료**되며 응답에 `expiry_time`이 포함된다. 만료 시 파일 객체를 다시 조회해 새 URL을 받아야 한다 | 동 문서 `file-object` |
| Rate limit은 커넥션당 **평균 초당 3회**(버스트 일부 허용) + 워크스페이스 단위 제한. 초과 시 HTTP 429 `rate_limited`, 과부하 시 529 `service_overload`, 두 경우 모두 `Retry-After`(초) 헤더를 따라야 한다 | 동 문서 `request-limits` |
| Next.js 16 App Router의 ISR은 라우트 세그먼트의 `export const revalidate = <초>`로 설정하고, `generateStaticParams`로 알려진 경로를 미리 생성한다. `generateStaticParams`는 **재검증 시 다시 호출되지 않는다** | Context7 / `vercel/next.js` v16.2.9 `docs/01-app/02-guides/incremental-static-regeneration.mdx` |
| 온디맨드 무효화는 `next/cache`의 `revalidatePath` / `revalidateTag`로 수행한다 | 동 문서 |

> `node_modules`가 아직 설치되지 않아 저장소 로컬의 `node_modules/next/dist/docs/`를 읽을 수 없었다. 위 Next.js 사실은 Context7이 제공한 v16.2.9 공식 문서를 근거로 하며, `npm install` 후 로컬 문서로 재확인할 것.

## 8. 렌더링·캐싱 전략

**채택: ISR — `export const revalidate = 60`**

목록(`/projects`)과 상세(`/projects/[slug]`) 모두 정적 생성하고 60초 주기로 재검증한다. 상세는 `generateStaticParams`로 발행된 slug를 빌드 시점에 미리 생성하고, `dynamicParams`는 기본값(허용)을 유지해 빌드 이후 Notion에 추가된 프로젝트도 첫 요청 때 생성되게 한다.

**선택 근거**

- 요구된 반영 지연이 "1분 이내"이므로 `revalidate = 60`이 요구사항을 정확히 만족한다.
- 방문자 요청이 Notion API를 직접 호출하지 않으므로, 트래픽이 몰려도 초당 3회 rate limit에 닿지 않는다.
- 캐시 수명 60초가 Notion 파일 URL 만료(1시간)보다 훨씬 짧아, 캐시에 담긴 이미지 URL이 만료된 채 서빙될 여지가 작다.

**탈락한 대안**

| 대안 | 탈락 이유 |
|---|---|
| 빌드 타임 SSG (재검증 없음) | 목표 G2(재배포 없는 갱신) 자체가 성립하지 않는다 |
| 요청마다 서버 렌더 (`dynamic = "force-dynamic"`) | 반영은 즉시지만 모든 방문이 Notion API 왕복을 유발해 LCP 목표(S4)와 rate limit 양쪽에서 불리하다 |
| `revalidate = 3600` + 온디맨드 Route Handler | 반영이 가장 빠르지만 Notion 자동화(웹훅) 설정과 시크릿 관리가 추가된다. 60초 대기로 충분하므로 **Post-MVP(P2)** 로 미룬다 |

## 9. 기능 명세

### P0 — 이것만으로 MVP가 성립한다

**F1. 프로젝트 목록 (`/projects`)**
`Published` 프로젝트를 정렬 규칙에 따라 카드 그리드로 나열한다.
- [ ] `Published`가 체크된 행만 나타난다
- [ ] `Order` 내림차순 → `Period Start` 내림차순으로 정렬된다
- [ ] 카드에 제목, `Outcome`, 기간, `Tags` 배지가 보인다
- [ ] 카드 클릭 시 `/projects/[slug]`로 이동한다
- [ ] 모바일 1열 / 태블릿 2열 / 데스크톱 3열

**F2. 프로젝트 상세 (`/projects/[slug]`)**
- [ ] 제목, `Outcome`, `Role`, 기간, `Tags`가 상단에 보인다
- [ ] Notion 본문이 §6.3 범위대로 렌더된다
- [ ] `External URL`이 있으면 하단에 링크 버튼이 보인다 (`target="_blank" rel="noreferrer"`)
- [ ] 없는 slug 또는 미발행 slug는 404를 반환한다

**F3. Notion 페치·매핑 계층**
- [ ] `NOTION_API_KEY`가 서버에서만 읽히고 클라이언트 번들에 포함되지 않는다
- [ ] Notion 응답을 `Project` 타입으로 변환하며 `any`를 쓰지 않는다
- [ ] 필수 속성이 비었거나 타입이 다른 행은 목록에서 제외되고 서버 로그에 경고를 남긴다
- [ ] 100건 초과 시에도 `next_cursor` 페이지네이션으로 전량을 가져온다

**F4. ISR 적용**
- [ ] 두 라우트에 `export const revalidate = 60`이 있다
- [ ] `generateStaticParams`가 발행된 slug 목록을 반환한다
- [ ] 빌드 후 Notion에 추가한 프로젝트가 재배포 없이 접근된다

**F5. 사이트 셸 정리**
- [ ] `SITE_CONFIG`가 포트폴리오 값으로 교체되고, navbar·footer·메타데이터에 반영된다
- [ ] `/docs`가 제거되고 링크가 남지 않는다
- [ ] `/` 히어로가 포트폴리오 문구로 바뀌고 최근 프로젝트 3건이 보인다
- [ ] `v1.0.0` 배지가 제거된다

**F6. 오류·빈 상태 처리**
- [ ] Notion API 실패 시 흰 화면 대신 안내 문구가 렌더된다
- [ ] 발행된 프로젝트가 0건이면 빈 상태 문구가 보인다

### P1 — MVP 직후

- **F7. 상세 페이지 로딩 UI** — `loading.tsx`로 첫 생성 시 스켈레톤 노출
- **F8. `Cover` 이미지** — 카드·상세 헤더에 `next/image` 적용. `next.config.ts`에 Notion 파일 호스트 허용 설정 필요 (§14 R2)
- **F9. `/about` 페이지 재작성** — PM 소개·경력 요약
- **F10. sitemap.xml / robots.txt**

### P2 — 나중에

- **F11. 온디맨드 재검증 Route Handler** (Notion 자동화 웹훅 연동)
- **F12. 태그 필터링**
- **F13. OG 이미지 자동 생성**

## 10. 비기능 요구사항

| 항목 | 요구 |
|---|---|
| 성능 | `/projects` 모바일 LCP 2.5초 이내, CLS 0.1 이하 |
| 반응형 | 375px / 768px / 1280px에서 가로 스크롤이 발생하지 않는다 |
| 다크 모드 | `next-themes` 클래스 방식 유지. 색은 `bg-background`·`text-muted-foreground` 같은 토큰으로만 지정하고 하드코딩 hex와 `text-gray-*` 류를 쓰지 않는다 |
| 접근성 | 카드 전체가 아닌 제목 링크에 접근 가능한 이름 부여, 이미지에 `alt`, 본문 heading 레벨을 건너뛰지 않는다 |
| SEO | 페이지별 `export const metadata`. 상세는 `generateMetadata`로 제목 `` `${Title} | ${SITE_CONFIG.name}` ``, description은 `Summary` |
| Rate limit | 방문자 요청이 Notion을 직접 호출하지 않는 구조(§8)로 1차 방어. 페치 계층에는 429·529 응답 시 `Retry-After` 헤더를 존중하는 재시도(최대 3회, 지수 백오프)를 둔다 |
| 시크릿 | `NOTION_API_KEY`는 `NEXT_PUBLIC_` 접두사 없이 서버 전용으로 유지 |
| 스타일 | 컨테이너는 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합은 `cn()` |
| 컴포넌트 경계 | 신규 컴포넌트는 전부 서버 컴포넌트. 클라이언트 훅이 필요한 경우가 MVP에는 없다 |

## 11. 에러·예외 처리

| 상황 | 동작 |
|---|---|
| Notion API 인증 실패 / 네트워크 오류 | 재시도 소진 후 페치 함수가 빈 배열 또는 `null` 반환. 목록은 "프로젝트를 불러오지 못했습니다" 안내, 상세는 `error.tsx`로 처리. **빌드를 실패시키지 않는다** |
| 429 / 529 | `Retry-After` 초만큼 대기 후 재시도, 최대 3회 |
| 발행된 프로젝트 0건 | 빈 상태 문구 렌더. 404가 아니다 |
| 존재하지 않는 slug | `notFound()` → 404 |
| 미발행(`Published` 해제) slug 직접 접근 | 존재하지 않는 것과 동일하게 404. 초안 내용을 노출하지 않는다 |
| `Slug` 중복 | 정렬 기준 첫 번째 행을 채택하고 나머지는 서버 로그에 경고. 빌드는 계속된다 |
| 필수 속성 누락 | 해당 프로젝트만 목록에서 제외, 나머지는 정상 렌더 |
| Notion 이미지 URL 만료 | 캐시 수명(60초)이 만료 시간(1시간)보다 짧아 정상 조건에서는 발생하지 않는다. 그래도 이미지 로드 실패 시 레이아웃이 깨지지 않도록 고정 비율 컨테이너를 쓴다 |
| 미지원 블록 타입 | 렌더하지 않고 건너뛴다. 오류를 던지지 않는다 |

## 12. 환경 변수

`.env.example`에 아래를 추가한다. **실제 값은 `.env.local`에만 두고 저장소에 커밋하지 않는다.**

| 키 | 필수 | 설명 |
|---|---|---|
| `NOTION_API_KEY` | ✅ | Notion 통합(Integration)의 시크릿. 서버 전용이므로 `NEXT_PUBLIC_` 접두사를 붙이지 않는다 |
| `NOTION_PROJECTS_DATA_SOURCE_ID` | ✅ | Projects Database의 **data source ID**. 최신 API가 `data_source_id`를 받으므로 명칭을 `DATABASE_ID`가 아닌 이 이름으로 둔다 (§7.2) |

기존 `.env.example`의 `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_DESCRIPTION`은 현재 코드가 읽지 않으며 `SITE_CONFIG`와 역할이 겹친다. 혼선을 줄이기 위해 제거한다.

Notion 쪽 사전 작업: 통합을 생성하고, Projects Database 페이지에서 해당 통합에 연결 권한을 부여해야 한다. 권한을 주지 않으면 API가 해당 Database를 찾지 못한다.

## 13. 마일스톤

### M1. 데이터 계층 (완료 판정: 콘솔에서 데이터 확인)
`@notionhq/client` 설치, `.env.local` 구성, Notion에 §6.1 스키마로 Database 생성 및 더미 프로젝트 3건 입력, `lib/notion/*` 작성.
**완료 판정**: 임시 서버 컴포넌트에서 `getPublishedProjects()` 결과를 출력했을 때 3건이 정렬 규칙대로 나오고, `npx tsc --noEmit`이 통과한다. 미발행 1건이 결과에 없다.

### M2. 화면 (완료 판정: 브라우저 확인)
`/projects` 목록, `/projects/[slug]` 상세, 블록 렌더러, 404·빈 상태 처리.
**완료 판정**: 개발 서버에서 목록 → 상세 → 외부 링크 이동이 동작하고, 없는 slug가 404이며, 375px·1280px에서 가로 스크롤이 없고 다크 모드에서 대비가 깨지지 않는다.

### M3. 셸 정리와 ISR (완료 판정: 프로덕션 빌드 + 반영 실측)
`SITE_CONFIG` 교체, `/docs` 제거, 홈 히어로 수정, `revalidate` / `generateStaticParams` 적용.
**완료 판정**: `npm run build` → `npm run start` 후, Notion에서 제목을 수정하고 60초 뒤 새로고침했을 때 반영된다(S1·S2). Lighthouse 모바일 LCP 2.5초 이내(S4). `npm run lint` 오류 0.

## 14. 리스크와 미결 사항

| ID | 내용 | 대응 |
|---|---|---|
| R1 | Notion API가 `databases` → `data sources` 로 전환된 직후라, 웹의 대다수 예제와 SDK 타입이 서로 다른 세대를 섞어 쓴다. 구버전 예제를 그대로 따르면 동작하지 않는다 | 구현 시 설치된 `@notionhq/client` 버전의 타입 정의를 먼저 확인하고, §7.2 근거를 기준으로 삼는다 |
| R2 | `next.config.ts`의 원격 이미지 허용 설정(`images.remotePatterns`) 스키마와, Notion S3 URL의 호스트·경로 패턴을 아직 검증하지 않았다 | F8(P1) 착수 시 Next.js 16 문서를 재확인한다. MVP(P0)는 `Cover` 없이도 성립한다 |
| R3 | 빌드 시점에 Notion API가 실패하면 `generateStaticParams`가 빈 배열을 반환해 상세 페이지가 하나도 생성되지 않을 수 있다 | `dynamicParams` 기본값을 유지해 런타임에 생성되게 하고, 빌드를 실패시키지 않는다 |
| R4 | 프로젝트가 20건을 넘어가면 필터·페이지네이션 부재가 실제 문제가 된다 | 20건 도달 시 F12(P2) 재평가 |
| U1 | `/about`의 경력 정보를 Notion에서 가져올지, 코드에 두고 손으로 고칠지 결정하지 않았다 | **MVP는 하드코딩**으로 진행. 갱신 빈도가 프로젝트보다 훨씬 낮아 CMS화 이득이 작다고 판단했다 |
| U2 | 배포 대상을 Vercel로 가정했다 | 다른 호스팅이면 ISR 동작 방식이 달라지므로 §8을 재검토해야 한다 |
| U3 | 도메인 연결 여부와 주소를 정하지 않았다 | F10(sitemap) 착수 전에 필요 |

## 15. 범위 밖 (Post-MVP)

인터뷰에서 잘라냈거나 위에서 P1/P2로 미룬 항목: 검색, 태그 필터링, 다국어, 조회수, 댓글, RSS, OG 이미지 자동 생성, 아티클/블로그, 온디맨드 재검증, 어드민 화면, 테스트 러너 도입.
