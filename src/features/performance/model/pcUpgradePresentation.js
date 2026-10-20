import { pcUpgradeSources } from './pcUpgradeSources.js'

export function upgradePresentation(advice, recommendations = [], specs = {}, category) {
  const keep = advice?.status === 'KEEP'
  const laptop = specs?.deviceType === 'LAPTOP' || /laptop|mobile|max-q/i.test(specs?.gpuModel ?? '')
  const sources = keep
    ? []
    : pcUpgradeSources.filter(source => {
        if (source.category !== category) return false
        if (category === 'CPU') return laptop && /intel|\bcore\b/i.test(specs?.cpuModel ?? '')
        if (category === 'GPU') return laptop && /nvidia|geforce|\brtx\b|\bgtx\b/i.test(specs?.gpuModel ?? '')
        return category === 'RAM'
      })
  const offers = []
  if (advice?.status === 'UPGRADE') {
    for (const item of [
      ...recommendations,
      ...(advice.offer
        ? [{ offer: advice.offer, reason: advice.reason, compatibilityNote: advice.compatibilityNote }]
        : []),
    ]) {
      if (item.offer?.part && !offers.some(existing => existing.offer.part.productCode === item.offer.part.productCode))
        offers.push(item)
    }
  }
  return { offers, sources, compatibilityNote: keep ? '' : (advice?.compatibilityNote ?? '') }
}
