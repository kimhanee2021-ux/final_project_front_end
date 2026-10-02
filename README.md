# GameSense

React + JavaScript + Vite 기반 반응형 게임 탐색·소비 분석 대시보드. `gamesense02.png` 디자인을 참고한 다크/민트 UI입니다.

## 실행
```sh
npm install
npm run dev
```

## 검증
```sh
npm run build
npm run lint
node --test tests/spendingMetrics.test.js
```

## 화면과 기능
- / : 히어로 배너, 장르별 게임 카드, 플레이 시간/선호 장르 차트, 추천 게임, 최근 활동
- /explore, /genres, /trending : 전체 게임 검색, 장르 필터, 추천/평점/이름 정렬, 그리드/리스트 전환
- /library : 보유 게임 목록
- /wishlist : 하트로 저장한 찜 목록 (localStorage 저장)
- /collections : 장르별 컬렉션과 필터 목록 연결
- /recommendations : 준비된 더미 추천 데이터 (실제 AI 호출 없음)
- /upcoming : 가상의 출시 예정 목록과 세션 내 데모 알림 선택
- /activity : 최근 플레이 기록 상세
- /settings : 테마, 메뉴 언어, 구매 내역 진입
- /analysis : 소비 분석과 계산 기준
- /purchases : 기존 전체 구매 내역 검색, 필터, 정렬, 구매 상세
- 라이트·다크·시스템 테마, 선택 저장 및 시스템 설정 변경 반영
- 모바일 메뉴, 반응형 구매 카드, 키보드 조작 가능한 상세 대화상자

## 데이터
실제 계정과 연결되지 않은 데모입니다. src/mocks/dashboardMock.js의 기준일은 2026-09-30이며 '이번 달'은 이 기준일의 월입니다.
금액은 원, 시간은 시간 단위입니다. amount: null은 금액 미확인, hours: null은 시간 미확인입니다.
새 탐색 화면의 데이터는 `src/mocks/discoverMock.js`에서 관리합니다. 게임 평점, 리뷰 수, 보유 여부, 플레이 시간은 샘플이며 실제 서비스 수치가 아닙니다. 플레이 차트는 2026년 1~6월 예시, 기존 소비 분석은 2026-09-30 기준으로 서로 독립적인 데모 데이터입니다.
소비 분석 화면의 게임 이미지는 기존 이니셜 타일을 유지합니다. 탐색 화면은 `public/images/`에 저장한 게임 표지를 사용하여 실행 중 외부 이미지 요청을 하지 않습니다.

## 반응형·접근성
- 데스크톱: 고정 사이드바, 2열 대시보드, 2~4열 게임 목록
- 태블릿: 세로 대시보드, 모바일 메뉴, 2열 게임 목록
- 모바일: 1열 카드, 세로 차트, 가로 스크롤 장르 필터
- 기본 다크 테마, 라이트/시스템 선택 가능. 기존 저장된 테마 선택을 존중합니다.
- `/` 키로 검색창 이동, Escape로 모달/메뉴 닫기, 네이티브 dialog의 포커스 제한·복귀
- 메뉴 언어(EN/KO)는 사이드바와 주요 목록 제목에 적용됩니다. 설명과 인사이트는 한국어입니다.
- 테마·메뉴 언어·위시리스트를 브라우저에 저장하며, 저장소가 막혀 있어도 메모리에서 동작합니다.

## 구성과 이미지
- `src/layouts/GameSenseLayout.jsx`: 공통 메뉴, 검색, 프로필/알림, 모바일 메뉴
- `src/pages/discover/`: 탐색, 위시리스트, 컬렉션, 설정 등 화면
- `src/components/discover/`: 게임 카드, 상세 창, 차트, 추천/최근 활동
- `src/styles/gamesense.css`: 기존 소비 분석 스타일과 분리된 새 UI
- 배너: 내장 imagegen으로 생성한 `public/images/fantasy-world.png`
- 게임 표지: Steam 공식 CDN의 해당 게임 library/header 이미지, Zelda는 [Nintendo 공식 상품 페이지](https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/)의 대표 이미지. 표지 권리는 각 권리자에게 있습니다.
- 프로필/로고: 로컬 SVG. 새로운 런타임 의존성은 추가하지 않았습니다.

배너 생성 프롬프트 (built-in imagegen, CLI 사용 없음):
> Create a single cinematic fantasy landscape background image for a premium dark gaming dashboard hero banner. Wide landscape 3:1 composition. A lone cloaked warrior seen from behind stands slightly right of center on rocky ledge; immense intricate gothic castle far in the right center distance, misty mountain valley, waterfall, ruins and pine forests, soft golden late afternoon sun through blue gray clouds, ultra detailed atmospheric painterly AAA game environment art, muted cool navy charcoal palette with small warm gold accents. Leftmost 38% is darker shadowed rocks and forest with ample clear negative space for white heading placed later by code. Full bleed landscape only. No text, logos, lettering, border, watermark, or user interface.

src/api/dashboardApi.js를 실제 API로 교체할 수 있습니다. 서버 계약 확정 전 불필요한 인증 설정이나 요청은 포함하지 않았습니다.
누적 지표는 조회 기간에 영향받지 않습니다. 기간별 차트와 목록은 구매일로 필터링합니다.
순지출 = 결제 금액 - 환불 금액(최소 0). 평균은 순지출이 양수인 게임 기준입니다.
시간당 비용은 금액과 시간을 모두 확인할 수 있는 유료 게임의 순지출 합계 / 누적 시간 합계입니다.
미플레이 게임 금액은 포함하며, 총 시간이 0이면 계산 전으로 표시합니다. 무료 및 금액 미확인 게임은 유료 평균에서 제외합니다.
번들 배분과 환불 시점별 현금흐름은 실제 데이터 계약 확정 후 확장할 항목입니다.
소비 인사이트는 규칙 기반이며 AI 서비스와 연결되어 있지 않습니다.
