import { EmptyState } from '@/shared/ui'
import Understood from './Understood'
import MatchedGame from './MatchedGame'
import SearchResultCard from './SearchResultCard'

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-[24px_20px]'

function LoadingGrid() {
  return (
    <div className={GRID} role="status" aria-label="AI가 게임을 찾고 있어요">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="grid gap-[10px]" aria-hidden="true">
          <div className="aspect-[460/215] rounded-[16px] bg-bg animate-[pulse_1.4s_infinite_alternate]" />
          <div className="h-[18px] w-[70%] rounded-[8px] bg-bg animate-[pulse_1.4s_infinite_alternate]" />
        </div>
      ))}
    </div>
  )
}

// 검색 결과: AI가 이해한 키워드 -> 말한 게임(있으면) -> 비슷한 게임 목록. 게임을 누르면 onSelect(appId)
export default function SearchResults({ search, selectedId, onSelect }) {
  if (search.loading) return <LoadingGrid />
  if (search.error) return <p className="text-[14px] text-muted" role="alert">{search.error}</p>
  const result = search.result
  if (!result) return null
  // 다음 소식·멈춤·계속처럼 브리핑 조작이었던 문장은 검색 결과가 없다
  if (!result.matchedGame && !result.games.length && ['NEXT_NEWS', 'PAUSE', 'RESUME'].includes(result.intent)) return null
  const selected = appId => String(appId) === selectedId
  return (
    <div className="grid gap-[20px]">
      <Understood result={result} />
      {result.matchedGame && (
        <MatchedGame game={result.matchedGame} selected={selected(result.matchedGame.appId)} onSelect={onSelect} />
      )}
      {result.games.length > 0 && (
        <>
          {result.matchedGame && <h3 className="!m-0 text-[15px] font-[700]">{result.matchedGame.name}와(과) 비슷한 게임</h3>}
          <div className={GRID}>
            {result.games.map(game => (
              <SearchResultCard key={game.appId} game={game} searchTags={result.tags} selected={selected(game.appId)} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}
      {!result.matchedGame && !result.games.length && (
        <EmptyState title="조건에 맞는 게임을 찾지 못했어요" description="문장을 조금 바꿔서 다시 찾아보세요." />
      )}
    </div>
  )
}
