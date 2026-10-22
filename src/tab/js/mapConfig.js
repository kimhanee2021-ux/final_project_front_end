// 프레임과 6×6 블록(간격 포함 8)은 연도·국가·플랫폼과 무관하게 고정합니다.
// 이용자 수에 따라 블록 개수와 배치가 변하며 카메라를 자동 확대하지 않습니다.
export const GRID = { width: 1680, height: 1060, step: 8, gap: 2 }
export const PEOPLE_PER_CELL = 250_000
export const LARGE_COUNTRY_UNIT = 750_000
export const NEUTRAL_COLOR = '#53647a'
// 모든 연도·플랫폼에서 고정합니다. 사각형 크기는 모든 국가가 같습니다.
export const COUNTRY_UNITS = {
  CN: LARGE_COUNTRY_UNIT, IN: LARGE_COUNTRY_UNIT,
}
export const PASTEL_COLORS = ['#A8D8EA', '#B8E6CF', '#F5D5A0', '#D5C4F1', '#F2BFCB']
export const PLATFORMS = [
  { id: 'PC', label: 'PC 게임', shortLabel: 'PC' },
]
// 캐나다는 원본 자료를 보존하고 강조·합계·국가 선택에서만 제외합니다.
export const EXCLUDED_COUNTRIES = ['CA']
// [작은 좌표 쪽 국가, 큰 좌표 쪽 국가, 축]. 충돌 회피 중에도 주요 상대 방향을 유지합니다.
export const COUNTRY_DIRECTIONS = [
  ['US', 'FR', 0], ['CL', 'BR', 0], ['BR', 'CL', 1],
  ['NO', 'FR', 1], ['KR', 'JP', 0], ['CN', 'IN', 1],
  ['EG', 'IL', 0], ['IL', 'EG', 1], ['IL', 'AE', 0],
  ['AE', 'IN', 0], ['EG', 'ZA', 1],
]
export function getCellRule(iso2) {
  return {
    unit: COUNTRY_UNITS[iso2] ?? PEOPLE_PER_CELL,
    scale: 1,
  }
}

// anchor는 국가 셀의 중심, label은 항상 보이는 이름표입니다.
// 작은 이스라엘도 데이터와 이름표를 별도로 보존합니다. 씨앗(seed)은 실제 지도 좌표입니다.
const definitions = {
  US: { anchor: [265, 340], label: [260, 345], color: 0 },
  BR: { anchor: [440, 630], label: [445, 630], color: 1 },
  CL: { anchor: [350, 745], label: [300, 740], color: 4 },
  NO: { anchor: [850, 135], label: [850, 100], color: 2 },
  GB: { anchor: [645, 215], label: [606, 190], color: 3 },
  FR: { anchor: [740, 300], label: [730, 285], seed: [715, 345], color: 0 },
  ES: { anchor: [700, 380], label: [665, 405], seed: [715, 355], color: 4 },
  DE: { anchor: [835, 245], label: [845, 231], color: 1 },
  IT: { anchor: [855, 350], label: [886, 407], color: 2 },
  IL: { anchor: [985, 425], label: [985, 395], color: 4 },
  AE: { anchor: [1095, 485], label: [1095, 460], color: 3 },
  EG: { anchor: [900, 515], label: [900, 510], color: 2 },
  ZA: { anchor: [875, 795], label: [873, 851], color: 3 },
  CN: { anchor: [1300, 320], label: [1315, 320], color: 2 },
  IN: { anchor: [1205, 490], label: [1215, 510], color: 4 },
  KR: { anchor: [1450, 345], label: [1446, 308], color: 1 },
  JP: { anchor: [1585, 370], label: [1600, 438], color: 3 },
  ID: { anchor: [1435, 610], label: [1440, 638], color: 0 },
  AU: { anchor: [1470, 805], label: [1470, 816], color: 1 },
}
export const COUNTRY_GEOMETRY = Object.fromEntries(
  Object.entries(definitions).map(([iso2, value]) => [
    iso2,
    { ...value, color: PASTEL_COLORS[value.color] },
  ]),
)
