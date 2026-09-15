# Task 018: `/about` 연락처 링크 추가 (방명록 대체)

## 고수준 명세

- **목적**: 방문자(채용 담당자)가 주인에게 바로 연락할 수 있도록 `/about` 하단에 연락 섹션을 둔다. "방문자가 글을 남기는 기능(방명록)" 검토 결과 보류하고 이것으로 대체한다(ROADMAP v2 §보류).
- **범위**: `SITE_CONFIG.contact`(email·linkedin·github, 각 선택) + `/about` 연락 섹션. Footer 노출은 범위 밖. 실제 값은 사용자가 채운다 — 이 Task는 빈 값으로 커밋한다.
- **PRD 참조**: §5 `/about`, §10 접근성(링크 접근 가능한 이름), U1(하드코딩 유지)
- **리스크·미결**:
  - U4 — 연락처 실제 값 미확정. 전부 비면 섹션이 렌더되지 않아 자리 표본이 노출되지 않는다.
  - 개인정보 수집 없음(주인의 공개 연락처만 표시), 클라이언트 훅 없음.
- **전제 조건**: ROADMAP v2 생성 완료.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/site-config.ts` | 수정 | `contact` 추가(단일 출처) |
| `README.md` | 수정 | 단일 출처 절에 연락처 언급 |
| `app/about/page.tsx` | 수정 | `CONTACT_LINKS` 상수 + 연락 섹션 |
| `docs/roadmaps/ROADMAP_v2.md` | 수정 | Task 018 ✅ |

## 수락 기준

- [x] `SITE_CONFIG.contact` 세 값이 전부 비면 `/about`에 연락 섹션이 없다
- [x] 값이 있는 항목만 렌더된다(일부만 설정 시 해당 항목만)
- [x] 이메일은 `mailto:`, LinkedIn·GitHub는 `target="_blank" rel="noreferrer"`
- [x] 링크에 접근 가능한 이름이 있고 아이콘은 장식(`aria-hidden`)
- [x] 375/1280 가로 스크롤 없음, 다크 모드 대비 유지
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: 서버 컴포넌트, 토큰 색, 모듈 스코프 `UPPER_SNAKE_CASE` 상수, `cn()`

## 구현 단계

- [x] 1. `lib/site-config.ts`에 `contact` 추가
- [x] 2. `app/about/page.tsx`에 `CONTACT_LINKS` + 섹션(0건이면 null)
- [x] 3. `npx tsc --noEmit` + `npm run lint` 오류 0
- [x] 4. 테스트 체크리스트(값 있음/일부/없음, 반응형, 다크)
- [x] 5. 작업 파일·ROADMAP v2 갱신. 완료 후 중단하고 지시 대기

## 테스트 체크리스트

> 개발 서버(`npm run dev`)에서 `SITE_CONFIG.contact`를 임시로 바꿔 가며 Playwright MCP로 확인하고 원복한다.

### 정상 흐름

- [x] 세 값 설정 → 링크 3개, `href`가 `mailto:`·LinkedIn·GitHub URL, 외부 링크 2개에 `target=_blank rel=noreferrer`
- [x] 이메일만 설정 → 링크 1개

### 예외·엣지 케이스

- [x] 전부 빈 값(커밋 상태) → 연락 섹션 없음, "프로젝트 보러 가기" 버튼은 그대로

### 반응형·다크 모드·접근성

- [x] 375/1280 가로 스크롤 없음, 375에서 버튼 줄바꿈
- [x] 다크 모드 대비
- [x] 접근성 스냅샷에서 링크 이름이 "이메일"/"LinkedIn"/"GitHub"

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/site-config.ts` — `contact: { email, linkedin, github }` 추가(빈 문자열 = 미설정). 사이트 정보 단일 출처 원칙 유지, 실제 값은 사용자가 채운다(U4).
- `app/about/page.tsx` — 모듈 스코프 `CONTACT_LINKS`(값 있는 항목만 `filter`) + "연락" 섹션. `Button asChild variant="outline"` 안의 `<a>`: 이메일 `mailto:`, 외부 링크 `target="_blank" rel="noreferrer"`. 아이콘은 `aria-hidden`, 링크 이름은 텍스트("이메일"/"LinkedIn"/"GitHub"). 세 값이 전부 비면 섹션을 렌더하지 않는다.
- 아이콘: 설치된 `lucide-react` 1.40은 브랜드 아이콘(`Github`·`Linkedin`)을 제공하지 않아(1.x에서 제거) 이메일은 `Mail`, 외부 링크 둘은 `ExternalLink`로 통일했다. 새 의존성 없음.
- `README.md` — "콘텐츠의 단일 출처" 절에 연락처도 `SITE_CONFIG`에서 관리함을 명시.

### 실측 (개발 서버, Playwright MCP)

- 빈 값(커밋 상태): 연락 섹션 없음, "프로젝트 보러 가기" 유지.
- 세 값 임시 설정: 링크 3개, `href` `mailto:`/LinkedIn/GitHub, 외부 2개에 `target=_blank rel=noreferrer`, 접근 가능한 이름 "이메일"·"LinkedIn"·"GitHub", SVG `aria-hidden=true`. 375px 가로 스크롤 없음(한 줄에 3개), 다크 모드 대비 정상(스크린샷 확인 후 삭제).
- 이메일만 설정: 링크 1개. 이후 `site-config.ts` 백업과 `cmp`로 원복 확인.
- tsc·lint 0.
