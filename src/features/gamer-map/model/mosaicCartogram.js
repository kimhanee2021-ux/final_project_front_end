import { COUNTRY_GEOMETRY, getCellRule, GRID, NEUTRAL_COLOR } from './mapConfig.js'
import { splitIntoCells, getSnapshot } from './playerData.js'
import { layoutContinents } from './mosaicLayout.js'
import { applySnapshotOverrides } from './mosaicSnapshotOverrides.js'
import americas from './data/worldBlocks.americas.json' with { type: 'json' }
import northAsia from './data/worldBlocks.north-asia.json' with { type: 'json' }
import southAsia from './data/worldBlocks.south-asia.json' with { type: 'json' }
import europe from './data/worldBlocks.europe.json' with { type: 'json' }
import africa from './data/worldBlocks.africa.json' with { type: 'json' }

export const WORLD_REGIONS = [americas, northAsia, southAsia, europe, africa]
const templates = new Map(WORLD_REGIONS.flatMap((region) => region.countries.map((country) => [country.iso2, { ...country, region: region.region_id }])))
const referenceTotals = Object.fromEntries(['PC'].map((platform) => [platform,
  Object.fromEntries(WORLD_REGIONS.map((region) => [region.region_id,
    getSnapshot(region.reference_year, platform).filter((row) => row.region === region.region_id).reduce((sum, row) => sum + (row.players ?? 0), 0),
  ])),
]))
// 기존 PC 지도의 거리·배치를 보존하는 고정 정규화 기준입니다.
const referenceCount = 7332
const layoutCache = new Map()
export function buildCartogram(records) {
  const cacheKey = JSON.stringify(records)
  if (layoutCache.has(cacheKey)) return layoutCache.get(cacheKey)
  const platforms = new Set(records.map((record) => record.platform))
  if (platforms.size > 1) throw new RangeError('서로 다른 플랫폼은 함께 계산할 수 없습니다.')
  const platform = records[0]?.platform ?? 'PC'
  if (!referenceTotals[platform]) throw new RangeError('지원하지 않는 플랫폼입니다.')
  const countryIds = new Set()
  const countries = records.map((record) => {
    const template = templates.get(record.iso2)
    if (!template) throw new RangeError(`지원하지 않는 국가: ${record.iso2}`)
    if (countryIds.has(record.iso2)) throw new RangeError(`중복 국가: ${record.iso2}`)
    countryIds.add(record.iso2)
    const rule = getCellRule(record.iso2), quantized = splitIntoCells(record.players, rule.unit)
    return { ...record, ...COUNTRY_GEOMETRY[record.iso2], ...rule, anchor: template.anchor, region: template.region, quantized,
      template, id: record.iso2, kind: 'data', count: quantized.count,
    }
  })
  const regions = WORLD_REGIONS.map((region) => {
    const rows = countries.filter((country) => country.region === region.region_id)
    const complete = rows.length === region.countries.length && rows.every((row) => row.players !== null)
    const players = rows.reduce((sum, row) => sum + (row.players ?? 0), 0)
    return { id: region.region_id, name: region.region_name, players, ratio: complete ? players / referenceTotals[platform][region.region_id] : null }
  })
  const context = WORLD_REGIONS.flatMap((region) => region.context.map((shape) => {
    const ratio = regions.find((entry) => entry.id === region.region_id).ratio
    return { id: `context:${region.region_id}:${shape.id}`, kind: 'context', region: region.region_id,
      template: shape, anchor: shape.anchor, color: NEUTRAL_COLOR,
      count: ratio === null ? 0 : Math.round(shape.reference_blocks * ratio),
    }
  }))
  const nodes = [...countries, ...context]
  const totalCount = nodes.reduce((sum, node) => sum + node.count, 0)
  // 카메라는 고정하고 목표 위치 간 거리를 줄여 초기 연도의 세계지도도 작아집니다.
  const spread = Math.min(1.08, Math.sqrt(totalCount / referenceCount))
  const placements = layoutContinents(nodes, spread)
  applySnapshotOverrides(WORLD_REGIONS, records, nodes, placements)
  const dataCells = [], neutralCells = []
  for (const node of nodes) {
    const placed = placements.get(node.id)
    node.position = placed.offset.map((value) => value * GRID.step)
    node.cells = placed.cells.map((cell, index) => ({
      ...cell, col: cell.x, row: cell.y, x: cell.x * GRID.step, y: cell.y * GRID.step,
      id: `${node.id}:${cell.part}:${cell.localX}:${cell.localY}`, iso2: node.kind === 'data' ? node.iso2 : null,
      region: node.region, kind: node.kind, color: node.color, size: GRID.step,
      fill: node.kind === 'data' && index === node.quantized.full ? node.quantized.remainder : 1,
    }))
    if (node.kind === 'data') dataCells.push(...node.cells)
    else neutralCells.push(...node.cells)
  }
  const labels = countries.map((country) => {
    const center = country.cells.length ? {
      x: country.cells.reduce((sum, cell) => sum + cell.x + GRID.step / 2, 0) / country.cells.length,
      y: country.cells.reduce((sum, cell) => sum + cell.y + GRID.step / 2, 0) / country.cells.length,
    } : { x: country.position[0], y: country.position[1] }
    return { iso2: country.iso2, name: country.name, color: country.color, center,
      x: center.x, y: Math.max(24, Math.min(...country.cells.map((cell) => cell.y), center.y) - 13),
    }
  })
  for (let pass = 0; pass < 16; pass++) for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
    const a = labels[i], b = labels[j]
    if (Math.abs(a.x - b.x) < 85 && Math.abs(a.y - b.y) < 28) {
      const sign = a.y <= b.y ? -1 : 1
      a.y = Math.max(20, a.y + sign * 8)
      b.y = Math.min(GRID.height - 20, b.y - sign * 8)
    }
  }
  const result = { countries, context, regions, labels, dataCells, neutralCells, spread }
  if (layoutCache.size >= 40) layoutCache.delete(layoutCache.keys().next().value)
  layoutCache.set(cacheKey, result)
  return result
}
