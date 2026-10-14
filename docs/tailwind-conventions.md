# CSS / Tailwind 사용법 — 현재 구조와 치트시트

- 작성일: 2026-10-12 / 갱신: 2026-10-13 (`gamesense.css` 마이그레이션 완료 후)
- 이 문서 두 부분으로 되어 있다: **0장**은 지금 CSS가 전체적으로 어떻게 짜여 있는지(구조 설명),
  **1장부터**는 **새 화면을 만들 때** CSS 지식 없이 따라 칠 수 있는 치트시트.

## 0. 현재 CSS 구조

### 0-1. 파일 목록과 역할

| 파일 | 줄 수 | 역할 |
|---|---|---|
| `src/index.css` | ~140줄 | 전역 진입점. Tailwind 로드, `@theme` 토큰 전부, 전역 리셋(`@layer base`), 몇 개 남은 공용 클래스 |
| `src/styles/tokens.css` | 19줄 | 원본 디자인 토큰(`--bg`, `--surface`, `--primary` 등). `index.css`가 `@import` |
| `src/styles/gamesense.css` | 65줄 | `--gs-*` 토큰 원본 + CSS로만 가능한 것들(가상요소, `:has()`, 다이얼로그 backdrop)만 남음 |
| `src/styles/performance.css` | 338줄 | **아직 미마이그레이션.** PC 성능 체크 화면(`pc-*` 클래스). 백엔드 연동 때 같이 진행 예정 |

나머지 화면(`auth.css`, `mypage.css`, `community.css`, `index.css`가 담당하던 소비분석 등)은 전부 컴포넌트 안의
Tailwind 유틸리티로 옮겨졌고, 해당 CSS 파일은 삭제됐다. **`performance.css`를 쓰는 화면(`/pc-check`)만
예외적으로 아직 옛날 방식이다.**

### 0-2. 색상은 전부 `@theme` 토큰을 거친다

`index.css`의 `@theme` 블록이 `tokens.css`/`gamesense.css`의 CSS 변수를 Tailwind 유틸리티로 등록해둔다.
그래서 `bg-gs-panel`, `text-primary` 같은 클래스가 실제로는 `var(--gs-panel)`, `var(--primary)`를
참조하는 식이고, 그 변수가 `:root[data-theme="dark"]`에서 다른 값으로 바뀌므로 **다크모드가 자동으로
적용**된다. 색상을 추가하려면 `tokens.css`/`gamesense.css`에 변수를 먼저 만들고 `index.css`의
`@theme`에 한 줄 등록한다 — 컴포넌트에서 직접 `#hexcode`를 쓰지 않는다.

### 0-3. 반응형은 Tailwind 기본 브레이크포인트(`sm`/`md`/`lg`)를 안 쓴다

기존 디자인의 브레이크포인트 값(360, 480, 580, 600, 700, 760, 850, 900, 1000, 1120, 1200, 1350,
1500, 1600, 1750, 1900px…)이 Tailwind 기본값과 안 맞아서, **전부 임의값 브레이크포인트**로 쓴다:

```
max-[900px]:hidden      /* 900px 이하에서 숨김 */
min-[1600px]:text-[14px] /* 1600px 이상에서 폰트 키움 */
```

### 0-4. "마커 클래스" — 스타일이 없는데 지우면 안 되는 클래스

일부 클래스 이름은 CSS 선택 규칙이 아니라 **JS나 CSS의 다른 규칙이 찾는 훅**으로만 쓰인다. 전부
유틸리티로 바꿔도 이것들은 이름 그대로 남겨둬야 한다:

