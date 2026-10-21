import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, GSIcon } from '@/shared/ui'
import GameIdentity from './GameIdentity'
import PlayStatusBadge from './PlayStatusBadge'
import { money, dateLabel } from '@/shared/utils/formatters'
import { netAmount, hourlyText, hoursText } from '../model/spendingMetrics'
import { noRecordLabel } from '@/features/purchaseImport'
const BADGE =
  'inline-block ml-[6px] px-[8px] py-[2px] rounded-full bg-bg text-[11px] font-medium text-muted align-middle'
const NO_AMOUNT_LABELS ={ NO_RECORD: '구매 기록 없음', UNKNOWN: '가격 정보 없음' }
const amountText = game =>
  game.amountSource === 'FREE'
    ? '무료'
    : game.amount == null
      ? game.amountSource === 'NO_RECORD'
        ? noRecordLabel(game.acquisitionMethod)
        : NO_AMOUNT_LABELS[game.amountSource] ?? '금액 미확인'
      : money(netAmount(game))
export default function PurchasedGamesTable({
  games,
  filter,
  setFilter,
  genre,
  clearGenre,
  onSelect,
  library,
  needsHistory = false,
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
      subtitle={
        needsHistory
          ? '누적 플레이 시간을 살펴보세요. 구매 금액과 시간당 비용은 구매 내역을 가져오면 확인할 수 있어요.'
          : hasPurchaseDates
            ? '구매 금액과 누적 이용 시간을 함께 살펴보세요.'
            : '정가(추정)와 누적 플레이 시간을 함께 살펴보세요.'
      }
      className=""
      action={<span className="text-[13px] text-faint whitespace-nowrap">{filtered.length}개 게임</span>}
    >
      <div className="flex justify-between gap-[15px] items-center mt-[28px] mb-[16px] max-[1000px]:items-start max-[1000px]:flex-col">
        <div className="flex items-center gap-[17px]" role="group" aria-label="플레이 상태 필터">
          <button
            className={`py-[6px] bg-transparent text-[14px] whitespace-nowrap ${filter === 'all' ? 'text-text font-bold' : 'text-muted'}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            전체 게임
          </button>
          <button
            className={`py-[6px] bg-transparent text-[14px] whitespace-nowrap ${filter === 'unplayed' ? 'text-text font-bold' : 'text-muted'}`}
            aria-pressed={filter === 'unplayed'}
            onClick={() => setFilter('unplayed')}
          >
            미플레이
          </button>
          {genre && (
            <button className="flex items-center gap-[6px] px-[12px] py-[5px] bg-bg text-text text-[13px] rounded-full" onClick={clearGenre}>
              {genre}
              <GSIcon name="close" size={12} />
              <span className="sr-only">장르 필터 해제</span>
            </button>
          )}
        </div>
        <div className="flex gap-[12px] max-[1000px]:w-full">
          <label className="flex items-center gap-[8px] text-muted px-[14px] h-[38px] bg-bg rounded-full max-[1000px]:flex-1">
            <GSIcon name="search" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="게임 검색"
              aria-label="구매한 게임 검색"
              className="w-[130px] bg-transparent border-0 text-text outline-offset-[1px] text-[14px] placeholder:text-muted max-[1000px]:w-full"
            />
          </label>
          <select
            aria-label="게임 정렬"
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-bg border-0 rounded-full h-[38px] px-[14px] text-text text-[13px]"
          >
            {hasPurchaseDates && <option value="recent">최근 구매순</option>}
            {!needsHistory && <option value="price">구매 금액순</option>}
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
              className="inline-flex items-center gap-[8px] py-[4px] bg-transparent text-[13px] font-[650] text-primary-text hover:underline"
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
          <table className="w-full border-collapse text-[14px] text-left whitespace-nowrap max-[580px]:block max-[580px]:whitespace-normal">
            <thead className="max-[580px]:absolute max-[580px]:w-[1px] max-[580px]:h-[1px] max-[580px]:overflow-hidden max-[580px]:[clip:rect(0,0,0,0)]">
              <tr>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">게임</th>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">구매 금액</th>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">{hasPurchaseDates ? '구매일' : '최근 플레이'}</th>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">플레이 시간</th>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">시간당 비용</th>
                <th className="text-[12px] font-medium text-faint px-[10px] py-[12px] border-b border-border">상태</th>
              </tr>
            </thead>
            <tbody className="max-[580px]:block">
              {sorted.map((game, index) => (
                <tr
                  key={game.id}
                  className={`max-[580px]:grid max-[580px]:grid-cols-2 max-[580px]:gap-[10px] max-[580px]:py-[17px] max-[580px]:border-t max-[580px]:border-border ${index === sorted.length - 1 ? '' : '[&_td]:border-b [&_td]:border-border max-[580px]:[&_td]:border-b-0'}`}
                >
                  <td className="px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:[grid-column:1/-1] max-[580px]:mb-[3px]">
                    <button className="bg-transparent p-0 text-left rounded-[6px]" onClick={() => onSelect(game)}>
                      <GameIdentity game={game} />
                    </button>
                  </td>
                  <td className="px-[10px] py-[16px] font-[650] tabular-nums max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:before:content-['구매_금액'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {needsHistory ? (
                      <span className="font-normal text-faint">확인 필요</span>
                    ) : (
                      <>
                        {amountText(game)}
                        {game.amountSource === 'ESTIMATED' && <span className={BADGE}>추정</span>}
                        {game.bundleAllocated && <span className={BADGE}>번들 배분</span>}
                        {game.dlcCount > 0 && <span className={BADGE}>DLC {game.dlcCount}</span>}
                        {game.refund > 0 && <span className={BADGE}>환불 반영</span>}
                      </>
                    )}
                  </td>
                  <td className={`px-[10px] py-[16px] text-muted max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px] ${hasPurchaseDates ? "max-[580px]:before:content-['구매일']" : "max-[580px]:before:content-['최근_플레이']"}`}>
                    {hasPurchaseDates
                      ? game.purchasedAt
                        ? dateLabel(game.purchasedAt)
                        : game.acquiredAt
                          ? dateLabel(game.acquiredAt) + ' 획득'
                          : '-'
                      : game.lastPlayedAt
                        ? dateLabel(game.lastPlayedAt)
                        : '기록 없음'}
                  </td>
                  <td className="px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:before:content-['플레이_시간'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {hoursText(game.hours)}
                  </td>
                  <td className="px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:before:content-['시간당_비용'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {needsHistory ? <span className="text-faint">확인 필요</span> : hourlyText(game)}
                  </td>
                  <td className="px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px]">
                    <PlayStatusBadge hours={game.hours} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-[8px] text-faint text-[12px] pt-[20px] max-[580px]:items-start max-[580px]:leading-[1.8]">
        <GSIcon name="info" size={14} className="shrink-0" />
        플레이 시간은 누적 기준이고, 1시간 미만 플레이한 게임은 구매 금액을 그대로 시간당 비용으로 보여줘요. 금액이 없는
        게임은 지출 계산에서 제외됩니다.
      </div>
      {needsHistory && (
        <p className="pt-[8px] text-[12px] text-muted">
          구매 금액과 시간당 비용은 실제 결제 기록이 있어야 알 수 있어요.{' '}
          <Link to="/purchases" className="font-[650] text-primary-text hover:underline">구매 내역 가져오러 가기 →</Link>
        </p>
      )}
    </Card>
  )
}
