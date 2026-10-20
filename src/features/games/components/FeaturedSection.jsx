import { useMemo } from 'react'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { useGameSense } from '@/shared/state'
import { gameGridClass } from '../model/gameGridClass'
import { searchTextOf } from '@/shared/utils/gameTags'
import { useFeaturedGames } from '../hooks/useFeaturedGames'
import { useInfiniteSlice } from '../hooks/useInfiniteSlice'
import CatalogMessage from './CatalogMessage'
import GameGrid from './GameGrid'
import GameLoadingSkeleton from './GameLoadingSkeleton'
import SectionHeader from './SectionHeader'

// 백엔드가 페이지네이션 없이 전체 배열을 한 번에 내려주므로(/api/games/featured),
// 이미 받은 배열을 PAGE_SIZE만큼씩 점진적으로 더 보여주는 방식으로 무한 스크롤을 구현한다.
const PAGE_SIZE = 24

const NO_EXTRA_GAMES = []

// 스팀 추천 게임 전체 목록 + 검색어 필터.
// extraGames: 검색할 때 함께 뒤질 다른 목록(트렌드 게임). 같은 게임(appId)은 한 번만 나온다.
export default function FeaturedSection({ view, className = '', extraGames = NO_EXTRA_GAMES }) {
  const { query, setQuery, t } = useGameSense()
  const { games, loading, error, retry } = useFeaturedGames()

  const filtered = useMemo(() => {
    if (!query.trim()) return games
    const pool = [...games, ...extraGames].filter((game, index, list) => list.findIndex(item => item.id === game.id) === index)
    return pool.filter(game => matchesSearch(searchTextOf(game), query))
  }, [games, extraGames, query])
  const { visibleItems, hasMore, sentinelRef } = useInfiniteSlice(filtered, PAGE_SIZE, query)

  let body
  if (loading) {
    body = <GameLoadingSkeleton view={view} className={gameGridClass(view)} />
  } else if (error && !games.length) {
    body = <CatalogMessage role="alert" icon="info" title="게임 목록을 불러오지 못했어요" description={error} action={{ label: '다시 시도', onClick: retry }} />
  } else if (visibleItems.length > 0) {
    body = (
      <>
        <GameGrid games={visibleItems} view={view} />
        {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-[1px]" />}
      </>
    )
  } else {
    body = <CatalogMessage icon="search" title="검색 결과가 없어요" description="다른 검색어를 입력해보세요." action={{ label: '필터 초기화', onClick: () => setQuery('') }} />
  }

  return (
    <section className={`min-w-0 ${className}`} aria-labelledby="gs-featured-title" aria-busy={loading}>
      <SectionHeader
        id="gs-featured-title"
        title={t('Featured Games', '추천 게임')}
        count={!loading && !error ? filtered.length : null}
        description="스팀이 지금 추천하는 게임들을 둘러보세요."
      />
      {query.trim() && !loading && !error && (
        <p className="mb-[20px] text-muted text-[14px]" aria-live="polite">
          “{query.trim()}” 검색 결과 <strong className="text-text ml-[6px]">{filtered.length.toLocaleString()}개</strong>
        </p>
      )}
      {body}
    </section>
  )
}