| 클래스 | 왜 필요한가 |
|---|---|
| `gs-shell` | `body:has(.gs-shell)` 전역 배경 규칙 + 리셋 CSS가 이 클래스를 찾음 |
| `gs-dialog`, `gs-mobile-drawer`, `mp-dialog` | `body:has(.gs-dialog[open], ...)` 스크롤 잠금 규칙, `::backdrop` 공용 규칙 |
| `gs-search` | `GameSenseLayout.jsx`가 `document.querySelector('.gs-search input')`로 `/` 단축키 포커스를 줌 (JS 훅, CSS 아님) |
| `gs-nav-link`, `active` (Sidebar) | `.gs-nav-link.active > svg:has(path[d^='m3 10'])` — 홈 아이콘만 fill 채우는 규칙 |
| `mp-mint`/`mp-blue`/`mp-pink`/`mp-gold`/`mp-purple` | `--mp-tone` CSS 변수를 설정하는 훅. `color-mix()`는 Tailwind 유틸리티가 없어서 그대로 둠 |
| `game-art`, `art-elden` 등 10종 | 게임 커버 그라디언트. 재사용 디자인 토큰이라 유틸리티로 안 바꿈 |

### 0-5. ⚠️ Tailwind v4 중요도(`!important`) 수정자는 접미사다

**`!bg-red-500`(접두사)는 Tailwind v4에서 작동하지 않는다 — 조용히 무시되고 클래스 자체가 생성 안 된다.**
빌드도 에러 없이 통과해서 알아채기 어렵다. 반드시 **접미사**로 쓴다:

```
bg-red-500!       ✅ 맞음 (!important 적용됨)
!bg-red-500       ❌ 틀림 (아무 효과 없음, 빌드도 조용히 통과)
```

언제 필요한가: `game-art`처럼 "이름 있는 공용 클래스"의 크기를 특정 화면에서만 다르게 쓸 때
(`w-[55px]! h-[65px]!` 식으로 플레인 CSS 규칙을 덮어씀).

## 1. 색상은 직접 고르지 않는다 — 이미 있는 토큰만 쓴다

아래 이름만 보고 복사해서 쓰면 다크모드가 자동으로 맞게 바뀐다. 색상 코드(`#fff` 같은 것)를
직접 쓰지 않는다.

| 쓰고 싶은 것 | 클래스 |
|---|---|
| 카드/패널 배경 | `bg-gs-panel` |
| 더 밝은 배경(hover 등) | `bg-gs-hover`, `bg-gs-raised` |
| 테두리 | `border-gs-border` |
| 기본 글자색 | `text-gs-text` |
| 보조/흐린 글자색 | `text-gs-muted` |
| 포인트 색(민트) | `text-gs-mint`, `bg-gs-mint` |
| 강조/액티브 배경 | `bg-gs-active` |
| 검색창 배경 | `bg-gs-search` |

공용(홈/마이페이지/성능 쪽) 화면이면 `--gs-*` 대신 아래를 쓴다:

| 쓰고 싶은 것 | 클래스 |
|---|---|
| 카드/패널 배경 | `bg-surface` |
| 테두리 | `border-border` |
| 기본 글자색 | `text-text` |
| 보조 글자색 | `text-muted` |
| 포인트 색 | `text-primary`, `bg-primary` |

로그인/가입 화면(`/login`, `/signup`, `/forgot-password`)만 쓰는 별도 토큰도 있다 — 이 화면은
사이트 테마와 무관하게 항상 다크다:

| 쓰고 싶은 것 | 클래스 |
|---|---|
| 배경 | `bg-auth-bg` |
| 테두리 | `border-auth-border` |
| 글자색 | `text-auth-text`, `text-auth-muted` |
| 포인트 색 | `text-auth-mint`, `bg-auth-mint` |

**어느 토큰 세트를 써야 할지 모르겠으면**: 로그인/가입 화면이면 `auth-*`, 그 외 사이드바 있는 화면
(`GameSenseLayout` 안, 거의 전부)이면 `gs-*`, 예전 소비분석/구매내역(`/analysis`, `/purchases`)
쪽이면 공용(`surface`/`text`/`primary`) 토큰.

## 2. 자주 쓰는 레이아웃 패턴

