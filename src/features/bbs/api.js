import apiClient from '@/shared/lib/apiClient'

export async function fetchBbsResource(path, signal) {
  const { data } = await apiClient.get(path, { signal })
  return data
}
