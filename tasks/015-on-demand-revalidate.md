# Task 015: 온디맨드 재검증 Route Handler 구현 (F11, P2)

## 고수준 명세

- **목적**: Notion 자동화(웹훅)가 `POST /api/revalidate`를 호출하면 ISR 60초 주기를 기다리지 않고 다음 요청에서 바로 갱신되게 한다. 부수 목표로 R6(404였던 slug 재발행 시 첫 재생성 한 주기 `noindex`+기본 `<title>`)가 `revalidatePath` 경로에서도 재현되는지 확인한다.
- **범위**: Route Handler + 시크릿 환경 변수 + Notion 자동화 설정 절차 문서화. `revalidate` 60→3600 상향은 웹훅 안정성을 사용자가 확인한 뒤 별도 결정(이번 Task에서는 60 유지). 특정 slug만 골라 무효화하는 최적화는 하지 않는다(발행 20건 미만, N3).
- **PRD 참조**: F11, §7.2(온디맨드 무효화 `revalidatePath`), §8 탈락 대안 표, §12 환경 변수
- **리스크·미결**:
  - R6 — `revalidatePath` 경로 재현 여부를 실측해 ROADMAP에 기록.
  - 시크릿은 `Authorization: Bearer` 헤더로만 받는다. Notion 웹훅 액션은 커스텀 헤더를 지원하며 POST 전용이다(Notion 도움말 "webhook-actions"). 쿼리 파라미터는 URL 로그에 남으므로 받지 않는다.
  - `NOTION_REVALIDATE_SECRET`은 선택 값이다. 없으면 사이트는 정상 동작하고 `/api/revalidate`만 503으로 닫힌다(fail-closed). 그래서 `lib/notion/client.ts`의 필수 키 배열(`NOTION_ENV_KEYS`, 없으면 throw)에는 넣지 않는다.
  - Vercel 환경 변수 등록과 Notion 자동화 생성은 **사용자 수작업**이다.
