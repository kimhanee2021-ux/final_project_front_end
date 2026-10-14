import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import GameIdentity from '../../dashboard/components/GameIdentity'
import { money } from '../../../utils/formatters'

function RankingList({ title, items, onSelect }) {
  return (
    <div>
      <h3 className="mb-[10px] text-[11px] font-semibold text-muted">{title}</h3>
      <ol className="list-none m-0 p-0 grid gap-[10px]">
        {items.map(({ game, hourly }) => (
          <li key={game.id} className="flex items-center justify-between gap-[10px] min-w-0">
            <button className="min-w-0 bg-transparent p-0 text-left rounded-[6px]" onClick={() => onSelect(game)}>
              <GameIdentity game={game} compact />
            </button>
            <span className="text-[12px] font-[650] whitespace-nowrap">
              {money(hourly)}
              <small className="ml-[3px] text-[9px] font-normal text-muted">/ 시간</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// confirmed: 구매내역을 가져와 실제 결제액으로 계산할 때 (아니면 현재 정가 추정)
export default function ValueRankingCard({ ranking, onSelect, confirmed = false }) {
  const { best, worst } = ranking
  return (
    <Card
      title="가성비 랭킹"
      subtitle={(confirmed ? '실제 결제액' : '정가') + ' ÷ 누적 플레이 시간 · 1시간 이상 플레이한 유료 게임'}
    >
      {!best.length ? (
        <EmptyState
          title="아직 비교할 게임이 없어요"
          description="유료 게임을 1시간 이상 플레이하면 가성비를 계산해 드려요."
        />
      ) : (
        <div className="grid grid-cols-2 gap-[18px] mt-[12px] max-[580px]:grid-cols-1">
          <RankingList title="본전 뽑은 게임" items={best} onSelect={onSelect} />
          {worst.length > 0 && <RankingList title="조금 아쉬운 게임" items={worst} onSelect={onSelect} />}
        </div>
      )}
    </Card>
  )
}
