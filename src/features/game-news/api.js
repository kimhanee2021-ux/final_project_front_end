import apiClient from '@/shared/lib/apiClient'

// BBS는 저장된 데이터 조회만 수행한다. 수집·AI 생성 요청을 보내지 않는다.
export async function fetchNewsResource(path, signal) {
  const { data } = await apiClient.get(path, { signal })
  return data
}
