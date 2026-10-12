import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import GameIdentity from '../../dashboard/components/GameIdentity'
import { money } from '../../../utils/formatters'

function RankingList({ title, items, onSelect }) {
  return (
    <div>
      <h3>{title}</h3>
      <ol>
        {items.map(({ game, hourly }) => (
          <li key={game.id}>
            <button className="game-detail-trigger" onClick={() => onSelect(game)}>
              <GameIdentity game={game} compact />
            </button>
            <span className="hourly">
              {money(hourly)}
              <small>/ 시간</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function ValueRankingCard({ ranking, onSelect }) {
  const { best, worst } = ranking
  return (
    <Card title="가성비 랭킹" subtitle="정가 ÷ 누적 플레이 시간 · 1시간 이상 플레이한 유료 게임" className="value-ranking">
      {!best.length ? (
        <EmptyState
          title="아직 비교할 게임이 없어요"
          description="유료 게임을 1시간 이상 플레이하면 가성비를 계산해 드려요."
        />
      ) : (
        <div className="value-ranking-grid">
          <RankingList title="본전 뽑은 게임" items={best} onSelect={onSelect} />
          {worst.length > 0 && <RankingList title="조금 아쉬운 게임" items={worst} onSelect={onSelect} />}
        </div>
      )}
    </Card>
  )
}
