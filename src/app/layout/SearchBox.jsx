import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { useDismiss } from '@/shared/hooks'
import { useAuth } from '@/features/auth'
import { MAX_QUERY_LENGTH, QuickSearchResults, useAiSearch } from '@/features/ai-search'
import { BbsVoiceMiniOrb, claimBbsAudioFromOutside, useBbsVoiceSearch } from '@/features/bbs'

// 아래 화면들은 검색어로 목록을 걸러 주므로 검색해도 이동하지 않고 그 화면의 결과가 바뀐다. 다른 화면에서는 게임 탐색으로 이동한다.
const SEARCHABLE_PATHS = ['/wishlist', '/explore']
// AI 게임 검색 화면에서 헤더 음성 버튼으로 말하면 드롭다운 대신 그 화면의 검색 결과를 바꾼다
const AI_SEARCH_PATH = '/ai-search'
const VOICE_BUSY = ['STARTING', 'LISTENING', 'TRANSCRIBING']

// 헤더 검색: 작은 검색 버튼을 누르면(또는 / 키) 바로 아래로 큰 검색창 하나가 내려와서, 입력 중인 검색어를 편하게 볼 수 있다.
// 입력하는 동안은 지금처럼 화면 목록을 거르고, 로그인한 사용자가 Enter를 누르거나 음성으로 말하면 AI가 관련 게임을 찾아 아래에 보여준다.
// (AI 검색은 GPT를 부르므로 글자마다가 아니라 Enter·음성 때만 묻는다. 로그인 전에는 AI 검색 API를 쓸 수 없어 예전 동작만 한다)
export default function SearchBox() {
  const { query, setQuery } = useGameSense()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const boxRef = useRef(null)
  useDismiss(boxRef, open, () => setOpen(false))
  const search = useAiSearch(isAuthenticated ? aiQuery : '')
  const voice = useBbsVoiceSearch(transcript => {
    const text = transcript.trim().slice(0, MAX_QUERY_LENGTH)
    if (!text) return
    setQuery(text)
    setAiQuery(text)
    // AI 게임 검색 화면에서는 드롭다운을 닫고 화면의 검색 결과를 바꾼다
    if (pathname === AI_SEARCH_PATH) {
      setOpen(false)
      navigate(`${AI_SEARCH_PATH}?${new URLSearchParams({ q: text })}`)
    } else setOpen(true)
  })
  const showVoice = isAuthenticated
  const listening = showVoice && VOICE_BUSY.includes(voice.phase)
  const voiceError = showVoice && voice.phase === 'ERROR'

  const goExplore = () => {
    setOpen(false)
    if (!SEARCHABLE_PATHS.includes(pathname)) navigate('/explore')
  }
  const submit = event => {
    event.preventDefault()
    const text = query.trim().slice(0, MAX_QUERY_LENGTH)
    if (isAuthenticated && text) setAiQuery(text)
    else goExplore()
  }
  const openInAiSearch = appId => {
    setOpen(false)
    navigate(`${AI_SEARCH_PATH}?${new URLSearchParams(appId ? { q: aiQuery, appId } : { q: aiQuery })}`)
  }
  const startVoice = () => {
    claimBbsAudioFromOutside()
    setOpen(true)
    voice.start()
  }
  const showPanel = isAuthenticated && (listening || voiceError || aiQuery)

  return (
    <div ref={boxRef} className="gs-search relative ml-auto min-w-0 w-[clamp(200px,28vw,380px)] max-[900px]:flex-1 max-[900px]:w-auto">
      <div className="flex items-center h-[40px] rounded-full bg-gs-search hover:ring-2 hover:ring-gs-hover">
        {/* 헤더의 작은 검색 버튼. .gs-search-trigger는 '/' 단축키가 찾는 이름이다. */}
        <button
          type="button"
          className="gs-search-trigger min-w-0 flex-1 flex items-center gap-[10px] h-full pl-[16px] pr-[10px] rounded-full bg-transparent text-gs-muted text-[13px] text-left"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          aria-label="게임 검색 열기"
        >
          <GSIcon name="search" size={18} className="shrink-0" />
          <span className={`flex-1 truncate ${query ? 'text-gs-text' : ''}`}>{query || '게임, 장르를 검색해보세요'}</span>
          <kbd className="shrink-0 px-[7px] py-[1px] rounded-[6px] bg-gs-raised text-[11px] font-[inherit] max-[900px]:hidden">/</kbd>
        </button>
        {showVoice && <BbsVoiceMiniOrb className="mr-[4px]" phase={voice.phase} onStart={startVoice} onCancel={voice.cancel} />}
      </div>

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
              placeholder={isAuthenticated ? '게임 이름이나 원하는 게임을 설명해 보세요' : '게임, 장르를 검색해보세요'}
            />
            {query && (
              <button type="button" className="p-0 grid place-items-center bg-transparent text-gs-muted hover:text-gs-text" aria-label="검색어 지우기" onClick={() => setQuery('')}>
                <GSIcon name="close" size={20} />
              </button>
            )}
          </label>

          {showPanel && (
            <div className="mt-[10px] p-[10px] rounded-[22px] bg-gs-panel shadow-[0_16px_44px_rgba(0,0,0,0.18)] max-h-[min(470px,70vh)] overflow-y-auto">
              {listening ? (
                <div className="grid gap-[4px] p-[10px]" role="status" aria-live="polite">
                  <strong className="text-[13px] text-gs-accent">{voice.phase === 'TRANSCRIBING' ? '말씀하신 내용을 확인하고 있어요' : '듣고 있어요'}</strong>
                  <p className={`m-0 text-[15px] ${voice.transcript ? 'text-gs-text' : 'text-gs-muted'}`}>{voice.transcript || '찾고 싶은 게임을 말씀해 주세요…'}</p>
                </div>
              ) : voiceError && !aiQuery ? (
                <p className="m-0 p-[10px] text-[13px] text-gs-muted" role="alert">{voice.message}</p>
              ) : (
                <>
                  <p className="m-0 px-[10px] pt-[4px] pb-[8px] text-[12px] text-gs-muted truncate">“{aiQuery}” 관련 게임</p>
                  <QuickSearchResults search={search} onSelect={openInAiSearch} />
                  <div className="flex flex-wrap gap-x-[16px] gap-y-[4px] px-[10px] pt-[10px] mt-[6px] border-t border-gs-border text-[12px]">
                    <button type="button" className="p-0 bg-transparent text-gs-accent font-[600] hover:underline" onClick={() => openInAiSearch()}>
                      AI 게임 검색에서 전체 결과 보기
                    </button>
                    {!SEARCHABLE_PATHS.includes(pathname) && (
                      <button type="button" className="p-0 bg-transparent text-gs-muted hover:text-gs-text" onClick={goExplore}>
                        게임 탐색에서 보기
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
