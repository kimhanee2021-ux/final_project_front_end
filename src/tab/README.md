# GameSense PC 모자이크 지도

2026-10-20 첨부된 `tab.zip`의 지도 소스를 기존 GameSense 앱에 통합했다.

## 실행과 구조

프로젝트 루트에서 `npm run dev`를 실행한 뒤 `/gamer-map`을 연다.
독립 `index.html`이나 별도의 9192 포트는 사용하지 않는다.
앱 라우트는 `pages/gamerMap`, 국가·연도 query와 주간랭킹 연결은 `features/gamerMap`에서 관리한다.

- `index.js`: 앱에서 사용하는 공개 export와 지도 CSS.
- `jsx/GamerMap.jsx`: 지도와 연도 재생 조합. 국가·연도는 상위 컴포넌트와 공유한다.
- `jsx/PixelWorldMap.jsx`: SVG 블록·국가 이름표·확대·이동.
- `jsx/TimeExplorer.jsx`: 2010~2025년 선택과 재생 버튼.
- `js/playerData.js`, `js/data/playerSeries*`: PC 19개국의 제공 시계열.
- `js/mosaic*`, `js/data/worldBlocks*`: 원본 지도 기하 계산·윤곽·연도별 보정.
- `js/cartogram.test.js`: 원본의 지도·데이터 검증.

## 데이터와 표시 기준

19개국, 16개 연도의 304개 PC 값을 보존했다. 캐나다는 표시와 합계에 포함하지 않는다.
자료는 백만 명 단위이며 원출처를 따로 검증하지 않은 제공값이다.
지도 면적은 국가별로 다른 고정 단위를 사용하므로 국가 간 이용자 수 순위를 의미하지 않는다.
중국·인도는 1블록=75만 명, 다른 국가는 25만 명이다. 블록은 모두 6×6이며 간격은 2다.
주변 회청색 지형은 통계가 아니다. 제공 게임 목록과 Steam 주간 매출 순위는 별도의 데이터다.

## 확인

```sh
node src/tab/js/cartogram.test.js
npm run build
```

기존 Windows 폴더에 `src/tab/index.html`이 남아 있다면 코드 적용 후
`node scripts/finalize-gamer-map.mjs`를 실행한다. 앱 루트 `index.html`은 유지한다.

## 사전 계산 및 렌더링 최적화

지도 모양과 수치는 원본 계산기의 결과를 그대로 사용한다. 브라우저에서는 `js/precomputedMap.js`로 저장된 결과를 조회하고, 원본 ID를 가진 SVG 블록으로 표시한다. 원본 좌표·색상·부분 블록의 너비·테두리·이름표 위치는 바꾸지 않는다. 원본과 동일한 블록 이동(550ms ease), 새 블록 등장(350ms ease-out), 이름표 이동(550ms ease)을 유지한다. 지도 컴포넌트 메모이제이션으로 국가 선택·호버·확대 시 블록의 불필요한 재렌더링을 줄인다. 국가 선택, 키보드 접근, 확대/축소, 가로 이동과 연도 자동 재생은 유지한다.

`js/data/precomputed/2010.js`~`2025.js`은 16개 연도의 생성 결과다. 선택한 연도만 지연 로딩하고, 불러온 결과를 재생·재방문에 재사용한다. 로딩 중에는 이전 완성 지도를 유지하고, 이름표·수치·연도를 함께 전환한다. 수치나 지도 원본을 의도적으로 변경할 때만 프로젝트 루트에서 아래 명령으로 다시 생성한다.

```sh
node src/tab/scripts/generate-map-layouts.mjs
node --test src/tab/js/cartogram.test.js src/tab/js/precomputedMap.test.js
```

`original-fingerprints.json`은 최적화 전 각 연도의 원본 결과에 대한 고정 해시다. 생성 스크립트는 이 기준 파일을 덮어쓰지 않는다. 검증은 16개 연도의 원본 해시, 모든 블록 ID·좌표·부분 채움 비율, 국가 색상, 부분 블록 테두리, 이름표, 합계와 표시 수치를 비교한다. 원본 변경을 의도하지 않았다면 기준 해시를 수정해 실패를 숨기지 않는다.
