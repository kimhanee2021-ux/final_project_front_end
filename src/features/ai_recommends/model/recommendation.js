// 추천 응답을 화면용 모양으로 바꾼다. 카탈로그에 없는 게임(game: null)도 목록에서 빠지지 않게 번호로 대신 보여준다.
export function toRecommendedGame(item) {
  const genres = (item.game?.genre ?? '')
    .split(',')
    .map(genre => genre.trim())
    .filter(Boolean)
  return {
    appId: item.app_id,
    rank: item.rank,
    score: item.score,
    name: item.game?.name ?? `게임 #${item.app_id}`,
    genres,
    image: item.game?.thumbnail_url ?? null,
    storeUrl: `https://store.steampowered.com/app/${item.app_id}`,
  }
}

export function toRecommendations(data) {
  return {
    games: (data?.recommendations ?? []).map(toRecommendedGame),
    usedGameCount: data?.meta?.used_game_count ?? 0,
    unplayedGameCount: data?.meta?.unplayed_game_count ?? 0,
  }
}
