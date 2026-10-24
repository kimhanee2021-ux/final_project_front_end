import apiClient from '@/shared/lib/apiClient'
export async function fetchBriefing(page, appId, signal, group, topic) {
  const { data } = await apiClient.get('/api/board/briefing', { params: { page, appId: appId || undefined, group, topic: topic || undefined }, signal })
  return data
}
export async function fetchSourceGames(signal) {
  const { data } = await apiClient.get('/api/board/official-news/games', { signal })
  return data
}
export async function fetchOfficialNews(page, appId, signal) {
  const { data } = await apiClient.get('/api/board/official-news', { params: { page, appId: appId || undefined }, signal })
  return data
}
