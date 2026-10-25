import { useState } from 'react'
import { GSIcon, PRIMARY_BUTTON } from '@/shared/ui'
import { MAX_QUERY_LENGTH } from '../api'

// 검색어 입력칸 + 검색 버튼 + 예시 검색어. 입력 값만 들고 있고, 검색 실행은 onSearch로 넘긴다.
export default function SearchForm({ onSearch, loading, examples }) {
  const [text, setText] = useState('')
  const submit = value => {
    if (!value.trim() || loading) return
    onSearch(value)
  }

  return (
    <div className="grid gap-[14px]">
      <form
        className="flex items-center gap-[10px] max-[600px]:flex-col max-[600px]:items-stretch"
        onSubmit={event => {
          event.preventDefault()
          submit(text)
        }}
      >
        <label className="flex flex-1 items-center gap-[10px] min-h-[48px] px-[18px] rounded-full bg-bg focus-within:ring-2 focus-within:ring-primary">
          <GSIcon name="search" size={19} className="text-muted shrink-0" />
          <input
            className="flex-1 min-w-0 bg-transparent text-[15px] outline-none placeholder:text-faint"
            type="text"
            value={text}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="예: 친구랑 같이 하는 무섭지 않은 협동 서바이벌"
            aria-label="자연어 검색어"
            onChange={event => setText(event.target.value)}
          />
        </label>
        <button type="submit" className={`${PRIMARY_BUTTON} h-[48px]`} disabled={loading || !text.trim()}>
          {loading ? '찾는 중...' : '검색'}
        </button>
      </form>
      <ul className="flex flex-wrap gap-[8px]" aria-label="검색어 예시">
        {examples.map(example => (
          <li key={example}>
            <button
              type="button"
              className="px-[12px] py-[5px] rounded-full bg-bg text-[13px] text-muted hover:text-text disabled:opacity-60"
              disabled={loading}
              onClick={() => {
                setText(example)
                submit(example)
              }}
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
