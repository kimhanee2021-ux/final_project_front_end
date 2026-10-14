import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import GameListCard from '../../features/games/components/GameListCard'
import { useGames } from '../../features/games/hooks/useGames'
import { GAME_GENRES } from '../../features/games/gameModel'

export default function ExplorePage() {
  const { query, setQuery, t } = useGameSense()
  const [params, setParams] = useSearchParams()
  const genre = GAME_GENRES.includes(params.get('genre')) ? params.get('genre') : 'All'
  const [view, setView] = useState('grid')
  const { games, total, last, error, searching, loading, loadingMore, loadMore, retry } = useGames({
    query,
    genre: genre === 'All' ? '' : genre,
  })
  const setGenre = value =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous)
        if (value === 'All') next.delete('genre')
        else next.set('genre', value)
        return next
      },
      { replace: true }
    )
  const resetFilters = () => {
    setQuery('')
    setParams({})
  }

  return (
    <section className="min-w-0 pt-[26px]" aria-labelledby="gs-catalog-title" aria-busy={loading}>
      <div className="flex items-start justify-between gap-[16px] items-center mb-[26px]">
        <div>
          <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
          <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-catalog-title">
            {t('Explore Games', '게임 탐색')}
            {!loading && !error && <span className="inline-block ml-[12px] align-middle text-[13px] p-[4px_8px] bg-gs-raised text-gs-muted rounded-[6px] max-[600px]:ml-[8px] max-[600px]:text-[11px]">{total.toLocaleString()}</span>}
          </h1>
          <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">새로운 세계를 발견해보세요.</p>
        </div>
      </div>
      <div className="flex items-center gap-[13px] m-[0_0_17px] min-w-0 max-[600px]:gap-[9px] max-[600px]:mb-[15px]">
        <div
          className="flex gap-[7px] overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-[2px_1px_3px] [&_button]:border [&_button]:border-gs-border [&_button]:rounded-[25px] [&_button]:bg-[linear-gradient(0deg,transparent,#8796a00c),var(--gs-raised)] [&_button]:p-[6px_15px] [&_button]:text-[10px] [&_button]:whitespace-nowrap [&_button]:min-h-[31px] [&_button:hover]:border-gs-mint [&_button:disabled]:opacity-45 [&_button:disabled]:cursor-not-allowed min-[1600px]:[&_button]:text-[11px] min-[1600px]:[&_button]:p-[6px_17px] max-[600px]:[&_button]:p-[6px_14px] max-[600px]:[&_button]:min-h-[32px] max-[600px]:[&_button]:text-[10px]"
          role="group"
          aria-label="장르 필터"
        >
          {GAME_GENRES.map(item => (
            <button
              key={item}
              className={genre === item ? 'bg-gs-accent! text-[#04291f]! font-[650]! border-gs-accent!' : ''}
              aria-pressed={genre === item}
              disabled={searching}
              onClick={() => setGenre(item)}
            >
              {item === 'All' ? t('All', '전체') : item}
            </button>
          ))}
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
      {searching && !loading && !error && (
        <p className="m-[-3px_0_16px] text-gs-muted text-[12px]" aria-live="polite">
          “{query.trim()}” 검색 결과 <strong className="text-gs-mint ml-[7px]">{total.toLocaleString()}개</strong>
          {genre !== 'All' && ' · 검색 중에는 장르 필터가 적용되지 않아요.'}
        </p>
      )}
      {loading ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="status">
          <GSIcon name="search" size={38} />
          <h3 className="text-[18px] mt-[18px]">게임을 불러오는 중이에요</h3>
        </div>
      ) : error && !games.length ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="alert">
          <GSIcon name="info" size={38} />
          <h3 className="text-[18px] mt-[18px]">게임 목록을 불러오지 못했어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">{error}</p>
          <button className="gs-primary-button" onClick={retry}>
            다시 시도
          </button>
        </div>
      ) : games.length > 0 ? (
        <>
          <div className={`grid gap-[11px_12px] max-[600px]:grid-cols-1 max-[600px]:gap-[11px] ${view === 'list' ? 'grid-cols-1' : 'grid-cols-2 min-[1900px]:grid-cols-4 max-[1350px]:grid-cols-2'}`}>
            {games.map(game => (
              <GameListCard key={game.id} game={game} view={view} />
            ))}
          </div>
          {error && (
            <p className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]" role="alert">
              <GSIcon name="info" size={20} />
              {error}
            </p>
          )}
          {!last && (
            <div className="flex justify-center p-[26px_0_8px]">
              <button
                className="gs-secondary-button"
                onClick={loadMore}
                disabled={loadingMore}
                aria-busy={loadingMore}
              >
                {loadingMore ? '불러오는 중...' : `더 보기 (${games.length.toLocaleString()} / ${total.toLocaleString()})`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="search" size={38} />
          <h3 className="text-[18px] mt-[18px]">검색 결과가 없어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">다른 검색어나 장르를 선택해보세요.</p>
          <button className="gs-primary-button" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      )}
    </section>
  )
}
