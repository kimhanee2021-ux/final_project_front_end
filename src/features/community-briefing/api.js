import apiClient from '@/shared/lib/apiClient'
export async function fetchBriefing(page, appId, signal, group, topic) {
  const { data } = await apiClient.get('/api/board/briefing', { params: { page, appId: appId || undefined, group, topic: topic || undefined }, signal })
  return data
}
