import { useState } from 'react'
import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import GSIcon from '../../../components/common/GSIcon'
import GameIdentity from './GameIdentity'
import PlayStatusBadge from './PlayStatusBadge'
import { money, number, dateLabel } from '../../../utils/formatters'
import { netAmount } from '../spendingMetrics'
export default function PurchasedGamesTable({
  games,
  filter,
  setFilter,
  genre,
  clearGenre,
  onSelect,
  library,
}) {
  const [sort, setSort] = useState('recent')
  const [query, setQuery] = useState('')
  const filtered = games.filter(
    game =>
      (filter !== 'unplayed' || (game.hours === 0 && netAmount(game) > 0)) &&
      (!genre || game.genre === genre) &&
      game.name.toLowerCase().includes(query.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) =>
    sort === 'price'
      ? (netAmount(b) ?? -1) - (netAmount(a) ?? -1)
      : sort === 'hours'
        ? (b.hours ?? -1) - (a.hours ?? -1)
        : b.purchasedAt.localeCompare(a.purchasedAt)
  )
  return (
    <Card
      title={library ? '내 게임 라이브러리' : '구매한 게임, 얼마나 즐겼을까요?'}
      subtitle="구매 금액과 누적 이용 시간을 함께 살펴보세요."
      className="purchase-card"
      action={<span className="count-label">{filtered.length}개 게임</span>}
    >
      <div className="table-toolbar">
        <div className="table-tabs" role="group" aria-label="플레이 상태 필터">
          <button
            className={filter === 'all' ? 'active' : ''}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            전체 게임
          </button>
          <button
            className={filter === 'unplayed' ? 'active' : ''}
            aria-pressed={filter === 'unplayed'}
            onClick={() => setFilter('unplayed')}
          >
            미플레이
          </button>
          {genre && (
            <button className="genre-filter" onClick={clearGenre}>
              {genre}
              <GSIcon name="close" size={12} />
              <span className="sr-only">장르 필터 해제</span>
            </button>
          )}
        </div>
        <div className="table-controls">
          <label className="search-field">
            <GSIcon name="search" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="게임 검색"
              aria-label="구매한 게임 검색"
            />
          </label>
          <select aria-label="게임 정렬" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recent">최근 구매순</option>
            <option value="price">구매 금액순</option>
            <option value="hours">플레이 시간순</option>
          </select>
        </div>
      </div>
      {!sorted.length ? (
        <EmptyState
          title="조건에 맞는 게임이 없어요"
          description="검색어 또는 필터를 변경해 보세요."
          action={
            <button
              className="text-button"
              onClick={() => {
                setQuery('')
                setFilter('all')
                clearGenre()
              }}
            >
              검색과 필터 초기화
              <GSIcon name="refresh" size={15} />
            </button>
          }
        />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>게임</th>
                <th>구매 금액</th>
                <th>구매일</th>
                <th>플레이 시간</th>
                <th>시간당 비용</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(game => (
                <tr key={game.id}>
                  <td>
                    <button className="game-detail-trigger" onClick={() => onSelect(game)}>
                      <GameIdentity game={game} />
                    </button>
                  </td>
                  <td className="amount-cell">{money(netAmount(game))}</td>
                  <td className="muted">{dateLabel(game.purchasedAt)}</td>
                  <td>{game.hours == null ? '시간 미확인' : number(game.hours) + '시간'}</td>
                  <td>
                    {game.amount == null
                      ? '금액 미확인'
                      : game.hours > 0
                        ? money(netAmount(game) / game.hours)
                        : '계산 전'}
                  </td>
                  <td>
                    <PlayStatusBadge hours={game.hours} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-foot">
        <GSIcon name="info" size={14} />
        플레이 시간은 누적 기준이며, 금액 미확인 게임은 지출 계산에서 제외됩니다.
      </div>
    </Card>
  )
}
