import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/discover/GSIcon'
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
    <section className="gs-catalog gs-full-catalog" aria-labelledby="gs-catalog-title" aria-busy={loading}>
      <div className="gs-section-heading">
        <div>
          <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
          <h1 id="gs-catalog-title">
            {t('Explore Games', '게임 탐색')}
            {!loading && !error && <span className="gs-result-count">{total.toLocaleString()}</span>}
          </h1>
          <p>새로운 세계를 발견해보세요.</p>
        </div>
      </div>
      <div className="gs-catalog-toolbar">
        <div className="gs-genre-tabs" role="group" aria-label="장르 필터">
          {GAME_GENRES.map(item => (
            <button
              key={item}
              className={genre === item ? 'active' : ''}
              aria-pressed={genre === item}
              disabled={searching}
              onClick={() => setGenre(item)}
            >
              {item === 'All' ? t('All', '전체') : item}
            </button>
          ))}
        </div>
        <div className="gs-view-toggle" role="group" aria-label="게임 목록 보기 방식">
          <button
            className={view === 'grid' ? 'active' : ''}
            aria-label="그리드 보기"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <GSIcon name="grid" size={17} />
          </button>
          <button
            className={view === 'list' ? 'active' : ''}
            aria-label="리스트 보기"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            <GSIcon name="list" size={20} />
          </button>
        </div>
      </div>
      {searching && !loading && !error && (
        <p className="gs-search-summary" aria-live="polite">
          “{query.trim()}” 검색 결과 <strong>{total.toLocaleString()}개</strong>
          {genre !== 'All' && ' · 검색 중에는 장르 필터가 적용되지 않아요.'}
        </p>
      )}
      {loading ? (
        <div className="gs-empty" role="status">
          <GSIcon name="search" size={38} />
          <h3>게임을 불러오는 중이에요</h3>
        </div>
      ) : error && !games.length ? (
        <div className="gs-empty" role="alert">
          <GSIcon name="info" size={38} />
          <h3>게임 목록을 불러오지 못했어요</h3>
          <p>{error}</p>
          <button className="gs-primary-button" onClick={retry}>
            다시 시도
          </button>
        </div>
      ) : games.length > 0 ? (
        <>
          <div className={`gs-game-grid ${view === 'list' ? 'gs-list-view' : ''}`}>
            {games.map(game => (
              <GameListCard key={game.id} game={game} />
            ))}
          </div>
          {error && (
            <p className="gs-inline-note" role="alert">
              <GSIcon name="info" size={20} />
              {error}
            </p>
          )}
          {!last && (
            <div className="gs-load-more">
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
        <div className="gs-empty">
          <GSIcon name="search" size={38} />
          <h3>검색 결과가 없어요</h3>
          <p>다른 검색어나 장르를 선택해보세요.</p>
          <button className="gs-primary-button" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      )}
    </section>
  )
}
