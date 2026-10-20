import { mkdirSync, writeFileSync } from 'node:fs'
import { buildCartogram } from '../js/cartogram.js'
import { getAvailableYears, getSnapshot, summarizeSnapshot } from '../js/playerData.js'
import { GRID, NEUTRAL_COLOR } from '../js/mapConfig.js'

// 원본 계산기·고정 좌표·보정값을 그대로 사용한다. 화면에서 다시 배치하지 않는다.
const years = {}
for (const year of getAvailableYears()) {
  const records = getSnapshot(year, 'PC')
  const layout = buildCartogram(records)
  years[year] = {
    year,
    summary: summarizeSnapshot(records),
    countries: layout.countries.map(({iso2, name, players, unit, quantized, color}) => ({iso2, name, players, unit, quantized, color})),
    labels: layout.labels,
    // 같은 블록 ID를 연도 사이에 유지해야 CSS 이동 모션이 이어진다.
    neutralBlocks: layout.neutralCells.map(({id,x,y,region}) => [id,x,y,region]),
    playerBlocks: layout.dataCells.map(({id,x,y,fill,iso2}) => [id,x,y,fill,iso2]),
    dataCellCount: layout.dataCells.length,
    neutralCellCount: layout.neutralCells.length,
  }
}
const destination = new URL('../js/data/precomputed/', import.meta.url)
mkdirSync(destination, { recursive: true })
for (const [year, layout] of Object.entries(years)) {
  writeFileSync(new URL(`${year}.js`, destination), 'export default '+JSON.stringify(layout)+'\n')
}
const entries = Object.keys(years).map(year => `  ${year}: () => import('./data/precomputed/${year}.js'),`).join('\n')
writeFileSync(new URL('../js/mapLoaders.js', import.meta.url), `// 생성 파일: node src/tab/scripts/generate-map-layouts.mjs\nexport const mapLoaders = {\n${entries}\n}\n`)
writeFileSync(new URL('config.json', destination), JSON.stringify({grid: GRID, neutralColor: NEUTRAL_COLOR, years:Object.keys(years).map(Number)})+'\n')
console.log(`Generated ${Object.keys(years).length} exact map layouts.`)
