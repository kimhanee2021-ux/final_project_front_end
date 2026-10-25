import apiClient from '@/shared/lib/apiClient'

// 스프링 자연어 검색 API(/api/search/natural) 연동. 검색어 → AI 키워드 변환 → 검색 모델 호출은 스프링이 처리하므로 프론트는 결과만 받는다.
// 로그인한 사용자만 쓸 수 있고, 사용자당 분당 10회로 제한된다(초과하면 429).
export const MAX_QUERY_LENGTH = 200
const DEFAULT_LIMIT = 12

// 응답: { query, analysis: { analyzed, tags, excludeTags, description, similarTo, ignoredTags },
//         results: [{ rank, appId, score, game: { name, genre, thumbnailUrl, ... } | null }] }
export async function fetchNaturalSearch({ query, limit = DEFAULT_LIMIT, signal }) {
  const { data } = await apiClient.get('/api/search/natural', {
    params: { query, limit },
    signal,
    // AI 분석과 검색 모델 호출이 이어져서 일반 요청보다 오래 걸릴 수 있다.
    timeout: 60000,
  })
  return data
}
