// AI 게임 추천 화면의 순수 로직 (네트워크·React 없이 테스트한다)

// 추천 서버 오류 code → 안내. 정해진 문구가 없으면 서버가 준 문구를 쓴다.
const ERROR_MESSAGES = {
  NO_PLAYED_GAMES: '추천에 쓸 수 있는 플레이한 게임이 아직 없어요. 스팀을 연동하고 게임을 플레이하면 추천해 드려요.',
  USER_NOT_FOUND: '회원 정보를 찾지 못했어요. 다시 로그인해 주세요.',
}

export function recommendationErrorMessage(error) {
  const code = error?.response?.data?.code
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code]
  const serverMessage = error?.response?.data?.error
  if (serverMessage) return serverMessage
  // 추천 서버가 꺼져 있으면 vite 프록시가 502/504 또는 연결 실패를 돌려준다
  if (!error?.response || [502, 503, 504].includes(error.response.status))
    return '추천 서버에 연결할 수 없어요. 추천 서버(FastAPI)가 실행 중인지 확인해 주세요.'
  return '추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
}

// 플레이한 게임이 없을 때는 오류가 아니라 "먼저 게임을 플레이해 보세요" 안내로 보여준다.
export function isNoPlayedGames(error) {
  return error?.response?.data?.code === 'NO_PLAYED_GAMES'
}

export const storeUrl = appId => `https://store.steampowered.com/app/${appId}`

// 추천 항목을 카드가 쓰는 모양으로 바꾼다. game이 null(카탈로그에 없는 게임)이어도 앱 번호로 상점 링크는 만들 수 있다.
export function toCard(item) {
  return {
    appId: item.app_id,
    rank: item.rank,
    name: item.game?.name ?? `게임 ${item.app_id}`,
    genre: item.game?.genre ?? '',
    image: item.game?.thumbnail_url ?? '',
    isNew: item.source === 'new',
    storeUrl: storeUrl(item.app_id),
  }
}
