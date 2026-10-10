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
- /pc-check : 좌측 PC 성능 체크 메뉴, 종합 점수, CPU/GPU/RAM/SSD 예시 상태, 해상도별 게임 FPS, 추천 업그레이드
- /mypage : 우측 상단 Player 클릭 → 프로필, 내 게임 현황, 내 게임 환경, 최근 게임 기록
- 마이페이지의 보유 게임/플레이 중/완료/위시리스트 카드는 실제 데모 목록에서 집계하며 해당 라이브러리 필터로 이동합니다.
- 프로필 이름·소개·위치, 취향 태그(최대 5개)·플레이 방식·월 목표/예산, 준비된 아바타/커버를 편집할 수 있습니다. 닉네임과 아바타는 공통 헤더에도 반영됩니다.
- 게임별 상태·진행률·메모를 기록할 수 있습니다. 완료 시 진행률은 100%, 플레이 예정은 0%입니다. 모든 기록 보기에서는 유형별로 최근 50개 기록을 조회합니다.
- 프로필/게임 기록은 `gamesense-player-v1` localStorage에 저장됩니다. 실제 계정·게임 실행·플레이 시간 측정·AI 추천 연동은 없습니다. Lv.12/XP/가입일은 화면용 예시이며 게임 수와 PC 사양은 기존 페이지 데이터와 공유합니다.
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
- PC 성능 체크: 진단/다시 진단 클릭 시 약 3초간 CPU → GPU → RAM → 저장장치 → 결과 순서로 데모 진행, 중복 실행 방지와 취소, 완료 시각 표시. 페이지 이탈 시 타이머 해제.
- 게임 FPS: FHD/QHD/4K 평가 기준 변경, 전체 보기/접기, 게임별 상세 창. 평가는 60 FPS 이상 원활, 30–59 FPS 보통, 30 FPS 미만 설정 조절. Nintendo Switch 게임은 PC 평가에서 제외.
- 추천 업그레이드와 시스템 더 보기는 키보드·Escape·배경 클릭으로 조작할 수 있는 상세 대화상자를 엽니다.
- 성능 데이터는 `src/mocks/performanceMock.js`에서 수정합니다. 점수·FPS·온도·사용률·드라이버 상태 모두 독립적인 화면 시연용 더미 데이터이며 하드웨어 조회, 벤치마크 실행, 개인정보 수집은 하지 않습니다.
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
- `src/pages/performance/PerformancePage.jsx`, `src/styles/performance.css`: 반응형 PC 성능 체크 페이지. 기존 공통 사이드바·헤더·라이트/다크 테마 재사용.
- `src/pages/mypage/`, `src/styles/mypage.css`: 프로필 편집·게임 기록·타임라인을 포함한 반응형 마이페이지.
- `src/mocks/playerMock.js`, `src/hooks/usePlayerData.js`: 프로필·취향·게임 상태·기록 예시와 브라우저 저장. 커버는 기존 로컬 이미지 재사용, 프로필 아바타는 내장 imagegen 생성 (`public/images/player-adventurer.png`, 프롬프트 기록은 같은 이름의 `.prompt.txt`).
- PC 배너: 내장 imagegen으로 생성한 `public/images/pc-performance-hero.png` (프롬프트: `public/images/pc-performance-hero.prompt.txt`)
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

## 로그인 화면과 데모 세션
- `/login`, `/signup`, `/forgot-password`: 독립된 반응형 인증 화면. 기존 GameSense 색상, 로고, 로컬 `fantasy-world.png`를 재사용합니다.
- 비로그인 헤더에는 로그인·회원가입, 데모 체험 중에는 프로필·로그아웃을 표시합니다.
- 내 게임, 위시리스트, 컬렉션, 활동 기록, 마이페이지, 지출 분석, 구매 내역, 설정은 데모 진입 후 확인할 수 있습니다. 진입 전 주소와 필터는 `next`에 보존하며 외부 주소·인증 화면으로의 반복 이동은 차단합니다.
- 비로그인 상태에서 게임을 찜하면 로그인 화면으로 이동합니다. 데모 체험 후 원래 게임 목록으로 돌아오며 찜 동작은 자동 실행하지 않습니다.
- 실제 백엔드·OAuth 연결은 없습니다. 로그인·회원가입·재설정 양식은 입력을 검증하고 준비 중 안내를 표시합니다. Steam/Google 버튼은 계정을 연결하지 않습니다. 실제 계정 생성이나 이메일 발송은 일어나지 않습니다.
- **데모 체험하기**만 데모 상태를 시작합니다. 이메일·비밀번호는 저장하거나 전송하지 않습니다. 기본은 탭 세션 유지, 로그인 상태 유지 선택 시 브라우저에 데모 표시만 저장합니다. 로그아웃은 데모 표시만 제거하며 기존 게임 기록은 보존합니다.
- 주요 파일: `src/pages/auth/AuthPage.jsx`, `src/styles/auth.css`, `src/contexts/AuthProvider.jsx`, `src/features/auth/authSession.js`. 실제 인증 도입 시 AuthProvider를 서버 세션으로 교체하고 서버에서 리소스 접근 권한을 검증해야 합니다.
- 인증 흐름 단위 확인: `node --test tests/authSession.test.js`.
