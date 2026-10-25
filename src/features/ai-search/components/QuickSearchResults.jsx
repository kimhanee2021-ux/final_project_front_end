import { GameImage } from '@/shared/ui'
import { tagLabel } from '@/shared/utils/gameTags'

const MAX_ROWS = 6

function LoadingRows() {
  return (
    <ul className="list-none m-0 p-0 grid gap-[4px]" role="status" aria-label="AI가 관련 게임을 찾고 있어요">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-center gap-[12px] p-[8px]" aria-hidden="true">
          <span className="w-[92px] aspect-[460/215] rounded-[10px] bg-gs-raised animate-[pulse_1.4s_infinite_alternate]" />
          <span className="h-[14px] w-[55%] rounded-[7px] bg-gs-raised animate-[pulse_1.4s_infinite_alternate]" />
        </li>
      ))}
    </ul>
  )
}

// 헤더 검색 드롭다운용 AI 검색 결과: 찾던 게임(있으면)과 관련 게임을 한 줄씩 짧게 보여준다. 누르면 onSelect(appId)
export default function QuickSearchResults({ search, onSelect }) {
  if (search.loading) return <LoadingRows />
  if (search.error) return <p className="m-0 p-[10px] text-[13px] text-gs-muted" role="alert">{search.error}</p>
  const result = search.result
  if (!result) return null
  const seen = new Set()
  const games = [result.matchedGame, ...result.games]
    .filter(game => game && !seen.has(game.appId) && seen.add(game.appId))
    .slice(0, MAX_ROWS)
  if (!games.length) return <p className="m-0 p-[10px] text-[13px] text-gs-muted">관련 게임을 찾지 못했어요. 문장을 조금 바꿔 보세요.</p>
  return (
    <ul className="list-none m-0 p-0 grid gap-[2px]" aria-label="AI 관련 게임">
      {games.map(game => {
        const matched = game.appId === result.matchedGame?.appId
        const tags = (game.steamTags.length ? game.steamTags : game.genres).slice(0, 2)
        return (
          <li key={game.appId}>
            <button
              type="button"
              onClick={() => onSelect(game.appId)}
              className="w-full flex items-center gap-[12px] p-[8px] rounded-[14px] bg-transparent text-left hover:bg-gs-hover focus-visible:bg-gs-hover"
            >
              <GameImage className="block shrink-0 w-[92px] aspect-[460/215] rounded-[10px] object-cover" src={game.image} iconSize={18} />
              <span className="min-w-0 flex-1 grid gap-[3px]">
                <span className="flex items-center gap-[6px] min-w-0">
                  {matched && <span className="shrink-0 px-[7px] py-[1px] rounded-full bg-gs-accent/15 text-gs-accent text-[11px] font-[700]">찾던 게임</span>}
                  <strong className="truncate text-[14px] font-[600] text-gs-text">{game.name}</strong>
                </span>
                <span className="truncate text-[12px] text-gs-muted">
                  {[...tags.map(tagLabel), game.positiveRate != null ? `긍정 ${Math.round(Number(game.positiveRate))}%` : null].filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
