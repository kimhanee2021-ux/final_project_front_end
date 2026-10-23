import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { buildCartogram } from './cartogram.js'
import { getAvailableYears, getSnapshot, summarizeSnapshot } from './playerData.js'
import { GRID, NEUTRAL_COLOR } from './mapConfig.js'
import { loadPrecomputedMap } from './precomputedMap.js'
import fingerprints from './data/precomputed/original-fingerprints.json' with { type: 'json' }
import config from './data/precomputed/config.json' with { type: 'json' }

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
test('원본의 연도·프레임·블록 크기·간격·지형 색상을 고정한다', () => {
  assert.deepEqual(GRID, {width:1680, height:1060, step:8, gap:2})
  assert.equal(NEUTRAL_COLOR, '#53647a')
  assert.deepEqual(config.grid, GRID)
  assert.deepEqual(fingerprints.grid, GRID)
  assert.equal(config.neutralColor, NEUTRAL_COLOR)
  assert.deepEqual(config.years, getAvailableYears())
  assert.deepEqual(Object.keys(fingerprints.years).map(Number), getAvailableYears())
  assert.deepEqual(getAvailableYears(), Array.from({length:16}, (_, index) => 2010 + index))
})

for (const year of getAvailableYears()) {
  const records = getSnapshot(year, 'PC')
  const original = buildCartogram(records)
  const compiled = await loadPrecomputedMap(year)
  const baseline = fingerprints.years[year]
  test(`${year}: 최적화 이전 좌표·색상·부분 블록·이름표·수치 해시를 보존한다`, () => {
    assert.equal(hash({grid: GRID, neutralColor: NEUTRAL_COLOR, labels: original.labels,
      cells: [...original.neutralCells, ...original.dataCells].map(({id,x,y,fill,color,iso2,region}) => ({id,x,y,fill,color,iso2,region}))}), baseline.geometryHash)
    assert.equal(hash({records, summary:summarizeSnapshot(records),
      countries:original.countries.map(({iso2,name,players,unit,quantized,color}) => ({iso2,name,players,unit,quantized,color}))}), baseline.metadataHash)
    assert.deepEqual(compiled.labels, original.labels)
    assert.deepEqual(compiled.summary, summarizeSnapshot(records))
    assert.deepEqual(compiled.countries, original.countries.map(({iso2,name,players,unit,quantized,color}) => ({iso2,name,players,unit,quantized,color})))
    assert.equal(compiled.year, year)
    assert.equal(compiled.dataCellCount, baseline.dataCells)
    assert.equal(compiled.neutralCellCount, baseline.neutralCells)
  })
  test(`${year}: 모든 블록의 모션 ID·좌표·부분 채움·색상이 원본과 정확히 일치한다`, () => {
    assert.deepEqual(compiled.neutralCells, original.neutralCells.map(({id,x,y,region}) => ({id,x,y,region})))
    assert.deepEqual(compiled.dataCells, original.dataCells.map(({id,x,y,fill,iso2,color}) => ({id,x,y,fill,iso2,color})))
    assert.equal(new Set(compiled.neutralCells.map(cell => cell.id)).size, compiled.neutralCells.length)
    assert.equal(new Set(compiled.dataCells.map(cell => cell.id)).size, compiled.dataCells.length)
  })
}

test('유효하지 않은 연도는 원본과 같이 거부하고 반복 조회는 계산 없이 같은 결과를 반환한다', () => {
  for (const year of [2009,2026,null,undefined,'__proto__']) assert.throws(() => loadPrecomputedMap(year), RangeError)
  assert.equal(loadPrecomputedMap(2025), loadPrecomputedMap(2025))
})
