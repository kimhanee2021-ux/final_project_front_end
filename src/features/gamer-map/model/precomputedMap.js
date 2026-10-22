import { mapLoaders } from './mapLoaders.js'

const cachedLayouts = new Map()

// 좌표는 사전 계산 결과 그대로 복원하며 연도별로 한 번만 준비한다.
export function loadPrecomputedMap(year) {
  if (!Object.hasOwn(mapLoaders, year)) throw new RangeError(`등록되지 않은 연도입니다: ${year}`)
  if (!cachedLayouts.has(year)) {
    cachedLayouts.set(year, mapLoaders[year]().then(({ default: stored }) => {
      const colors = new Map(stored.countries.map(country => [country.iso2, country.color]))
      const { neutralBlocks, playerBlocks, ...layout } = stored
      return {
        ...layout,
        neutralCells: neutralBlocks.map(([id,x,y,region]) => ({id,x,y,region})),
        dataCells: playerBlocks.map(([id,x,y,fill,iso2]) => ({id,x,y,fill,iso2,color:colors.get(iso2)})),
      }
    }))
  }
  return cachedLayouts.get(year)
}
