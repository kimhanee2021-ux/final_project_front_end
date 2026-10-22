# src 폴더 구조

기능(feature) 단위로 묶고, 여러 기능이 같이 쓰는 것만 `shared`에 둔다.

```
src/
├─ main.jsx                 진입점 (Provider 감싸고 router 실행)
├─ app/                     앱 전체 틀
│  ├─ App.jsx               최상위 Provider 조합
│  ├─ router.jsx            라우트 목록 (어떤 주소에 어떤 페이지)
│  ├─ providers/            전역 Provider (GameSense, Theme)
│  └─ layout/               헤더바·검색·설정 메뉴·모바일 사이드바 등 공통 레이아웃
├─ pages/                   주소 하나 = 페이지 하나. 기능 컴포넌트를 조립만 한다
├─ features/                기능별 폴더 (아래 규칙 참고)
│  ├─ auth/            로그인·가입·온보딩 흐름, 세션
│  ├─ user/            계정 설정 (닉네임·비밀번호·스팀 연동·탈퇴)
│  ├─ player/          마이페이지 프로필·편집 창
│  ├─ library/         내 스팀 라이브러리
│  ├─ wishlist/        위시리스트와 AI 구매 판단
│  ├─ spending/        보유 게임 소비 데이터 (금액·플레이 시간), 보유 게임 표
│  ├─ purchase-import/ 스팀 구매내역·라이선스 가져오기
│  ├─ game-analysis/   나의 분석 > AI 분석 페이지 (데이터 패널·목차)
│  ├─ ai-insight/      AI 분석 영역 (소비 유형·주제별 AI 결과)
│  ├─ ai-coach/        코치 노바 채팅·예산
│  ├─ ai-recommends/   AI 게임 추천
│  ├─ games/           스팀 전체 게임 탐색
│  ├─ performance/     AI PC 진단
│  ├─ board/           커뮤니티 게시판
│  ├─ hangul-blocks/   한글 테트리스
│  └─ gamer-map/       랜딩의 PC 게이머 모자이크 지도
└─ shared/                  여러 기능이 같이 쓰는 것
   ├─ ui/                   화면 부품 (layout / charts / controls / feedback / icons / media)
   ├─ state/                전역 상태 (GameSense, Theme)
   ├─ hooks/                공용 훅 (useDismiss, useModalDialog, useActiveSection …)
   ├─ lib/                  외부 연동 (apiClient, aiRequest, 토큰 저장)
   ├─ utils/                순수 함수 (formatters, searchMatch, headline, smoothScroll)
   └─ styles/               전역 CSS 토큰
```

## 기능 폴더 안 규칙

```
features/<기능>/
├─ components/   화면 컴포넌트 (파일 하나 = 컴포넌트 하나)
│  └─ <영역>/    한 화면이 커지면 화면 영역별로 하위 폴더를 둔다 (예: spending/components/games-table)
├─ hooks/        상태·데이터 훅 (화면 없이 상태와 동작만)
├─ model/        화면과 무관한 순수 로직 (계산, 변환, 파싱, 입력 검사) — tests/에서 바로 테스트한다
├─ mocks/        더미 데이터
├─ context/      해당 기능의 Context/Provider
├─ api.js        백엔드 호출
└─ index.js      이 기능의 공개 목록
```

`pages/<페이지>/` 안에도 그 페이지에서만 쓰는 조각을 하위 폴더로 둘 수 있다 (예: `pages/auth/shell`, `pages/mypage/sections`).
여러 기능을 함께 조립하는 화면(온보딩 등)은 기능끼리 서로 import하지 않도록 페이지 쪽에 둔다.

## 이름 규칙

- 폴더 이름은 케밥 케이스 (`game-analysis`, `purchase-import`), 컴포넌트 파일은 파스칼 케이스 (`GenrePanel.jsx`), 그 밖의 파일은 카멜 케이스 (`gamesTable.js`).
- `useRef`로 만든 값은 이름 끝을 `Ref`로 (`boardRef`, `softRef`) — React 컴파일러 lint가 ref로 알아본다.

## import 규칙

- 다른 기능·공용을 쓸 때는 `@` 별칭과 **index.js**로만 가져온다.
  - `import { useAuth } from '@/features/auth'`
  - `import { Panel, GSIcon } from '@/shared/ui'`
- 같은 기능 폴더 안에서는 상대 경로(`./`, `../`)를 쓴다.
- `model/`의 순수 함수에는 화면(JSX)을 넣지 않는다. 화면은 `components/`가 맡는다.
  node로 바로 테스트할 수 있게 `model/`끼리는 확장자를 붙인 상대 경로(`'./spendingMetrics.js'`)로 가져온다.
- 공용(`shared`)은 기능(`features`)을 가져다 쓰지 않는다. (공용 → 기능 방향 금지)

## 확인

```sh
npm run lint
npm run build
node --test tests/*.test.js src/features/gamer-map/model/*.test.js
```
