import { tagLabel } from '@/shared/utils/gameTags'

// 추천 응답을 화면용 모양으로 바꾼다. 카탈로그에 없는 게임(game: null)도 목록에서 빠지지 않게 번호로 대신 보여준다.
export function toRecommendedGame(item) {
  const genres = (item.game?.genre ?? '')
    .split(',')
    .map(genre => genre.trim())
    .filter(Boolean)
  return {
    // id · tags는 위시리스트(하트)가 쓰는 이름이다. 게임 탐색의 스팀 게임처럼 id는 앱 번호라서 어디서 담아도 같은 게임으로 본다.
    id: item.app_id,
    appId: item.app_id,
    rank: item.rank,
    score: item.score,
    name: item.game?.name ?? `게임 #${item.app_id}`,
    genres,
    tags: genres,
    image: item.game?.thumbnail_url ?? null,
    isNew: item.source === 'new',
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

// AI가 읽은 내 취향: 추천 결과에 자주 나온 장르. 순위가 높은 게임의 장르일수록 더 크게 센다.
export function tasteGenres(games, count = 3) {
  const weights = {}
  games.forEach((game, index) => {
    game.genres.forEach(genre => {
      weights[genre] = (weights[genre] ?? 0) + (games.length - index)
    })
  })
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([genre]) => genre)
}

// 장르 비중: 추천 게임 중 그 장르를 가진 게임의 비율(%). 한 게임이 여러 장르를 가지므로 합이 100을 넘을 수 있다.
export function genreShares(games, genres) {
  return genres.map(genre => ({
    genre,
    share: games.length ? Math.round((games.filter(game => game.genres.includes(genre)).length / games.length) * 100) : 0,
  }))
}

// 잘 맞는 정도. score는 일치율이 아니라 순위용 값이라 %로 보여주지 않고, 목록 안의 순위 구간으로 나눈다.
export function matchLevel(index, total) {
  const ratio = total > 0 ? index / total : 0
  if (ratio < 0.3) return { level: 3, label: '매우 잘 맞음' }
  if (ratio < 0.7) return { level: 2, label: '잘 맞음' }
  return { level: 1, label: '취향 넓히기' }
}

// 카드에 붙는 추천 이유 한 줄: 내 취향 장르와 겹치는 장르를 보여준다.
export function reasonFor(game, taste) {
  if (game.isNew) return '취향에 맞는 신작'
  const shared = game.genres.filter(genre => taste.includes(genre)).slice(0, 2)
  if (!shared.length) return '새로운 장르로 취향 넓히기'
  return `취향 일치 · ${shared.map(tagLabel).join(' · ')}`
}

// 스팀 라이브러리 전체 플레이시간 (시간 단위, 반올림)
export function totalPlayHours(libraryGames) {
  return Math.round((libraryGames ?? []).reduce((sum, game) => sum + (game.playtimeForever ?? 0), 0) / 60)
}

// 취향을 만든 게임: 내 스팀 라이브러리에서 플레이시간이 가장 긴 게임
export function topPlayedGames(libraryGames, count = 3) {
  return [...(libraryGames ?? [])]
    .filter(game => game.playtimeForever > 0)
    .sort((a, b) => b.playtimeForever - a.playtimeForever)
    .slice(0, count)
}
