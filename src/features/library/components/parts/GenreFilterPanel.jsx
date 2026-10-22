import { GSIcon, Panel } from '@/shared/ui'
import { ALL_GENRES } from '../../model/libraryGenres'
import { genreIcon } from '../../model/libraryList'

// 왼쪽 장르 필터 카드: 장르별 게임 수 + 필터 초기화. 보유 게임을 불러오기 전에는 안내만 보여준다.
export default function GenreFilterPanel({ ready, games, genreOptions, activeGenre, setGenre, reset }) {
  return (
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
  )
}
