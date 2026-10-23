import { GSIcon } from '@/shared/ui'

// 표 위 오른쪽: 게임 이름 검색 + 정렬. 구매일이 없으면 '최근 구매순', 구매 내역이 없으면 '구매 금액순'을 뺀다.
export default function GamesTableToolbar({ query, onQueryChange, sort, onSortChange, hasPurchaseDates, needsHistory }) {
  return (
    <div className="flex gap-[12px] max-[1000px]:w-full">
      <label className="flex items-center gap-[8px] text-muted px-[14px] h-[38px] bg-bg rounded-full max-[1000px]:flex-1">
        <GSIcon name="search" size={16} />
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="게임 검색"
          aria-label="구매한 게임 검색"
          className="w-[130px] bg-transparent border-0 text-text outline-offset-[1px] text-[14px] placeholder:text-muted max-[1000px]:w-full"
        />
      </label>
      <select
        aria-label="게임 정렬"
        value={sort}
        onChange={e => onSortChange(e.target.value)}
        className="bg-bg border-0 rounded-full h-[38px] px-[14px] text-text text-[13px]"
      >
        {hasPurchaseDates && <option value="recent">최근 구매순</option>}
        {!needsHistory && <option value="price">구매 금액순</option>}
        <option value="hours">플레이 시간순</option>
      </select>
    </div>
  )
}
