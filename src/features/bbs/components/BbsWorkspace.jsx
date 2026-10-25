import { useRef } from 'react'
import BbsNewsFeed from './BbsNewsFeed'
import BbsNewsReader from './BbsNewsReader'
import { newsView } from '../model/news'
import { GSIcon } from '@/shared/ui'
import GameImage from '@/shared/ui/media/GameImage'

export default function BbsWorkspace({ game, loading, error, onRetry, onClear, news, category, page, newsId, onNewsChange }) {
  const readerRef = useRef(null)
  const view = newsView(news.data?.items ?? [], category, page, newsId)
  const selectArticle = id => {
    onNewsChange({ newsId: id })
    if (window.matchMedia('(max-width: 720px)').matches) {
      requestAnimationFrame(() => {
        readerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
        readerRef.current?.focus({ preventScroll: true })
      })
    }
  }
  return <>
    <div className="bbs-selection" aria-live="polite">
      {loading ? <p>선택한 게임을 불러오고 있어요…</p> : error ? <div className="bbs-feedback" role="alert">
        <GSIcon name="info" size={19} /><p>{error}</p>
        {onRetry && <button type="button" className="bbs-text-button" onClick={onRetry}>다시 시도</button>}
        <button type="button" className="bbs-text-button" onClick={onClear}>선택 해제</button>
      </div> : game ? <>
        <GameImage src={game.thumbnailUrl} className="bbs-selected-image" />
        <div className="bbs-selection-copy"><span>선택한 게임</span><h2>{game.name}</h2></div>
        <button type="button" className="bbs-clear" onClick={onClear} aria-label="게임 선택 해제"><GSIcon name="close" size={18} /></button>
      </> : <p><GSIcon name="gamepad" size={20} /> 게임을 선택하면 이곳에 소식을 모아드려요.</p>}
    </div>

    <div className="bbs-workspace">
      <BbsNewsFeed game={game} news={news} view={view} onChange={onNewsChange} onSelect={selectArticle} />
      <BbsNewsReader game={game} article={view.selected} news={news} readerRef={readerRef}
        missing={Boolean(newsId && news.data && !view.selected)}
        onReset={() => onNewsChange({ newsId: null })} />
    </div>
  </>
}
