import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { discoverGames, genres, recommendedIds } from '../mocks/discoverMock'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GameCard from './GameCard'
import GSIcon from '../../../components/common/GSIcon'
import { useAuth } from '../../auth/context/AuthContext'
import SteamLibraryPanel from '../../library/components/SteamLibraryPanel'

// 홈, 장르, 인기, 추천, 내 게임, 위시리스트가 mode만 바꿔 함께 쓰는 게임 목록 (더미 데이터 기반)
const pageTitles = {
  genres: ['Find Your Genre', '취향별 장르 탐색', '지금 당신이 빠져들고 싶은 세계는 무엇인가요?'],
  trending: [
    'New & Trending',
    '지금 인기 있는 게임',
    '플레이어들이 사랑하는 게임을 평점순으로 만나보세요.',
  ],
  library: ['My Games', '내 게임', '당신의 다음 모험은 이미 라이브러리에 있을지도 몰라요.'],
  wishlist: ['Your Wishlist', '나의 위시리스트', '언젠가 만나고 싶은 세계를 한곳에 모아두세요.'],
  recommendations: [
    'Picked for You',
    '당신을 위한 추천',
    'RPG와 액션을 좋아하는 당신을 위한 데모 추천 목록입니다.',
  ],
}

export default function GameCatalog({ mode = 'home' }) {
  const { query, setQuery, wishlist, t } = useGameSense()
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const genre = genres.includes(params.get('genre')) ? params.get('genre') : 'All'
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('featured')
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

  if (mode === 'library') {
    const title = pageTitles.library
    return (
      <section className="gs-catalog gs-full-catalog" aria-labelledby="gs-catalog-title">
        <div className="gs-section-heading">
          <div>
            <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
            <h1 id="gs-catalog-title">{t(title[0], title[1])}</h1>
            <p>{title[2]}</p>
          </div>
        </div>
        {isAuthenticated ? (
          <SteamLibraryPanel query={query} />
        ) : (
          <div className="gs-empty">
            <GSIcon name="steam" size={38} />
            <h3>스팀 계정으로 로그인하면 보유 게임을 볼 수 있어요</h3>
            <p>데모 세션에서는 실제 라이브러리를 불러올 수 없어요.</p>
            <Link className="gs-primary-button" to="/signup">
              회원가입하기
              <GSIcon name="arrow" size={17} />
            </Link>
          </div>
        )}
      </section>
    )
  }

  let games = discoverGames.filter(
    game =>
      (mode !== 'wishlist' || wishlist.includes(game.id)) &&
      (mode !== 'recommendations' || recommendedIds.includes(game.id))
  )
  if (mode === 'recommendations')
    games.sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
  games = games.filter(
    game =>
      (genre === 'All' || game.genres.includes(genre)) &&
      `${game.name} ${game.genres.join(' ')} ${game.platforms.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  if (sort === 'rating' || (mode === 'trending' && sort === 'featured'))
    games.sort((a, b) => b.rating - a.rating)
  if (sort === 'name') games.sort((a, b) => a.name.localeCompare(b.name))
  const visibleGames =
    mode === 'home' && genre === 'All' && !query.trim() ? games.slice(0, 6) : games
  const title = pageTitles[mode]
  const Heading = mode === 'home' ? 'h2' : 'h1'
  return (
    <section
      className={`gs-catalog ${mode === 'home' ? 'gs-home-catalog' : 'gs-full-catalog'}`}
      aria-labelledby="gs-catalog-title"
    >
      <div className="gs-section-heading">
        <div>
          {mode !== 'home' && <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>}
          <Heading id="gs-catalog-title">
            {mode === 'home' ? t('Game List', '게임 목록') : t(title[0], title[1])}
            {mode !== 'home' && <span className="gs-result-count">{games.length}</span>}
          </Heading>
          <p>{mode === 'home' ? '새로운 세계를 발견해보세요.' : title[2]}</p>
        </div>
        {mode === 'home' ? (
          <Link to="/explore" className="gs-text-link">
            View All
            <GSIcon name="arrow" size={16} />
          </Link>
        ) : (
          <label className="gs-sort">
            <span className="sr-only">게임 정렬</span>
            <select
              aria-label="게임 정렬"
              value={sort}
              onChange={event => setSort(event.target.value)}
            >
              <option value="featured">{mode === 'trending' ? '인기순' : '추천순'}</option>
              <option value="rating">평점 높은 순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        )}
      </div>
      <div className="gs-catalog-toolbar">
        <div className="gs-genre-tabs" role="group" aria-label="장르 필터">
          {genres.map(item => (
            <button
              key={item}
              className={genre === item ? 'active' : ''}
              aria-pressed={genre === item}
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
      {query.trim() && (
        <p className="gs-search-summary" aria-live="polite">
          “{query}” 검색 결과 <strong>{games.length}개</strong>
        </p>
      )}
      {visibleGames.length > 0 ? (
        <div className={`gs-game-grid ${view === 'list' ? 'gs-list-view' : ''}`}>
          {visibleGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="gs-empty">
          <GSIcon name={mode === 'wishlist' ? 'heart' : 'search'} size={38} />
          <h3>
            {mode === 'wishlist' && !wishlist.length
              ? '다음 모험을 찜해보세요'
              : '검색 결과가 없어요'}
          </h3>
          <p>
            {mode === 'wishlist' && !wishlist.length
              ? '게임 카드의 하트를 누르면 이곳에 저장됩니다.'
              : '다른 검색어나 장르를 선택해보세요.'}
          </p>
          {mode === 'wishlist' && !wishlist.length ? (
            <Link className="gs-primary-button" to="/explore">
              게임 둘러보기
              <GSIcon name="arrow" size={17} />
            </Link>
          ) : (
            <button
              className="gs-primary-button"
              onClick={() => {
                setQuery('')
                setParams({})
              }}
            >
              필터 초기화
            </button>
          )}
        </div>
      )}
      {mode === 'recommendations' && (
        <div className="gs-inline-note">
          <GSIcon name="spark" size={20} />
          <p>
            현재 추천은 준비된 더미 데이터입니다. AI API 연결 시 실제 플레이 기록에 기반한 추천으로
            확장할 수 있습니다.
          </p>
        </div>
      )}
    </section>
  )
}
