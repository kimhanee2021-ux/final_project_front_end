import apiClient from '@/shared/lib/apiClient'

export async function fetchRankingOptions(signal) {
  const { data } = await apiClient.get('/api/ranks/weekly/options', { signal })
  return data
}

export async function fetchWeeklyProducts(country, week, signal) {
  const { data } = await apiClient.get('/api/ranks/weekly/products', {
    params: { country, week }, signal,
  })
  return {
    ...data,
    entries: data.entries.map(entry => ({
      ...entry,
      rankChange: ['NEW', 'RETURNING'].includes(entry.changeKind)
        ? entry.changeKind
        : ['UP', 'DOWN', 'SAME'].includes(entry.changeKind) && Number.isInteger(entry.previousRank)
          ? entry.previousRank - entry.sourceRank : null,
    })),
  }
}
