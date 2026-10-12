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
      className="pb-0"
      action={<span className="text-[10px] text-muted bg-surface-soft py-[5px] px-[9px] rounded-[6px] whitespace-nowrap">{filtered.length}개 게임</span>}
    >
      <div className="flex justify-between gap-[15px] items-center mt-[22px] mb-[17px] max-[1000px]:items-start max-[1000px]:flex-col">
        <div className="flex items-center gap-[17px]" role="group" aria-label="플레이 상태 필터">
          <button
            className={`py-[6px] bg-transparent text-[11px] whitespace-nowrap ${filter === 'all' ? 'text-primary-text font-bold' : 'text-muted'}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            전체 게임
          </button>
          <button
            className={`py-[6px] bg-transparent text-[11px] whitespace-nowrap ${filter === 'unplayed' ? 'text-primary-text font-bold' : 'text-muted'}`}
            aria-pressed={filter === 'unplayed'}
            onClick={() => setFilter('unplayed')}
          >
            미플레이
          </button>
          {genre && (
            <button className="flex items-center gap-[6px] px-[7px] py-[3px] bg-primary-soft text-primary-text rounded-[5px]" onClick={clearGenre}>
              {genre}
              <GSIcon name="close" size={12} />
              <span className="sr-only">장르 필터 해제</span>
            </button>
          )}
        </div>
        <div className="flex gap-[12px] max-[1000px]:w-full">
          <label className="flex items-center gap-[7px] text-muted px-[9px] py-[6px] bg-surface-soft border border-border rounded-[7px] max-[1000px]:flex-1">
            <GSIcon name="search" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="게임 검색"
              aria-label="구매한 게임 검색"
              className="w-[110px] bg-transparent border-0 text-text outline-offset-[1px] text-[11px] placeholder:text-muted max-[1000px]:w-full"
            />
          </label>
          <select
            aria-label="게임 정렬"
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-surface border border-border rounded-[7px] p-[7px] text-subtle text-[10px]"
          >
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
              className="inline-flex items-center gap-[8px] py-[4px] bg-transparent text-[10px] font-[650] text-primary-text hover:underline"
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] text-left whitespace-nowrap max-[580px]:block max-[580px]:whitespace-normal">
            <thead className="max-[580px]:absolute max-[580px]:w-[1px] max-[580px]:h-[1px] max-[580px]:overflow-hidden max-[580px]:[clip:rect(0,0,0,0)]">
              <tr>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft rounded-l-[6px] pl-[12px]">게임</th>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft">구매 금액</th>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft">구매일</th>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft">플레이 시간</th>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft">시간당 비용</th>
                <th className="text-[10px] font-medium text-muted px-[10px] py-[11px] bg-surface-soft rounded-r-[6px]">상태</th>
              </tr>
            </thead>
            <tbody className="max-[580px]:block">
              {sorted.map((game, index) => (
                <tr
                  key={game.id}
                  className={`hover:bg-surface-soft max-[580px]:grid max-[580px]:grid-cols-2 max-[580px]:gap-[10px] max-[580px]:py-[17px] max-[580px]:border-t max-[580px]:border-border ${index === sorted.length - 1 ? '' : '[&_td]:border-b [&_td]:border-border max-[580px]:[&_td]:border-b-0'}`}
                >
                  <td className="px-[10px] py-[13px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px] max-[580px]:[grid-column:1/-1] max-[580px]:mb-[3px]">
                    <button className="bg-transparent p-0 text-left rounded-[6px]" onClick={() => onSelect(game)}>
                      <GameIdentity game={game} />
                    </button>
                  </td>
                  <td className="px-[10px] py-[13px] font-[650] tabular-nums max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px] max-[580px]:before:content-['구매_금액'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[9px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">{money(netAmount(game))}</td>
                  <td className="px-[10px] py-[13px] text-muted max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px] max-[580px]:before:content-['구매일'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[9px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">{dateLabel(game.purchasedAt)}</td>
                  <td className="px-[10px] py-[13px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px] max-[580px]:before:content-['플레이_시간'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[9px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {game.hours == null ? '시간 미확인' : number(game.hours) + '시간'}
                  </td>
                  <td className="px-[10px] py-[13px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px] max-[580px]:before:content-['시간당_비용'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[9px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {game.amount == null
                      ? '금액 미확인'
                      : game.hours > 0
                        ? money(netAmount(game) / game.hours)
                        : '계산 전'}
                  </td>
                  <td className="px-[10px] py-[13px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[11px]">
                    <PlayStatusBadge hours={game.hours} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-[7px] text-muted text-[9px] py-[15px] border-t border-border max-[580px]:items-start max-[580px]:leading-[1.8]">
        <GSIcon name="info" size={14} className="shrink-0" />
        플레이 시간은 누적 기준이며, 금액 미확인 게임은 지출 계산에서 제외됩니다.
      </div>
    </Card>
  )
}
