import apiClient from '@/shared/lib/apiClient'

// FastAPI 추천 서버(/api/v1/users/me/recommendations) 연동.
// 스프링(/api)과 서버가 달라 개발 환경에서는 vite proxy의 /recommend-api 경로를 거친다.
// 배포 등으로 추천 서버 주소가 다르면 VITE_RECOMMEND_API_BASE_URL에 지정한다.
const RECOMMEND_BASE = import.meta.env.VITE_RECOMMEND_API_BASE_URL || '/recommend-api'

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 50
// 추천 칸 중 학습에 없던 신작으로 채울 칸 수
const NEW_SLOTS = 3

// 응답: { recommendations: [{ rank, app_id, score, source('main'|'new'), game: { name, genre, thumbnail_url } | null }],
//         meta: { used_game_count, unplayed_game_count } }
// score는 요청 안에서 순위를 매기는 값일 뿐 확률이나 일치율이 아니다.
export async function fetchRecommendations({ limit = DEFAULT_LIMIT, signal } = {}) {
  const { data } = await apiClient.get(`${RECOMMEND_BASE}/api/v1/users/me/recommendations`, {
    params: { limit, new_slots: NEW_SLOTS },
    signal,
    // 추천 서버의 401로 전체 로그아웃되지 않게 한다. 토큰 만료는 스프링 API 호출에서 처리된다.
    skipSessionExpiry: true,
    // 모델 추론이 있어 일반 요청보다 오래 걸릴 수 있다.
    timeout: 60000,
  })
  return data
}

// FastAPI 에러 응답도 스프링과 같은 { code, error } 형식이다.
export function recommendErrorMessage(error) {
  const message = error?.response?.data?.error
  if (typeof message === 'string') return message
  if (error?.code === 'ECONNABORTED') return '추천 서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.'
  if (error?.request && !error.response) return '추천 서버에 연결할 수 없어요. 추천 서버가 실행 중인지 확인해주세요.'
  return '추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
}

// 플레이한 게임이 없을 때 서버가 409(NO_PLAYED_GAMES)를 준다. 오류가 아니라 안내 상태로 보여준다.
export const isNoPlayedGames = error => error?.response?.data?.code === 'NO_PLAYED_GAMES'
