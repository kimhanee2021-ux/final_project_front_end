export async function assessGamesSequentially(games, assess, isActive, onResult, onGameError) {
 for (const game of games) {
  if (!isActive()) return
  try {
   const result = await assess(game)
   if (!isActive()) return
   onResult(result)
  } catch (error) {
   if (!isActive()) return
   if (!onGameError || ![400,404,503].includes(error.status)) throw error
   onGameError(game,error)
  }
 }
}
