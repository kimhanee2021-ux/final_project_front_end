import apiClient from '@/shared/lib/apiClient'

// 스프링 AI 게임 검색 API(/api/ai-search) 연동.
// 스프링이 GPT로 문장을 요청 종류·게임 이름·영어 키워드로 바꾸고, FastAPI 검색 모델로 비슷한 게임을 찾아 게임 정보를 붙인다.

export const MAX_QUERY_LENGTH = 200
const LIMIT = 12
const CACHE_SIZE = 30

// 같은 문장은 한 번만 묻는다 (음성 요청 해석과 결과 화면이 같은 결과를 쓰고, GPT 호출 비용이 든다).
// 문장 -> 응답 Promise. 실패한 요청은 지워서 다시 시도할 수 있게 한다.
const cache = new Map()
const keyOf = query => query.trim()

// 응답: { query, intent, matchedGame: { appId, game } | null, keywords: { gameTitle, tags, excludeTags, description, similarTo },
//         ignoredTags, similarTo: { appId, name } | null, items: [{ rank, appId, score, game: { name, genre, tags, thumbnailUrl, positiveRate } | null }] }
export function searchGames(query) {
  const key = keyOf(query)
  if (!cache.has(key)) {
    const request = apiClient
      .get('/api/ai-search', {
        params: { q: key, limit: LIMIT },
        // GPT 호출과 검색 모델 계산이 있어 일반 요청보다 오래 걸릴 수 있다.
        timeout: 40000,
      })
      .then(({ data }) => data)
    request.catch(() => cache.delete(key))
    cache.set(key, request)
    if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value)
  }
  return cache.get(key)
}

// 다른 문장(예: 음성 요청 뒤 주소에 들어가는 게임 이름)으로도 같은 결과를 보여주게 한다
export function rememberSearch(query, data) {
  cache.set(keyOf(query), Promise.resolve(data))
}

// 에러 응답은 스프링 공통 형식 { code, error }이다.
export function searchErrorMessage(error) {
  const message = error?.response?.data?.error
  if (typeof message === 'string') return message
  if (error?.code === 'ECONNABORTED') return '검색이 지연되고 있어요. 잠시 후 다시 시도해주세요.'
  if (error?.request && !error.response) return '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.'
  return '검색하지 못했어요. 잠시 후 다시 시도해주세요.'
}
