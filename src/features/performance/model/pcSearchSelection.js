const titleKey = value =>
  String(value ?? '')
    .replace(/[™®]/g, '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
export function exactSearchGame(query, games) {
  const unique = [...new Map(games.map(game => [game.appId, game])).values()]
  const exact = unique.filter(game => titleKey(game.name) === titleKey(query))
  return exact.length === 1 ? exact[0] : null
}
