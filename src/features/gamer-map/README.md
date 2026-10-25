# GameSense PC 모자이크 지도

2026-10-20 첨부된 `tab.zip`의 지도 소스를 기존 GameSense 앱에 통합했다.

## 실행과 구조

프로젝트 루트에서 `npm run dev`를 실행한 뒤 랜딩 페이지(`/`)의 두 번째 장면에서 본다. 지도만 보려면 `/landing-map`을 연다.
앱 라우트는 `pages/landing/LandingMapPage.jsx`이고, 랜딩(`public/landing/index.html`)이 이 화면을 iframe으로 띄운다.

- `index.js`: 앱에서 사용하는 공개 export.
- `components/GamerMapEmbed.jsx`: 랜딩용 지도. 툴바·줌·설명 없이 2010→2025를 자동 재생한다.
- `components/CanvasMosaic.jsx`: 블록을 canvas 한 장에 그리고, 연도가 바뀔 때 이전 자리에서 새 자리로 옮긴다. 블록(약 6,600개)을 SVG 요소로 만들면 랜딩의 3D 영상과 함께 돌 때 화면이 끊겨서 canvas로 바꿨다.
- `model/playerData.js`, `model/data/playerSeries*`: PC 19개국의 제공 시계열. 화면은 여기서 재생할 연도 목록만 읽는다.
- `model/precomputedMap.js`, `model/mapLoaders.js`, `model/data/precomputed/2010.js`~`2025.js`: 연도별로 미리 계산해 둔 지도 결과. 선택한 연도만 지연 로딩하고, 불러온 결과를 재생·재방문에 재사용한다.

## 데이터와 표시 기준

19개국, 16개 연도의 304개 PC 값을 보존했다. 캐나다는 표시와 합계에 포함하지 않는다.
자료는 백만 명 단위이며 원출처를 따로 검증하지 않은 제공값이다.
지도 면적은 국가별로 다른 고정 단위를 사용하므로 국가 간 이용자 수 순위를 의미하지 않는다.
중국·인도는 1블록=75만 명, 다른 국가는 25만 명이다. 블록은 모두 6×6이며 간격은 2다.
주변 회청색 지형은 통계가 아니다.

## 지도 데이터를 다시 만들 때

미리 계산한 결과를 만드는 생성기(`scripts/generate-map-layouts.mjs`, `model/mosaic*`, `model/data/worldBlocks*`)는 화면에서 쓰지 않아 저장소에서 뺐다.
수치나 지도 모양을 바꿔야 하면 `backup/before-cleanup` 브랜치에서 생성기를 꺼내 다시 만든다.
