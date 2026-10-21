// 내 라이브러리의 장르 태그 계산. 화면(SteamLibraryPanel)은 이 결과만 받아서 그린다.
export const ALL_GENRES = 'all'
const UNKNOWN_GENRE = '기타'

// 스팀 보유 게임 하나의 장르: 소비 분석 데이터에서 appId가 같은 게임의 장르, 없으면 '기타'
export function genreOfLibraryGame(game, spendingGames = []) {
  return spendingGames.find(item => item.appId === game.appId)?.genre ?? UNKNOWN_GENRE
}

// 칩 목록: '전체' + 장르별 게임 수가 많은 순
export function libraryGenreOptions(games) {
  const counts = games.reduce((result, game) => ({ ...result, [game.genre]: (result[game.genre] ?? 0) + 1 }), {})
  const genres = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ key: name, label: `${name} ${count}` }))
  return [{ key: ALL_GENRES, label: `전체 ${games.length}` }, ...genres]
}
