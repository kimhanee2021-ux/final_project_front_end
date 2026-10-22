import apiClient from '@/shared/lib/apiClient'

// 추천 서버(FastAPI, final_project_fast_api) 연동. Two-Tower 모델이 내 보유 게임(플레이한 것만)으로 다음에 할 게임을 추천한다.
// 개발 환경에서는 vite proxy가 /api/v1을 추천 서버로 넘긴다. 로그인 토큰(JWT)은 apiClient가 붙이고, 추천 서버가 같은 키로 검증한다.
// 응답: { recommendations: [{ rank, app_id, score, source('main'|'new'), game: { name, genre, thumbnail_url } | null }],
//         meta: { used_game_count, unplayed_game_count } }
// score는 요청 안에서 순위를 매기는 값일 뿐 확률이나 일치율이 아니다. game은 게임 카탈로그에 없으면 null.
export async function fetchRecommendations({ limit = 12, newSlots = 3 } = {}) {
  const { data } = await apiClient.get('/api/v1/users/me/recommendations', {
    params: { limit, new_slots: newSlots },
    // 모델 추론과 DB 조회가 있어서 기본(15초)보다 넉넉히 기다린다
    timeout: 30000,
  })
  return data
}
