# BBS 게임 소식 화면

메뉴: **게임 탐색 → 스팀 전체 게임 바로 아래 BBS**. 데스크톱 헤더와 모바일 메뉴가 같은 메뉴 정의를 사용한다.

## 경로와 데이터

- 목록: `/bbs`
- 상세: `/bbs/:appId/:newsId`
- 목록 URL에 `appId`, `category`, `page`, `size`를 보존한다. 상세 → 목록, 뒤로 가기, 새로고침에도 조건이 유지된다.
- 로그인 없이 읽을 수 있다. 신규 글 작성·수정·삭제 UI가 없으며 기존 게시판을 사용하거나 변경하지 않는다.
- 모든 목록·요약·본문은 저장된 API 데이터다. 화면을 열 때 Steam 수집이나 AI 생성을 실행하지 않는다.
- Dota 2(570), Counter-Strike 2(730), Team Fortress 2(440)는 빠른 선택 링크다. 다른 게임도 기존 DB 게임 검색 API로 선택할 수 있다.
- 게임 이름 또는 번호 검색, 6개 분류, 페이지 번호·이전/다음·처음/끝, 페이지당 5/10/20/50개를 지원한다. 처음에는 최신순 5개다.
- 목록에는 원문 제목과 한국어 요약, 상세에는 요약·한국어 본문·공식 원문 링크·게시/생성 시간을 표시한다. 날짜는 한국 시간이다.
- `stale=true`이면 이전 성공본 표시와 갱신 대기/실패 안내를 제공한다.
- 본문은 React 텍스트로 렌더링하며 원문 HTML을 삽입하지 않는다. 원문 링크는 HTTP(S)만 허용하고 새 탭으로 연다.
- 로딩, 요청 실패와 재시도, 빈 목록, 공개 불가능한 상세(404), 잘못된 상세 주소를 처리한다. 조건 변경/이탈 시 이전 요청을 취소한다.

사용 API:

| 기능 | GET 경로 |
|---|---|
| 전체 소식 | `/api/games/news` |
| 게임별 소식 | `/api/games/{appId}/news` |
| 상세 | `/api/games/{appId}/news/{newsId}` |
| 게임 이름 검색 | `/api/games/search?name=...&page=0&size=8` |
| 게임 번호/선택 이름 확인 | `/api/games/{appId}` |

기존 `apiClient`와 Vite `/api` 프록시를 사용한다. 개발 주소는 `http://localhost:9191/bbs`, 기본 백엔드는 8080이다.
`AI_API_TARGET` / `VITE_BACKEND_URL` / `VITE_API_BASE_URL` 등 기존 프로젝트 연결 설정을 그대로 따른다.

## 파일 구조

- `src/app/layout/headerMenus.js`: 공통 BBS 메뉴
- `src/app/router.jsx`: 공개 목록/상세 경로
- `src/pages/game-news/`: 공통 PageBox와 기능 컴포넌트를 조립하는 페이지
- `src/features/game-news/components/`: 목록·상세·게임 선택·페이징·상태 안내
- `src/features/game-news/hooks/useNewsResource.js`: 요청·취소·오류·재시도
- `src/features/game-news/model/newsQuery.js`: URL 조건, 날짜, 원문 URL, 갱신 상태 표시
- `src/features/game-news/api.js`: 기존 클라이언트로 GET 호출
- `src/features/game-news/styles/gameNews.css`: 기존 테마 색상 변수를 사용하는 BBS 전용 스타일
- `tests/gameNews.test.js`: URL·페이징 경계, 링크 안전성, 한국 시간, 갱신 상태 테스트

## 검증 (2026-10-24)

- `npm run build` 통과. 기존 앱의 큰 번들 경고는 있으나 빌드 오류는 없음.
- `npm run lint` 통과.
- `node --test tests/gameNews.test.js`: 7개 통과.
- 실행 중인 9191 프론트엔드와 8080 백엔드를 연결해 확인.
- Dota 2·Counter-Strike 2·Team Fortress 2 각각 목록 5건을 표시하고, 총 15건의 상세 화면을 직접 열어 한국어 본문 표시 확인.
- 메뉴 위치와 클릭, 전체/게임/분류 복합 필터, 페이지 전환, 10개씩 보기, 상세 복귀·새로고침의 페이지 보존 확인.
- 기존 DB의 다른 게임 검색·선택과 빈 브리핑 안내, 잘못된 게임/소식 조합의 404 안내 확인.
- 데스크톱 메뉴 및 좁은 모바일 화면의 메뉴·목록·상세를 확인하고 가로 넘침 없음 확인.

조회 테스트는 기존 브리핑을 수정하지 않는다. 본문 표현상의 오탈자도 저장된 AI 결과를 그대로 보여준다.
