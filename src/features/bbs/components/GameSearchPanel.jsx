import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import GameImage from '@/shared/ui/media/GameImage'

function SearchForm({ query, onSearch, loading, onManualInput }) {
  const [value, setValue] = useState(query)
  return <form className="bbs-search-form" role="search" onSubmit={event => {
    event.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }}>
    <label htmlFor="bbs-game-query">어떤 게임의 소식이 궁금하세요?</label>
    <div className="bbs-search-field">
      <GSIcon name="search" size={21} />
      <input id="bbs-game-query" type="search" value={value} onChange={event => { onManualInput?.(); setValue(event.target.value) }}
        placeholder="게임 이름 또는 Steam App ID" maxLength={255} autoComplete="off"
        aria-describedby="bbs-search-hint" />
      <button type="submit" className="bbs-button bbs-button-primary" disabled={!value.trim()}>
        {loading ? '다시 검색' : '게임 검색'}<GSIcon name="arrow" size={17} />
      </button>
    </div>
    <p id="bbs-search-hint">등록된 한국어·영어 게임명과 별칭으로 찾을 수 있어요.</p>
  </form>
}

export default function GameSearchPanel({ query, selectedId, result, onSearch, onSelect, onManualInput }) {
  const games = result.data?.content ?? []
  return <section className="bbs-search-panel" aria-label="게임 찾기">
    <SearchForm key={query} query={query} onSearch={onSearch} loading={result.loading} onManualInput={onManualInput} />
    {!query && <div className="bbs-search-suggestions">
      <span>이렇게 찾아보세요</span>
      {['Dota 2', 'Counter-Strike 2', 'Stardew Valley'].map(name =>
        <button type="button" key={name} onClick={() => onSearch(name)}>{name}<GSIcon name="arrow" size={13} /></button>)}
    </div>}
    {query && <div className="bbs-search-results" aria-busy={result.loading}>
      <div className="bbs-results-caption" role="status" aria-live="polite">
        {result.loading ? '게임을 찾고 있어요…' : result.error ? '검색을 완료하지 못했어요' :
          <><strong>검색 결과</strong><span>{games.length}개{result.data?.hasMore ? ' 이상' : ''}</span></>}
      </div>
      {result.loading ? <div className="bbs-game-results" aria-hidden="true">
        {[0, 1, 2].map(id => <div className="bbs-result-skeleton" key={id}><i /><span /></div>)}
      </div> : result.error ? <div className="bbs-feedback" role="alert">
        <GSIcon name="info" size={19} /><p>{result.error}</p>
        <button type="button" className="bbs-text-button" onClick={result.retry}>다시 시도</button>
      </div> : games.length ? <>
        <div className="bbs-game-results">
          {games.map(game => <button type="button" key={game.appId}
            className={`bbs-game-result ${selectedId === String(game.appId) ? 'is-selected' : ''}`}
            aria-pressed={selectedId === String(game.appId)} onClick={() => onSelect(game.appId)}>
            <GameImage src={game.thumbnailUrl} className="bbs-result-image" />
            <span className="bbs-result-copy"><strong>{game.name}</strong><small>{game.genre || 'Steam 게임'}</small></span>
            <GSIcon name={selectedId === String(game.appId) ? 'check' : 'plus'} size={18} />
          </button>)}
        </div>
        {result.data.hasMore && <p className="bbs-more-hint">검색 결과가 더 있어요. 게임 이름을 조금 더 자세히 입력해 주세요.</p>}
      </> : <div className="bbs-no-results">
        <GSIcon name="search" size={25} /><div><strong>일치하는 게임을 찾지 못했어요</strong>
          <p>다른 게임명이나 Steam App ID로 검색해 보세요.</p></div>
      </div>}
    </div>}
  </section>
}
