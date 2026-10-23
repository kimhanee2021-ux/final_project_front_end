import { SORT_OPTIONS } from '../../model/libraryList'

// 정렬 드롭다운. 위쪽과 목록 카드 안 두 곳에서 같은 값을 쓴다.
export default function SortSelect({ value, onChange, id }) {
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
