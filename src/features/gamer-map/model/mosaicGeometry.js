// 첨부 예제의 면적 배분 → 윤곽 스케일 → 연결 셀 성장을 확장합니다.
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]
const key = (x, y) => `${x}:${y}`
const cache = new Map()
export function polygonArea(polygon) {
  return Math.abs(polygon.reduce((sum, a, i) => {
    const b = polygon[(i + 1) % polygon.length]
    return sum + a[0] * b[1] - b[0] * a[1]
  }, 0)) / 2
}
function distanceToShape(x, y, rings) {
  let inside = false, distance = Infinity
  for (const polygon of rings) for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length]
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
    const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy
    const t = length ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / length)) : 0
    distance = Math.min(distance, (x - a[0] - t * dx) ** 2 + (y - a[1] - t * dy) ** 2)
  }
  return Math.sqrt(distance) * (inside ? -1 : 1)
}
class MinHeap {
  items = []
  push(value) {
    let i = this.items.length
    this.items.push(value)
    while (i) {
      const parent = (i - 1) >> 1
      if (this.items[parent].score <= value.score) break
      this.items[i] = this.items[parent]
      i = parent
    }
    this.items[i] = value
  }
  pop() {
    const first = this.items[0], last = this.items.pop()
    if (this.items.length) {
      let i = 0
      while (i * 2 + 1 < this.items.length) {
        let child = i * 2 + 1
        if (child + 1 < this.items.length && this.items[child + 1].score < this.items[child].score) child++
        if (last.score <= this.items[child].score) break
        this.items[i] = this.items[child]
        i = child
      }
      this.items[i] = last
    }
    return first
  }
}
function rasterize(rings, target, part) {
  if (!target) return []
  const points = rings.flat(), xs = points.map((p) => p[0]), ys = points.map((p) => p[1])
  let seed = null
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      const score = distanceToShape(x + 0.5, y + 0.5, rings)
      if (!seed || score < seed.score) seed = { x, y, score }
    }
  const frontier = new MinHeap(), visited = new Set(), selected = []
  const offer = (x, y) => {
    const id = key(x, y)
    if (visited.has(id)) return
    visited.add(id)
    frontier.push({ x, y, score: distanceToShape(x + 0.5, y + 0.5, rings) })
  }
  offer(seed.x, seed.y)
  while (selected.length < target) {
    const cell = frontier.pop()
    selected.push({ x: cell.x, y: cell.y, part })
    for (const [dx, dy] of directions) offer(cell.x + dx, cell.y + dy)
  }
  return selected
}
function allocate(parts, target) {
  const totalArea = parts.reduce((sum, p) => sum + p.area, 0)
  const shares = parts.map((p) => target * p.area / totalArea)
  const counts = shares.map((n) => Math.floor(n))
  if (target >= parts.length) for (let i = 0; i < counts.length; i++) counts[i] = Math.max(1, counts[i])
  let total = counts.reduce((sum, n) => sum + n, 0)
  while (total !== target) {
    const adding = total < target
    let winner = -1
    for (let i = 0; i < counts.length; i++) {
      if (!adding && counts[i] <= (target >= parts.length ? 1 : 0)) continue
      const score = adding ? shares[i] - counts[i] : counts[i] - shares[i]
      const best = winner < 0 ? -Infinity : adding ? shares[winner] - counts[winner] : counts[winner] - shares[winner]
      if (score > best) winner = i
    }
    counts[winner] += adding ? 1 : -1
    total += adding ? 1 : -1
  }
  return counts
}
const offsets = new Map()
function offsetsFor(radius) {
  if (offsets.has(radius)) return offsets.get(radius)
  const choices = []
  for (let y = -radius; y <= radius; y++)
    for (let x = -radius; x <= radius; x++) choices.push({ x, y, score: x * x + y * y })
  choices.sort((a, b) => a.score - b.score || a.y - b.y || a.x - b.x)
  offsets.set(radius, choices)
  return choices
}
function placeCells(cells, desired, occupied, { gap = 1, bounds = null, radius = 80, acceptOffset = () => true } = {}) {
  if (!cells.length) return { cells: [], offset: desired }
  for (const delta of offsetsFor(radius)) {
    const ox = Math.round(desired[0]) + delta.x, oy = Math.round(desired[1]) + delta.y
    if (!acceptOffset([ox, oy])) continue
    const fits = cells.every((cell) => {
      const x = cell.x + ox, y = cell.y + oy
      if (bounds && (x < bounds[0] || y < bounds[1] || x >= bounds[2] || y >= bounds[3])) return false
      for (let dy = -gap; dy <= gap; dy++)
        for (let dx = -gap; dx <= gap; dx++) if (occupied.has(key(x + dx, y + dy))) return false
      return true
    })
    if (fits) {
      const placed = cells.map((cell) => ({ ...cell, x: cell.x + ox, y: cell.y + oy }))
      for (const cell of placed) occupied.add(key(cell.x, cell.y))
      return { cells: placed, offset: [ox, oy] }
    }
  }
  throw new RangeError('모자이크를 배치할 공간이 부족합니다. 블록 단위나 고정 프레임을 조정해 주세요.')
}
export function buildMosaic(id, template, count) {
  if (!Number.isInteger(count) || count < 0 || count > 20_000) throw new RangeError('블록 수는 0~20,000 사이의 정수여야 합니다.')
  if (!count) return []
  if (!template.parts?.length || template.parts.some((part) =>
    !part.rings?.length || part.rings.some((ring) => !Array.isArray(ring) || ring.length < 3 ||
      ring.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) || polygonArea(ring) <= 0),
  )) throw new RangeError('모자이크 윤곽은 면적이 있는 유한 좌표의 폴리곤이어야 합니다.')
  const cacheKey = `${id}:${count}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const parts = template.parts.map((part) => ({ ...part, area: Math.max(1, polygonArea(part.rings[0]) - part.rings.slice(1).reduce((sum, ring) => sum + polygonArea(ring), 0)) }))
  const totalArea = parts.reduce((sum, part) => sum + part.area, 0)
  const points = parts.flatMap((part) => part.rings[0])
  const center = [0, 1].map((axis) => (Math.min(...points.map((p) => p[axis])) + Math.max(...points.map((p) => p[axis]))) / 2)
  const scale = Math.sqrt(count / totalArea), counts = allocate(parts, count)
  const occupied = new Set(), cells = []
  for (const entry of parts.map((part, i) => ({ ...part, count: counts[i] })).sort((a, b) => b.area - a.area)) {
    const rings = entry.rings.map((polygon) => polygon.map(([x, y]) => [(x - center[0]) * scale, (y - center[1]) * scale]))
    const partCells = rasterize(rings, entry.count, entry.id)
    cells.push(...placeCells(partCells, [0, 0], occupied, { radius: 32 }).cells)
  }
  const result = cells.map((cell, i) => ({ ...cell, index: i }))
  if (cache.size >= 512) cache.delete(cache.keys().next().value)
  cache.set(cacheKey, result)
  return result
}
