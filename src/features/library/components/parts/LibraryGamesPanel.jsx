import { GameImage, GSIcon, Panel } from '@/shared/ui'
import { formatHours, formatPlayedDate } from '../../model/libraryList'
import SortSelect from './SortSelect'
import { noticeClass } from './noticeClass'

// 오른쪽 보유 게임 목록 카드: 연동 전·오류·불러오는 중·빈 목록 안내, 또는 이 칸 안에서 스크롤되는 게임 목록.
export default function LibraryGamesPanel({ library, ready, visible, sort, setSort, onLink, onSelect }) {
  const { games, loading, error, notLinked, sync } = library
  return (
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
          <button type="button" className="gs-primary-button" onClick={onLink}>
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
                onClick={() => onSelect(game)}
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
  )
}
