import { COUNTRY_DIRECTIONS, GRID } from './mapConfig.js'
import { buildMosaic } from './mosaicGeometry.js'

const context = (region, id) => `context:${region}:${id}`
const north = (id) => context('north-asia', id)
const south = (id) => context('south-asia', id)
const europe = (id) => context('europe', id)
const africa = (id) => context('africa', id)
const america = (id) => context('americas', id)
const key = (x, y) => `${x}:${y}`

// 지리적인 연결 순서와 방향은 연도와 무관하게 고정합니다.
// 같은 육지는 빈 격자 없이 붙이고, 섬과 바다만 여백을 남깁니다.
const EURASIA = [
  ['CN'],
  ['IN', 'CN', [-0.4, 1]],
  [north('west-0'), 'CN', [-0.9, -0.6]],
  [north('east-0'), 'CN', [0, -1]],
  [north('east-1'), north('east-0'), [1, 0.1]],
  [south('east-0'), 'CN', [0.65, 1]],
  ['KR', 'CN', [1, 0.05]],
  ['JP', 'KR', [1, 0.25], 2],
  [europe('east-0'), north('west-0'), [-1, 0.05]],
  [europe('north-0'), europe('east-0'), [0, -1]],
  ['DE', europe('east-0'), [-1, -0.05]],
  ['FR', 'DE', [-0.8, 0.7]],
  ['ES', 'FR', [-0.15, 1]],
  ['IT', 'DE', [0.3, 1]],
  ['NO', europe('north-0'), [-0.8, -0.35]],
  ['GB', 'FR', [-0.3, -1], 1],
  [europe('islands-0'), 'GB', [-1, 0], 1],
  [europe('east-1'), 'FR', [-0.7, 0.4]],
  [south('west-0'), europe('east-0'), [0.1, 1]],
  ['IL', south('west-0'), [-1, 0.1]],
  ['AE', south('west-0'), [0.15, 1]],
  [south('east-1'), 'CN', [1, 0.8], 1],
]
const AFRICA = [
  [africa('north-0')],
  [africa('central-0'), africa('north-0'), [0.35, 1]],
  ['EG', africa('north-0'), [0.8, -0.55]],
  ['ZA', africa('central-0'), [0.1, 1]],
  [africa('north-1'), africa('central-0'), [1, -0.65]],
  [africa('central-1'), africa('central-0'), [1, 0.3], 3],
]
const NORTH_AMERICA = [
  ['US'],
  [america('north-0'), 'US', [-0.2, -1]],
  [america('central-0'), 'US', [0.9, -0.6]],
  [america('central-1'), 'US', [0.05, 1]],
  [america('north-1'), america('north-0'), [1, -0.4], 2],
  [america('greenland-0'), america('north-0'), [1, -0.7], 5],
]
const SOUTH_AMERICA = [
  ['BR'],
  [america('andes-0'), 'BR', [-1, -0.35]],
  ['CL', 'BR', [-0.85, 0.75]],
  [america('south-1'), 'CL', [1, 0.05]],
  [america('south-0'), 'CL', [0.1, 1]],
]
const OCEANIA = [
  ['AU'],
  [south('oceania-0'), 'AU', [1, 0.2], 4],
  [south('oceania-1'), south('oceania-0'), [-0.2, 1], 2],
]

function occupies(cells, offset, occupied, gap) {
  return cells.some((cell) => {
    for (let y = -gap; y <= gap; y++) for (let x = -gap; x <= gap; x++) {
      if (occupied.has(key(cell.x + offset[0] + x, cell.y + offset[1] + y))) return true
    }
    return false
  })
}
function addCells(cells, offset, occupied) {
  for (const cell of cells) occupied.add(key(cell.x + offset[0], cell.y + offset[1]))
}

// 정해진 방향의 한 경로에서 가장 가까운 자리를 찾습니다.
// 매년 모든 방향의 빈자리를 다시 탐색하지 않아 좌우가 갑자기 뒤집히지 않습니다.
function dock(cells, target, direction, occupied, gap = 0, port = [0, 0]) {
  const length = Math.hypot(...direction), vector = direction.map((value) => value / length)
  for (let distance = 1; distance <= 240; distance++) {
    const candidate = target.map((value, axis) => Math.round(value + vector[axis] * distance - port[axis]))
    if (!occupies(cells, candidate, occupied, gap)) return candidate
  }
  throw new RangeError('대륙을 배치할 공간이 부족합니다.')
}

