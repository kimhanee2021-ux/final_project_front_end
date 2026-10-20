# src 폴더 구조

기능(feature) 단위로 묶고, 여러 기능이 같이 쓰는 것만 `shared`에 둔다.

```
src/
├─ main.jsx                 진입점 (Provider 감싸고 router 실행)
├─ app/                     앱 전체 틀
│  ├─ App.jsx               최상위 Provider 조합
│  ├─ router.jsx            라우트 목록 (어떤 주소에 어떤 페이지)
│  └─ layout/               헤더바·검색·설정 메뉴·모바일 사이드바 등 공통 레이아웃
├─ pages/                   주소 하나 = 페이지 하나. 기능 컴포넌트를 조립만 한다
├─ features/                기능별 폴더 (아래 규칙 참고)
│  ├─ auth/ board/ games/ gameAnalysis/ library/
│  ├─ performance/ player/ purchaseImport/ spending/ user/
└─ shared/                  여러 기능이 같이 쓰는 것
   ├─ ui/                   화면 부품 (layout / charts / controls / feedback / icons)
   ├─ state/                전역 상태 (GameSense, Theme)
   ├─ hooks/                공용 훅
   ├─ lib/                  외부 연동 (apiClient)
   ├─ utils/                순수 함수 (formatters, searchMatch, headline)
   └─ styles/               전역 CSS 토큰
```

## 기능 폴더 안 규칙

```
features/<기능>/
├─ components/   화면 컴포넌트 (파일 하나 = 컴포넌트 하나)
├─ hooks/        상태·데이터 훅
├─ model/        화면과 무관한 순수 로직 (계산, 변환, 파싱)
├─ mocks/        더미 데이터
├─ context/      해당 기능의 Context/Provider
├─ api.js        백엔드 호출
└─ index.js      이 기능의 공개 목록
```

## import 규칙

- 다른 기능·공용을 쓸 때는 `@` 별칭과 **index.js**로만 가져온다.
  - `import { useAuth } from '@/features/auth'`
  - `import { Panel, GSIcon } from '@/shared/ui'`
- 같은 기능 폴더 안에서는 상대 경로(`./`, `../`)를 쓴다.
- `model/`의 순수 함수에는 화면(JSX)을 넣지 않는다. 화면은 `components/`가 맡는다.
- 공용(`shared`)은 기능(`features`)을 가져다 쓰지 않는다. (공용 → 기능 방향 금지)
