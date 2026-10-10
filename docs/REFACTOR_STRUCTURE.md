# 프론트엔드 폴더 구조 리팩토링 결과 (도메인별 구조)

- 작성일: 2026-10-10
- 브랜치: `test/front_back_connect`
- 검증: ESLint 통과, `npm run build` 성공, 단위 테스트 9/9 통과, 미사용 파일·깨진 import 0개
- 미검증: 브라우저에서 각 화면을 직접 열어보는 확인은 하지 않음

## 1. 원칙

| 폴더 | 역할 |
|---|---|
| `pages/` | 라우트 진입점만 둔다. 라우트당 폴더 1개 |
| `features/<도메인>/` | 도메인 코드 (`api`, `hooks/`, `components/`, `mocks/`, 순수 로직) |
| `components/common/` | 여러 도메인이 함께 쓰는 공통 UI |
| `layouts/` | 앱 레이아웃 (`GameSenseLayout`, `Sidebar`) |
| `contexts/` | 앱 전체 상태 (`GameSense`, `Theme`) |
| `hooks/`, `utils/`, `styles/` | 공통 훅, 유틸, 전역 CSS |

## 2. 결과 구조

```
src/
├─ main.jsx · App.jsx · Router.jsx · index.css
├─ pages/
│   ├─ activity/ActivityPage.jsx
│   ├─ analysis/AnalysisPage.jsx
│   ├─ auth/AuthPage.jsx
│   ├─ collections/CollectionsPage.jsx
│   ├─ explore/ExplorePage.jsx
│   ├─ home/HomePage.jsx
│   ├─ mypage/MyPage.jsx
│   ├─ performance/PerformancePage.jsx
│   ├─ settings/SettingsPage.jsx
│   ├─ upcoming/UpcomingPage.jsx
│   └─ store/                      (빈 폴더 유지)
├─ features/
│   ├─ auth/        api.js, authSession.js, context/, components/RequireDemoSession.jsx
│   ├─ dashboard/   api.js, spendingMetrics.js, spendingInsights.js, hooks/, components/, mocks/
│   ├─ games/       api.js, gameModel.js, hooks/useGames.js, components/, mocks/discoverMock.js
│   ├─ library/     api.js, hooks/, components/SteamLibraryPanel.jsx
│   ├─ performance/ components/(5개), mocks/performanceMock.js
│   ├─ player/      hooks/usePlayerData.js, components/(3개), mocks/playerMock.js
│   └─ user/        api.js, components/AccountSettings.jsx
├─ components/common/  Card, EmptyState, ErrorState, GSIcon, Icon, PageHeading, PeriodFilter, Skeleton, StatCard
├─ layouts/            GameSenseLayout.jsx, Sidebar.jsx
├─ contexts/           GameSenseContext/Provider, ThemeContext/Provider
├─ hooks/              useTheme.js
├─ utils/              apiClient.js, formatters.js
└─ styles/             auth.css, gamesense.css, mypage.css, performance.css, tokens.css
```

## 3. 파일 이동 내역

| 이전 | 이후 |
|---|---|
| `contexts/AuthContext.js` | `features/auth/context/AuthContext.js` |
| `contexts/AuthProvider.jsx` | `features/auth/context/AuthProvider.jsx` |
| `components/auth/RequireDemoSession.jsx` | `features/auth/components/RequireDemoSession.jsx` |
| `components/discover/GSIcon.jsx` | `components/common/GSIcon.jsx` |
| `components/discover/GameCard.jsx` | `features/games/components/GameCard.jsx` |
| `components/discover/GameDialog.jsx` | `features/games/components/GameDialog.jsx` |
| `components/discover/DashboardWidgets.jsx` | `features/games/components/HomeWidgets.jsx` (이름 변경) |
| `components/game/GameIdentity.jsx` | `features/dashboard/components/GameIdentity.jsx` |
| `components/game/PlayStatusBadge.jsx` | `features/dashboard/components/PlayStatusBadge.jsx` |
| `hooks/usePlayerData.js` | `features/player/hooks/usePlayerData.js` |
| `mocks/dashboardMock.js` | `features/dashboard/mocks/dashboardMock.js` |
| `mocks/discoverMock.js` | `features/games/mocks/discoverMock.js` |
| `mocks/performanceMock.js` | `features/performance/mocks/performanceMock.js` |
| `mocks/playerMock.js` | `features/player/mocks/playerMock.js` |
| `pages/mypage/ActivityTimeline.jsx` | `features/player/components/ActivityTimeline.jsx` |
| `pages/mypage/PlayerDialog.jsx` | `features/player/components/PlayerDialog.jsx` |
| `pages/mypage/ProfileHero.jsx` | `features/player/components/ProfileHero.jsx` |

