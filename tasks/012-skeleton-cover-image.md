# Task 012: 로딩 스켈레톤 및 Cover 이미지 적용 (F7·F8)

## 고수준 명세

- **목적**: 첫 생성(빌드에 없던 slug·개발 서버)에서 흰 화면 대신 실제 레이아웃과 같은 치수의 스켈레톤을 보여 주고(F7), `Cover`와 본문 이미지를 `next/image`로 최적화해 LCP·CLS를 개선한다(F8).
- **범위**: 목록·상세 페이지의 `<Suspense>` 스켈레톤, `next.config.ts` `images.remotePatterns`, 카드·헤더·본문 이미지 블록의 `next/image` 적용. Lighthouse 측정은 Task 014.
- **PRD 참조**: F7, F8, §10 성능·접근성, §11 이미지 URL 만료, §14 R2
- **리스크·미결**:
  - R5 — `loading.tsx`는 `notFound()`의 404를 200으로 바꾸므로 쓰지 않는다. 상세는 `getProjectBySlug` → `notFound()`를 Suspense **밖**에서 끝낸 뒤 본문(`getProjectBlocks`)만 Suspense로 감싼다. 프로덕션에서 404 상태 코드가 유지되는지 재확인한다.
  - R2 — 실제 Notion 파일 URL을 API 응답에서 채취해 호스트·경로 패턴을 등록한다. 서명 쿼리(`X-Amz-*`)가 붙으므로 `search`는 생략(와일드카드).
  - Notion 파일 URL은 발급 1시간 뒤 만료. ISR 60초마다 새 서명 URL로 HTML이 갱신되므로 정상 조건에서는 만료 URL이 서빙되지 않는다. 옵티마이저 캐시(`minimumCacheTTL` 기본 4시간)는 src URL 단위라 새 URL이면 다시 받아온다. 1시간 넘게 아무도 찾지 않은 페이지의 첫 STALE 응답 1회만 만료 URL이 될 수 있고, 그때도 고정 비율 컨테이너가 레이아웃을 지킨다.
  - 본문 `image` 블록은 `external`(임의 호스트)일 수 있다. `remotePatterns`에 없는 호스트는 400이 나므로 Notion 호스트가 아니면 `unoptimized`로 렌더한다.
