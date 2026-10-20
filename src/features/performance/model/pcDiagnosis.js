const textFields = ['cpuModel', 'cpuDetails', 'gpuModel', 'gpuMemory', 'ramSpeed', 'os']
const numericFields = ['ramGB', 'storageTotalGB', 'storageFreeGB']
export function normalizeSpecs(input) {
  const result = {}
  for (const key of textFields) {
    const value = String(input[key] ?? '').trim()
    if (value.length > (key === 'ramSpeed' ? 80 : 160)) throw new Error('사양 항목을 짧게 입력해 주세요.')
    result[key] = value
  }
  for (const key of numericFields) {
    const raw = input[key]
    const value = raw == null || String(raw).trim() === '' ? null : Number(raw)
    if (
      value !== null &&
      (!Number.isFinite(value) ||
        value < (key === 'storageFreeGB' ? 0 : 0.1) ||
        value > (key === 'ramGB' ? 4096 : 100000))
    )
      throw new Error('용량은 올바른 GB 숫자로 입력해 주세요.')
    result[key] = value
  }
  if (result.storageFreeGB !== null && result.storageTotalGB !== null && result.storageFreeGB > result.storageTotalGB)
    throw new Error('남은 공간은 총 저장공간보다 클 수 없어요.')
  result.deviceType = ['DESKTOP', 'LAPTOP'].includes(input.deviceType) ? input.deviceType : 'UNKNOWN'
  return result
}
export function ownedPage(games, expanded, page) {
  const hasPlaytime = games.some(g => Number(g.playtimeForever) > 0)
  const ordered = [...games].sort((a, b) =>
    hasPlaytime
      ? (Number(b.playtimeForever) || 0) - (Number(a.playtimeForever) || 0)
      : String(a.name).localeCompare(String(b.name))
  )
  const pages = Math.max(1, Math.ceil(ordered.length / 10)),
    current = Math.max(0, Math.min(page, pages - 1))
  return {
    games: expanded ? ordered.slice(current * 10, current * 10 + 10) : ordered.slice(0, 5),
    hasPlaytime,
    pages,
    page: current,
    total: games.length,
  }
}
