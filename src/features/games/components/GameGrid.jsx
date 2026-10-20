import { gameGridClass } from '../model/gameGridClass'
import GameListCard from './GameListCard'

// 게임 카드를 view(grid/list)에 맞는 격자로 나열한다.
export default function GameGrid({ games, view }) {
  return (
    <div className={gameGridClass(view)}>
      {games.map(game => (
        <GameListCard key={game.id} game={game} view={view} />
      ))}
    </div>
  )
}
