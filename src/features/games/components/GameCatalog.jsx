import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { discoverGames, genres, recommendedIds } from '../mocks/discoverMock'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GameCard from './GameCard'
import GSIcon from '../../../components/common/GSIcon'
import { useAuth } from '../../auth/context/AuthContext'
import SteamLibraryPanel from '../../library/components/SteamLibraryPanel'

// 내 게임, 위시리스트, 추천이 mode만 바꿔 함께 쓰는 화면. library/wishlist는 각자 다른 모양이라 위에서 바로 return하고,
// 아래 공통 렌더링(장르 필터·정렬·그리드)은 이제 recommendations(더미 데이터 기반)만 쓴다.
const pageTitles = {
  library: ['My Games', '내 게임', '당신의 다음 모험은 이미 라이브러리에 있을지도 몰라요.'],
  wishlist: ['Your Wishlist', '나의 위시리스트', '언젠가 만나고 싶은 세계를 한곳에 모아두세요.'],
  recommendations: [
    'Picked for You',
    '당신을 위한 추천',
    'RPG와 액션을 좋아하는 당신을 위한 데모 추천 목록입니다.',
  ],
}

export default function GameCatalog({ mode }) {
  const { query, setQuery, t } = useGameSense()
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
      <section className="min-w-0 pt-[26px]" aria-labelledby="gs-catalog-title">
        <div className="flex items-start justify-between gap-[16px] mb-[26px] items-center">
          <div>
            <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
            <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-catalog-title">{t(title[0], title[1])}</h1>
            <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">{title[2]}</p>
          </div>
        </div>
        {isAuthenticated ? (
          <SteamLibraryPanel query={query} />
        ) : (
          <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
            <GSIcon name="steam" size={38} />
            <h3 className="text-[18px] mt-[18px]">스팀 계정으로 로그인하면 보유 게임을 볼 수 있어요</h3>
            <p className="m-[8px_0_23px] text-gs-muted text-[12px]">데모 세션에서는 실제 라이브러리를 불러올 수 없어요.</p>
            <Link className="gs-primary-button" to="/signup">
              회원가입하기
              <GSIcon name="arrow" size={17} />
            </Link>
          </div>
        )}
      </section>
    )
  }

  if (mode === 'wishlist') {
    const title = pageTitles.wishlist
    return (
      <section className="min-w-0 pt-[26px]" aria-labelledby="gs-catalog-title">
        <div className="flex items-start justify-between gap-[16px] mb-[26px] items-center">
          <div>
            <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
            <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-catalog-title">{t(title[0], title[1])}</h1>
            <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">{title[2]}</p>
          </div>
        </div>
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="settings" size={38} />
          <h3 className="text-[18px] mt-[18px]">위시리스트는 공사 중이에요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">실제 게임 데이터와 연동한 위시리스트를 준비하고 있어요. 조금만 기다려주세요.</p>
        </div>
      </section>
    )
  }

  let games = discoverGames.filter(game => recommendedIds.includes(game.id))
  games.sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
  games = games.filter(
    game =>
      (genre === 'All' || game.genres.includes(genre)) &&
      `${game.name} ${game.genres.join(' ')} ${game.platforms.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  if (sort === 'rating') games.sort((a, b) => b.rating - a.rating)
  if (sort === 'name') games.sort((a, b) => a.name.localeCompare(b.name))
  const title = pageTitles.recommendations
  return (
    <section className="min-w-0" aria-labelledby="gs-catalog-title">
      <div className="flex items-start justify-between gap-[16px] items-center mb-[26px]">
        <div>
          <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
          <h1
            className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]"
            id="gs-catalog-title"
          >
            {t(title[0], title[1])}
            <span className="inline-block ml-[12px] align-middle text-[13px] p-[4px_8px] bg-gs-raised text-gs-muted rounded-[6px] max-[600px]:ml-[8px] max-[600px]:text-[11px]">{games.length}</span>
          </h1>
          <p className="text-gs-muted text-[11px] mt-[4px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">{title[2]}</p>
        </div>
        <label className="max-[600px]:pt-[26px]">
          <span className="sr-only">게임 정렬</span>
          <select
            className="text-gs-text bg-gs-panel border border-gs-border rounded-[8px] p-[9px_12px] text-[11px] max-[600px]:p-[7px] max-[600px]:text-[9px] max-[600px]:max-w-[87px]"
            aria-label="게임 정렬"
            value={sort}
            onChange={event => setSort(event.target.value)}
          >
            <option value="featured">추천순</option>
            <option value="rating">평점 높은 순</option>
            <option value="name">이름순</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-[13px] m-[0_0_17px] min-w-0 max-[600px]:gap-[9px] max-[600px]:mb-[15px]">
        <div
          className="flex gap-[7px] overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-[2px_1px_3px] max-[600px]:gap-[7px] flex-initial [&_button]:border [&_button]:border-gs-border [&_button]:rounded-[25px] [&_button]:bg-[linear-gradient(0deg,transparent,#8796a00c),var(--gs-raised)] [&_button]:p-[6px_15px] [&_button]:text-[10px] [&_button]:whitespace-nowrap [&_button]:min-h-[31px] [&_button:hover]:border-gs-mint [&_button:disabled]:opacity-45 [&_button:disabled]:cursor-not-allowed min-[1600px]:[&_button]:text-[11px] min-[1600px]:[&_button]:p-[6px_17px] max-[600px]:[&_button]:p-[6px_14px] max-[600px]:[&_button]:min-h-[32px] max-[600px]:[&_button]:text-[10px]"
          role="group"
          aria-label="장르 필터"
        >
          {genres.map(item => (
            <button
              key={item}
              className={genre === item ? 'bg-gs-accent! text-[#04291f]! font-[650]! border-gs-accent!' : ''}
              aria-pressed={genre === item}
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
      {query.trim() && (
        <p className="m-[-3px_0_16px] text-gs-muted text-[12px]" aria-live="polite">
          “{query}” 검색 결과 <strong className="text-gs-mint ml-[7px]">{games.length}개</strong>
        </p>
      )}
      {games.length > 0 ? (
        <div className={`grid gap-[11px_12px] max-[600px]:grid-cols-1 max-[600px]:gap-[11px] ${view === 'list' ? 'grid-cols-1' : 'grid-cols-2 min-[1900px]:grid-cols-4 max-[1350px]:grid-cols-2'}`}>
          {games.map(game => (
            <GameCard key={game.id} game={game} view={view} />
          ))}
        </div>
      ) : (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="search" size={38} />
          <h3 className="text-[18px] mt-[18px]">검색 결과가 없어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">다른 검색어나 장르를 선택해보세요.</p>
          <button
            className="gs-primary-button"
            onClick={() => {
              setQuery('')
              setParams({})
            }}
          >
            필터 초기화
          </button>
        </div>
      )}
      <div className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]">
        <GSIcon name="spark" size={20} />
        <p>
          현재 추천은 준비된 더미 데이터입니다. AI API 연결 시 실제 플레이 기록에 기반한 추천으로
          확장할 수 있습니다.
        </p>
      </div>
    </section>
  )
}