function pack(plan, byId) {
  const occupied = new Set(), entries = [], positions = new Map()
  for (const [id, parent, direction = [0, 1], gap = 0] of plan) {
    const node = byId.get(id)
    if (!node) continue
    const cells = buildMosaic(node.id, node.template, node.count)
    const target = positions.get(parent) ?? [0, 0]
    const offset = parent && cells.length ? dock(cells, target, direction, occupied, gap) : target
    positions.set(id, offset)
    addCells(cells, offset, occupied)
    entries.push({ node, cells, offset })
  }
  return { entries, positions, cells: entries.flatMap((entry) => entry.cells.map((cell) => ({ x: cell.x + entry.offset[0], y: cell.y + entry.offset[1] }))) }
}

export function layoutContinents(nodes, spread) {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const occupied = new Set(), result = new Map(), positions = new Map()
  const anchor = ([x, y]) => [(840 + (x - 840) * spread) / GRID.step, (500 + (y - 500) * spread) / GRID.step].map(Math.round)
  const placeGroup = (group, offset) => {
    addCells(group.cells, offset, occupied)
    for (const entry of group.entries) {
      const position = entry.offset.map((value, axis) => value + offset[axis])
      positions.set(entry.node.id, position)
      result.set(entry.node.id, { offset: position, cells: entry.cells.map((cell) => ({ ...cell, localX: cell.x, localY: cell.y, x: cell.x + position[0], y: cell.y + position[1] })) })
    }
  }
  const eurasia = pack(EURASIA, byId)
  // 25만/75만 명 단위에서도 일본·인도네시아가 같은 고정 프레임 안에 들어오도록 합니다.
  placeGroup(eurasia, anchor([1146, 330]))
  const african = pack(AFRICA, byId)
  const egypt = african.positions.get('EG') ?? [0, 0]
  const israel = positions.get('IL') ?? anchor([985, 425])
  // 아프리카는 통째로 남쪽으로만 밀착합니다. 이집트·중앙·남아공이 따로 튀지 않습니다.
  placeGroup(african, dock(african.cells, [israel[0] - 6, israel[1]], [0, 1], occupied, 1, egypt))
  const americanNorth = pack(NORTH_AMERICA, byId)
  const americanAnchor = anchor([270, 335])
  while (occupies(americanNorth.cells, americanAnchor, occupied, 2)) americanAnchor[0]--
  placeGroup(americanNorth, americanAnchor)
  const americanSouth = pack(SOUTH_AMERICA, byId)
  placeGroup(americanSouth, dock(americanSouth.cells, positions.get(america('central-1')), [0.25, 1], occupied, 0, americanSouth.positions.get(america('andes-0'))))
  const indonesia = pack([['ID']], byId)
  placeGroup(indonesia, dock(indonesia.cells, positions.get(south('east-0')), [0.8, 1], occupied, 2))
  const oceania = pack(OCEANIA, byId)
  placeGroup(oceania, dock(oceania.cells, positions.get('ID') ?? anchor([1435, 610]), [0.3, 1], occupied, 5))
  if (result.size !== nodes.length) throw new RangeError('대륙 배치에 등록되지 않은 지형이 있습니다.')
  for (const [before, after, axis] of COUNTRY_DIRECTIONS) {
    if (byId.get(before)?.count && byId.get(after)?.count && positions.get(before)[axis] >= positions.get(after)[axis])
      throw new RangeError(`국가의 상대 방향을 조정해 주세요: ${before} / ${after}`)
  }
  for (const [id, placement] of result) if (placement.cells.some((cell) =>
    cell.x < 0 || cell.y < 0 || cell.x >= GRID.width / GRID.step || cell.y >= Math.floor(GRID.height / GRID.step),
  )) throw new RangeError(`모자이크가 고정 프레임을 벗어납니다: ${id}. 대륙 배치를 조정해 주세요.`)
  return result
}
