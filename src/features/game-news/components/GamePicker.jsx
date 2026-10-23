import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useNewsResource } from '../hooks/useNewsResource'
import { QUICK_GAMES, validId } from '../model/newsQuery'

export default function GamePicker({ appId, onChange }) {
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState('')
  const numeric = validId(submitted)
  const path = submitted ? (numeric ? `/api/games/${submitted}` : `/api/games/search?name=${encodeURIComponent(submitted)}&size=8&page=0`) : null
  const results = useNewsResource(path)
  const selected = useNewsResource(appId ? `/api/games/${appId}` : null)
  const games = results.data ? (numeric ? [results.data] : results.data.content) : []
  const choose = id => { onChange(id); setSubmitted(''); setTerm('') }

  return <div className="news-game-picker">
    <form className="news-search" onSubmit={event => { event.preventDefault(); if (term.trim() === submitted) results.retry(); else setSubmitted(term.trim()) }}>
      <label htmlFor="news-game-search">게임 찾기</label>
      <div className="news-search-row">
        <div className="news-search-input"><GSIcon name="search" size={18} />
          <input id="news-game-search" type="search" value={term} maxLength={100} placeholder="게임 이름 또는 Steam 게임 번호" onChange={event => setTerm(event.target.value)} />
        </div>
        <button type="submit" className="news-button" disabled={!term.trim()}>검색</button>
      </div>
    </form>
    {submitted && <div className="news-search-results" aria-label="게임 검색 결과">
      <div className="news-search-caption"><span>‘{submitted}’ 검색 결과</span><button type="button" onClick={() => setSubmitted('')} aria-label="검색 결과 닫기"><GSIcon name="close" size={16} /></button></div>
      {results.loading ? <p role="status">게임을 찾고 있어요.</p> : results.error ? <div role="alert"><p>{results.status === 404 ? '해당 게임을 찾을 수 없어요.' : results.error}</p><button type="button" className="news-text-button" onClick={results.retry}>다시 시도</button></div> : games.length ? <ul>{games.map(game => <li key={game.appId}>
        <button type="button" onClick={() => choose(String(game.appId))}><span>{game.name}</span><small>#{game.appId}</small><GSIcon name="arrow" size={16} /></button>
      </li>)}</ul> : <p role="status">검색 결과가 없어요. 다른 이름으로 찾아보세요.</p>}
      {results.data?.totalElements > 8 && <small>상위 8개 결과예요. 더 구체적인 이름으로 검색할 수 있어요.</small>}
    </div>}
    <div className="news-quick-games" aria-label="게임 빠른 선택">
      <button type="button" className={!appId ? 'is-active' : ''} aria-pressed={!appId} onClick={() => choose('')}>전체 게임</button>
      {QUICK_GAMES.map(game => <button type="button" key={game.appId} className={appId === game.appId ? 'is-active' : ''} aria-pressed={appId === game.appId} onClick={() => choose(game.appId)}>{game.name}</button>)}
    </div>
    {appId && <div className="news-selected-game"><GSIcon name="gamepad" size={17} />
      <span>선택한 게임: <strong>{selected.data?.name || `Steam #${appId}`}</strong></span>
      <button type="button" className="news-text-button" onClick={() => choose('')}>선택 해제</button>
    </div>}
  </div>
}
