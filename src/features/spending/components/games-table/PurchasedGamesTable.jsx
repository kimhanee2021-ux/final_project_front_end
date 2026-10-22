import { useState } from 'react'
import { Card, EmptyState, GSIcon } from '@/shared/ui'
import PlayFilterTabs from './PlayFilterTabs'
import GamesTableToolbar from './GamesTableToolbar'
import GameRow from './GameRow'
import { filterByPlayState, isUnplayedPaid, maxPlayHours, searchGames, sortGames } from '../../model/gamesTable'

// 열 제목: 사이트 보라 테마의 옅은 띠. 양 끝 칸만 둥글게 깎아 한 줄짜리 알약처럼 보이게 한다.
const TH = 'text-[12px] font-[650] text-primary-text bg-primary-soft px-[10px] py-[12px] first:rounded-l-[12px] last:rounded-r-[12px]'

function titleOf({ library, hasPurchaseDates }) {
  if (library) return '내 게임 라이브러리'
  return hasPurchaseDates ? '구매한 게임, 얼마나 즐겼을까요?' : '보유 게임, 얼마나 즐겼을까요?'
}

function subtitleOf({ needsHistory, hasPurchaseDates }) {
  if (needsHistory) return '누적 플레이 시간을 살펴보세요. 구매 금액과 시간당 비용은 구매 내역을 가져오면 확인할 수 있어요.'
  return hasPurchaseDates ? '구매 금액과 누적 이용 시간을 함께 살펴보세요.' : '정가(추정)와 누적 플레이 시간을 함께 살펴보세요.'
}

// 보유(구매한) 게임 표: 플레이 상태 탭 · 검색 · 정렬 + 게임별 금액/날짜/플레이 시간/시간당 비용.
// filter는 바깥이 들고 있다 (AI 분석의 미플레이 패널이 표를 미플레이로 바꿔 열 수 있게).
// library: 구매 내역 페이지 제목, needsHistory: 구매 내역이 없어 금액 칸을 "확인 필요"로, scrollable: 긴 표를 칸 안에서 스크롤.
export default function PurchasedGamesTable({ games, filter, setFilter, onSelect, library, needsHistory = false, scrollable = false, icon }) {
  // 스팀 연동 분석은 구매일이 없으므로 구매일 열/정렬 대신 최근 플레이를 보여준다
  const hasPurchaseDates = games.some(game => game.purchasedAt)
  const [sort, setSort] = useState(hasPurchaseDates ? 'recent' : 'hours')
  const [query, setQuery] = useState('')
  // 탭 옆 개수가 검색 결과와 맞도록, 플레이 상태 필터만 빼고 먼저 거른다
  const searched = searchGames(games, query)
  const visible = sortGames(filterByPlayState(searched, filter), sort)
  const tabs = [
    { key: 'all', label: '전체 게임', count: searched.length },
    { key: 'unplayed', label: '미플레이', count: searched.filter(isUnplayedPaid).length },
  ]
  const maxHours = maxPlayHours(games)
  const reset = () => {
    setQuery('')
    setFilter('all')
  }
  return (
    <Card
      icon={icon}
      title={titleOf({ library, hasPurchaseDates })}
      subtitle={subtitleOf({ needsHistory, hasPurchaseDates })}
      className=""
      action={<span className="text-[13px] text-faint whitespace-nowrap">{visible.length}개 게임</span>}
    >
      <div className="flex justify-between gap-[15px] items-center mt-[28px] mb-[16px] max-[1000px]:items-start max-[1000px]:flex-col">
        <div className="flex items-center gap-[12px] flex-wrap">
          <PlayFilterTabs tabs={tabs} active={filter} onSelect={setFilter} />
        </div>
        <GamesTableToolbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          hasPurchaseDates={hasPurchaseDates}
          needsHistory={needsHistory}
        />
      </div>
      {!visible.length ? (
        <EmptyState
          title="조건에 맞는 게임이 없어요"
          description="검색어 또는 필터를 변경해 보세요."
          action={
            <button
              className="inline-flex items-center gap-[8px] py-[4px] bg-transparent text-[13px] font-[650] text-primary-text hover:underline"
              onClick={reset}
            >
              검색과 필터 초기화
              <GSIcon name="refresh" size={15} />
            </button>
          }
        />
      ) : (
        // scrollable: 표가 길면 이 칸 안에서만 세로로 스크롤하고, 열 제목은 위에 붙어 있게 한다 (AI 분석 페이지에서 쓴다).
        <div className={`overflow-x-auto ${scrollable ? 'max-h-[480px] overflow-y-auto overscroll-contain [&_th]:sticky [&_th]:top-0 [&_th]:z-[1]' : ''}`}>
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
              {visible.map((game, index) => (
                <GameRow
                  key={game.id}
                  game={game}
                  last={index === visible.length - 1}
                  hasPurchaseDates={hasPurchaseDates}
                  needsHistory={needsHistory}
                  maxHours={maxHours}
                  onSelect={onSelect}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {needsHistory && <p className="pt-[8px] text-[12px] text-muted">구매 금액과 시간당 비용은 실제 결제 기록이 있어야 알 수 있어요.</p>}
    </Card>
  )
}
