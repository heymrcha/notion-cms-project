# Task 017: OG 이미지 자동 생성 (F13, P2)

## 고수준 명세

- **목적**: `/projects/[slug]` 링크를 메신저·SNS·이력서에 붙였을 때 `Title`·`Outcome`이 담긴 미리보기 카드가 뜨게 한다. 루트(`/`)에도 사이트 카드를 둔다 — 이력서에 가장 많이 붙는 링크이기 때문이다.
- **범위**: `opengraph-image.tsx` 2개(루트, 상세), `generateMetadata`·루트 `metadata`에 `openGraph`·`twitter`·`metadataBase` 연결, 문서. `twitter-image` 파일은 만들지 않는다(X는 `twitter:image`가 없으면 `og:image`를 쓴다).
- **PRD 참조**: F13, §10 SEO, §15 범위 밖(OG 자동 생성 → 이번 Task로 편입)
- **리스크·미결**:
  - `ImageResponse`는 Satori 기반이라 flexbox와 CSS 일부만 지원하고 CSS 변수·Tailwind 토큰·다크 모드를 읽지 못한다. 색은 hex 하드코딩 — 코드 관례("토큰만")의 명시적 예외.
  - 한글 글리프: `@vercel/og`가 누락 글리프를 Google Fonts에서 런타임에 받아오는 `loadDynamicAsset`을 내장한다. 기본 동작으로 렌더해 확인하고, 깨지면 `fonts` 옵션으로 서브셋을 넘긴다(번들 500KB 제한 때문에 TTF 동봉은 불가).
  - `metadataBase` 없이는 Vercel이 배포별 URL을 추측해 `og:image`가 프로덕션 도메인이 아닐 수 있다 → `SITE_CONFIG.siteUrl`로 고정.
  - Task 016(태그 필터)은 R4(발행 20건) 미충족으로 건너뛰었다. shrimp 의존을 015로 바꿔 착수.
- **전제 조건**: Task 015 완료(온디맨드 재검증으로 OG 재생성 확인에 사용).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/projects/[slug]/opengraph-image.tsx` | 신규 | `getProjectBySlug` → `ImageResponse` 1200×630, `revalidate = 60` |
| `app/opengraph-image.tsx` | 신규 | 사이트 이름·설명 정적 카드(`/projects`, `/about`이 상속) |
| `lib/og-card.tsx` | 신규 | 두 이미지가 공유하는 카드 레이아웃·팔레트 |
| `app/layout.tsx` | 수정 | `metadataBase`, `openGraph` 기본값, `twitter.card` |
| `app/projects/[slug]/page.tsx` | 수정 | `generateMetadata`에 `openGraph`·`twitter` |
| `README.md` | 수정 | 구조 트리, 콘텐츠 작성 규칙(Outcome 한 줄) |
| `ROADMAP.md` | 수정 | Task 017 ✅ |

## 수락 기준

- [x] `/projects/[slug]/opengraph-image` → 200, `content-type: image/png`, 1200×630, 한글 제목·Outcome이 깨지지 않는다
- [x] `/opengraph-image` → 200, 사이트 이름·설명 카드
- [x] 없는 slug의 OG 이미지도 200(기본 카드) — 500이 아니다
- [x] 상세 HTML에 `og:image`(절대 URL, `siteUrl` 기준)·`og:image:width/height/alt`·`og:title`·`og:description`·`twitter:card=summary_large_image`가 있다
- [x] `/`, `/projects`, `/about` HTML의 `og:image`가 루트 카드를 가리킨다
- [x] Notion 제목 수정 → 재검증 → OG 이미지가 새 제목으로 재생성된다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 서버 전용, hex 하드코딩은 OG 카드 파일에만 한정하고 이유를 주석으로 남김

## 구현 단계

- [x] 1. `opengraph-image.md`·`image-response.md`·`generate-metadata.md`(metadataBase) 로컬 문서 확인
- [x] 2. `lib/og-card.tsx` 공용 카드 + `app/opengraph-image.tsx` + `app/projects/[slug]/opengraph-image.tsx`
- [x] 3. `app/layout.tsx`·`app/projects/[slug]/page.tsx` 메타 연결
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0
- [x] 5. 아래 테스트 체크리스트 수행(curl + 이미지 시각 확인 + Playwright MCP)
- [x] 6. README·작업 파일·ROADMAP 갱신. 완료 후 중단하고 지시 대기

## 테스트 체크리스트

> 프로덕션 빌드(`npm run build` → `npm run start -p 3001`)에서 수행한다. 이미지는 파일로 저장해 눈으로 확인한다.

### 정상 흐름

- [x] `curl -I /projects/subscription-checkout/opengraph-image` → 200 `image/png`; 저장한 PNG에서 제목·Outcome·역할·기간·태그가 한글로 보인다
- [x] `curl -I /opengraph-image` → 200 `image/png`; 사이트 이름·설명
- [x] 상세 HTML `<head>`: `og:image`가 `https://notion-cms-project-kohl.vercel.app/projects/subscription-checkout/opengraph-image?…`, `og:title`·`og:description`·`twitter:card`
- [x] `/`, `/about` HTML `og:image`가 `/opengraph-image`
- [x] Playwright MCP로 상세 페이지 `<head>` 메타 1회 확인

