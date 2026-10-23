// 검색 모드에서는 검색한 게임을, 검색 전에는 스팀 인기 게임을 보여준다.
export function gameViewGames(ownedListing, searched, searchMode, topGames = []) {
  return searchMode ? (searched.length ? searched : topGames) : ownedListing.games
}