## 4. 분리·이름 변경 (팀 공유 필요)

| 이전 | 이후 | 이유 |
|---|---|---|
| `pages/home/HomePage.jsx` (소비 분석) | `pages/analysis/AnalysisPage.jsx` | `/analysis`, `/purchases` 화면인데 이름이 Home이었음 |
| `pages/discover/DiscoverPage.jsx` | `pages/home/HomePage.jsx` + `features/games/components/GameCatalog.jsx` + `HomeHero.jsx` | `/` 홈 화면. 여러 라우트가 함께 쓰는 게임 목록과 배너를 분리 |
| `pages/discover/LibraryPages.jsx` | `pages/upcoming`, `collections`, `activity`, `settings` 4개 페이지 | 파일 하나에 페이지 4개 |
| (LibraryPages 내부) `PageHeading` | `components/common/PageHeading.jsx` | 여러 페이지 공통 |
| `pages/performance/PerformancePage.jsx` (602줄) | 페이지 273줄 + `features/performance/components/` 5개 | `PanelHeading`, `ScoreGauge`, `HardwareCard`, `GamePerformance`, `DetailsDialog` |

## 5. 라우트 연결 (`src/Router.jsx`)

| 경로 | 컴포넌트 | 로그인 필요 |
|---|---|---|
| `/login`, `/signup`, `/forgot-password` | `pages/auth/AuthPage` | |
| `/` | `pages/home/HomePage` | |
| `/explore` | `pages/explore/ExplorePage` (백엔드 `/api/games` 연동) | |
| `/genres`, `/trending`, `/recommendations` | `features/games/components/GameCatalog` | |
| `/upcoming` | `pages/upcoming/UpcomingPage` | |
| `/pc-check` | `pages/performance/PerformancePage` | |
| `/library`, `/wishlist` | `features/games/components/GameCatalog` | O |
| `/collections`, `/activity`, `/settings`, `/mypage` | 각 `pages/*` | O |
| `/analysis`, `/purchases` | `pages/analysis/AnalysisPage` | O |

## 6. 이번에 하지 않은 것 (후속 과제)

- `contexts/GameSense*`: 검색어, 위시리스트, 언어, 토스트, 선택된 게임이 한곳에 섞여 있음. 도메인별로 나누면 동작이 바뀌므로 이번에는 제외
- `styles/`: 전역 CSS 그대로. Tailwind로 옮길 때 함께 정리 예정
- `Icon`과 `GSIcon`, `GameCard`와 `GameListCard`: 같은 역할의 컴포넌트가 두 벌씩 있음
- 더미 데이터(`features/*/mocks`): 탐색 탭 외의 화면은 아직 목업 데이터를 사용

## 7. 같은 브랜치의 이전 작업

- 쓰지 않는 파일 13개 삭제 (예전 진입점·라우터, 초기 템플릿, 예전 대시보드 레이아웃 등)
- 사이드바를 `layouts/Sidebar.jsx`로 분리하고 링크를 모두 NavLink로 변경
- 라우팅을 `Router.jsx`(`createBrowserRouter`)로 분리하고 `App`을 최상위 라우트로 지정
- 로그인 화면에서 Steam·Google 소셜 버튼 제거
- 탐색 탭과 검색을 백엔드 `/api/games`, `/api/games/search`에 연동
  - 남은 문제: 백엔드 `SecurityConfig`가 `/api/games`만 허용해서, 로그인하지 않은 사용자는 `/api/games/search`에 401을 받음 → `/api/games/**`로 수정 필요
