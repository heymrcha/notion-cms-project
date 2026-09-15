# Task 013: `/about` 페이지 재작성 및 sitemap·robots 생성 (F9·F10)

## 고수준 명세

- **목적**: 채용 담당자가 프로젝트 목록 다음으로 찾는 "이 사람이 누구인가"를 `/about`에 담고(F9), 검색 엔진이 목록·상세를 색인하도록 `sitemap.xml`·`robots.txt`를 제공한다(F10).
- **범위**: `/about` 하드코딩 콘텐츠(U1 확정), `SITE_CONFIG.siteUrl`, `app/sitemap.ts`, `app/robots.ts`. OG 이미지는 Task 017.
- **PRD 참조**: F9, F10, §5, §14 U1·U3
- **리스크·미결**:
  - U1 — 소개·경력은 코드의 모듈 스코프 상수. 실제 내용은 사용자 확인이 필요하므로 **자리 표본**을 넣고 교체 지점을 명시한다.
  - U3 — 도메인 미확정. `siteUrl`은 Vercel 기본 도메인 형태로 임시 지정하고 Task 014에서 확정한다. `app/layout.tsx`는 건드리지 않는다.
  - `sitemap.ts`는 기본적으로 캐시되는 특수 Route Handler(`sitemap.md` Good to know). `getPublishedProjects()`를 쓰므로 `revalidate`를 두지 않으면 빌드 뒤 추가된 프로젝트가 영영 실리지 않는다 → 1시간 재검증.
  - `Project`에 `lastEditedTime`이 없다(PRD §7.1 스키마 밖). 상세 URL의 `lastModified`는 생성 시각으로 둔다.
- **전제 조건**: Task 012 완료.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/site-config.ts` | 수정 | `siteUrl` 추가 |
| `app/about/page.tsx` | 수정 | 소개·경력·역량을 `UPPER_SNAKE_CASE` 상수 + `.map()`으로 렌더 |
| `app/sitemap.ts` | 신규 | 정적 3개 + 발행 프로젝트 상세 URL, `revalidate = 3600` |
| `app/robots.ts` | 신규 | 전체 허용 + `sitemap` 경로 |

## 수락 기준

- [x] `/about`에 소개·경력·역량 섹션이 렌더되고 데이터는 컴포넌트 밖 상수에만 있다
- [x] `/sitemap.xml`에 `/`, `/projects`, `/about` + 발행 프로젝트 3건 상세 URL이 `siteUrl` 기준 절대 URL로 실린다
- [x] `/robots.txt`에 `User-Agent: *`, `Allow: /`, `Sitemap: <siteUrl>/sitemap.xml`
- [x] Notion 실패 시 sitemap이 정적 3개만으로 응답한다(빌드 실패 없음)
- [x] `/about` 375/1280 가로 스크롤 없음, 다크 모드 대비, heading 연속
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: 서버 컴포넌트, 토큰 색, 컨테이너 클래스, `cn()`

## 구현 단계

- [x] 1. `sitemap.md`, `robots.md` 로컬 문서 확인.
- [x] 2. `SITE_CONFIG.siteUrl` 추가.
- [x] 3. `app/about/page.tsx` 상수 + 렌더.
- [x] 4. `app/sitemap.ts`, `app/robots.ts`.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0.
- [x] 6. 아래 테스트 체크리스트 수행.
- [x] 7. 체크박스 갱신, `ROADMAP.md` Task 013 ✅, 커밋(연속 실행 모드).

## 테스트 체크리스트

> 개발 서버(3000)에서 확인한다.

### 정상 흐름

- [x] `curl /sitemap.xml` → `<urlset>` 안에 `<loc>` 6개(정적 3 + 상세 3), `<lastmod>` 존재
- [x] `curl /robots.txt` → `Allow: /`, `Sitemap:` 줄
- [x] `/about` 소개 문단·경력 항목·역량 배지 렌더, `<title>` `소개 | PM 포트폴리오`

### 예외·엣지 케이스

- [x] 잘못된 `NOTION_API_KEY`로 `/sitemap.xml` → 정적 3개만, 200

### 반응형·다크 모드·접근성

- [x] 375/1280 `scrollWidth <= innerWidth`
- [x] 다크 모드 스크린샷 대비
- [x] heading `h1→h2→h3` 연속

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/site-config.ts`: `siteUrl` 추가(`https://notion-cms-project.vercel.app`, 임시 — U3). `app/layout.tsx`는 변경 없음.
- `app/about/page.tsx`: `INTRO_PARAGRAPHS`·`CAREER`·`SKILLS` 상수 + `.map()`. 소개(`<header>`)·경력(`<ol>` 회사·역할·기간·성과 불릿)·역량(Badge)·`/projects` 버튼. **내용은 자리 표본이며 `TODO(사용자 확인)` 주석 아래 상수만 바꾸면 된다.**
- `app/sitemap.ts`: 정적 3개(`/` 1.0, `/projects` 0.9, `/about` 0.5) + 발행 프로젝트 상세(0.8). `revalidate = 3600` — 기본 캐시 핸들러라 재검증 없이는 빌드 뒤 발행분이 안 실림. Notion 실패 시 `?? []`로 정적 3개만 응답.
- `app/robots.ts`: `*` 전체 허용 + `Sitemap` 절대 경로.

### 검증

- `/sitemap.xml`: `<loc>` 6개(정적 3 + 상세 3), `<lastmod>` 6개, 절대 URL. `/robots.txt`: `User-Agent: *`, `Allow: /`, `Sitemap: …/sitemap.xml`.
- 잘못된 `NOTION_API_KEY` → `/sitemap.xml` 200, `<loc>` 3개. `.env.local` 원복(`cmp` 일치) 후 6개 복귀.
- `/about`: `<title>` `소개 | PM 포트폴리오`, heading `h1→h2→h3→h3→h2`, 375/1280 가로 스크롤 없음, 다크 모드 스크린샷 대비 양호.
- `npx tsc --noEmit`·`npm run lint` 0.

### 후속

- U3: 배포 후 실제 도메인으로 `siteUrl` 교체(Task 014).
- `/about` 실제 내용 교체는 사용자 확인 필요.
