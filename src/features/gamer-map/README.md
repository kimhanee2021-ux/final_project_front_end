# GameSense PC 모자이크 지도

2026-10-20 첨부된 `tab.zip`의 지도 소스를 기존 GameSense 앱에 통합했다.

## 실행과 구조

프로젝트 루트에서 `npm run dev`를 실행한 뒤 랜딩 페이지(`/`)의 두 번째 장면에서 본다. 지도만 보려면 `/landing-map`을 연다.
독립 `index.html`이나 별도의 9192 포트는 사용하지 않는다.
앱 라우트는 `pages/landing/LandingMapPage.jsx`이고, 랜딩(`public/landing/index.html`)이 이 화면을 iframe으로 띄운다.

- `index.js`: 앱에서 사용하는 공개 export와 지도 CSS.
- `components/GamerMapEmbed.jsx`: 랜딩용 지도. 툴바·줌·설명 없이 2010→2025를 자동 재생한다.
- `components/CanvasMosaic.jsx`: 블록을 canvas 한 장에 그리고, 연도가 바뀔 때 이전 자리에서 새 자리로 옮긴다. 블록(약 6,600개)을 SVG 요소로 만들면 랜딩의 3D 영상과 함께 돌 때 화면이 끊겨서 canvas로 바꿨다.
- `model/playerData.js`, `model/data/playerSeries*`: PC 19개국의 제공 시계열.
- `model/mosaic*`, `model/data/worldBlocks*`: 원본 지도 기하 계산·윤곽·연도별 보정.
- `model/cartogram.test.js`: 원본의 지도·데이터 검증.

## 데이터와 표시 기준

19개국, 16개 연도의 304개 PC 값을 보존했다. 캐나다는 표시와 합계에 포함하지 않는다.
자료는 백만 명 단위이며 원출처를 따로 검증하지 않은 제공값이다.
지도 면적은 국가별로 다른 고정 단위를 사용하므로 국가 간 이용자 수 순위를 의미하지 않는다.
중국·인도는 1블록=75만 명, 다른 국가는 25만 명이다. 블록은 모두 6×6이며 간격은 2다.
주변 회청색 지형은 통계가 아니다.

## 확인

```sh
node src/features/gamer-map/model/cartogram.test.js
npm run build
```


## 사전 계산 및 렌더링 최적화

지도 모양과 수치는 원본 계산기의 결과를 그대로 사용한다. 브라우저에서는 `model/precomputedMap.js`로 저장된 결과를 조회하고, 원본 ID를 가진 SVG 블록으로 표시한다. 원본 좌표·색상·부분 블록의 너비·테두리·이름표 위치는 바꾸지 않는다. 원본과 동일한 블록 이동(550ms ease), 새 블록 등장(350ms ease-out), 이름표 이동(550ms ease)을 유지한다. 지도 컴포넌트 메모이제이션으로 국가 선택·호버·확대 시 블록의 불필요한 재렌더링을 줄인다. 국가 선택, 키보드 접근, 확대/축소, 가로 이동과 연도 자동 재생은 유지한다.

`model/data/precomputed/2010.js`~`2025.js`은 16개 연도의 생성 결과다. 선택한 연도만 지연 로딩하고, 불러온 결과를 재생·재방문에 재사용한다. 로딩 중에는 이전 완성 지도를 유지하고, 이름표·수치·연도를 함께 전환한다. 수치나 지도 원본을 의도적으로 변경할 때만 프로젝트 루트에서 아래 명령으로 다시 생성한다.

```sh
node src/features/gamer-map/scripts/generate-map-layouts.mjs
node --test src/features/gamer-map/model/cartogram.test.js src/features/gamer-map/model/precomputedMap.test.js
```

`original-fingerprints.json`은 최적화 전 각 연도의 원본 결과에 대한 고정 해시다. 생성 스크립트는 이 기준 파일을 덮어쓰지 않는다. 검증은 16개 연도의 원본 해시, 모든 블록 ID·좌표·부분 채움 비율, 국가 색상, 부분 블록 테두리, 이름표, 합계와 표시 수치를 비교한다. 원본 변경을 의도하지 않았다면 기준 해시를 수정해 실패를 숨기지 않는다.
