import { useState } from 'react'
import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import GSIcon from '../../../components/common/GSIcon'
import GameIdentity from './GameIdentity'
import PlayStatusBadge from './PlayStatusBadge'
import { money, dateLabel } from '../../../utils/formatters'
import { netAmount, hourlyText, hoursText } from '../spendingMetrics'
const NO_AMOUNT_LABELS = { NO_RECORD: '구매 기록 없음', UNKNOWN: '가격 정보 없음' }
const amountText = game =>
  game.amountSource === 'FREE'
    ? '무료'
    : game.amount == null
      ? NO_AMOUNT_LABELS[game.amountSource] ?? '금액 미확인'
      : money(netAmount(game))
export default function PurchasedGamesTable({
  games,
  filter,
  setFilter,
  genre,
  clearGenre,
  onSelect,
  library,
}) {
  // 스팀 연동 분석은 구매일이 없으므로 구매일 열/정렬 대신 최근 플레이를 보여준다
  const hasPurchaseDates = games.some(game => game.purchasedAt)
  const [sort, setSort] = useState(hasPurchaseDates ? 'recent' : 'hours')
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
        : (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? '')
  )
  return (
    <Card
      title={library ? '내 게임 라이브러리' : hasPurchaseDates ? '구매한 게임, 얼마나 즐겼을까요?' : '보유 게임, 얼마나 즐겼을까요?'}
      subtitle={hasPurchaseDates ? '구매 금액과 누적 이용 시간을 함께 살펴보세요.' : '정가(추정)와 누적 플레이 시간을 함께 살펴보세요.'}
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
            {hasPurchaseDates && <option value="recent">최근 구매순</option>}
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
          <table className={hasPurchaseDates ? '' : 'no-purchase-dates'}>
            <thead>
              <tr>
                <th>게임</th>
                <th>구매 금액</th>
                <th>{hasPurchaseDates ? '구매일' : '최근 플레이'}</th>
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
                  <td className="amount-cell">
                    {amountText(game)}
                    {game.amountSource === 'ESTIMATED' && <span className="estimate-badge">추정</span>}
                    {game.bundleAllocated && <span className="estimate-badge">번들 배분</span>}
                    {game.dlcCount > 0 && <span className="estimate-badge">DLC {game.dlcCount}</span>}
                    {game.refund > 0 && <span className="estimate-badge">환불 반영</span>}
                  </td>
                  <td className="muted">
                    {hasPurchaseDates
                      ? game.purchasedAt
                        ? dateLabel(game.purchasedAt)
                        : '-'
                      : game.lastPlayedAt
                        ? dateLabel(game.lastPlayedAt)
                        : '기록 없음'}
                  </td>
                  <td>{hoursText(game.hours)}</td>
                  <td>{hourlyText(game)}</td>
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
        플레이 시간은 누적 기준이고, 시간당 비용은 1시간 이상 플레이한 게임부터 계산해요. 금액이 없는 게임은 지출 계산에서
        제외됩니다.
      </div>
    </Card>
  )
}
