import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { discoverGames, genres, recommendedIds } from '../../mocks/discoverMock'
import { useGameSense } from '../../contexts/GameSenseContext'
import GameCard from '../../components/discover/GameCard'
import GSIcon from '../../components/discover/GSIcon'
import {
  PlayPattern,
  RecentActivity,
  Recommendations,
} from '../../components/discover/DashboardWidgets'
import { gameStatuses } from '../../mocks/playerMock'
import { useAuth } from '../../contexts/AuthContext'
import SteamLibraryPanel from '../../features/library/components/SteamLibraryPanel'

const slides = [
  {
    eyebrow: 'PLAY  EXPLORE  TRACK  IMPROVE',
    title: (
      <>
        Good Games
        <br />
        Make a Better You
      </>
    ),
    description: (
      <>
        게임은 단순한 놀이가 아니라,
        <br />
        당신의 일상을 채우는 또 하나의 경험입니다.
      </>
    ),
    cta: '지금 탐험하기',
    to: '/explore',
  },
  {
    eyebrow: 'DISCOVER YOUR NEXT FAVORITE',
    title: (
      <>
        A New World.
        <br />
        Your Next Story.
      </>
    ),
    description: (
      <>
        수많은 세계 속에서 발견하는 나만의 취향.
        <br />
        다음으로 사랑하게 될 게임을 만나보세요.
      </>
    ),
    cta: '추천 게임 보기',
    to: '/recommendations',
  },
  {
    eyebrow: 'LESS GUESSING. MORE PLAYING.',
    title: (
      <>
        Know Your Play.
        <br />
        Find Your Balance.
      </>
    ),
    description: (
      <>
        나의 플레이와 소비 패턴을 한눈에.
        <br />더 즐거운 게임 라이프를 시작해 보세요.
      </>
    ),
    cta: '나의 패턴 보기',
    to: '/analysis',
  },
]
function Hero() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  return (
    <section className={`gs-hero gs-hero-${index}`} aria-label="GameSense 소개">
      <div className="gs-hero-image" />
      <div className="gs-hero-copy" key={index}>
        <p className="gs-hero-eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p className="gs-hero-description">{slide.description}</p>
        <Link className="gs-primary-button" to={slide.to}>
          {slide.cta}
          <GSIcon name="arrow" size={18} />
        </Link>
      </div>
      <div className="gs-hero-signature">
        <span>
          FIND
          <br />
          PLAY
          <br />
          ANALYZE
          <br />
          GROW
        </span>
        <em>
          with
          <br />
          <strong>GameSense</strong>
        </em>
      </div>
      <div className="gs-hero-pagination" role="group" aria-label="배너 선택">
        {slides.map((item, number) => (
          <button
            key={item.eyebrow}
            className={index === number ? 'active' : ''}
            aria-label={`배너 ${number + 1}`}
            aria-pressed={index === number}
            onClick={() => setIndex(number)}
          />
        ))}
      </div>
    </section>
  )
}

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

export function GameCatalog({ mode = 'home' }) {
  const { query, setQuery, wishlist, t, player } = useGameSense()
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const genre = genres.includes(params.get('genre')) ? params.get('genre') : 'All'
  const status =
    mode === 'library' && gameStatuses.some(item => item.id === params.get('status'))
      ? params.get('status')
      : 'all'
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
  let games = discoverGames.filter(
    game =>
      (mode !== 'library' || game.owned) &&
      (mode !== 'wishlist' || wishlist.includes(game.id)) &&
      (mode !== 'recommendations' || recommendedIds.includes(game.id))
  )
  if (status !== 'all') games = games.filter(game => player.games[game.id]?.status === status)
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
      {mode === 'library' && isAuthenticated && <SteamLibraryPanel query={query} />}
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
      {mode === 'library' && (
        <div className="gs-player-status-filter" role="group" aria-label="라이브러리 플레이 상태">
          {[{ id: 'all', label: '전체 상태' }, ...gameStatuses].map(item => (
            <button
              key={item.id}
              aria-pressed={status === item.id}
              onClick={() =>
                setParams(
                  previous => {
                    const next = new URLSearchParams(previous)
                    if (item.id === 'all') next.delete('status')
                    else next.set('status', item.id)
                    return next
                  },
                  { replace: true }
                )
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
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

export default function DiscoverPage() {
  return (
    <>
      <Hero />
      <Link to="/ai-worldcup" className="hb-home-link"><strong>AI 게임 취향 월드컵 →</strong><span>두 게임 중 내 선택은? · 선택할수록 달라지는 AI 대결</span></Link>
      <Link to="/hangul-blocks" className="hb-home-link"><strong>한글 테트리스 →</strong><span>게임 전 가볍게 한 판 · 50단계 & 일일 챌린지</span></Link>
      <div className="gs-dashboard-grid">
        <GameCatalog />
        <aside className="gs-dashboard-widgets" aria-label="나의 게임 인사이트">
          <PlayPattern />
          <Recommendations />
          <RecentActivity />
        </aside>
      </div>
    </>
  )
}
