import { useState } from 'react'
import { GSIcon, PRIMARY_BUTTON } from '@/shared/ui'
import { MAX_QUERY_LENGTH } from '../api'

const EXAMPLES = [
  '친구랑 같이 하는 무서운 협동 게임',
  '할로우 나이트 같은 게임',
  '배그 최신 소식 들려줘',
  '느긋한 농사 게임인데 픽셀 그래픽은 싫어',
]

// 찾고 싶은 게임을 문장으로 적는 입력창과 예시 문장. 예시를 누르면 그 문장으로 바로 찾는다.
// 음성으로 찾은 문장도 주소(검색 문장)를 통해 initialQuery로 들어와 입력창에 보인다.
export default function SearchForm({ initialQuery = '', busy, onSearch, onTyping }) {
  const [text, setText] = useState(initialQuery)
  const query = text.trim()
  const submit = event => {
    event.preventDefault()
    if (query.length >= 2) onSearch(query)
  }
  const pick = example => {
    setText(example)
    onSearch(example)
  }
  return (
    <div>
      <form onSubmit={submit} className="flex gap-[10px] max-[600px]:flex-col">
        <label className="flex-1 flex items-center gap-[10px] px-[16px] h-[52px] rounded-[14px] border border-border bg-surface-soft focus-within:border-primary">
          <GSIcon name="search" size={18} className="text-muted shrink-0" />
          <input
            value={text}
            onChange={event => {
              setText(event.target.value)
              onTyping?.()
            }}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="찾고 싶은 게임을 적거나, 위 원형을 눌러 말해 보세요"
            aria-label="찾고 싶은 게임 설명"
            className="flex-1 min-w-0 bg-transparent text-[15px] text-text outline-none placeholder:text-muted"
          />
        </label>
        <button type="submit" className={PRIMARY_BUTTON + ' h-[52px] px-[24px]'} disabled={busy || query.length < 2}>
          {busy ? '찾는 중...' : 'AI로 찾기'}
        </button>
      </form>
      <ul className="list-none m-0 mt-[14px] p-0 flex flex-wrap gap-[8px]" aria-label="예시 문장">
        {EXAMPLES.map(example => (
          <li key={example}>
            <button
              type="button"
              disabled={busy}
              onClick={() => pick(example)}
              className="px-[14px] h-[34px] rounded-full bg-bg text-[13px] text-muted hover:text-text transition-colors"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
