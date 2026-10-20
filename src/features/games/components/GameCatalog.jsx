import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { discoverGames, genres, recommendedIds } from '../mocks/discoverMock'
import { useGameSense } from '@/shared/state'
import RecommendedGameCard from './RecommendedGameCard'
import CatalogMessage from './CatalogMessage'
import { GSIcon, PageHeading, FilterChips } from '@/shared/ui'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { useAuth } from '@/features/auth'
import { SteamLibraryPanel } from '@/features/library'

// 내 게임, 추천이 mode만 바꿔 함께 쓰는 화면. library는 다른 모양이라 위에서 바로 return하고,
// 아래 공통 렌더링(장르 필터·정렬·그리드)은 이제 recommendations(더미 데이터 기반)만 쓴다.
const pageTitles = {
  library: ['My Games', '내 게임', '당신의 다음 모험은 이미 라이브러리에 있을지도 몰라요.'],
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
      <section className="min-w-0" aria-labelledby="gs-catalog-title">
        <PageHeading id="gs-catalog-title" title={t(title[0], title[1])} description={title[2]} />
        {isAuthenticated ? (
          <SteamLibraryPanel query={query} />
        ) : (
          <CatalogMessage icon="steam" title="스팀 계정으로 로그인하면 보유 게임을 볼 수 있어요" description="데모 세션에서는 실제 라이브러리를 불러올 수 없어요.">
            <Link className="gs-primary-button mt-[16px]" to="/signup">
              회원가입하기
              <GSIcon name="arrow" size={17} />
            </Link>
          </CatalogMessage>
        )}
      </section>
    )
  }

  let games = discoverGames.filter(game => recommendedIds.includes(game.id))
  games.sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
  games = games.filter(
    game =>
      (genre === 'All' || game.genres.includes(genre)) &&
      matchesSearch(`${game.name} ${game.genres.join(' ')} ${game.platforms.join(' ')}`, query)
  )
  if (sort === 'rating') games.sort((a, b) => b.rating - a.rating)
  if (sort === 'name') games.sort((a, b) => a.name.localeCompare(b.name))
  const title = pageTitles.recommendations
  const genreOptions = genres.map(item => ({ key: item, label: item === 'All' ? t('All', '전체') : item }))
  return (
    <section className="min-w-0" aria-labelledby="gs-catalog-title">
      <PageHeading
        id="gs-catalog-title"
        title={t(title[0], title[1])}
        description={`${title[2]} · ${games.length}개`}
        action={
          <label>
            <span className="sr-only">게임 정렬</span>
            <select
              className="h-[36px] px-[14px] rounded-full bg-bg text-text text-[13px] border-0"
              aria-label="게임 정렬"
              value={sort}
              onChange={event => setSort(event.target.value)}
            >
              <option value="featured">추천순</option>
              <option value="rating">평점 높은 순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        }
      />
      <div className="mb-[28px] min-w-0">
        <FilterChips label="장르 필터" options={genreOptions} activeKey={genre} onSelect={setGenre} />
      </div>
      {query.trim() && (
        <p className="mb-[20px] text-muted text-[14px]" aria-live="polite">
          “{query}” 검색 결과 <strong className="text-text ml-[6px]">{games.length}개</strong>
        </p>
      )}
      {games.length > 0 ? (
        <div className="grid grid-cols-3 gap-[36px_20px] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {games.map(game => (
            <RecommendedGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <CatalogMessage
          icon="search"
          title="검색 결과가 없어요"
          description="다른 검색어나 장르를 선택해보세요."
          action={{
            label: '필터 초기화',
            onClick: () => {
              setQuery('')
              setParams({})
            },
          }}
        />
      )}
      <p className="mt-[40px] text-faint text-[12px] leading-[1.8]">
        현재 추천은 준비된 더미 데이터입니다. AI API 연결 시 실제 플레이 기록에 기반한 추천으로 확장할 수 있습니다.
      </p>
    </section>
  )
}
