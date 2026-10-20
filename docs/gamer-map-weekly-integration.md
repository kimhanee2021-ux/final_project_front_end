# 지도·주간랭킹 통합

- 지도 소스는 `src/tab`에 유지하며 앱의 `/gamer-map`에서 표시한다.
- `src/tab/index.html`은 사용하지 않는다. 루트 `index.html`은 앱 진입점으로 유지한다.
- 게임 탐색 메뉴와 사이드바에서 지도·주간랭킹으로 이동할 수 있다.
- `/weekly-rankings`는 국가·주차 선택을 URL에 보존하고 지도와 상호 이동한다.
- 주간랭킹은 DB/API 연결 없는 빈 상태다. 첨부본의 snapshots 및 historicalSnapshots 데이터는 포함하지 않는다.
- `src/features/rankings/dataSource.js`는 항상 `null`/빈 배열을 반환한다. 국가·주차를 바꿔도 저장된 순위로 대체하지 않는다.
- 실제 데이터 연결 전 화면에는 준비 안내와 선택한 국가·주차의 Steam 원본 링크를 표시한다.

검증: `npm run build`, `npm run lint`, `node --test tests/*.test.js src/tab/js/cartogram.test.js`.
