import { GRID } from './mapConfig.js'
import { buildMosaic } from './mosaicGeometry.js'

// 기본 배치가 끝난 뒤 지정 스냅샷의 조각만 교체합니다.
// 보정한 회색 블록 수로 세계 전체 spread나 다른 대륙의 위치를 다시 계산하지 않습니다.
export function applySnapshotOverrides(regions, records, nodes, placements) {
  if (!records.length || !records.every((row) => row.platform === records[0].platform && row.sourceYear === records[0].sourceYear)) return
  const snapshot = `${records[0].platform}:${records[0].sourceYear}`
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const origins = new Map([...placements].map(([id, placement]) => [id, placement.offset]))
  let changed = false
  for (const region of regions) {
    const profile = region.snapshot_overrides?.[snapshot]
    if (!profile) continue
    const regionalCountries = region.countries.map((country) => byId.get(country.iso2))
    const hasRegionalPlayers = regionalCountries.every((country) => country?.players != null)
      && regionalCountries.some((country) => country.players > 0)
    const edits = [
      ...Object.entries(profile.context ?? {}).map(([id, edit]) => [`context:${region.region_id}:${id}`, edit]),
      ...Object.entries(profile.countries ?? {}),
    ]
    for (const [id, edit] of edits) {
      const node = byId.get(id)
      // 반올림으로 기본 지형이 0칸이어도 명시적인 회색 지형 보정은 적용합니다.
      // 국가 통계가 0이거나 결측인 영역의 지형은 새로 만들지 않습니다.
      if (!node || (!node.count && !(node.kind === 'context' && edit.blocks > 0 && hasRegionalPlayers))) continue
      const origin = origins.get(edit.relative_to)
      if (!origin || !Array.isArray(edit.offset_cells) || edit.offset_cells.length !== 2 || !edit.offset_cells.every(Number.isInteger))
        throw new RangeError(`스냅샷 보정의 기준점과 정수 격자 이동량을 확인하세요: ${snapshot} / ${id}`)
      if (node.kind === 'data' && (edit.blocks !== undefined || edit.parts !== undefined))
        throw new RangeError('국가 이용자 블록 수와 윤곽은 주변 지형 보정으로 변경할 수 없습니다.')
      const count = edit.blocks ?? node.count
      const template = edit.parts ? { ...node.template, parts: edit.parts } : node.template
      // 같은 ID·개수라도 기본 윤곽과 보정 윤곽이 캐시를 공유하지 않게 합니다.
      const cells = buildMosaic(`${id}:${snapshot}`, template, count)
      const offset = origin.map((value, axis) => value + edit.offset_cells[axis])
      node.count = count
      node.template = template
      placements.set(id, { offset, cells: cells.map((cell) => ({ ...cell,
        localX: cell.x, localY: cell.y, x: cell.x + offset[0], y: cell.y + offset[1],
      })) })
      changed = true
    }
  }
  if (!changed) return
  const occupied = new Map()
  for (const [id, placement] of placements) for (const cell of placement.cells) {
    if (cell.x < 0 || cell.y < 0 || (cell.x + 1) * GRID.step > GRID.width || (cell.y + 1) * GRID.step > GRID.height)
      throw new RangeError(`스냅샷 보정이 프레임을 벗어납니다: ${snapshot} / ${id}`)
    const key = `${cell.x}:${cell.y}`
    if (occupied.has(key)) throw new RangeError(`스냅샷 보정이 겹칩니다: ${snapshot} / ${id} / ${occupied.get(key)} (${key})`)
    occupied.set(key, id)
  }
}
