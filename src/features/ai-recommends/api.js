import apiClient from '@/shared/lib/apiClient'

// 스프링 추천 API(/api/recommendations) 연동. 모델 서버(FastAPI)는 스프링이 대신 호출하므로 프론트는 모른다.
// 스프링이 마지막 추천을 저장해 두므로 같은 결과를 다시 받을 때는 빠르다.
const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 50

// 응답: { recommendations: [{ rank, appId, score, source('main'|'new'), game: { name, genre, thumbnailUrl } | null }],
//         meta: { usedGameCount, unplayedGameCount } }
// score는 요청 안에서 순위를 매기는 값일 뿐 확률이나 일치율이 아니다.
export async function fetchRecommendations({ limit = DEFAULT_LIMIT, signal } = {}) {
  const { data } = await apiClient.get('/api/recommendations', {
    params: { limit },
    signal,
    // 저장된 추천이 없거나 오래되면 스프링이 모델 추론을 돌려서 일반 요청보다 오래 걸릴 수 있다.
    timeout: 60000,
  })
  return data
}

// 추천 오류 응답도 { code, error } 형식이다.
export function recommendErrorMessage(error) {
  const message = error?.response?.data?.error
  if (typeof message === 'string') return message
  if (error?.code === 'ECONNABORTED') return '추천 서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.'
  if (error?.request && !error.response) return '추천 서버에 연결할 수 없어요. 추천 서버가 실행 중인지 확인해주세요.'
  return '추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
}

// 플레이한 게임이 없을 때 서버가 409(NO_PLAYED_GAMES)를 준다. 오류가 아니라 안내 상태로 보여준다.
export const isNoPlayedGames = error => error?.response?.data?.code === 'NO_PLAYED_GAMES'
