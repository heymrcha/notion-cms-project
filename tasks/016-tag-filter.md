# Task 016: 태그 필터링 구현 (F12, P2)

## 고수준 명세

- **목적**: `/projects` 목록을 `Tags` 값으로 좁혀 볼 수 있게 한다. 채용 담당자가 관심 영역(예: `결제`, `B2B`)만 골라 보는 용도.
- **범위**: 태그 칩 목록(전체 + 집계된 태그), 태그별 목록 페이지, 정렬·빈 상태 유지. 검색·페이지네이션·다중 태그 조합은 하지 않는다(N3).
- **착수 조건 기록**: ROADMAP R4는 발행 20건 도달 시 착수로 정했으나, **사용자가 3건 시점에 명시적으로 착수를 지시**해 진행한다. 조건 미충족 사실을 여기 남긴다.
- **PRD 참조**: F12, §2 N3, §6.1 `Tags`(필터링에 쓰지 않음 → 이 Task로 해제), §8 ISR
- **리스크·미결**:
  - ROADMAP 원안은 `?tag=` 검색 파라미터였다. 그러나 Next.js 16에서 `searchParams`는 **Request-time API**라 페이지가 동적 렌더링으로 바뀌어(`04-glossary.md` §Request-time APIs) `revalidate = 60` ISR이 무효가 되고 **모든 방문이 Notion을 직접 호출**한다 — PRD §8이 ISR을 채택한 이유(rate limit·LCP)를 정면으로 깬다. 따라서 **동적 세그먼트 `/projects/tag/[tag]`** 로 구현해 태그별 페이지를 `generateStaticParams` + ISR로 캐시한다. `?tag=`는 클라이언트 훅 없이는 ISR과 양립하지 않으므로 채택하지 않는다.
  - 태그는 한글이 많아 URL에 퍼센트 인코딩된다. `params.tag`는 디코딩된 값으로 오는지 실측해 `decodeURIComponent` 필요 여부를 확정한다.
  - 없는 태그 URL은 404가 아니라 빈 상태(ROADMAP "필터 적용 상태에서도 빈 상태 유지"). 초안 노출 위험이 없는 경로라 404로 닫을 이유가 없다.
