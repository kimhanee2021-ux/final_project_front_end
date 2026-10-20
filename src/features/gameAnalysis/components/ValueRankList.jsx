import GameThumb from './GameThumb'
import { hoursText } from '@/features/spending'
import { money } from '@/shared/utils/formatters'

// 순위형 데이터 → 순번 뱃지 + 썸네일 + 시간당 가격 리스트 (게임별 분석·종합 분석이 같이 쓴다)
export default function ValueRankList({ ranking }) {
  return (
    <ol>
      {ranking.map(({ game, hourly }, index) => (
        <li key={game.id} className="flex items-center gap-[16px] py-[16px] border-b border-border last:border-0">
          <span className="grid place-items-center w-[30px] h-[30px] rounded-full bg-bg text-muted text-[13px] font-[700] shrink-0">{index + 1}</span>
          <GameThumb game={game} />
          <div className="min-w-0">
            <strong className="block text-[15px] truncate">{game.name}</strong>
            <small className="text-[12px] text-muted">{game.genre}</small>
          </div>
          <div className="ml-auto text-right shrink-0">
            <strong className="block text-[16px]">{money(hourly)}/시간</strong>
            <small className="text-[12px] text-muted">{hoursText(game.hours)} · {money(game.amount)}</small>
          </div>
        </li>
      ))}
    </ol>
  )
}