### 예외·엣지 케이스

- [x] `/projects/no-such-slug/opengraph-image` → 200 기본 카드(500 아님)
- [x] 긴 제목(40자 초과)이 카드 밖으로 넘치지 않는다 — Notion 제목을 임시로 늘려 확인 후 원복
- [x] Notion `admin-dashboard` 제목 수정 → `POST /api/revalidate` → `/projects/admin-dashboard/opengraph-image` 재생성 확인 → 원복

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/og-card.tsx` 신규 — `OgCard`(eyebrow·제목·강조 성과/보조 설명·footer)와 `OgBadges`, `OG_SIZE`(1200×630), `clampText`. Satori 는 CSS 변수·Tailwind 토큰·`line-clamp` 를 읽지 못하므로 이 파일에 한해 hex(globals.css 라이트 팔레트를 옮긴 값)와 글자 수 자르기(제목 40자, 성과 48자, 설명 80자)를 쓴다.
- `app/opengraph-image.tsx` 신규 — 사이트 이름·설명 정적 카드. `/projects`, `/about` 이 상속.
- `app/projects/[slug]/opengraph-image.tsx` 신규 — `getProjectBySlug` → Title·Outcome·Role·기간·Tags(최대 4) 카드. 없는 slug 는 기본 카드(200). `revalidate = 60` + **`generateStaticParams`** — 이것이 없으면 빌드에서 `ƒ`(동적)로 잡혀 `revalidate` 가 무시되고 요청마다 Notion 을 호출했다(실측 ~0.4초/요청 → 추가 후 ~1ms, `x-nextjs-cache: HIT`, 빌드 표기 `● … 1m`).
- `app/layout.tsx` — `metadataBase: new URL(SITE_CONFIG.siteUrl)`, `openGraph.siteName/locale/type`, `twitter.card`. `app/projects/[slug]/page.tsx` — `generateMetadata` 에 `openGraph`(article, url, siteName·locale 재지정 — 중첩 세그먼트의 `openGraph` 는 루트와 병합되지 않고 대체됨)·`twitter`. `images` 는 파일 규약이 자동으로 붙이므로 지정하지 않음. Next 가 `twitter:image` 도 OG 파일에서 자동 생성함을 확인.
- `app/api/revalidate/route.ts` — `revalidatePath("/projects/[slug]", "page")` 로는 OG 카드 엔트리가 갱신되지 않아(실측: 페이지는 새 제목, OG 는 HIT 로 옛 이미지) `revalidatePath("/projects", "layout")` 으로 교체. 목록·상세·OG 카드가 한 번에 무효화된다.
- 한글: `@vercel/og` 내장 `loadDynamicAsset`(Google Fonts Noto Sans) 기본 동작으로 정상 렌더 — 별도 폰트 동봉 불필요. 렌더 시 외부 네트워크가 필요하다는 점만 유의.
- README — 구조 트리, 콘텐츠 작성 규칙(Title 40자·Outcome 48자), 즉시 반영 절 문구.

### 실측 (로컬 프로덕션, 포트 3001)

- `/opengraph-image`, `/projects/subscription-checkout/opengraph-image`, `/projects/no-such-slug/opengraph-image` 모두 200 `image/png`(20~28KB). PNG 를 눈으로 확인 — 한글·레이아웃·배지 정상, 루트 카드는 설명이 2줄로 표시.
- 메타: 상세 `og:image=https://notion-cms-project-kohl.vercel.app/projects/subscription-checkout/opengraph-image?<hash>`, `og:image:width/height/alt`, `og:type=article`, `twitter:card=summary_large_image`, `twitter:image` 자동 생성. `/`, `/projects`, `/about` 은 `/opengraph-image` 상속.
- 긴 제목(58자)으로 바꿔 빌드 → 2줄 안에서 `…` 로 잘림, 넘침 없음. 원복.
- 온디맨드: 제목 원복 후 `POST /api/revalidate`(layout 타입) → 상세 `<title>` 갱신, OG 첫 요청 MISS + 처음 짧은 제목 이미지와 md5 동일(`7b74…`), 두 번째 HIT.
- Playwright: 상세 페이지 `<head>` 메타 7종 확인, `og:image` fetch 200 `image/png`.
- Notion 제목 원복, `.env.local` 백업과 `cmp` 동일 확인, 임시 시크릿·PNG 삭제. Notion 공개 API 는 MCP 로 고친 값이 반영되기까지 수십 초 지연될 수 있어 빌드가 이전 제목을 잡는 일이 있었다(검증 결과에는 영향 없음).