- **전제 조건**: Task 015·017 완료(온디맨드 재검증 대상에 `/projects` layout이 포함돼 태그 페이지도 함께 무효화됨).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/notion/collect-tags.ts` | 신규 | `Project[]` → 중복 제거·가나다순 태그 배열 순수 함수 |
| `components/projects/tag-filter.tsx` | 신규 | "전체" + 태그 칩 `<Link>` 목록, 현재 태그 `aria-current="page"` |
| `components/projects/empty-state.tsx` | 수정 | 문구 prop(기본값 유지) — 태그 0건 문구 |
| `app/projects/page.tsx` | 수정 | 칩 목록 렌더(필터 없음) |
| `app/projects/tag/[tag]/page.tsx` | 신규 | 태그별 목록, `generateStaticParams`, `revalidate = 60`, `generateMetadata` |
| `app/sitemap.ts` | 수정 | 태그 페이지 URL 추가 |
| `README.md`, `ROADMAP.md` | 수정 | 구조 트리, Task 016 ✅·R4 갱신 |

## 수락 기준

- [x] `/projects`에 "전체"와 발행 프로젝트의 태그 전부가 칩으로 보이고, "전체"가 현재 상태로 표시된다
- [x] 칩 클릭 → `/projects/tag/<태그>`로 이동, 해당 태그를 가진 카드만 정렬 규칙(`Order` desc → `Period Start` desc) 그대로 보인다
- [x] 태그 페이지에서도 칩 목록이 보이고 현재 태그가 강조되며 "전체"로 돌아갈 수 있다
- [x] 없는 태그 직접 URL(`/projects/tag/없는태그`) → 200 + 빈 상태 문구, 404·500 아님
- [x] 태그 페이지가 빌드 로그에 ISR(`1m`)로 표기되고 `x-nextjs-cache: HIT`
- [x] `/projects`는 여전히 ISR(동적으로 바뀌지 않음)
- [x] `sitemap.xml`에 태그 페이지가 포함된다
- [x] 375/768/1280 가로 스크롤 없음, 칩이 줄바꿈된다, 다크 모드 대비 유지
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 서버 컴포넌트만, 토큰 색, `cn()`

## 구현 단계

- [x] 1. `page.md`(`params`/`searchParams`)·`04-glossary.md`(Request-time APIs)·`generate-static-params.md` 확인
- [x] 2. `collect-tags.ts` + `tag-filter.tsx` + `empty-state.tsx` 문구 prop
- [x] 3. `app/projects/tag/[tag]/page.tsx` + `app/projects/page.tsx` 칩 연결 + `sitemap.ts`
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0
- [x] 5. 아래 테스트 체크리스트 수행(프로덕션 빌드 + Playwright MCP)
- [x] 6. README·작업 파일·ROADMAP 갱신. 완료 후 중단하고 지시 대기

## 테스트 체크리스트

> 프로덕션 빌드(`npm run build` → `npm run start -p 3001`)에서 Playwright MCP로 수행한다.

### 정상 흐름

- [x] `/projects` 칩: 전체 + 태그(가나다순), "전체" `aria-current="page"`
- [x] `결제` 칩 클릭 → URL `/projects/tag/결제`(인코딩), 카드 1건(`구독 결제 전환율 개선`), 칩 `결제`가 현재
- [x] `B2C` 클릭 → `구독 결제 전환율 개선`, `온보딩 플로우 재설계` 순(Order 10 → Period Start desc)
- [x] "전체" 클릭 → `/projects` 3건
- [x] 카드 제목 클릭 → 상세 이동, 뒤로 가기 → 태그 페이지 복귀

### 예외·엣지 케이스

- [x] `/projects/tag/no-such-tag` → 200, 빈 상태 문구("‘no-such-tag’ 태그의 프로젝트가 없습니다"), 칩 목록은 그대로
- [x] 빌드 로그 `● /projects/tag/결제 … 1m`, curl 2회째 `x-nextjs-cache: HIT`; `/projects`도 HIT
- [x] `sitemap.xml`에 `/projects/tag/…` URL

### 반응형·다크 모드·접근성

- [x] 375/768/1280 가로 스크롤 없음, 375에서 칩 줄바꿈
- [x] 다크 모드에서 현재 칩·비활성 칩 대비 유지
- [x] 칩이 `<nav aria-label="태그 필터">` 안의 링크이고 현재 항목에 `aria-current`

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- **`?tag=` 대신 `/projects/tag/[tag]` 경로**로 구현. `searchParams`는 Request-time API라 페이지가 동적 렌더링으로 바뀌어 ISR이 풀리고 모든 방문이 Notion을 직접 호출하게 된다(`04-glossary.md`). 경로 세그먼트 + `generateStaticParams` + `revalidate = 60`으로 태그 페이지도 목록과 같은 ISR을 받는다. 빌드 로그 `● /projects/tag/결제 … 1m`, curl 2회째 `x-nextjs-cache: HIT`, `/projects`도 HIT 유지.
- `lib/notion/collect-tags.ts` — `Set`으로 중복 제거 후 `localeCompare(…, "ko")` 정렬(한글 → 영문 순). 칩 순서가 재검증마다 흔들리지 않게 정렬 규칙과 분리.
- `components/projects/tag-filter.tsx` — `<nav aria-label="태그 필터">` 안에 "전체"(`/projects`) + 태그 `<Link>`, 현재 항목 `aria-current="page"` + `bg-primary`. 없는 태그로 들어온 경우 그 태그를 칩 끝에 붙여 현재 필터가 보이게 함. `tagHref()`가 `encodeURIComponent`를 담당(sitemap도 공유).
- `app/projects/tag/[tag]/page.tsx` — `params.tag`는 퍼센트 인코딩된 채로 오므로 `decodeURIComponent`(실측: `%EA%B2%B0%EC%A0%9C` → `결제`). `getPublishedProjects()`가 정렬해 둔 배열을 `filter`만 하므로 정렬 유지. 없는 태그는 200 + 빈 상태(`EmptyState`에 `message` prop 추가), 404 아님. `generateMetadata`에 `alternates.canonical`.
- `app/projects/page.tsx` — 칩 목록을 `ProjectList` 안(데이터 도착 후)에 렌더해 Suspense 경계를 그대로 둠. `app/sitemap.ts` — 태그 URL 7건 추가(priority 0.6).
- 온디맨드 재검증은 Task 017에서 `/projects` layout 타입으로 바꿔 두어 태그 페이지도 함께 무효화된다 — 추가 변경 없음.

### 실측 (로컬 프로덕션, 포트 3001)

- `/projects` 칩 8개(전체·결제·그로스·어드민·온보딩·운영·B2B·B2C), "전체" 현재. `B2C` → 2건 정렬 순, `결제` → 1건, `B2B` → 1건(어드민), `no-such-tag` → 빈 상태 + 칩 9개(현재 태그 추가).
- 카드 → 상세 → 뒤로 가기 → 태그 페이지 복귀, "전체" → `/projects` 3건.
- 375px: `scrollWidth 375 == innerWidth`, 칩 2줄로 줄바꿈. 다크 모드: 현재 칩 L7.8 on L91, 비활성 L66 on L2.8. 스크린샷 확인 후 삭제.
- `sitemap.xml`에 `/projects/tag/%EA%B2%B0%EC%A0%9C` 등 7건.
- tsc·lint 0.

### 후속

- 카드 안 태그 배지를 필터 링크로 만드는 것은 하지 않았다(홈 카드까지 영향, 스코프 밖). 필요하면 `ProjectCard`의 `Badge`에 `asChild` + `Link href={tagHref(tag)}`만 붙이면 된다.
