import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useMySpendingContext } from '@/features/spending'
import { GSIcon, FilterChips } from '@/shared/ui'
import { useSteamLibrary } from '../hooks/useSteamLibrary'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { libraryGenreOptions, genreOfLibraryGame, ALL_GENRES } from '../model/libraryGenres'

const hours = minutes => `${(minutes / 60).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}시간`
const playedAt = value =>
  value ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '플레이 기록 없음'

// 안내 문구 한 줄과 버튼 하나. 연동 전·오류·로딩·빈 목록이 같은 모양을 쓴다.
const noticeClass = 'flex flex-wrap items-center justify-between gap-[14px] py-[8px] text-muted text-[14px] max-[700px]:flex-col max-[700px]:items-start'

export default function SteamLibraryPanel({ query = '' }) {
  const { user, startSteamLink } = useAuth()
  const { games, loading, error, notLinked, sync } = useSteamLibrary(user?.id)
  // 스팀 보유 게임 응답에는 장르가 없어서, 소비 분석 데이터(appId로 연결)에서 장르를 가져온다.
  const { data: spending } = useMySpendingContext()
  const [genre, setGenre] = useState(ALL_GENRES)
  const withGenre = (games ?? []).map(game => ({ ...game, genre: genreOfLibraryGame(game, spending?.games) }))
  const genreOptions = libraryGenreOptions(withGenre)
  const activeGenre = genreOptions.some(option => option.key === genre) ? genre : ALL_GENRES
  const visible = withGenre.filter(
    game => matchesSearch(game.name, query) && (activeGenre === ALL_GENRES || game.genre === activeGenre)
  )
  return (
    <section className="min-w-0" aria-labelledby="gs-steam-library-title" aria-busy={loading}>
      <div className="flex items-center justify-between gap-[12px] mb-[8px]">
        <h2 className="text-[20px] font-[700] tracking-[-0.5px]" id="gs-steam-library-title">
          Steam 라이브러리
          {games && <span className="ml-[10px] text-[15px] font-[500] text-faint">{games.length}</span>}
        </h2>
        {!notLinked && (
          <button type="button" className="gs-secondary-button" onClick={sync} disabled={loading}>
            <GSIcon name="refresh" size={16} />
            {loading ? '동기화 중...' : '다시 동기화'}
          </button>
        )}
      </div>
      {games?.length > 0 && !notLinked && !error && (
        <FilterChips label="장르 필터" options={genreOptions} activeKey={activeGenre} onSelect={setGenre} className="my-[16px]" />
      )}
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
          <button type="button" className="gs-primary-button" onClick={sync} disabled={loading}>다시 시도</button>
        </div>
      ) : loading && !games ? (
        <p className={noticeClass}>스팀에서 보유 게임을 불러오는 중이에요...</p>
      ) : games && !visible.length ? (
        <p className={noticeClass}>{games.length ? '조건과 일치하는 스팀 게임이 없어요.' : '스팀 계정에 보유한 게임이 없어요.'}</p>
      ) : (
        <ul className="list-none m-0 p-0 grid grid-cols-2 gap-[12px] max-[700px]:grid-cols-1">
          {visible.map(game => (
            <li key={game.appId} className="flex items-center gap-[16px] p-[16px] rounded-[16px] bg-bg min-w-0">
              {game.iconUrl ? (
                <img className="w-[44px] h-[44px] rounded-[10px] shrink-0" src={game.iconUrl} alt="" loading="lazy" />
              ) : (
                <span className="w-[44px] h-[44px] rounded-[10px] shrink-0 grid place-items-center bg-surface text-muted"><GSIcon name="gamepad" size={20} /></span>
              )}
              <div className="flex-1 min-w-0">
                <strong className="block text-[15px] font-[600] truncate">{game.name}</strong>
                <small className="block text-[12px] text-faint">{game.genre} · 최근 플레이 {playedAt(game.lastPlayedAt)}</small>
              </div>
              <span className="text-right whitespace-nowrap">
                <b className="block text-[15px] font-[650]">{hours(game.playtimeForever)}</b>
                <small className="text-[12px] text-faint">최근 2주 {hours(game.playtime2Weeks)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
