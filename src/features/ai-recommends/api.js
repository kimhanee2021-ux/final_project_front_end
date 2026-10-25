import apiClient from '@/shared/lib/apiClient'

// 스프링 추천 API(/api/recommendations/me) 연동.
// 실제 계산은 FastAPI 추천 서버가 하지만, 인증 없는 내부 서버라 프론트는 스프링만 부른다.

const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 50
// 추천 칸 중 학습에 없던 신작으로 채울 칸 수
const NEW_SLOTS = 3

// 응답: { recommendations: [{ rank, appId, score, source('main'|'new'), game: { name, genre, thumbnailUrl } | null }],
//         meta: { usedGameCount, unplayedGameCount } }
// score는 요청 안에서 순위를 매기는 값일 뿐 확률이나 일치율이 아니다.
export async function fetchRecommendations({ limit = DEFAULT_LIMIT, signal } = {}) {
  const { data } = await apiClient.get('/api/recommendations/me', {
    params: { limit, newSlots: NEW_SLOTS },
    signal,
    // 모델 추론이 있어 일반 요청보다 오래 걸릴 수 있다.
    timeout: 60000,
  })
  return data
}

// 에러 응답은 스프링 공통 형식 { code, error }이다.
export function recommendErrorMessage(error) {
  const message = error?.response?.data?.error
  if (typeof message === 'string') return message
  if (error?.code === 'ECONNABORTED') return '추천 서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.'
  if (error?.request && !error.response) return '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.'
  return '추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
}

// 플레이한 게임이 없을 때 서버가 409(NO_PLAYED_GAMES)를 준다. 오류가 아니라 안내 상태로 보여준다.
export const isNoPlayedGames = error => error?.response?.data?.code === 'NO_PLAYED_GAMES'
