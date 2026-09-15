# Task 006: Notion 블록 렌더러 구현

## 고수준 명세

- **목적**: 상세 페이지가 Notion 본문(`NotionBlock[]`)을 PRD §6.3 규칙대로 렌더하게 한다. 더미 `MOCK_BLOCKS`로 7종 블록·인라인 서식·연속 리스트 묶기를 시각 확인한다.
- **범위**: `lib/notion/group-blocks.ts`(순수 함수), `components/projects/rich-text.tsx`(인라인 서식), `components/projects/notion-blocks.tsx`(블록 → JSX), 상세 페이지 연결. `image`는 고정 비율 컨테이너 + `alt`만(`next/image`는 Task 012). 미지원 블록은 매퍼(Task 009)에서 걸러지므로 렌더러는 `default: null`로 방어만 한다.
- **PRD 참조**: §6.3 지원 블록 표, §10 접근성(heading 레벨 건너뛰지 않음, 이미지 `alt`), F2
- **리스크·미결**: 없음. 중첩 블록은 한 단계만 처리(하위 무시)한다는 §6.3 규칙은 타입 자체에 자식이 없어 자연히 충족된다.
- **전제 조건**: Task 005 완료(상세 페이지·`ProjectHeader`), `MOCK_BLOCKS`(Task 003).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/notion/group-blocks.ts` | 신규 | `groupBlocks(blocks)` — 인접한 같은 리스트 타입을 `{ type: "list", ordered, items }`로 묶는 순수 함수 |
| `components/projects/rich-text.tsx` | 신규 | `RichTextSpans({ richText })` — bold/italic/code/href → `<strong>`/`<em>`/`<code>`/`<a>` |
| `components/projects/notion-blocks.tsx` | 수정 | `groupBlocks` 후 `switch(type)` 렌더, `default: null` |
| `app/projects/[slug]/page.tsx` | 수정 | `ProjectHeader` 아래 `<NotionBlocks blocks={MOCK_BLOCKS} />` |
| `lib/notion/types.ts` | 참조 | `NotionBlock`, `RichText` (변경 없음) |
| `lib/notion/mock-data.ts` | 참조 | `MOCK_BLOCKS` (변경 없음) |

## 수락 기준

- [x] `/projects/subscription-checkout` 본문에 `h2`(배경) → `h3`(역할) → `h4`(진행 순서) 순으로 heading이 있고 `h1`은 제목 하나뿐이다
- [x] `ul` 1개(`li` 3), `ol` 1개(`li` 2)로 연속 리스트가 묶인다
- [x] `blockquote`, `hr`, `pre > code`, 이미지 컨테이너(`alt` 있음)가 각 1개 있다
- [x] 인라인 서식 `strong`("58%"), `em`("주소 입력"), `code`("checkout_v1"), `a`("분석 노트", `href` 일치, `target="_blank" rel="noreferrer"`)가 렌더된다
- [x] `groupBlocks`는 입력 배열을 변경하지 않고, 리스트가 아닌 블록은 그대로 통과시킨다
- [x] 375px / 1280px에서 가로 스크롤이 없다(긴 코드 블록은 `overflow-x-auto`)
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 서버 컴포넌트, 색은 토큰만, 클래스 조합 `cn()`

## 구현 단계

- [x] 1. `types.ts`·`mock-data.ts`·`notion-blocks.tsx` 껍데기를 확인한다.
- [x] 2. `lib/notion/group-blocks.ts`를 작성한다(타입 `GroupedBlock` export).
- [x] 3. `rich-text.tsx`와 `notion-blocks.tsx` 렌더 분기를 작성하고, 타이포그래피는 ui-markup-specialist에 위임한다.
- [x] 4. 상세 페이지에 `MOCK_BLOCKS`를 연결한다.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 6. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 7. 체크박스를 갱신하고 `ROADMAP.md`의 Task 006을 ✅로 표시한다. 완료 후 중단하고 다음 지시를 기다린다.

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `/projects/subscription-checkout` 진입 → 본문 heading 순서 `H2 → H3 → H4`, `h1` 1개
- [x] `ul`/`ol` 개수와 `li` 수가 기대와 일치
- [x] `blockquote`·`hr`·`pre>code`·`img[alt]` 존재
- [x] `strong`·`em`·`code`·`a[target=_blank][rel=noreferrer]` 인라인 렌더

### 예외·엣지 케이스

- [x] 빈 `blocks` → 아무것도 렌더하지 않고 오류 없음(페이지에서 `[]` 임시 전달 후 원복)

### 반응형·다크 모드·접근성

- [x] 375px / 1280px에서 가로 스크롤 없음(코드 블록 내부 스크롤만)
- [x] 다크 모드에서 인용·코드 블록 대비 유지
- [x] heading 레벨 건너뜀 없음, 이미지 `alt`

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/notion/group-blocks.ts` 신규 — `groupBlocks(blocks): GroupedBlock[]`. 인접한 같은 리스트 타입을 `{ type: "list", ordered, items }`로 묶고 나머지는 통과. `Extract`/`Exclude`로 타입을 파생해 `NotionBlock` 유니온이 바뀌어도 따라간다. 실행 검증: 입력 불변, 14 → 11(ul 3·ol 2), 빈 입력 `[]`.
- `components/projects/rich-text.tsx` 신규 — `RichTextSpans`. 조각마다 `code → em → strong → a` 순으로 래핑을 겹친다(링크가 가장 바깥). `a`는 `target="_blank" rel="noreferrer"`.
- `components/projects/notion-blocks.tsx` — `groupBlocks` 후 `switch(type)`: `heading_1/2/3 → h2/h3/h4`(페이지 `<h1>`은 Title), `list → ul/ol`, `quote`, `divider`, `code`(`overflow-x-auto`), `image`(`aspect-video` 컨테이너 + `<img alt>`, `next/image`는 Task 012), `default: null`. 타이포그래피 클래스는 ui-markup-specialist가 토큰 색만으로 작성.
- `app/projects/[slug]/page.tsx` — `ProjectHeader` 아래 `<NotionBlocks blocks={MOCK_BLOCKS} />`(Task 010에서 `getProjectBlocks`로 교체).
- 검증: tsc·lint 0. Playwright — heading `H1 → H2 → H3 → H4`, `ul` 1(li 3)·`ol` 1(li 2), `blockquote`·`hr`·`pre>code`·`img[alt]` 각 1, `strong`/`em`/`code`/`a[target=_blank][rel=noreferrer]` 인라인 확인, `pre` `overflow-x: auto`, 375px·1280px 가로 스크롤 없음(코드 블록 내부 스크롤만), 다크 모드 대비 정상, 빈 `blocks` → 본문 요소 0·오류 없음.
