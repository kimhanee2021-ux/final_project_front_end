import { useState } from 'react'
import { Card, EmptyState, GSIcon } from '@/shared/ui'
import GameIdentity from './GameIdentity'
import PlaytimeCell from './PlaytimeCell'
import { money, dateLabel } from '@/shared/utils/formatters'
import { netAmount, hourlyText, hourlyTone } from '../model/spendingMetrics'
import { noRecordLabel } from '@/features/purchaseImport'
const BADGE =
  'inline-block ml-[6px] px-[8px] py-[2px] rounded-full bg-bg text-[11px] font-medium text-muted align-middle'
// 열 제목: 사이트 보라 테마의 옅은 띠. 양 끝 칸만 둥글게 깎아 한 줄짜리 알약처럼 보이게 한다.
const TH =
  'text-[12px] font-[650] text-primary-text bg-primary-soft px-[10px] py-[12px] first:rounded-l-[12px] last:rounded-r-[12px]'
// 시간당 비용 알약 색: 쌀수록 초록, 비쌀수록 복숭아색 (AI 분석 '게임 가성비' 구간과 같은 기준)
const HOURLY_TONES = {
  great: 'bg-mint-bg text-mint-text',
  good: 'bg-primary-soft text-primary-text',
  fair: 'bg-bg text-text',
  poor: 'bg-peach-bg text-peach-text',
}
const isUnplayedPaid = game => game.hours === 0 && netAmount(game) > 0
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
  scrollable = false,
  icon,
}) {
  // 스팀 연동 분석은 구매일이 없으므로 구매일 열/정렬 대신 최근 플레이를 보여준다
  const hasPurchaseDates = games.some(game => game.purchasedAt)
  const [sort, setSort] = useState(hasPurchaseDates ? 'recent' : 'hours')
  const [query, setQuery] = useState('')
  // 탭 옆 개수가 검색·장르 결과와 맞도록, 플레이 상태 필터만 빼고 먼저 거른다
  const base = games.filter(
    game => (!genre || game.genre === genre) && game.name.toLowerCase().includes(query.toLowerCase())
  )
  const filtered = filter === 'unplayed' ? base.filter(isUnplayedPaid) : base
  const tabs = [
    { key: 'all', label: '전체 게임', count: base.length },
    { key: 'unplayed', label: '미플레이', count: base.filter(isUnplayedPaid).length },
  ]
  // 플레이 시간 미니 막대의 기준(100%): 보유 게임 중 가장 오래 한 게임
  const maxHours = Math.max(0, ...games.map(game => game.hours || 0))
  const sorted = [...filtered].sort((a, b) =>
    sort === 'price'
      ? (netAmount(b) ?? -1) - (netAmount(a) ?? -1)
      : sort === 'hours'
        ? (b.hours ?? -1) - (a.hours ?? -1)
        : (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? '')
  )
  return (
    <Card
      icon={icon}
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
        <div className="flex items-center gap-[12px] flex-wrap">
          {/* 세그먼트 탭: 옅은 틀 안에서 고른 탭만 흰 카드처럼 떠오른다 */}
          <div className="inline-flex p-[4px] rounded-full bg-bg" role="group" aria-label="플레이 상태 필터">
            {tabs.map(tab => {
              const active = filter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(tab.key)}
                  className={`inline-flex items-center gap-[8px] h-[34px] px-[16px] rounded-full text-[13px] whitespace-nowrap transition-[background,color,box-shadow] duration-200 ${
                    active ? 'bg-surface text-primary-text font-[700] shadow-[var(--shadow)]' : 'text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`min-w-[22px] px-[6px] py-[1px] rounded-full text-[11px] font-[650] tabular-nums ${
                      active ? 'bg-primary-soft text-primary-text' : 'bg-surface text-faint'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
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
        // scrollable: 표가 길면 이 칸 안에서만 세로로 스크롤하고, 열 제목은 위에 붙어 있게 한다 (AI 분석 페이지에서 쓴다).
        <div
          className={`overflow-x-auto ${scrollable ? 'max-h-[480px] overflow-y-auto overscroll-contain [&_th]:sticky [&_th]:top-0 [&_th]:z-[1]' : ''}`}
        >
          <table className="w-full border-separate border-spacing-0 text-[14px] text-left whitespace-nowrap max-[580px]:block max-[580px]:whitespace-normal">
            <thead className="max-[580px]:absolute max-[580px]:w-[1px] max-[580px]:h-[1px] max-[580px]:overflow-hidden max-[580px]:[clip:rect(0,0,0,0)]">
              <tr>
                <th className={TH}>게임</th>
                <th className={TH}>구매 금액</th>
                <th className={TH}>{hasPurchaseDates ? '구매일' : '최근 플레이'}</th>
                <th className={TH}>플레이 시간</th>
                <th className={TH}>시간당 비용</th>
              </tr>
            </thead>
            <tbody className="max-[580px]:block">
              {sorted.map((game, index) => (
                <tr
                  key={game.id}
                  className={`transition-colors [&:hover_td]:bg-surface-soft max-[580px]:grid max-[580px]:grid-cols-2 max-[580px]:gap-[10px] max-[580px]:py-[17px] max-[580px]:border-t max-[580px]:border-border ${index === sorted.length - 1 ? '' : '[&_td]:border-b [&_td]:border-border max-[580px]:[&_td]:border-b-0'}`}
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
                    <PlaytimeCell hours={game.hours} maxHours={maxHours} />
                  </td>
                  <td className="px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px] max-[580px]:before:content-['시간당_비용'] max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]">
                    {needsHistory ? (
                      <span className="text-faint">확인 필요</span>
                    ) : hourlyTone(game) ? (
                      <span className={`inline-block px-[10px] py-[3px] rounded-full text-[13px] font-[650] tabular-nums whitespace-nowrap ${HOURLY_TONES[hourlyTone(game)]}`}>
                        {hourlyText(game)}
                      </span>
                    ) : (
                      <span className="text-muted">{hourlyText(game)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {needsHistory && (
        <p className="pt-[8px] text-[12px] text-muted">
          구매 금액과 시간당 비용은 실제 결제 기록이 있어야 알 수 있어요.
        </p>
      )}
    </Card>
  )
}
