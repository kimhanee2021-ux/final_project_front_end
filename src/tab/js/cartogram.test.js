import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCartogram, WORLD_REGIONS } from './cartogram.js'
import { getCellRule, GRID, NEUTRAL_COLOR, COUNTRY_UNITS } from './mapConfig.js'
import source, { PLAYER_REGIONS } from './data/playerSeries.js'
import legacySource from './data/countryPlayers.source.json' with { type: 'json' }
import { getAvailableYears, getSnapshot, createPlayerSeries, millionToPeople, splitIntoCells, summarizeSnapshot } from './playerData.js'
import { applySnapshotOverrides } from './mosaicSnapshotOverrides.js'
import { buildMosaic, polygonArea } from './mosaicGeometry.js'

function componentCount(cells) {
  const pending = new Set(cells.map((cell) => `${cell.col}:${cell.row}`))
  let count = 0
  while (pending.size) {
    count++
    const queue = [pending.values().next().value]
    pending.delete(queue[0])
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i].split(':').map(Number)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${x + dx}:${y + dy}`
        if (pending.delete(key)) queue.push(key)
      }
    }
  }
  return count
}
const templates = new Map(WORLD_REGIONS.flatMap((region) => region.countries.map((country) => [country.iso2, country])))
const footprint = (layout) => {
  const cells = [...layout.dataCells, ...layout.neutralCells]
  return (Math.max(...cells.map((c) => c.x)) - Math.min(...cells.map((c) => c.x)) + GRID.step)
    * (Math.max(...cells.map((c) => c.y)) - Math.min(...cells.map((c) => c.y)) + GRID.step)
}

test('5개 영역에 19개국을 한 번씩 배정하고 지형과 통계 소속을 일치시킨다', () => {
  assert.deepEqual(PLAYER_REGIONS.map((region) => [region.region_id, region.countries.length]), [
    ['americas', 3], ['north-asia', 3], ['south-asia', 5], ['europe', 6], ['africa', 2],
  ])
  assert.equal(templates.size, 19)
  for (const region of WORLD_REGIONS) {
    const data = PLAYER_REGIONS.find((item) => item.region_id === region.region_id)
    assert.deepEqual(region.countries.map((c) => c.iso2).sort(), data.countries.map((c) => c.country_iso2).sort())
    assert.ok(region.context.length)
  }
  assert.equal(source.countries.find((country) => country.country_iso2 === 'AU').region, 'south-asia')
})

test('중국·인도는 75만 명, 나머지 17개국은 25만 명으로 고정하고 픽셀 크기를 유지한다', () => {
  assert.deepEqual(COUNTRY_UNITS, { CN: 750_000, IN: 750_000 })
  for (const country of source.countries) {
    assert.equal(getCellRule(country.country_iso2).scale, 1)
    assert.equal(getCellRule(country.country_iso2).unit,
      ['CN', 'IN'].includes(country.country_iso2) ? 750_000 : 250_000)
  }
  assert.equal(GRID.step - GRID.gap, 6)
})

test('원본 캐나다 자료는 보존하고 304개 값·Top 5·16개 연간 합계를 유지한다', () => {
  assert.ok(legacySource.countries.some((row) => row.iso2 === 'CA'))
  for (const year of getAvailableYears()) for (const platform of ['PC']) {
    const records = getSnapshot(year, platform)
    assert.equal(records.length, 19)
    assert.ok(!records.some((row) => row.iso2 === 'CA'))
    for (const record of records) {
      const original = source.countries.find((row) => row.country_iso2 === record.iso2)[platform]
      assert.equal(record.players, Math.round(original.yearly_mau_m[year] * 1_000_000))
      assert.deepEqual(record.topGames, original.top_5_games)
    }
    assert.equal(summarizeSnapshot(records).players, Math.round(source.annual_totals_19_countries_m[platform][year] * 1_000_000))
  }
})

test('환산·부분 블록·0·결측을 처리하며 없는 수치를 만들지 않는다', () => {
  assert.equal(millionToPeople(4.3), 4_300_000)
  assert.equal(millionToPeople(null), null)
  assert.equal(splitIntoCells(1_250_000).equivalent, 5)
  assert.equal(splitIntoCells(90_000, 40_000).remainder, 0.25)
  assert.throws(() => millionToPeople(-1), RangeError)
  assert.throws(() => getSnapshot(2009, 'PC'), RangeError)
  const future = structuredClone(source)
  future.metadata.years.push(2026)
  assert.ok(createPlayerSeries(future)[2026].records.every((row) => row.players === null))
  const missing = getSnapshot(2025, 'PC').map((record) => ({ ...record, players: record.region === 'africa' ? null : record.players }))
  const layout = buildCartogram(missing)
  assert.equal(layout.regions.find((region) => region.id === 'africa').ratio, null)
  assert.ok(!layout.neutralCells.some((cell) => cell.region === 'africa'))
  assert.ok(layout.countries.filter((country) => country.region === 'africa').every((country) => country.cells.length === 0))
  const zero = buildCartogram(getSnapshot(2025, 'PC').map((record) => ({ ...record, players: 0 })))
  assert.equal(zero.dataCells.length + zero.neutralCells.length, 0)
})

for (const year of getAvailableYears()) for (const platform of ['PC']) {
  test(`${year} ${platform}: 모자이크 인원 보존·동일 크기·비중첩·섬 연결·주변 지형 증감`, () => {
    const records = getSnapshot(year, platform), layout = buildCartogram(records)
    assert.equal(layout.countries.length, 19)
    assert.equal(layout.labels.length, 19)
    const occupied = new Set()
    for (const cell of [...layout.dataCells, ...layout.neutralCells]) {
      assert.equal(cell.size, GRID.step)
      assert.equal(cell.x % GRID.step, 0)
      assert.equal(cell.y % GRID.step, 0)
      assert.ok(cell.x >= 0 && cell.y >= 0 && cell.x + cell.size <= GRID.width && cell.y + cell.size <= GRID.height)
      const key = `${cell.col}:${cell.row}`
      assert.ok(!occupied.has(key), `겹침 ${key}`)
      occupied.add(key)
    }
    for (const country of layout.countries) {
      const quantized = splitIntoCells(country.players, getCellRule(country.iso2).unit)
      assert.equal(country.cells.length, quantized.count)
      assert.ok(Math.abs(country.cells.reduce((sum, cell) => sum + cell.fill * country.unit, 0) - country.players) < 0.01)
      assert.equal(componentCount(country.cells), templates.get(country.iso2).parts.length)
      // 작은 연도의 값을 최소 개수로 부풀리거나 최대 개수로 잘라내지 않습니다.
      assert.ok(country.cells.length >= 1)
    }
    assert.ok(layout.neutralCells.every((cell) => cell.color === NEUTRAL_COLOR && cell.kind === 'context' && cell.iso2 === null))
    for (const region of WORLD_REGIONS) {
      const current = records.filter((row) => row.region === region.region_id).reduce((sum, row) => sum + row.players, 0)
      const reference = getSnapshot(2025, platform).filter((row) => row.region === region.region_id).reduce((sum, row) => sum + row.players, 0)
      const overrides = region.snapshot_overrides?.[`${platform}:${year}`]?.context ?? {}
      const count = region.context.reduce((sum, shape) => sum + (overrides[shape.id]?.blocks ?? Math.round(shape.reference_blocks * current / reference)), 0)
      assert.equal(layout.neutralCells.filter((cell) => cell.region === region.region_id).length, count)
    }
    for (const label of layout.labels) assert.ok(label.x >= 0 && label.y >= 0 && label.x <= GRID.width && label.y <= GRID.height)
    const positions = Object.fromEntries(layout.countries.map((country) => [country.iso2, country.position]))
    assert.ok(positions.US[0] < positions.FR[0])
    assert.ok(positions.CL[0] < positions.BR[0])
    assert.ok(positions.KR[0] < positions.JP[0])
    assert.ok(positions.IN[1] > positions.CN[1])
    assert.ok(positions.NO[1] < positions.FR[1])
    assert.ok(positions.IL[0] > positions.EG[0] && positions.IL[1] < positions.EG[1], '이스라엘은 이집트 북동쪽')
    assert.ok(positions.AE[0] > positions.IL[0] && positions.AE[0] < positions.IN[0], 'UAE는 이스라엘 동쪽·인도 서쪽')
    assert.ok(positions.ZA[1] > positions.EG[1], '남아공은 아프리카 남쪽')
    assert.ok(positions.CL[1] > positions.BR[1], '칠레는 브라질 남서쪽')
  })
}

test('긴 국가의 최대 외곽 크기와 통일 단위의 블록 범위를 제어한다', () => {
  const ranges = Object.fromEntries(['IL', 'NO', 'AE', 'ZA', 'CL'].map((id) => [id, []]))
  for (const year of getAvailableYears()) for (const platform of ['PC']) {
    const layout = buildCartogram(getSnapshot(year, platform))
    for (const country of layout.countries) {
      if (!ranges[country.iso2]) continue
      ranges[country.iso2].push(country.count)
      const width = Math.max(...country.cells.map((cell) => cell.x)) - Math.min(...country.cells.map((cell) => cell.x)) + GRID.step
      const height = Math.max(...country.cells.map((cell) => cell.y)) - Math.min(...country.cells.map((cell) => cell.y)) + GRID.step
      if (country.iso2 === 'IL') assert.ok(height <= 96, '이스라엘이 중동 전체 높이를 차지하지 않는다')
      if (country.iso2 === 'AE') assert.ok(width <= 96, 'UAE가 인도 크기로 늘어나지 않는다')
      if (country.iso2 === 'CL') assert.ok(height <= 208, '칠레가 남미 전체 높이를 넘지 않는다')
    }
  }
  assert.deepEqual(Object.fromEntries(Object.entries(ranges).map(([id, values]) => [id, [Math.min(...values), Math.max(...values)]])),
    { IL: [6, 10], NO: [6, 8], AE: [5, 12], ZA: [8, 32], CL: [12, 24] })
})

test('대륙의 주요 국가와 회색 지형을 빈 격자 없이 이어 붙인다', () => {
  const adjacent = [
    ['US', 'context:americas:north-0'], ['BR', 'context:americas:andes-0'],
    ['CN', 'context:north-asia:west-0'], ['DE', 'context:europe:east-0'],
    ['FR', 'DE'], ['ES', 'FR'], ['EG', 'context:africa:north-0'],
    ['ZA', 'context:africa:central-0'], ['context:africa:north-0', 'context:africa:central-0'],
  ]
  for (const year of getAvailableYears()) for (const platform of ['PC']) {
    const layout = buildCartogram(getSnapshot(year, platform))
    const nodes = new Map([...layout.countries, ...layout.context].map((node) => [node.id, node]))
    for (const [a, b] of adjacent) {
      const touching = nodes.get(a).cells.some((left) => nodes.get(b).cells.some((right) =>
        Math.max(Math.abs(left.col - right.col), Math.abs(left.row - right.row)) === 1,
      ))
      assert.ok(touching, `${year} ${platform}: ${a} / ${b} 사이에 빈 격자가 없다`)
    }
  }
})

test('2020·2022년 아프리카의 이동을 제한하고 내부 블록이 뒤섞이지 않는다', () => {
  for (const platform of ['PC']) for (const year of [2020, 2022]) {
    const previous = buildCartogram(getSnapshot(year - 1, platform))
    const current = buildCartogram(getSnapshot(year, platform))
    const oldNodes = new Map([...previous.countries, ...previous.context].map((node) => [node.id, node]))
    for (const node of [...current.countries, ...current.context].filter((n) => n.region === 'africa')) {
      const old = oldNodes.get(node.id)
      const movement = node.position.map((value, axis) => value - old.position[axis])
      assert.ok(Math.hypot(...movement) <= GRID.step * (year === 2020 ? 5 : 4), `${year} ${platform}: ${node.id} 이동`)
      if (platform === 'PC' && year === 2022) assert.ok(Math.hypot(...movement) <= GRID.step, '2022년 PC의 작은 감소는 한 격자 이내 이동으로 표시한다')
      const oldCells = new Map(old.cells.map((cell) => [cell.id, cell]))
      let retained = 0
      for (const cell of node.cells) if (oldCells.has(cell.id)) {
        const prior = oldCells.get(cell.id)
        assert.deepEqual([cell.x - prior.x, cell.y - prior.y], movement, '기존 블록은 조각 전체와 같은 거리만 이동한다')
        retained++
      }
      assert.ok(retained >= Math.min(old.cells.length, node.cells.length) * 0.6, '변화가 작은 연도 사이에 기존 셀을 유지한다')
    }
  }
})

test('2010 PC 아메리카 보정은 그린란드를 줄이고 알래스카·멕시코·남미를 연결한다', () => {
  const region = WORLD_REGIONS.find((r) => r.region_id === 'americas')
  assert.deepEqual(Object.keys(region.snapshot_overrides).filter((key) => key.startsWith('PC:') && key <= 'PC:2017').sort(), ['PC:2010', 'PC:2011', 'PC:2012', 'PC:2013', 'PC:2014', 'PC:2015', 'PC:2016', 'PC:2017'])
  const layout = buildCartogram(getSnapshot(2010, 'PC'))
  const nodes = new Map([...layout.countries, ...layout.context].map((n) => [n.id.replace('context:americas:', ''), n]))
  const touches = (a, b) => nodes.get(a).cells.some((c) => nodes.get(b).cells.some((d) =>
    Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) === 1))
  assert.equal(nodes.get('greenland-0').count, 26)
  assert.ok(nodes.get('greenland-0').position[0] < 496 && nodes.get('greenland-0').position[1] > 200)
  assert.equal(nodes.get('north-1').count, 32)
  assert.ok(nodes.get('north-1').position[0] < nodes.get('north-0').position[0])
  assert.equal(nodes.get('andes-0').count, 36)
  assert.equal(nodes.get('south-0').count, 8)
  assert.deepEqual(nodes.get('US').position, [376, 408])
  assert.deepEqual(nodes.get('BR').position, [480, 616])
  assert.deepEqual(nodes.get('CL').position, [440, 664])
  assert.equal(nodes.get('CL').count, 12)
  assert.equal(nodes.get('CL').players, 2_800_000)
  assert.ok(nodes.get('central-0').position[1] > nodes.get('US').position[1])
  for (const [a, b] of [
    ['north-0', 'north-1'], ['US', 'central-0'], ['central-0', 'central-1'],
    ['central-1', 'andes-0'], ['andes-0', 'BR'], ['BR', 'south-0'],
    ['BR', 'south-1'], ['south-0', 'south-1'], ['CL', 'south-1'],
  ]) assert.ok(touches(a, b), `${a}와 ${b}를 빈 격자 없이 연결한다`)
})

test('2010 PC 러시아·중앙아시아는 중국에 연결되고 아프리카는 이집트를 감싸 남아공까지 이어진다', () => {
  const layout = buildCartogram(getSnapshot(2010, 'PC'))
  const nodes = new Map([...layout.countries, ...layout.context].map((node) => [node.id, node]))
  const north = (id) => `context:north-asia:${id}`
  const africa = (id) => `context:africa:${id}`
  for (const region of WORLD_REGIONS.filter((r) => ['north-asia', 'africa'].includes(r.region_id)))
    assert.deepEqual(Object.keys(region.snapshot_overrides).filter((key) => key.startsWith('PC:') && key <= 'PC:2017').sort(), ['PC:2010', 'PC:2011', 'PC:2012', 'PC:2013', 'PC:2014', 'PC:2015', 'PC:2016', 'PC:2017'])
  const touches = (a, b) => nodes.get(a).cells.some((c) => nodes.get(b).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  for (const [a, b] of [
    [north('east-0'), north('east-1')], [north('east-0'), north('west-0')],
    [north('east-0'), 'CN'], [north('west-0'), 'CN'],
    [africa('north-0'), africa('central-0')], [africa('north-1'), africa('central-0')],
    [africa('central-0'), 'ZA'],
  ]) assert.ok(touches(a, b), `${a}와 ${b}는 변을 맞대고 연결된다`)
  assert.equal(layout.neutralCells.filter((c) => c.region === 'north-asia').length, 625)
  assert.equal(layout.neutralCells.filter((c) => c.region === 'africa').length, 479)
  for (const node of layout.context.filter((n) => ['north-asia', 'africa'].includes(n.region)))
    assert.equal(componentCount(node.cells), 1, `${node.id}의 내부가 끊어지지 않는다`)
  const gray = new Set(layout.neutralCells.filter((c) => c.region === 'africa').map((c) => `${c.col}:${c.row}`))
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]])
    assert.ok(nodes.get('EG').cells.some((c) => gray.has(`${c.col + dx}:${c.row + dy}`)), '이집트 사방에 주변 지형이 닿는다')
  assert.deepEqual(nodes.get('CN').position, [1008, 408])
  assert.deepEqual(nodes.get('EG').position, [712, 512])
  assert.deepEqual(nodes.get('ZA').position, [704, 736])
  assert.equal(nodes.get('ZA').count, 8)
  assert.equal(nodes.get('ZA').players, 1_800_000)
})

test('2010 PC 중동은 이스라엘·UAE와 중앙아시아·인도를 연결하고 홍해 간격을 남긴다', () => {
  const region = WORLD_REGIONS.find((r) => r.region_id === 'south-asia')
  assert.deepEqual(Object.keys(region.snapshot_overrides).filter((key) => key.startsWith('PC:') && key <= 'PC:2017').sort(), ['PC:2010', 'PC:2011', 'PC:2012', 'PC:2013', 'PC:2014', 'PC:2015', 'PC:2016', 'PC:2017'])
  const layout = buildCartogram(getSnapshot(2010, 'PC'))
  const nodes = new Map([...layout.countries, ...layout.context].map((node) => [node.id, node]))
  const middle = nodes.get('context:south-asia:west-0')
  assert.equal(middle.count, 216)
  assert.equal(componentCount(middle.cells), 1)
  for (const id of ['IL', 'AE', 'IN', 'context:north-asia:west-0'])
    assert.ok(middle.cells.some((c) => nodes.get(id).cells.some((d) =>
      Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `중동과 ${id}가 변을 맞대고 연결된다`)
  const africa = layout.neutralCells.filter((c) => c.region === 'africa' && c.row >= 62)
  assert.ok(middle.cells.every((c) => africa.every((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) > 1)), '아라비아반도와 아프리카 사이에 바다 간격을 남긴다')
  assert.deepEqual(nodes.get('IL').position, [760, 432])
  assert.deepEqual(nodes.get('AE').position, [784, 456])
  assert.equal(nodes.get('IL').count, 6)
  assert.equal(nodes.get('AE').count, 5)
})

test('2010 PC 동유럽은 독일·러시아를 연결하고 아나톨리아 북쪽의 흑해를 비운다', () => {
  const region = WORLD_REGIONS.find((r) => r.region_id === 'europe')
  assert.deepEqual(Object.keys(region.snapshot_overrides).filter((key) => key.startsWith('PC:') && key <= 'PC:2017').sort(), ['PC:2010', 'PC:2011', 'PC:2012', 'PC:2013', 'PC:2014', 'PC:2015', 'PC:2016', 'PC:2017'])
  const layout = buildCartogram(getSnapshot(2010, 'PC'))
  const nodes = new Map([...layout.countries, ...layout.context].map((node) => [node.id, node]))
  const east = nodes.get('context:europe:east-0')
  assert.equal(east.count, 269)
  assert.equal(componentCount(east.cells), 1)
  for (const id of ['DE', 'context:europe:north-0', 'context:north-asia:east-0', 'context:north-asia:west-0', 'context:south-asia:west-0'])
    assert.ok(east.cells.some((c) => nodes.get(id).cells.some((d) =>
      Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `동유럽과 ${id}가 변을 맞대고 연결된다`)
  const occupied = new Set([...layout.dataCells, ...layout.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (let row = 44; row <= 46; row++) for (let col = 96; col <= 102; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '흑해 중심 수역은 다른 지형으로도 채워지지 않는다')
  const land = new Set(east.cells.map((c) => `${c.col}:${c.row}`))
  for (let row = 48; row <= 49; row++) for (let col = 94; col <= 103; col++)
    assert.ok(land.has(`${col}:${row}`), '흑해 남쪽에 아나톨리아가 동서로 연속해 놓인다')
  assert.deepEqual(nodes.get('DE').position, [632, 360])
  assert.equal(nodes.get('DE').count, 82)
})

for (const year of [2011, 2012]) {
  test(`${year} PC는 ${year - 1}년의 대륙 연결과 흑해·홍해를 보존하며 조금씩 확장한다`, () => {
    const previous = buildCartogram(getSnapshot(year - 1, 'PC'))
    const current = buildCartogram(getSnapshot(year, 'PC'))
    const oldNodes = new Map([...previous.countries, ...previous.context].map((n) => [n.id, n]))
    const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
    const a = (id) => `context:americas:${id}`, n = (id) => `context:north-asia:${id}`
    const e = (id) => `context:europe:${id}`, f = (id) => `context:africa:${id}`
    const middle = 'context:south-asia:west-0'
    const touches = (left, right) => nodes.get(left).cells.some((c) => nodes.get(right).cells.some((d) =>
      Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
    for (const [left, right] of [
      ['US', a('north-0')], [a('north-0'), a('north-1')], ['US', a('central-0')],
      [a('central-0'), a('central-1')], [a('central-1'), a('andes-0')], [a('andes-0'), 'BR'],
      ['BR', a('south-0')], ['BR', a('south-1')], ['CL', a('south-1')], [a('south-0'), a('south-1')],
      ['CN', n('east-0')], ['CN', n('west-0')], [n('east-0'), n('east-1')], [n('east-0'), n('west-0')],
      ['DE', e('east-0')], [e('east-0'), n('east-0')], [e('east-0'), n('west-0')], [e('east-0'), e('north-0')],
      [middle, e('east-0')], [middle, n('west-0')], [middle, 'IL'], [middle, 'AE'], [middle, 'IN'],
      ['EG', f('north-0')], [f('north-0'), f('central-0')], [f('central-0'), f('north-1')], [f('central-0'), 'ZA'],
    ]) assert.ok(touches(left, right), `${left} / ${right} 연결이 끊기지 않는다`)
    for (const node of nodes.values()) {
      assert.ok(node.position.every((v, axis) => Math.abs(v - oldNodes.get(node.id).position[axis]) <= GRID.step * 2), `${node.id}: 각 축에서 두 격자 이내 이동`)
      if (node.kind === 'context') assert.equal(componentCount(node.cells), 1)
    }
    const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
    for (let row = 44; row <= 46; row++) for (let col = 96; col <= 101; col++)
      assert.ok(!occupied.has(`${col}:${row}`), '흑해 중심 수역을 비워 둔다')
    for (const [col, row] of [[94, 65], [94, 66], [95, 69], [95, 70]])
      assert.ok(!occupied.has(`${col}:${row}`), '홍해와 아라비아반도 서쪽의 바다를 남긴다')
    const african = new Set(current.neutralCells.filter((c) => c.region === 'africa').map((c) => `${c.col}:${c.row}`))
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]])
      assert.ok(nodes.get('EG').cells.some((c) => african.has(`${c.col + dx}:${c.row + dy}`)), '이집트 주변은 회색 지형으로 감싼다')
    assert.ok(footprint(current) > footprint(previous))
    assert.equal(summarizeSnapshot(getSnapshot(year, 'PC')).players, { 2011: 442_500_000, 2012: 471_000_000 }[year])
  })

  test(`${year} PC 회색 지형은 ${year - 1} 보정 개수에서 해당 영역 이용자 증감률을 반영한다`, () => {
    const previous = buildCartogram(getSnapshot(year - 1, 'PC')), current = buildCartogram(getSnapshot(year, 'PC'))
    for (const region of WORLD_REGIONS) {
      assert.equal(region.snapshot_overrides[ `PC:${year}` ].reference_snapshot, `PC:${year - 1}`)
      const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
      for (const node of previous.context.filter((c) => c.region === region.region_id))
        assert.equal(current.context.find((c) => c.id === node.id).count, Math.round(node.count * ratio))
    }
  })
}

test('2013 PC는 아프리카를 내리고 기니만·스칸디나비아 바다를 열면서 대륙 접합을 유지한다', () => {
  const previous = buildCartogram(getSnapshot(2012, 'PC')), current = buildCartogram(getSnapshot(2013, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const a = (id) => `context:americas:${id}`, n = (id) => `context:north-asia:${id}`
  const e = (id) => `context:europe:${id}`, f = (id) => `context:africa:${id}`
  const middle = 'context:south-asia:west-0'
  const touches = (left, right) => nodes.get(left).cells.some((c) => nodes.get(right).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  for (const [left, right] of [
    ['US', a('north-0')], [a('north-0'), a('north-1')], ['US', a('central-0')],
    [a('central-0'), a('central-1')], [a('central-1'), a('andes-0')], [a('andes-0'), 'BR'],
    ['BR', a('south-0')], ['BR', a('south-1')], ['CL', a('south-1')], [a('south-0'), a('south-1')],
    ['CN', n('east-0')], ['CN', n('west-0')], [n('east-0'), n('east-1')], [n('east-0'), n('west-0')],
    ['DE', e('east-0')], [e('east-0'), n('east-0')], [e('east-0'), n('west-0')],
    ['NO', e('north-0')], [e('north-0'), e('east-0')],
    [middle, e('east-0')], [middle, n('west-0')], [middle, 'IL'], [middle, 'AE'], [middle, 'IN'],
    ['EG', f('north-0')], [f('north-0'), f('central-0')], [f('central-0'), f('north-1')], [f('central-0'), 'ZA'],
  ]) assert.ok(touches(left, right), `${left} / ${right}의 연결을 유지한다`)
  for (const node of current.context) assert.equal(componentCount(node.cells), 1, node.id)
  for (const id of ['EG', 'ZA'])
    assert.ok(nodes.get(id).position[1] - previous.countries.find((c) => c.id === id).position[1] >= GRID.step * 4)
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (let row = 80; row <= 88; row++) for (let col = 68; col <= 77; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '기니만 서쪽 굴곡을 회색 블록으로 메우지 않는다')
  for (let row = 31; row <= 38; row++) for (let col = 96; col <= 102; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '스칸디나비아 동쪽 바다를 러시아 블록으로 메우지 않는다')
  for (let row = 44; row <= 46; row++) for (let col = 96; col <= 101; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '흑해 중심 수역을 보존한다')
  for (const [col, row] of [[94, 65], [94, 66], [95, 69], [95, 70]])
    assert.ok(!occupied.has(`${col}:${row}`), '홍해를 남긴다')
  const african = new Set(current.neutralCells.filter((c) => c.region === 'africa').map((c) => `${c.col}:${c.row}`))
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]])
    assert.ok(nodes.get('EG').cells.some((c) => african.has(`${c.col + dx}:${c.row + dy}`)), '이집트 주변 지형을 유지한다')
  for (const [col, row] of [[70, 74], [76, 74], [81, 82], [88, 82]])
    assert.ok(african.has(`${col}:${row}`), '북아프리카 가로 윤곽과 중앙아프리카 세로 윤곽을 남긴다')
  assert.equal(summarizeSnapshot(getSnapshot(2013, 'PC')).players, 502_000_000)
})

test('2013 PC의 중앙아시아·북유럽만 회색 블록 수를 줄이고 나머지는 영역 증감률을 따른다', () => {
  const previous = buildCartogram(getSnapshot(2012, 'PC')), current = buildCartogram(getSnapshot(2013, 'PC'))
  const reduced = { 'context:north-asia:west-0': 128, 'context:europe:north-0': 88 }
  for (const region of WORLD_REGIONS) {
    assert.equal(region.snapshot_overrides['PC:2013'].reference_snapshot, 'PC:2012')
    const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
    for (const node of previous.context.filter((c) => c.region === region.region_id)) {
      const count = current.context.find((c) => c.id === node.id).count
      assert.equal(count, reduced[node.id] ?? Math.round(node.count * ratio))
      if (reduced[node.id]) assert.ok(count < node.count)
    }
  }
})

test('2014 PC는 아프리카 회색 블록을 10개 줄이고 중앙아시아·아라비아 윤곽을 보정한다', () => {
  const previous = buildCartogram(getSnapshot(2013, 'PC')), current = buildCartogram(getSnapshot(2014, 'PC'))
  const reduced = {
    'context:north-asia:west-0': 112, 'context:south-asia:west-0': 260,
    'context:africa:north-0': 270, 'context:africa:north-1': 32,
    'context:africa:central-0': 390, 'context:africa:central-1': 29,
  }
  const africaCount = (layout) => layout.neutralCells.filter((c) => c.region === 'africa').length
  assert.equal(africaCount(current), africaCount(previous) - 10)
  assert.equal(africaCount(current), 721)
  for (const region of WORLD_REGIONS) {
    assert.equal(region.snapshot_overrides['PC:2014'].reference_snapshot, 'PC:2013')
    const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
    for (const node of previous.context.filter((c) => c.region === region.region_id))
      assert.equal(current.context.find((c) => c.id === node.id).count, reduced[node.id] ?? Math.round(node.count * ratio))
  }
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const touches = (a, b) => nodes.get(a).cells.some((c) => nodes.get(b).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  const north = (id) => `context:north-asia:${id}`, europe = (id) => `context:europe:${id}`
  const africa = (id) => `context:africa:${id}`, middle = 'context:south-asia:west-0'
  for (const [a, b] of [
    ['CN', north('east-0')], ['CN', north('west-0')], [north('east-0'), north('east-1')],
    [north('east-0'), north('west-0')], ['DE', europe('east-0')],
    ['NO', europe('north-0')], [europe('north-0'), europe('east-0')],
    [europe('east-0'), north('east-0')], [europe('east-0'), north('west-0')],
    [middle, 'IL'], [middle, 'AE'], [middle, 'IN'], [middle, north('west-0')], [middle, europe('east-0')],
    ['EG', africa('north-0')], [africa('north-0'), africa('central-0')],
    [africa('central-0'), africa('north-1')], [africa('central-0'), 'ZA'],
  ]) assert.ok(touches(a, b), `${a} / ${b} 연결을 유지한다`)
  for (const node of current.context) assert.equal(componentCount(node.cells), 1, node.id)
  for (const id of ['EG', 'ZA'])
    assert.deepEqual(nodes.get(id).position, previous.countries.find((c) => c.id === id).position, '아프리카 기준 국가의 위치를 보존한다')
  assert.equal(current.dataCells.length, 1449)
  assert.equal(summarizeSnapshot(getSnapshot(2014, 'PC')).players, 528_500_000)
})

test('2014 PC는 아라비아반도의 동쪽·남쪽 바다와 기니만·발트해 공간을 남긴다', () => {
  const current = buildCartogram(getSnapshot(2014, 'PC'))
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (const [col, row] of [[103, 53], [104, 54], [105, 55], [106, 56], [107, 57], [108, 58], [110, 59], [112, 60]])
    assert.ok(!occupied.has(`${col}:${row}`), '페르시아만의 대각선 수역을 남긴다')
  for (let row = 62; row <= 66; row++) for (let col = 110; col <= 118; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '아라비아반도와 인도 사이의 아라비아해를 남긴다')
  const arabia = new Set(current.neutralCells.filter((c) => c.id.startsWith('context:south-asia:west-0:')).map((c) => `${c.col}:${c.row}`))
  for (const [col, row] of [[98, 55], [99, 58], [100, 62], [104, 65]])
    assert.ok(arabia.has(`${col}:${row}`), '반도의 북서쪽에서 남동쪽까지 육지가 이어진다')
  for (let row = 80; row <= 88; row++) for (let col = 68; col <= 77; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '2013년 기니만 굴곡을 유지한다')
  for (let row = 30; row <= 37; row++) for (let col = 96; col <= 102; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '스칸디나비아 동쪽 바다를 유지한다')
  for (let row = 44; row <= 46; row++) for (let col = 96; col <= 101; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '흑해 중심 수역을 유지한다')
  for (let row = 26; row <= 35; row++) for (let col = 141; col <= 144; col++)
    assert.ok(occupied.has(`${col}:${row}`), '러시아 조각 사이의 가느다란 수직 틈을 닫는다')
})

test('2015 PC는 시나이로 아프리카·중동을 연결하고 중국·한국·시베리아를 이어 붙인다', () => {
  const current = buildCartogram(getSnapshot(2015, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const a = (id) => `context:americas:${id}`, n = (id) => `context:north-asia:${id}`
  const e = (id) => `context:europe:${id}`, f = (id) => `context:africa:${id}`
  const middle = 'context:south-asia:west-0'
  const touches = (left, right) => nodes.get(left).cells.some((c) => nodes.get(right).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  for (const [left, right] of [
    ['US', a('north-0')], [a('north-0'), a('north-1')], ['US', a('central-0')],
    [a('central-0'), a('central-1')], [a('central-1'), a('andes-0')], [a('andes-0'), 'BR'],
    ['BR', a('south-0')], ['BR', a('south-1')], ['CL', a('south-1')],
    ['CN', 'KR'], ['CN', n('east-0')], ['CN', n('east-1')], ['KR', n('east-1')],
    ['CN', n('west-0')], [n('east-0'), n('east-1')], [n('east-0'), n('west-0')],
    ['DE', e('east-0')], ['NO', e('north-0')], [e('north-0'), e('east-0')],
    [e('east-0'), n('east-0')], [e('east-0'), n('west-0')],
    [middle, e('east-0')], [middle, n('west-0')], [middle, 'IL'], [middle, 'AE'], [middle, 'IN'],
    ['EG', f('north-0')], [f('north-0'), middle], [f('north-0'), f('central-0')],
    [f('central-0'), f('north-1')], [f('central-0'), 'ZA'],
  ]) assert.ok(touches(left, right), `${left} / ${right}가 빈 격자 없이 변을 맞댄다`)
  for (const node of current.context) assert.equal(componentCount(node.cells), 1, node.id)
  const join = nodes.get(f('north-0')).cells.filter((c) => nodes.get(middle).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  assert.ok(join.every((c) => c.row <= 62), '홍해 남쪽을 메우지 않고 이집트 북동쪽으로 연결한다')
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (const [col, row] of [[94, 65], [94, 66], [95, 69], [95, 70], [103, 53], [105, 55], [108, 58], [112, 60]])
    assert.ok(!occupied.has(`${col}:${row}`), '홍해와 페르시아만 수역을 남긴다')
  for (let row = 62; row <= 66; row++) for (let col = 110; col <= 118; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '아라비아해 공간을 유지한다')
  for (let row = 30; row <= 40; row++) for (let col = 137; col <= 146; col++)
    assert.ok(occupied.has(`${col}:${row}`), '중국 북쪽과 시베리아 접합부에 가느다란 틈이 없다')
  assert.equal(summarizeSnapshot(getSnapshot(2015, 'PC')).players, 551_000_000)
})

test('2015 PC 회색 블록은 증감률과 대륙별 윤곽 보정을 반영한다', () => {
  const previous = buildCartogram(getSnapshot(2014, 'PC')), current = buildCartogram(getSnapshot(2015, 'PC'))
  const revisedCounts = {
    'context:americas:north-0': 276, 'context:americas:andes-0': 142, 'context:americas:south-1': 93,
    'context:south-asia:west-0': 302, 'context:europe:east-0': 449, 'context:europe:north-0': 82,
  }
  for (const region of WORLD_REGIONS) {
    assert.equal(region.snapshot_overrides['PC:2015'].reference_snapshot, 'PC:2014')
    const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
    for (const node of previous.context.filter((c) => c.region === region.region_id)) {
      const connectingBlocks = node.id === 'context:north-asia:east-0' ? 42 : 0
      assert.equal(current.context.find((c) => c.id === node.id).count, revisedCounts[node.id] ?? Math.round(node.count * ratio) + connectingBlocks)
    }
  }
})

test('2015 PC는 캐나다·남미 내부를 채우고 칠레·UAE를 내리면서 홍해를 연다', () => {
  const current = buildCartogram(getSnapshot(2015, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (const [x0, x1, y0, y1] of [[23, 42, 37, 43], [43, 50, 76, 83]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(occupied.has(`${col}:${row}`), '캐나다 접합부와 브라질 서쪽은 빈 공간 없이 채운다')
  assert.deepEqual(nodes.get('CL').position, [384, 736])
  assert.deepEqual(nodes.get('AE').position, [848, 512])
  assert.equal(nodes.get('CL').count, 17)
  assert.equal(nodes.get('AE').count, 8)
  const arabia = nodes.get('context:south-asia:west-0').cells
  assert.equal(Math.max(...arabia.map((c) => c.row)), 70, '반도 남단도 UAE와 함께 네 격자 내려간다')
  for (let row = 61; row <= 71; row++) assert.ok(!occupied.has(`95:${row}`), '홍해는 남쪽 바다까지 끊기지 않는 수로로 남긴다')
  assert.equal(current.dataCells.length, 1500)
})

test('2015 PC 남미는 브라질 오른쪽을 감싸고 남쪽으로 좁아지며 유럽의 본토와 해안을 구분한다', () => {
  const current = buildCartogram(getSnapshot(2015, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  const rim = new Set(nodes.get('context:americas:south-1').cells.map((c) => `${c.col}:${c.row}`))
  for (let row = 73; row <= 83; row++) {
    const right = Math.max(...nodes.get('BR').cells.filter((c) => c.row === row).map((c) => c.col))
    assert.ok(rim.has(`${right + 1}:${row}`), '브라질 동쪽 해안에 회색 지형을 이어 붙인다')
  }
  const southAmerica = [...current.countries, ...current.context].filter((n) => n.region === 'americas').flatMap((n) => n.cells)
  let previousWidth = Infinity
  for (let row = 85; row <= 98; row++) {
    const cols = southAmerica.filter((c) => c.row === row).map((c) => c.col)
    const width = Math.max(...cols) - Math.min(...cols) + 1
    assert.ok(width <= previousWidth, '남미 하단은 남쪽으로 갈수록 좁아진다')
    previousWidth = width
  }
  assert.ok(southAmerica.every((c) => c.row <= 98), '칠레 남단 아래로 튀어나온 회색 꼬리를 깎는다')
  const mainland = nodes.get('context:europe:east-0').cells
  for (const id of ['FR', 'DE', 'IT'])
    assert.ok(nodes.get(id).cells.some((c) => mainland.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `${id}가 유럽 본토와 맞닿는다`)
  for (const [x0, x1, y0, y1] of [[79, 82, 38, 44], [72, 82, 46, 48], [95, 101, 40, 43]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(occupied.has(`${col}:${row}`), '중부·동부 유럽 내부에 가느다란 틈을 남기지 않는다')
  for (const [x0, x1, y0, y1] of [[59, 66, 41, 42], [97, 101, 28, 32], [96, 100, 45, 47], [81, 82, 52, 57], [79, 82, 60, 61]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(!occupied.has(`${col}:${row}`), '영국 해협·발트해·흑해·아드리아해·지중해를 비워 둔다')
})

test('2016 PC는 넓은 이집트 북동 해안으로 중동과 맞닿고 중국·한국·시베리아 연결을 유지한다', () => {
  const previous = buildCartogram(getSnapshot(2015, 'PC')), current = buildCartogram(getSnapshot(2016, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const a = (id) => `context:americas:${id}`, n = (id) => `context:north-asia:${id}`
  const e = (id) => `context:europe:${id}`, f = (id) => `context:africa:${id}`
  const middle = 'context:south-asia:west-0'
  const touches = (left, right) => nodes.get(left).cells.some((c) => nodes.get(right).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  for (const [left, right] of [
    ['US', a('north-0')], [a('north-0'), a('north-1')], ['US', a('central-0')],
    [a('central-0'), a('central-1')], [a('central-1'), a('andes-0')], [a('andes-0'), 'BR'],
    ['BR', a('south-0')], ['BR', a('south-1')], ['CL', a('south-1')],
    ['CN', 'KR'], ['CN', n('east-0')], ['CN', n('east-1')], ['KR', n('east-1')],
    ['CN', n('west-0')], [n('east-0'), n('east-1')], [n('east-0'), n('west-0')],
    ['DE', e('east-0')], ['NO', e('north-0')], [e('north-0'), e('east-0')],
    [e('east-0'), n('east-0')], [e('east-0'), n('west-0')],
    [middle, e('east-0')], [middle, n('west-0')], [middle, 'IL'], [middle, 'AE'], [middle, 'IN'],
    ['EG', f('north-0')], [f('north-0'), middle], [f('north-0'), f('central-0')],
    [f('central-0'), f('north-1')], [f('central-0'), 'ZA'],
  ]) assert.ok(touches(left, right), `${left} / ${right} 연결을 유지한다`)
  for (const node of current.context) assert.equal(componentCount(node.cells), 1, node.id)
  const join = nodes.get(f('north-0')).cells.filter((c) => nodes.get(middle).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  assert.ok(new Set(join.map((c) => c.row)).size >= 5, '아프리카와 중동이 최소 다섯 줄에 걸쳐 맞닿는다')
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (let row = 59; row <= 61; row++) for (let col = 89; col <= 96; col++)
    assert.ok(occupied.has(`${col}:${row}`), '가는 대각선 다리 대신 폭이 있는 본토 해안으로 연결한다')
  const oldEgypt = previous.countries.find((c) => c.id === 'EG')
  assert.ok(nodes.get('EG').position[0] > oldEgypt.position[0] && nodes.get('EG').position[1] < oldEgypt.position[1], '이집트를 중동 쪽으로 가깝게 배치한다')
  const madagascar = nodes.get(f('central-1'))
  const mainland = [...current.countries, ...current.context].filter((c) => c.region === 'africa' && c.id !== madagascar.id).flatMap((c) => c.cells)
  assert.ok(madagascar.cells.every((c) => mainland.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), '마다가스카르는 본토와 바다 간격을 둔다')
  for (let row = 63; row <= 68; row++) for (let col = 96; col <= 97; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '넓어진 육지 연결 아래의 홍해는 남긴다')
  for (let row = 59; row <= 60; row++) for (let col = 78; col <= 82; col++)
    assert.ok(!occupied.has(`${col}:${row}`), '아프리카와 남유럽 사이의 지중해는 남긴다')
  const africanTerrain = current.context.filter((n) => n.region === 'africa').flatMap((n) => n.cells)
  for (const id of ['IT', 'ES', 'FR'])
    assert.ok(nodes.get(id).cells.every((c) => africanTerrain.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), `${id}와 아프리카 사이에 바다 한 격자를 남긴다`)
  for (const [col, row] of [[103, 53], [105, 55], [108, 58], [112, 60], [112, 63], [116, 65]])
    assert.ok(!occupied.has(`${col}:${row}`), '페르시아만과 아라비아해를 유지한다')
  assert.equal(current.dataCells.length, 1570)
  assert.equal(summarizeSnapshot(getSnapshot(2016, 'PC')).players, 576_000_000)
})

test('2016 PC는 2015 기준 개수와 캐나다·동아프리카의 개별 보정량을 반영한다', () => {
  const previous = buildCartogram(getSnapshot(2015, 'PC')), current = buildCartogram(getSnapshot(2016, 'PC'))
  // Only South America and Europe are explicitly rebased. Other stored profiles stay fixed.
  const original2015Counts = {
    'context:americas:north-0': 179, 'context:south-asia:west-0': 277,
  }
  const coastAdjustments = { 'context:americas:north-0': 130, 'context:africa:central-0': -8 }
  for (const region of WORLD_REGIONS) {
    assert.equal(region.snapshot_overrides['PC:2016'].reference_snapshot, 'PC:2015')
    const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
    for (const node of previous.context.filter((c) => c.region === region.region_id))
      assert.equal(current.context.find((c) => c.id === node.id).count, Math.round((original2015Counts[node.id] ?? node.count) * ratio) + (coastAdjustments[node.id] ?? 0))
  }
})

test('2016 PC는 2015년의 브라질 동쪽 해안·남미 남단·유럽 본토와 바다 경계를 유지한다', () => {
  const current = buildCartogram(getSnapshot(2016, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  const rim = new Set(nodes.get('context:americas:south-1').cells.map((c) => `${c.col}:${c.row}`))
  for (let row = 73; row <= 83; row++) {
    const right = Math.max(...nodes.get('BR').cells.filter((c) => c.row === row).map((c) => c.col))
    assert.ok(rim.has(`${right + 1}:${row}`), '커진 브라질의 오른쪽을 회색 해안으로 감싼다')
  }
  const south = [...current.countries, ...current.context].filter((n) => n.region === 'americas').flatMap((n) => n.cells)
  let lastWidth = Infinity
  for (let row = 85; row <= 99; row++) {
    const cols = south.filter((c) => c.row === row).map((c) => c.col)
    const width = Math.max(...cols) - Math.min(...cols) + 1
    assert.ok(width <= lastWidth, '아르헨티나 하단은 남쪽으로 좁아진다')
    lastWidth = width
  }
  assert.ok(south.every((c) => c.row <= 99), '칠레 남단 아래로 회색 꼬리가 튀어나오지 않는다')
  assert.deepEqual(nodes.get('CL').position, [376, 744])
  assert.equal(nodes.get('CL').count, 18)
  const mainland = nodes.get('context:europe:east-0').cells
  for (const id of ['FR', 'DE', 'IT'])
    assert.ok(nodes.get(id).cells.some((c) => mainland.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `${id}의 2016년 블록을 유럽 본토에 붙인다`)
  const northernJoin = nodes.get('context:europe:north-0').cells.filter((c) => mainland.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  assert.ok(northernJoin.length > 0 && northernJoin.every((c) => c.col >= 99), '서쪽으로 옮긴 북유럽은 발트해를 가로지르지 않고 핀란드 쪽으로 이어진다')
  for (const [x0, x1, y0, y1] of [[78, 81, 38, 44], [70, 81, 46, 48], [49, 56, 84, 86]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(occupied.has(`${col}:${row}`), '국가가 커진 뒤 유럽·남미 내부에 빈 틈을 남기지 않는다')
  for (const [x0, x1, y0, y1] of [[58, 65, 40, 42], [93, 97, 28, 32], [85, 98, 34, 35], [96, 100, 45, 47], [80, 81, 52, 57]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(!occupied.has(`${col}:${row}`), '영국 해협·발트해·흑해·아드리아해를 남긴다')
  assert.equal(current.dataCells.length, 1570)
})

test('2016 PC는 미국·캐나다를 넓게 붙이고 동아프리카 해안과 북유럽 위치를 다듬는다', () => {
  const current = buildCartogram(getSnapshot(2016, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const canada = new Set(nodes.get('context:americas:north-0').cells.map((c) => `${c.col}:${c.row}`))
  for (let col = 20; col <= 42; col++) {
    const top = Math.min(...nodes.get('US').cells.filter((c) => c.col === col).map((c) => c.row))
    for (let row = 35; row < top; row++) assert.ok(canada.has(`${col}:${row}`), '미국 북쪽과 캐나다 사이를 넓게 채운다')
  }
  assert.equal(nodes.get('context:americas:north-0').count, 315)
  assert.deepEqual(nodes.get('US').position, [288, 408])
  assert.deepEqual(nodes.get('NO').position, [696, 208])
  assert.deepEqual(nodes.get('context:europe:north-0').position, [752, 232])
  assert.equal(nodes.get('NO').count, 6)
  assert.equal(nodes.get('context:europe:north-0').count, 84)
  const eastAfrica = nodes.get('context:africa:central-0')
  assert.equal(eastAfrica.count, 471)
  let previousRight = Infinity
  for (let row = 81; row <= 98; row++) {
    const right = Math.max(...eastAfrica.cells.filter((c) => c.row === row).map((c) => c.col))
    assert.ok(right <= previousRight && (previousRight === Infinity || previousRight - right <= 1), '동아프리카 해안은 큰 돌출 없이 남쪽으로 완만하게 좁아진다')
    previousRight = right
  }
  assert.equal(nodes.get('context:africa:north-1').count, 39)
  assert.equal(current.dataCells.length, 1570)
})

test('2017 PC는 다섯 영역의 2016년 보정 윤곽과 증감률을 반영하고 통계 블록을 유지한다', () => {
  const previous = buildCartogram(getSnapshot(2016, 'PC')), current = buildCartogram(getSnapshot(2017, 'PC'))
  const expected = {
    americas: { 'andes-0': 153, 'south-0': 8, 'south-1': 100, 'north-0': 220 },
    'north-asia': { 'east-0': 611, 'east-1': 189, 'west-0': 128 },
    'south-asia': { 'west-0': 338, 'east-0': 18, 'east-1': 2, 'oceania-0': 1, 'oceania-1': 2 },
    europe: { 'east-0': 476, 'north-0': 87, 'east-1': 2, 'islands-0': 9 },
    africa: { 'north-0': 375, 'north-1': 44, 'central-0': 534, 'central-1': 41 },
  }
  const localContours = new Set(['context:americas:north-0'])
  for (const region of WORLD_REGIONS) {
    const profile = region.snapshot_overrides?.['PC:2017']
    assert.ok(profile, `${region.region_id}의 보정본이 누락되어 자동 배치로 돌아가지 않는다`)
    assert.equal(profile.reference_snapshot, 'PC:2016')
    assert.deepEqual(Object.fromEntries(Object.entries(profile.context).map(([id, part]) => [id, part.blocks])), expected[region.region_id])
    const ratio = current.regions.find((r) => r.id === region.region_id).players / previous.regions.find((r) => r.id === region.region_id).players
    for (const [id, count] of Object.entries(expected[region.region_id])) {
      const fullId = `context:${region.region_id}:${id}`
      if (!localContours.has(fullId)) assert.equal(count, Math.round(previous.context.find((n) => n.id === fullId).count * ratio))
      const node = current.context.find((n) => n.id === fullId)
      assert.equal(node.count, count)
      assert.equal(componentCount(node.cells), 1)
    }
  }
  assert.equal(current.dataCells.length, 1656)
  assert.equal(summarizeSnapshot(getSnapshot(2017, 'PC')).players, 608_000_000)
})

test('2017 PC 남미는 브라질 양쪽을 감싸고 칠레 옆 아르헨티나가 남쪽으로 좁아진다', () => {
  const current = buildCartogram(getSnapshot(2017, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const rim = new Set(nodes.get('context:americas:south-1').cells.map((c) => `${c.col}:${c.row}`))
  const west = new Set(nodes.get('context:americas:andes-0').cells.map((c) => `${c.col}:${c.row}`))
  for (let row = 72; row <= 84; row++) {
    const cols = nodes.get('BR').cells.filter((c) => c.row === row).map((c) => c.col)
    assert.ok(rim.has(`${Math.max(...cols) + 1}:${row}`), '브라질 동쪽의 해안을 잇는다')
    assert.ok(west.has(`${Math.min(...cols) - 1}:${row}`), '브라질 서쪽의 빈 공간을 채운다')
  }
  const south = ['BR', 'CL', 'context:americas:andes-0', 'context:americas:south-0', 'context:americas:south-1'].flatMap((id) => nodes.get(id).cells)
  assert.equal(componentCount(south), 1)
  let lastWidth = Infinity
  for (let row = 85; row <= 100; row++) {
    const cols = south.filter((c) => c.row === row).map((c) => c.col)
    const width = Math.max(...cols) - Math.min(...cols) + 1
    assert.ok(width <= lastWidth, '남미 남단으로 갈수록 폭이 좁아진다')
    assert.equal(cols.length, width, '남미 하단 내부에 빈 구멍을 남기지 않는다')
    lastWidth = width
  }
  assert.ok(south.every((c) => c.row <= Math.max(...nodes.get('CL').cells.map((cell) => cell.row))), '칠레 아래로 회색 꼬리가 나오지 않는다')
})

test('2017 PC 유럽은 본토를 잇고 스칸디나비아·흑해·지중해의 바다 간격을 남긴다', () => {
  const current = buildCartogram(getSnapshot(2017, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const mainland = nodes.get('context:europe:east-0').cells
  for (const id of ['DE', 'FR', 'IT', 'context:north-asia:west-0', 'context:south-asia:west-0'])
    assert.ok(nodes.get(id).cells.some((c) => mainland.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `${id}와 유럽 본토를 연결한다`)
  const north = nodes.get('context:europe:north-0').cells
  const join = north.filter((c) => mainland.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  assert.ok(join.length > 0 && join.every((c) => c.col >= 98), '왼쪽으로 옮긴 북유럽의 발트해를 비우고 핀란드 쪽으로 연결한다')
  assert.ok(nodes.get('NO').cells.some((c) => north.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)))
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (const [x0, x1, y0, y1] of [[95, 101, 42, 44], [93, 97, 27, 31], [78, 81, 54, 59]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(!occupied.has(`${col}:${row}`), '흑해·발트해·아드리아해 수역을 남긴다')
  for (const id of ['FR', 'DE'])
    assert.ok(nodes.get('GB').cells.every((c) => nodes.get(id).cells.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), '영국과 본토 사이에 바다 한 격자를 남긴다')
  const africa = current.context.filter((n) => n.region === 'africa').flatMap((n) => n.cells)
  for (const id of ['FR', 'ES', 'IT', 'context:europe:east-0'])
    assert.ok(nodes.get(id).cells.every((c) => africa.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), '아프리카와 유럽 사이 지중해 간격을 보존한다')
})

test('2017 PC는 미국·캐나다 연결과 동아프리카 해안·북유럽의 서쪽 이동을 유지한다', () => {
  const current = buildCartogram(getSnapshot(2017, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const canada = new Set(nodes.get('context:americas:north-0').cells.map((c) => `${c.col}:${c.row}`))
  for (let col = 24; col <= 47; col++) {
    const top = Math.min(...nodes.get('US').cells.filter((c) => c.col === col).map((c) => c.row))
    for (let row = 38; row < top; row++) assert.ok(canada.has(`${col}:${row}`), '2017년 미국 북쪽을 캐나다에 넓게 붙인다')
  }
  assert.deepEqual(nodes.get('US').position, [320, 392])
  assert.deepEqual(nodes.get('NO').position, [696, 200])
  assert.deepEqual(nodes.get('context:europe:north-0').position, [752, 224])
  assert.equal(nodes.get('NO').count, 7)
  assert.equal(nodes.get('context:europe:north-0').count, 87)
  assert.deepEqual(nodes.get('EG').position, [712, 520])
  assert.deepEqual(nodes.get('ZA').position, [704, 792])
  const eastAfrica = nodes.get('context:africa:central-0').cells
  let previousRight = Infinity
  for (let row = 83; row <= 100; row++) {
    const right = Math.max(...eastAfrica.filter((c) => c.row === row).map((c) => c.col))
    assert.ok(right <= previousRight && (previousRight === Infinity || previousRight - right <= 1), '동아프리카 해안은 남쪽으로 완만하게 좁아진다')
    previousRight = right
  }
  const madagascar = nodes.get('context:africa:central-1').cells
  const mainland = [...current.countries, ...current.context].filter((n) => n.region === 'africa' && n.id !== 'context:africa:central-1').flatMap((n) => n.cells)
  assert.ok(madagascar.every((c) => mainland.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), '동해안과 마다가스카르 사이 바다 간격을 남긴다')
  for (const id of ['ZA', 'context:africa:north-0', 'context:africa:north-1'])
    assert.ok(nodes.get(id).cells.some((c) => eastAfrica.some((d) => Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1)), `${id}와 동아프리카를 연결한다`)
})

test('2017 PC 아프리카는 이집트를 감싸고 남아공까지 이어지며 홍해·지중해를 보존한다', () => {
  const current = buildCartogram(getSnapshot(2017, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const terrain = current.context.filter((n) => n.region === 'africa').flatMap((n) => n.cells)
  assert.equal(terrain.length, 994)
  assert.equal(nodes.get('EG').count, 41)
  assert.equal(nodes.get('ZA').count, 21)
  const gray = new Set(terrain.map((c) => `${c.col}:${c.row}`))
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
    assert.ok(nodes.get('EG').cells.some((c) => gray.has(`${c.col + dx}:${c.row + dy}`)), '이집트 사방에 회색 지형이 닿는다')
  const mainland = [...current.context.filter((n) => n.region === 'africa' && n.id !== 'context:africa:central-1').flatMap((n) => n.cells), ...nodes.get('EG').cells, ...nodes.get('ZA').cells]
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (let row = 63; row <= 74; row++) {
    const cols = mainland.filter((c) => c.row === row).map((c) => c.col)
    for (let col = Math.min(...cols); col <= Math.max(...cols); col++)
      assert.ok(occupied.has(`${col}:${row}`), '이집트 주변과 아프리카 본토 내부에 빈틈을 남기지 않는다')
  }
  for (const [x0, x1, y0, y1] of [[96, 97, 63, 68], [78, 81, 54, 59]])
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++)
      assert.ok(!occupied.has(`${col}:${row}`), '홍해와 지중해 수역을 비워 둔다')
  assert.ok(nodes.get('context:africa:central-0').cells.every((c) => c.row <= 100), '남아공 아래로 가는 회색 꼬리가 튀어나오지 않는다')
})

test('2017 PC 중동·아시아는 2016년 배치를 이어받아 아프리카와 중국·한국·시베리아를 연결한다', () => {
  const previous = buildCartogram(getSnapshot(2016, 'PC')), current = buildCartogram(getSnapshot(2017, 'PC'))
  const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
  const n = (id) => `context:north-asia:${id}`, middle = 'context:south-asia:west-0'
  const touches = (a, b) => nodes.get(a).cells.some((c) => nodes.get(b).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  for (const [a, b] of [
    ['CN', 'KR'], [n('east-0'), 'CN'], [n('east-1'), 'CN'], [n('east-1'), 'KR'],
    [n('east-0'), n('east-1')], [n('east-0'), n('west-0')], [n('west-0'), 'CN'],
    [n('east-0'), 'context:europe:east-0'], [n('west-0'), 'context:europe:east-0'],
    [middle, n('west-0')], [middle, 'context:europe:east-0'], [middle, 'context:africa:north-0'],
    [middle, 'IL'], [middle, 'AE'], [middle, 'IN'], ['context:south-asia:east-0', 'CN'],
  ]) assert.ok(touches(a, b), `${a} / ${b}의 연결을 유지한다`)
  const join = nodes.get('context:africa:north-0').cells.filter((c) => nodes.get(middle).cells.some((d) =>
    Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
  assert.ok(new Set(join.map((c) => c.row)).size >= 4, '홍해 북쪽에서 본토 해안이 네 줄 이상 맞닿는다')
  const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
  for (const [x, y] of [[115, 43], [120, 43], [123, 42], [135, 43], [137, 41], [138, 40], [145, 38], [145, 41]])
    assert.ok(occupied.has(`${x}:${y}`), '커진 중국과 시베리아 사이에 내부 빈틈을 남기지 않는다')
  for (const [x, y] of [[103, 53], [105, 55], [108, 58], [112, 60], [112, 63], [116, 65]])
    assert.ok(!occupied.has(`${x}:${y}`), '페르시아만과 아라비아해의 경계를 유지한다')
  const scale = Math.sqrt(608 / 576), origin = [105, 62.5]
  for (const id of ['CN', 'KR', 'JP', 'IN', 'ID', 'IL', 'AE', 'AU']) {
    const old = previous.countries.find((c) => c.id === id)
    const expected = old.position.map((v, axis) => origin[axis] + (v / 8 - origin[axis]) * scale)
    assert.ok(nodes.get(id).position.every((v, axis) => Math.abs(v / 8 - expected[axis]) <= 3), `${id}가 전년도 위치에서 갑자기 흩어지지 않는다`)
  }
})

for (const year of [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]) {
  test(`${year} PC: 다섯 영역의 독립 보정본과 중동·아시아 연결, 주요 바다를 보존한다`, () => {
    const records = getSnapshot(year, 'PC'), current = buildCartogram(records)
    const reference = buildCartogram(getSnapshot(2017, 'PC'))
    const nodes = new Map([...current.countries, ...current.context].map((n) => [n.id, n]))
    const a = (id) => `context:americas:${id}`, n = (id) => `context:north-asia:${id}`
    const e = (id) => `context:europe:${id}`, f = (id) => `context:africa:${id}`, middle = 'context:south-asia:west-0'
    const touches = (left, right) => nodes.get(left).cells.some((c) => nodes.get(right).cells.some((d) =>
      Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
    for (const [left, right] of [
      ['US', a('north-0')], ['US', a('central-1')], [a('central-1'), a('andes-0')],
      [a('andes-0'), 'BR'], [a('south-1'), 'BR'], [a('south-1'), 'CL'],
      ['CN', 'KR'], [n('east-0'), 'CN'], [n('east-1'), 'CN'], [n('east-1'), 'KR'],
      [n('east-0'), n('east-1')], [n('east-0'), n('west-0')], [n('west-0'), 'CN'],
      [e('east-0'), 'DE'], [e('east-0'), 'FR'], [e('east-0'), 'IT'],
      [e('east-0'), n('east-0')], [e('east-0'), n('west-0')], [e('north-0'), 'NO'], [e('north-0'), e('east-0')],
      [middle, 'IL'], [middle, 'AE'], [middle, 'IN'], [middle, n('west-0')], [middle, e('east-0')], [middle, f('north-0')],
      [f('north-0'), 'EG'], [f('central-0'), 'ZA'], [f('north-0'), f('central-0')], [f('central-0'), f('north-1')],
    ]) assert.ok(touches(left, right), `${left} / ${right} 연결`)
    for (const region of WORLD_REGIONS) {
      const profile = region.snapshot_overrides[`PC:${year}`]
      assert.ok(profile, `${region.region_id}를 누락해 자동 배치로 돌아가지 않는다`)
      assert.equal(profile.reference_snapshot, 'PC:2017')
      assert.deepEqual(Object.keys(profile.context).sort(), region.context.map((c) => c.id).sort())
      assert.deepEqual(Object.keys(profile.countries).sort(), region.countries.map((c) => c.iso2).sort())
      const ratio = current.regions.find((r) => r.id === region.region_id).players / reference.regions.find((r) => r.id === region.region_id).players
      for (const node of current.context.filter((c) => c.region === region.region_id)) {
        const previous = reference.context.find((c) => c.id === node.id)
        const adjustment = year === 2020 && node.id === a('central-0') ? 1
          : year === 2022 && node.id === a('central-0') ? 6
            : year === 2023 && node.id === a('south-1') ? 8 : 0
        assert.equal(node.count, Math.round(previous.count * ratio) + adjustment)
        assert.equal(componentCount(node.cells), 1, node.id)
      }
    }
    const join = nodes.get(f('north-0')).cells.filter((c) => nodes.get(middle).cells.some((d) =>
      Math.abs(c.col - d.col) + Math.abs(c.row - d.row) === 1))
    assert.ok(new Set(join.map((c) => c.row)).size >= 3, '아프리카와 중동을 세 줄 이상으로 잇는다')
    const occupied = new Set([...current.dataCells, ...current.neutralCells].map((c) => `${c.col}:${c.row}`))
    const scale = Math.sqrt(summarizeSnapshot(records).players / 608_000_000), origin = [105, 62.5]
    for (const point of [[98, 43], [96, 64], [96, 66], [79, 56], [94, 29]]) {
      const [x, y] = point.map((v, axis) => Math.floor(origin[axis] + (v + 0.5 - origin[axis]) * scale))
      assert.ok(!occupied.has(`${x}:${y}`), '흑해·홍해·지중해·발트해의 중심 수역을 남긴다')
    }
    const island = nodes.get(f('central-1')).cells
    const mainland = [...current.countries, ...current.context].filter((c) => c.region === 'africa' && c.id !== f('central-1')).flatMap((c) => c.cells)
    assert.ok(island.every((c) => mainland.every((d) => Math.max(Math.abs(c.col - d.col), Math.abs(c.row - d.row)) > 1)), '마다가스카르의 바다 간격')
    assert.equal(current.dataCells.length, { 2018: 1716, 2019: 1760, 2020: 1899, 2021: 1960, 2022: 1944, 2023: 1977, 2024: 2013, 2025: 2035 }[year])
  })
}

test('연도에 따라 블록 수·윤곽·주변 위치가 변하고 세계지도 전체가 커진다', () => {
  for (const platform of ['PC']) {
    const first = buildCartogram(getSnapshot(2010, platform)), last = buildCartogram(getSnapshot(2025, platform))
    assert.ok(first.dataCells.length < last.dataCells.length)
    assert.ok(first.neutralCells.length < last.neutralCells.length)
    assert.ok(footprint(first) < footprint(last))
    for (const country of first.countries) {
      const later = last.countries.find((entry) => entry.iso2 === country.iso2)
      assert.notDeepEqual(country.position, later.position)
      assert.ok(country.cells.length < later.cells.length)
      assert.notDeepEqual(country.cells.map((c) => [c.x, c.y]), later.cells.slice(0, country.cells.length).map((c) => [c.x, c.y]))
    }
  }
  const before = buildCartogram(getSnapshot(2021, 'PC')), after = buildCartogram(getSnapshot(2022, 'PC'))
  assert.ok(after.dataCells.length < before.dataCells.length)
  assert.ok(after.neutralCells.length < before.neutralCells.length)
  assert.equal(summarizeSnapshot(getSnapshot(2025, 'PC')).players, 748_300_000)
})

test('재생 순서와 무관하게 같은 상태를 만들고 잘못된 입력을 거부한다', () => {
  const records = getSnapshot(2018, 'PC'), expected = structuredClone(buildCartogram(records))
  buildCartogram(getSnapshot(2010, 'PC'))
  assert.deepEqual(buildCartogram(structuredClone(records)), expected)
  assert.throws(() => buildCartogram([records[0], records[0]]), RangeError)
  assert.throws(() => buildCartogram([{ ...records[0], iso2: 'XX' }]), RangeError)
  assert.throws(() => buildCartogram([...records, { ...records[0], platform: 'UNSUPPORTED' }]), RangeError)
  assert.throws(() => buildCartogram([{ ...records[0], players: 1_000_000_000_000 }]), RangeError)
  assert.equal(polygonArea([[0, 0], [2, 0], [2, 2], [0, 2]]), 4)
  assert.deepEqual(buildMosaic('empty', { parts: [] }, 0), [])
  assert.throws(() => buildMosaic('invalid', { parts: [{ rings: [[0, 0], [2, 2]] }] }, 32), RangeError)
})





test('회색 지형의 0칸 보정은 실제 0·결측·누락 통계의 영역을 되살리지 않는다', () => {
  const shape = { parts: [{ id: 'land', rings: [[[0, 0], [2, 0], [2, 2], [0, 2]]] }] }
  const region = { region_id: 'example', countries: [{ iso2: 'AA' }, { iso2: 'BB' }], snapshot_overrides: {
    'PC:2010': { context: { coast: { blocks: 4, relative_to: 'context:example:coast', offset_cells: [0, 0] } } },
  } }
  for (const values of [[0, 0], [10, null], [10, undefined], [10, 0]]) {
    const node = { id: 'context:example:coast', kind: 'context', count: 0, template: shape }
    const countries = values.flatMap((players, i) => players === undefined ? [] : [{ id: i ? 'BB' : 'AA', kind: 'data', players }])
    const placements = new Map([[node.id, { offset: [20, 20], cells: [] }]])
    applySnapshotOverrides([region], [{ platform: 'PC', sourceYear: 2010 }], [node, ...countries], placements)
    assert.equal(placements.get(node.id).cells.length, values[1] === 0 && values[0] > 0 ? 4 : 0)
  }
  const zero = buildCartogram(getSnapshot(2010, 'PC').map((row) => ({ ...row, players: 0 })))
  assert.equal(zero.dataCells.length + zero.neutralCells.length, 0)
})
