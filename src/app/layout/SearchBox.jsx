import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { useDismiss } from '@/shared/hooks'

// 아래 화면들은 검색어로 목록을 걸러 주므로 검색해도 이동하지 않고 그 화면의 결과가 바뀐다. 다른 화면에서는 게임 탐색으로 이동한다.
const SEARCHABLE_PATHS = ['/wishlist', '/recommendations', '/explore']

// 헤더 검색: 작은 검색 버튼을 누르면(또는 / 키) 바로 아래로 큰 검색창 하나가 내려와서, 입력 중인 검색어를 편하게 볼 수 있다.
export default function SearchBox() {
  const { query, setQuery } = useGameSense()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  useDismiss(boxRef, open, () => setOpen(false))

  const submit = event => {
    event.preventDefault()
    setOpen(false)
    if (!SEARCHABLE_PATHS.includes(pathname)) navigate('/explore')
  }

  return (
    <div ref={boxRef} className="gs-search relative ml-auto min-w-0 w-[clamp(200px,28vw,380px)] max-[900px]:flex-1 max-[900px]:w-auto">
      {/* 헤더의 작은 검색 버튼. .gs-search-trigger는 '/' 단축키가 찾는 이름이다. */}
      <button
        type="button"
        className="gs-search-trigger w-full flex items-center gap-[10px] h-[40px] px-[16px] rounded-full bg-gs-search text-gs-muted text-[13px] text-left hover:ring-2 hover:ring-gs-hover"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-label="게임 검색 열기"
      >
        <GSIcon name="search" size={18} className="shrink-0" />
        <span className={`flex-1 truncate ${query ? 'text-gs-text' : ''}`}>{query || '게임, 장르를 검색해보세요'}</span>
        <kbd className="shrink-0 px-[7px] py-[1px] rounded-[6px] bg-gs-raised text-[11px] font-[inherit] max-[900px]:hidden">/</kbd>
      </button>

      {open && (
        <form
          role="search"
          onSubmit={submit}
          className="absolute right-0 top-[calc(100%+10px)] z-[45] w-[min(520px,calc(100vw-32px))] animate-[gs-appear_.15s_ease] max-[900px]:left-0 max-[900px]:right-auto"
        >
          {/* 포커스 표시: 테두리 선 대신, 입력 중이면 배경이 또렷해지고(불투명도 ↑) 그림자가 깊어지며 돋보기 아이콘 색이 바뀐다. */}
          <label className="group flex items-center gap-[14px] h-[56px] px-[22px] rounded-full bg-gs-panel/85 backdrop-blur-md shadow-[var(--gs-shadow)] transition-[background-color,box-shadow] duration-200 focus-within:bg-gs-panel focus-within:shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
            <GSIcon name="search" size={22} className="shrink-0 text-gs-muted transition-colors duration-200 group-focus-within:text-gs-mint" />
            <input
              autoFocus
              className="min-w-0 w-full bg-transparent border-0 !outline-none caret-gs-accent text-gs-text text-[18px] placeholder:text-gs-muted"
              aria-label="검색어 입력"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="게임, 장르를 검색해보세요"
            />
            {query && (
              <button type="button" className="p-0 grid place-items-center bg-transparent text-gs-muted hover:text-gs-text" aria-label="검색어 지우기" onClick={() => setQuery('')}>
                <GSIcon name="close" size={20} />
              </button>
            )}
          </label>
        </form>
      )}
    </div>
  )
}