- **전제 조건**: Task 011-1 완료. Notion에 `Cover` 파일 1건 이상(이 Task에서 `subscription-checkout`에 업로드).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/notion/file-host.ts` | 신규 | `NOTION_FILE_HOST`, `isNotionFileUrl()` — 설정과 렌더러가 공유 |
| `next.config.ts` | 수정 | `images.remotePatterns`에 Notion S3 호스트·워크스페이스 경로 등록 |
| `components/projects/cover-image.tsx` | 신규 | `fill` + `aspect-video` 컨테이너 + `sizes`, 비-Notion 호스트는 `unoptimized` |
| `components/projects/project-card.tsx` | 수정 | `coverUrl` 있으면 카드 상단 썸네일 |
| `components/projects/project-header.tsx` | 수정 | 자리표시 → `coverUrl` 있을 때만 `CoverImage`, `priority` |
| `components/projects/notion-blocks.tsx` | 수정 | `image` 블록 `<img>` → `CoverImage` |
| `components/projects/project-grid-skeleton.tsx` | 신규 | 카드 3장 치수의 `animate-pulse` 스켈레톤 |
| `components/projects/notion-blocks-skeleton.tsx` | 신규 | 본문 문단 치수의 스켈레톤 |
| `app/projects/page.tsx` | 수정 | 페치를 비동기 자식 컴포넌트로 옮기고 `<Suspense>` |
| `app/projects/[slug]/page.tsx` | 수정 | 존재 확인은 밖, 본문만 `<Suspense>` |

## 수락 기준

- [x] `/projects`·`/projects/[slug]` 첫 생성 시 스켈레톤이 보이고, 완료 후 레이아웃 폭·높이가 스켈레톤과 어긋나지 않는다(CLS 0에 가까움)
- [x] 프로덕션 빌드에서 없는 slug·미발행 slug가 여전히 HTTP 404 (R5)
- [x] `Cover`가 있는 프로젝트는 카드·상세 헤더에 `next/image`로 렌더(`alt`=Title, `/_next/image?url=…` 요청 200)
- [x] `Cover`가 없는 프로젝트는 빈 회색 박스 없이 렌더
- [x] 본문 `image` 블록이 `next/image`로 렌더, 외부 호스트는 `unoptimized`로 깨지지 않음
- [x] 깨진/만료 URL에서도 고정 비율 컨테이너가 유지돼 레이아웃이 흔들리지 않음
- [x] `remotePatterns` 근거(실제 호스트·경로·쿼리 키)가 이 파일에 기록됨
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0(`no-img-element` disable 주석 제거)
- [x] 코드 관례 준수: 서버 컴포넌트, 토큰 색, `cn()`

## 구현 단계

- [x] 1. `image.md`(remotePatterns·fill·sizes·minimumCacheTTL), `loading.md` §Status Codes 재확인.
- [x] 2. Notion `Cover` 업로드 → API 응답에서 호스트·경로·쿼리 키 채취 → `file-host.ts` + `next.config.ts`.
- [x] 3. `CoverImage` 작성, 카드·헤더·본문 블록 적용.
- [x] 4. 스켈레톤 2종 + 두 페이지 `<Suspense>` 적용.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0.
- [x] 6. 아래 테스트 체크리스트 수행.
- [x] 7. 체크박스 갱신, `ROADMAP.md` Task 012 ✅, 커밋(연속 실행 모드).

## 테스트 체크리스트

> 개발 서버(3000)에서 스켈레톤·이미지, 프로덕션(3001)에서 404 유지·이미지 최적화 응답을 확인한다.

### 정상 흐름

- [x] `/projects` 카드에 `subscription-checkout` 썸네일(`img[alt="구독 결제 전환율 개선"]`) 렌더, `src`가 `/_next/image?url=`로 시작
- [x] 상세 헤더 커버 렌더, 본문 이미지 블록도 `next/image`
- [x] 개발 서버 첫 요청 스트림에서 스켈레톤 마크업(`animate-pulse`)이 먼저 내려온 뒤 본문으로 교체

### 예외·엣지 케이스

- [x] 프로덕션 `/projects/no-such-slug`, `/projects/draft-unpublished` → 404
- [x] `Cover` 없는 프로젝트(온보딩) 카드·헤더에 이미지 컨테이너 없음
- [x] 이미지 URL을 만료된 서명으로 바꿔 요청 → `/_next/image` 실패해도 컨테이너 `aspect-video` 유지(`getBoundingClientRect` 비율 16:9)

### 반응형·다크 모드·접근성

- [x] 375/1280 가로 스크롤 없음
- [x] 스켈레톤 색이 토큰(`bg-muted`)만 사용, 다크 모드 대비 유지
- [x] 모든 `img`에 `alt`

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

### R2 해소 — 실제 Notion 파일 URL 패턴 (API 응답에서 채취, 서명 값은 기록하지 않음)

- 호스트: `prod-files-secure.s3.us-west-2.amazonaws.com`
- 경로: `/<워크스페이스 ID>/<파일 ID>/<파일명>` (예: `/8aff250b-…/72b9440d-…/subscription-cover.png`)
- 쿼리: `X-Amz-Algorithm, X-Amz-Content-Sha256, X-Amz-Credential, X-Amz-Date, X-Amz-Expires, X-Amz-Security-Token, X-Amz-Signature, X-Amz-SignedHeaders, x-amz-checksum-mode, x-id` — 매 응답마다 달라지므로 `remotePatterns.search`는 생략
- `expiry_time`: 발급 +1시간
- `next.config.ts`: `protocol https / hostname 위 호스트 / pathname "/<워크스페이스 ID>/**"`. `image.md` §remotePatterns: `search` 등 생략 시 `**`가 암시됨을 근거로 함

### 구현

- `lib/notion/file-host.ts`: 호스트 상수 + `isNotionFileUrl`. `server-only`를 붙이지 않은 이유는 `next.config.ts`가 import해야 하기 때문(비밀 값 없음).
- `components/projects/cover-image.tsx`: `relative aspect-video` 컨테이너 + `<Image fill sizes>`; Notion 호스트가 아니면 `unoptimized`(본문 `external` 이미지가 400으로 깨지지 않게). 카드(`sizes` 100vw/50vw/33vw, 첫 카드만 `priority`), 헤더(`priority`, 상한 48rem), 본문 `image` 블록에 적용. `no-img-element` disable 주석 제거.
- 카드·헤더는 `coverUrl`이 있을 때만 이미지 컨테이너를 렌더한다(빈 회색 박스 제거).
- 스켈레톤: `ProjectGridSkeleton`(카드 3장, 제목·요약 2줄·성과·기간·배지 치수), `NotionBlocksSkeleton`(제목 + 5줄). `role="status"` + 한국어 `aria-label`, 색은 `bg-muted`만.
- `app/projects/page.tsx`: 페치를 `ProjectList` 자식으로 내려 `<Suspense>`. `app/projects/[slug]/page.tsx`: `getProjectBySlug` → `notFound()`는 Suspense 밖, `ProjectBody`(블록 페치)만 Suspense.

### 검증

- 개발 서버: `/projects` 스트림에 `animate-pulse`가 먼저 내려온 뒤 그리드로 교체. 카드 썸네일·헤더 커버 `srcset`이 `/_next/image?url=…`, 옵티마이저 응답 200 `image/png`. 본문 외부 이미지는 `src` 직접(unoptimized). 커버 없는 온보딩 상세는 `<img>` 0.
- 첫 카드 커버가 LCP로 감지된다는 dev 경고 → 그리드에서 `index === 0`에 `priority` 전달, 프리로드 `<link>` 1건 확인.
- 깨진 URL(만료 서명 흉내)로 `src` 교체 → `naturalWidth 0`이어도 컨테이너 768×432(1.778) 불변. 375px 가로 스크롤 없음, `img[alt]` 누락 0.
- 프로덕션 빌드: ISR 표기 유지(`1m`), `/projects/no-such-slug`·`draft-unpublished` **404 유지**(R5 — Suspense 밖 `notFound()`), 정적 HTML의 보이는 DOM에 스켈레톤 없음(RSC 페이로드에만), 옵티마이저 200.
- `npx tsc --noEmit`·`npm run lint` 0.

### 참고

- 커버가 있는 카드와 없는 카드가 섞이면 높이 차이가 크다. PRD에서 `Cover`는 선택이므로 그대로 두되, 실제 콘텐츠를 채울 때 전 프로젝트에 커버를 넣는 편이 보기 좋다.
- Notion `Cover`는 `subscription-checkout`에 placehold 이미지(1200×675 PNG)를 업로드해 두었다. 실제 이미지로 교체하면 된다.
