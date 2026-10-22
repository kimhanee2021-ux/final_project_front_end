import { FilterChips, GSIcon } from '@/shared/ui'
import { BOARD_CATEGORIES } from '../../model/boardModel'

export const ALL_CATEGORY = 'All'
const CATEGORY_OPTIONS = [ALL_CATEGORY, ...BOARD_CATEGORIES].map(item => ({ key: item, label: item === ALL_CATEGORY ? '전체' : item }))

// 게시판 카테고리 칩 + 제목·내용 검색
export default function BoardFilters({ category, setCategory, keyword, setKeyword }) {
  return (
    <div className="flex items-center justify-between gap-[16px] mb-[12px] min-w-0 max-[760px]:flex-col max-[760px]:items-stretch">
      <FilterChips label="게시판 카테고리" options={CATEGORY_OPTIONS} activeKey={category} onSelect={setCategory} />
      <label className="flex items-center gap-[9px] w-[240px] h-[38px] px-[16px] rounded-full bg-bg text-muted shrink-0 max-[760px]:w-full">
        <GSIcon name="search" size={16} className="shrink-0" />
        <input
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          placeholder="제목, 내용 검색"
          aria-label="게시글 검색"
          className="w-full bg-transparent border-0 outline-none text-text text-[14px]"
        />
      </label>
    </div>
  )
}