- **전제 조건**: Task 014 완료(배포 URL 확정), Notion 유료 플랜(웹훅 액션 조건).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/api/revalidate/route.ts` | 신규 | `POST` 전용. Bearer 시크릿 타이밍 안전 비교 → `revalidatePath` ×4 |
| `.env.example` | 수정 | `NOTION_REVALIDATE_SECRET` 추가(한국어 주석, 값 비움) |
| `README.md` | 수정 | 환경 변수 표, "즉시 반영(선택)" 절차, 배포 절 환경 변수 목록 |
| `lib/notion/client.ts` | 참조 | 필수 키 배열에 넣지 않는 결정(변경 없음) |
| `ROADMAP.md` | 수정 | Task 015 ✅, R6 결과, 우선순위 이동 |

## 수락 기준

- [x] `POST /api/revalidate` — 헤더 없음·불일치 → 401, 환경 변수 미설정 → 503, 올바른 시크릿 → 200 JSON
- [x] `GET /api/revalidate` → 405
- [x] Notion 제목 수정 → POST → 60초를 기다리지 않고 `/projects`·`/projects/[slug]`·`/` 첫 요청에 반영
- [x] `/sitemap.xml`도 함께 무효화된다
- [x] `.env.example`·README 환경 변수 표·배포 절이 동시에 갱신됐다(shrimp-rules §7)
- [x] README에 Notion 자동화(웹훅) 설정 절차가 한국어로 있다
- [x] R6 재현 여부가 ROADMAP에 기록됐다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 시크릿 값은 로그·응답에 노출하지 않음

## 구현 단계

- [x] 1. `revalidatePath.md`·`route.md` 로컬 문서 확인, Notion 웹훅 액션의 헤더 지원 여부 확인
- [x] 2. `app/api/revalidate/route.ts` 작성
- [x] 3. `.env.example`·README 갱신
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0
- [x] 5. 아래 테스트 체크리스트 수행(curl + Playwright MCP)
- [x] 6. 작업 파일 체크박스·요약, ROADMAP ✅·R6 기록. 완료 후 중단하고 지시 대기

## 테스트 체크리스트

> 로컬 프로덕션(`npm run build` → `npm run start -p 3001`)에서 수행한다. 시크릿 값은 읽거나 출력하지 않는다.

### 정상 흐름

- [x] 올바른 `Authorization: Bearer` → 200 `{ revalidated: true, paths: [...] }`
- [x] Notion에서 `admin-dashboard` 제목 수정 → 즉시 POST → `/projects`·`/projects/admin-dashboard`·`/` 첫 요청에 새 제목(`x-nextjs-cache` 확인). 확인 후 원복 + POST
- [x] Playwright MCP로 `/projects`에서 새 제목이 보이는지 1회 확인

### 예외·엣지 케이스

- [x] 헤더 없음 → 401, 틀린 값 → 401, `Bearer` 접두사 없음 → 401
- [x] `GET` → 405
- [x] `NOTION_REVALIDATE_SECRET` 미설정 상태로 기동 → 503, 나머지 페이지는 정상
- [x] R6: `draft-unpublished` 상세를 먼저 요청해 404 캐시 → Published 체크 → POST → 첫 응답의 `<title>`·robots 메타 확인 → 결과 기록. 확인 후 Published 해제 + POST

### 배포 환경

- [ ] Vercel 배포본 `POST /api/revalidate` — **미완(사용자 작업 남음)**: 이 Task 커밋·푸시 전이라 현재 404. 푸시 후 시크릿 미등록이면 503, `NOTION_REVALIDATE_SECRET` 등록·재배포 후 401/200 재확인

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `app/api/revalidate/route.ts` 신규 — `POST` 전용. `Authorization: Bearer` 시크릿을 `timingSafeEqual`로 비교(길이 다르면 비교 없이 거부) → `revalidatePath("/")`, `("/projects")`, `("/projects/[slug]", "page")`, `("/sitemap.xml")` → `200 { revalidated, paths, now }`. 헤더 없음·불일치 401, 시크릿 미설정 503(fail-closed, 서버 로그에 설정 누락 기록), GET 405(핸들러 미정의).
- `.env.example`에 `NOTION_REVALIDATE_SECRET`(선택, 한국어 주석) 추가. `lib/notion/client.ts`의 `NOTION_ENV_KEYS`에는 넣지 않음 — 그 배열은 없으면 throw 하는 필수 키용이고 이 값은 선택이라 route 안에서만 검사한다.
- `README.md` — 환경 변수 표, "즉시 반영 (선택, Notion 자동화 웹훅)" 절(시크릿 생성 → Vercel 등록 → 자동화 트리거/웹훅 액션/커스텀 헤더 → curl 수동 호출), 배포 절 환경 변수 목록, 구조 트리.
- Notion 웹훅 액션은 커스텀 헤더를 지원하고 POST 전용이며 유료 플랜 기능임을 확인(Notion 도움말 webhook-actions). 그래서 쿼리 파라미터 대안은 두지 않았다.
- 본문 블록만 고친 경우는 속성 변경이 아니라 자동화가 발동하지 않는다 — README에 명시.

### 실측 (로컬 프로덕션, 포트 3001)

- 시크릿 미설정: POST 503, GET 405, `/projects` 200(사이트 정상).
- 임시 시크릿 설정 후: 헤더 없음 401, 틀린 값 401, `Bearer` 접두사 없음 401, 길이 다른 값 401, 올바른 값 200 `{"revalidated":true,"paths":["/","/projects","/projects/[slug]","/sitemap.xml"]}`.
- 즉시 반영: 세 경로 HIT 상태에서 Notion `admin-dashboard` 제목 수정 → POST 200(14:24:16) → **다음 첫 요청(14:24:17)이 MISS로 새 제목** 반영, 두 번째 요청 HIT. 시간 기반 ISR과 달리 STALE 단계(구 데이터 1회 노출)가 없다. `/sitemap.xml`도 MISS.
- **R6 재현 안 됨**: `draft-unpublished` 404를 HIT로 캐시 → Published 체크 → POST → 첫 응답부터 200 + 정상 `<title>` + `robots` 메타 없음. R6는 시간 기반 재검증(백그라운드 재생성)에서만 나타나므로, 재발행 직후 웹훅/수동 POST를 하면 우회된다.
- Playwright로 `/projects` 카드 3건·원복 제목 확인. Notion 데이터(제목·Published) 원복, `.env.local` 백업과 `cmp`로 동일 확인, 임시 시크릿 파일 삭제.
- Vercel: 코드 미배포 상태라 404. 푸시 후 사용자가 `NOTION_REVALIDATE_SECRET`을 Vercel에 등록하고 Notion 자동화를 만들면 된다(README 절차).

### 후속 결정 항목

- 웹훅이 실제 편집에서 안정적으로 발동하는 것을 확인한 뒤 `revalidate`를 60 → 3600으로 올릴지 결정. 올리면 Notion 호출이 크게 줄지만 웹훅이 빠진 변경(본문만 수정 등)은 최대 1시간 지연된다.