| 하고 싶은 것 | 클래스 |
|---|---|
| 가로로 나열, 가운데 정렬 | `flex items-center gap-[10px]` |
| 세로로 쌓기 | `flex flex-col gap-[10px]` |
| 양 끝으로 벌리기 (왼쪽 제목, 오른쪽 버튼 등) | `flex items-center justify-between` |
| 둥근 카드 | `rounded-xl border border-gs-border bg-gs-panel p-[20px]` |
| 둥근 버튼 느낌 테두리 | `rounded-[10px]` |
| 완전히 둥근 pill (검색창 등) | `rounded-[25px]` |

간격 숫자는 기존 화면과 비슷한 느낌을 보고 `gap-[10px]`, `px-[14px]`처럼 **대괄호 안에 그대로 px 값을** 넣으면 된다 — "Tailwind 표준 간격이 뭔지" 고민하지 않아도 됨.

## 3. 글자

| 하고 싶은 것 | 클래스 |
|---|---|
| 작은 보조 텍스트 | `text-[11px] text-gs-muted` |
| 본문 텍스트 | `text-[13px]` |
| 제목(크게) | `text-[20px] font-bold` |
| 굵게 | `font-bold` (딱 기존 숫자와 맞춰야 하면 `font-[650]`처럼 대괄호) |
| 한 줄로 자르고 "..." 처리 | `whitespace-nowrap overflow-hidden text-ellipsis` |

## 4. 호버 / 다크모드 / 반응형

- 마우스 올렸을 때 배경 바꾸기: `hover:bg-gs-hover`
- **다크모드 전용 클래스는 따로 안 써도 된다** — 토큰 클래스들이 전부 자동으로 다크모드에 맞게 바뀐다. `dark:` 접두사를 쓸 필요가 없다 (이 프로젝트는 그런 방식이 아님).
- 화면 크기별로 다르게 하고 싶으면 `max-[900px]:flex-col`, `min-[1600px]:text-[14px]` 식으로 쓴다 (0-3 참고, `sm:`/`md:` 안 씀).

## 5. 네이티브 다이얼로그(`<dialog>`), 애니메이션, `:has()`, `color-mix()` 같은 특수한 것

이건 Tailwind 유틸리티로 안 되는 것들이다. **새 화면에서 이런 게 필요하면 혼자 판단하지 말고 CSS를 아는 사람에게 물어본다.** (0-4의 "마커 클래스"가 실제 사례)

## 6. 작업 끝나면

1. `npm run build`, `npx eslint .` 둘 다 통과하는지 확인 (실패하면 클래스 이름을 잘못 썼을 가능성이 큼)
2. **직접 화면을 열어서 눈으로 확인한다.** 빌드가 통과해도 이상하게 보일 수 있다 — 이게 자동으로 안 걸러진다. 특히 0-5의 `!` 수정자는 **틀려도 빌드가 그냥 통과**하니 눈으로 꼭 확인한다.
3. 라이트/다크 모드 둘 다 한 번씩 눌러서 확인한다.

---

## 비주얼 QA를 맡을 때 (코드 안 짜는 역할)

마이그레이션된 화면이 나오면, 아래만 확인해서 보고하면 된다 — 코드를 볼 필요 없음.

- [ ] 라이트 모드에서 색이 이상한 곳 없는지
- [ ] 다크 모드로 전환했을 때 색이 이상한 곳 없는지 (특히 글자가 배경색과 비슷해져서 안 보이는 경우)
- [ ] 버튼/링크 위에 마우스 올렸을 때 반응이 이상한지
- [ ] 화면을 좁게(모바일 크기로) 줄였을 때 깨지는 곳 없는지
- [ ] 변환 전 화면(develop 브랜치)과 나란히 띄워놓고 비교했을 때 다르게 보이는 부분

## 7. 아직 안 끝난 것

- `src/styles/performance.css`(`/pc-check`, PC 성능 체크 화면)는 백엔드 PC 사양 연동 때 같이
  마이그레이션하기로 결정됨. 지금은 그대로 `pc-*` 클래스 쓴다 — 이 화면만 작업할 땐 위 치트시트
  대신 기존 `performance.css`의 클래스를 그대로 따라 쓰면 된다.
