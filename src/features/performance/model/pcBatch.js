export async function assessGamesSequentially(games, assess, isActive, onResult) {
 for (const game of games) {
  if (!isActive()) return
  const result = await assess(game)
  if (!isActive()) return
  onResult(result)
 }
}
