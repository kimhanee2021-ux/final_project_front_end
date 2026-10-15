import { useEffect, useMemo, useRef, useState } from 'react'
import GSIcon from '../../components/common/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import GameListCard from '../../features/games/components/GameListCard'
import GameLoadingSkeleton from '../../features/games/components/GameLoadingSkeleton'
import { useFeaturedGames } from '../../features/games/hooks/useFeaturedGames'

// 백엔드가 페이지네이션 없이 전체 배열을 한 번에 내려주므로(/api/games/featured),
// 화면에서는 이미 받은 배열을 PAGE_SIZE만큼씩 점진적으로 더 보여주는 방식으로 무한 스크롤을 구현한다.
const PAGE_SIZE = 24

export default function ExplorePage() {
  const { query, setQuery, t } = useGameSense()
  const [view, setView] = useState('grid')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)
  const { games, loading, error, retry } = useFeaturedGames()

  const filtered = useMemo(() => {
    const name = query.trim().toLowerCase()
    return name ? games.filter(game => game.name.toLowerCase().includes(name)) : games
  }, [games, query])
  const visibleGames = filtered.slice(0, visibleCount)
  const last = visibleCount >= filtered.length

  // 검색어가 바뀌면 다시 처음 PAGE_SIZE개부터 보여준다 (렌더 중 조정 — 리액트가 공식으로 지원하는 "prop 변경에 따른 state 초기화" 패턴).
  const [previousQuery, setPreviousQuery] = useState(query)
  if (previousQuery !== query) {
    setPreviousQuery(query)
    setVisibleCount(PAGE_SIZE)
  }

  useEffect(() => {
    if (!sentinelRef.current || last) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setVisibleCount(count => count + PAGE_SIZE)
      },
      { rootMargin: '400px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [last])

  const resetFilters = () => setQuery('')
  // 실제 카드 목록과 로딩 스켈레톤이 같은 격자를 쓰도록 한 곳에서 만든다.
  const gridClass = `grid gap-[11px_12px] max-[600px]:grid-cols-1 max-[600px]:gap-[11px] ${view === 'list' ? 'grid-cols-1' : 'grid-cols-2 min-[1900px]:grid-cols-4 max-[1350px]:grid-cols-2'}`

  return (
    <section className="min-w-0 pt-[26px]" aria-labelledby="gs-catalog-title" aria-busy={loading}>
      <div className="flex items-start justify-between gap-[16px] items-center mb-[26px]">
        <div>
          <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
          <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-catalog-title">
            {t('Featured Games', '추천 게임')}
            {!loading && !error && <span className="inline-block ml-[12px] align-middle text-[13px] p-[4px_8px] bg-gs-raised text-gs-muted rounded-[6px] max-[600px]:ml-[8px] max-[600px]:text-[11px]">{filtered.length.toLocaleString()}</span>}
          </h1>
          <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">스팀이 지금 추천하는 게임들을 둘러보세요.</p>
        </div>
        <div className="flex border border-gs-border rounded-[20px] h-[31px] overflow-hidden shrink-0 max-[600px]:h-[32px]" role="group" aria-label="게임 목록 보기 방식">
          <button
            className={`w-[32px] grid place-items-center bg-transparent text-gs-muted p-0 max-[600px]:w-[30px] ${view === 'grid' ? 'text-gs-text bg-gs-hover' : ''}`}
            aria-label="그리드 보기"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <GSIcon name="grid" size={17} className={view === 'grid' ? 'stroke-2' : ''} />
          </button>
          <button
            className={`w-[32px] grid place-items-center bg-transparent text-gs-muted p-0 max-[600px]:w-[30px] ${view === 'list' ? 'text-gs-text bg-gs-hover' : ''}`}
            aria-label="리스트 보기"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            <GSIcon name="list" size={20} />
          </button>
        </div>
      </div>
      {query.trim() && !loading && !error && (
        <p className="m-[-3px_0_16px] text-gs-muted text-[12px]" aria-live="polite">
          “{query.trim()}” 검색 결과 <strong className="text-gs-mint ml-[7px]">{filtered.length.toLocaleString()}개</strong>
        </p>
      )}
      {loading ? (
        <GameLoadingSkeleton view={view} className={gridClass} />
      ) : error && !games.length ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="alert">
          <GSIcon name="info" size={38} />
          <h3 className="text-[18px] mt-[18px]">게임 목록을 불러오지 못했어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">{error}</p>
          <button className="gs-primary-button" onClick={retry}>
            다시 시도
          </button>
        </div>
      ) : visibleGames.length > 0 ? (
        <>
          <div className={gridClass}>
            {visibleGames.map(game => (
              <GameListCard key={game.id} game={game} view={view} />
            ))}
          </div>
          {!last && <div ref={sentinelRef} aria-hidden="true" className="h-[1px]" />}
        </>
      ) : (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="search" size={38} />
          <h3 className="text-[18px] mt-[18px]">검색 결과가 없어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">다른 검색어를 입력해보세요.</p>
          <button className="gs-primary-button" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      )}
    </section>
  )
}
