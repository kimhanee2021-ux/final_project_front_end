import { useState } from 'react'
import { AiRecommendTeaser } from '@/features/ai-recommends'
import { useAuth } from '@/features/auth'
import { useMySpendingContext } from '@/features/spending'
import { GameImage, GSIcon, PageHeading, Panel } from '@/shared/ui'
import { useSteamLibrary } from '../hooks/useSteamLibrary'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { libraryGenreOptions, genreOfLibraryGame, ALL_GENRES } from '../model/libraryGenres'
import { DEFAULT_SORT, SORT_OPTIONS, formatHours, formatPlayedDate, genreIcon, sortGames } from '../model/libraryList'
import LibraryGameDialog from './LibraryGameDialog'

// 안내 문구 한 줄과 버튼 하나. 연동 전·오류·로딩·빈 목록이 같은 모양을 쓴다.
const noticeClass =
  'flex flex-wrap items-center justify-between gap-[14px] py-[8px] text-muted text-[14px] max-[700px]:flex-col max-[700px]:items-start'

// 정렬 드롭다운. 위쪽과 목록 카드 안 두 곳에서 같은 값을 쓴다.
function SortSelect({ value, onChange, id }) {
  return (
    <label>
      <span className="sr-only">게임 정렬</span>
      <select
        id={id}
        className="h-[40px] px-[16px] rounded-full bg-bg text-text text-[13px] border-0"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// 내 스팀 라이브러리 화면: 제목·검색 카드, 왼쪽 장르 필터 카드, 오른쪽 스크롤되는 보유 게임 목록 카드.
export default function SteamLibraryPanel() {
  const { user, startSteamLink } = useAuth()
  const { games, loading, error, notLinked, sync } = useSteamLibrary(user?.id)
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
      <Panel>
        <PageHeading
          title="게임 목록"
          description="내가 보유한 모든 게임을 확인할 수 있습니다."
          action={
            ready && (
              <div className="flex items-center gap-[10px] flex-wrap">
                <span className="text-[13px] text-muted">총 {games.length}개</span>
                <SortSelect value={sort} onChange={setSort} id="library-sort-top" />
                <button type="button" className="gs-secondary-button" onClick={sync} disabled={loading}>
                  <GSIcon name="refresh" size={16} />
                  {loading ? '동기화 중...' : '다시 동기화'}
                </button>
              </div>
            )
          }
        />
        <label className="flex items-center gap-[12px] h-[52px] px-[20px] rounded-full bg-bg text-muted origin-center transition-[transform,box-shadow] duration-200 hover:scale-[1.01] focus-within:scale-[1.02] focus-within:shadow-[var(--shadow)]">
          <GSIcon name="search" size={18} className="shrink-0" />
          <input
            type="search"
            className="flex-1 min-w-0 h-full bg-transparent border-0 text-text text-[14px] outline-none! placeholder:text-faint"
            placeholder="게임 이름 또는 장르로 검색해보세요"
            aria-label="내 게임 검색"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </label>
      </Panel>

      {ready && <AiRecommendTeaser />}

      <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-[16px] items-start max-[900px]:grid-cols-1">
        <Panel className="!p-[24px]">
          <h2 className="text-[16px] font-[700] mb-[16px]">장르 필터</h2>
          {ready ? (
            <>
              <ul className="list-none m-0 p-0 grid gap-[4px] max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
                {genreOptions.map(option => {
                  const active = option.key === activeGenre
                  const [name, count] =
                    option.key === ALL_GENRES ? ['전체', games.length] : option.label.split(/ (?=\d+$)/)
                  return (
                    <li key={option.key}>
                      <button
                        type="button"
                        aria-pressed={active}
                        className={`w-full flex items-center gap-[12px] h-[44px] px-[14px] rounded-[14px] text-[14px] text-left transition-colors ${
                          active
                            ? 'bg-primary-soft text-primary-text font-[650]'
                            : 'bg-transparent text-muted hover:bg-bg hover:text-text'
                        }`}
                        onClick={() => setGenre(option.key)}
                      >
                        <GSIcon
                          name={genreIcon(option.key === ALL_GENRES ? 'all' : name)}
                          size={18}
                          className="shrink-0"
                        />
                        <span className="flex-1 truncate">{name}</span>
                        <span className="text-[12px] tabular-nums">{count}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <button type="button" className="gs-secondary-button w-full mt-[20px]" onClick={reset}>
                필터 초기화
              </button>
            </>
          ) : (
            <p className="text-[13px] text-faint">보유 게임을 불러오면 장르별로 걸러볼 수 있어요.</p>
          )}
        </Panel>

        <Panel className="!p-[24px] min-w-0">
          <div className="flex items-start justify-between gap-[12px] mb-[16px]">
            <div>
              <h2 className="text-[16px] font-[700]">보유 게임 목록</h2>
              {games && <p className="mt-[4px] text-[13px] text-muted">총 {visible.length}개의 게임이 있습니다.</p>}
            </div>
            {ready && <SortSelect value={sort} onChange={setSort} id="library-sort-list" />}
          </div>
          {notLinked ? (
            <div className={noticeClass}>
              <p>스팀 계정을 연동하면 보유 게임을 자동으로 가져올 수 있어요.</p>
              <button type="button" className="gs-primary-button" onClick={startSteamLink}>
                <GSIcon name="steam" size={17} />
                Steam 계정 연동하기
              </button>
            </div>
          ) : error ? (
            <div className={noticeClass} role="alert">
              <p>{error}</p>
              <button type="button" className="gs-primary-button" onClick={sync} disabled={loading}>
                다시 시도
              </button>
            </div>
          ) : loading && !games ? (
            <p className={noticeClass}>스팀에서 보유 게임을 불러오는 중이에요...</p>
          ) : games && !visible.length ? (
            <p className={noticeClass}>
              {games.length ? '조건과 일치하는 스팀 게임이 없어요.' : '스팀 계정에 보유한 게임이 없어요.'}
            </p>
          ) : (
            // 게임이 많아도 페이지가 끝없이 길어지지 않게, 목록만 이 칸 안에서 스크롤한다.
            // overscroll-contain: 목록 끝에 닿은 뒤 계속 내려도 바깥 페이지가 따라 스크롤되지 않게 막는다.
            <ul className="list-none m-0 p-0 grid grid-cols-2 gap-[12px] max-h-[620px] overflow-y-auto overscroll-contain pr-[6px] max-[700px]:grid-cols-1">
              {visible.map(game => (
                <li key={game.appId} className="min-w-0">
                  <button
                    type="button"
                    className="w-full flex items-center gap-[14px] p-[14px] rounded-[16px] bg-bg text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow)]"
                    onClick={() => setSelected(game)}
                  >
                    <GameImage className="w-[52px] h-[52px] rounded-[12px] shrink-0" src={game.iconUrl} iconSize={22} />
                    <span className="flex-1 min-w-0">
                      <strong className="block text-[14px] font-[650] truncate">{game.name}</strong>
                      <small className="block mt-[4px] text-[12px] text-faint truncate">
                        {formatHours(game.playtimeForever)} · {formatPlayedDate(game.lastPlayedAt)}
                      </small>
                    </span>
                    <GSIcon name="chevron" size={16} className="text-faint shrink-0 -rotate-90" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <LibraryGameDialog game={selected} onClose={() => setSelected(null)} />
    </>
  )
}
