import ResultCard from './ResultCard'

export const RESULT_GRID_CLASS =
  'grid gap-[36px_20px] grid-cols-4 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1'

// 검색 결과 카드를 격자로 나열한다.
export default function ResultList({ games }) {
  return (
    <div className={RESULT_GRID_CLASS}>
      {games.map(game => (
        <ResultCard key={game.id} game={game} />
      ))}
    </div>
  )
}
