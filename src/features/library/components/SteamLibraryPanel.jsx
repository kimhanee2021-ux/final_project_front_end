import { useState } from 'react'
import { AiRecommendTeaser } from '@/features/ai-recommends'
import { useAuth } from '@/features/auth'
import { useMySpendingContext } from '@/features/spending'
import { useSteamLibrary } from '../hooks/useSteamLibrary'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { libraryGenreOptions, genreOfLibraryGame, ALL_GENRES } from '../model/libraryGenres'
import { DEFAULT_SORT, sortGames } from '../model/libraryList'
import LibraryGameDialog from './LibraryGameDialog'
import LibraryHeader from './parts/LibraryHeader'
import GenreFilterPanel from './parts/GenreFilterPanel'
import LibraryGamesPanel from './parts/LibraryGamesPanel'

// 내 스팀 라이브러리 화면: 제목·검색 카드, 왼쪽 장르 필터 카드, 오른쪽 스크롤되는 보유 게임 목록 카드.
export default function SteamLibraryPanel() {
  const { user, startSteamLink } = useAuth()
  const library = useSteamLibrary(user?.id)
  const { games, loading, error, notLinked, sync } = library
  // 스팀 보유 게임 응답에는 장르가 없어서, 소비 분석 데이터(appId로 연결)에서 장르를 가져온다.
  const { data: spending } = useMySpendingContext()
  const [genre, setGenre] = useState(ALL_GENRES)
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const withGenre = (games ?? []).map(game => ({ ...game, genre: genreOfLibraryGame(game, spending?.games) }))
  const genreOptions = libraryGenreOptions(withGenre)
  const activeGenre = genreOptions.some(option => option.key === genre) ? genre : ALL_GENRES
  const visible = sortGames(
    withGenre.filter(
      game =>
        matchesSearch(`${game.name} ${game.genre}`, query) && (activeGenre === ALL_GENRES || game.genre === activeGenre)
    ),
    sort
  )
  const ready = games && !notLinked && !error
  const reset = () => {
    setGenre(ALL_GENRES)
    setQuery('')
  }

  return (
    <>
      <LibraryHeader ready={ready} games={games} sort={sort} setSort={setSort} sync={sync} loading={loading} query={query} setQuery={setQuery} />

      {ready && <AiRecommendTeaser />}

      <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-[16px] items-start max-[900px]:grid-cols-1">
        <GenreFilterPanel ready={ready} games={games} genreOptions={genreOptions} activeGenre={activeGenre} setGenre={setGenre} reset={reset} />

        <LibraryGamesPanel
          library={library}
          ready={ready}
          visible={visible}
          sort={sort}
          setSort={setSort}
          onLink={startSteamLink}
          onSelect={setSelected}
        />
      </div>
      <LibraryGameDialog game={selected} onClose={() => setSelected(null)} />
    </>
  )
}
