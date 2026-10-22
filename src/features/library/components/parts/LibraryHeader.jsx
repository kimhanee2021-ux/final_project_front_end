import { GSIcon, PageHeading, Panel } from '@/shared/ui'
import SortSelect from './SortSelect'

// 제목·검색 카드: 총 개수 · 정렬 · 다시 동기화 + 게임 이름/장르 검색
export default function LibraryHeader({ ready, games, sort, setSort, sync, loading, query, setQuery }) {
  return (
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
  )
}
