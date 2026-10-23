import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { EmptyState, GSIcon, PageHeading } from '@/shared/ui'
import { useNewsResource } from '../hooks/useNewsResource'
import { NEWS_CATEGORIES, PAGE_SIZES, categoryLabel, formatNewsDate, newsListApi, newsSearch, parseNewsQuery } from '../model/newsQuery'
import GamePicker from './GamePicker'
import VoiceNewsControls from './VoiceNewsControls'
import NewsFeedback from './NewsFeedback'
import NewsPagination from './NewsPagination'
import '../styles/gameNews.css'

export default function GameNewsList() {
  const [params, setParams] = useSearchParams()
  const [voiceSelection, setVoiceSelection] = useState(null)
  const [voiceFlow, setVoiceFlow] = useState(null)
  const voiceSequence = useRef(0)
  const voiceCancelRef = useRef(null)
  const voiceConversationRef = useRef({ history: [], context: null, version: 0 })
  const query = parseNewsQuery(params)
  const result = useNewsResource(newsListApi(query))
  useEffect(() => {
    const cancelNavigation = () => { voiceCancelRef.current?.(); setVoiceFlow(null) }
    window.addEventListener('popstate', cancelNavigation)
    return () => window.removeEventListener('popstate', cancelNavigation)
  }, [])
  const update = changes => {
    voiceCancelRef.current?.()
    setVoiceFlow(null)
    setParams(newsSearch({ ...query, page: 0, ...changes }))
  }
  const voiceUpdate = (changes, mode, gameName, prompt) => {
    voiceCancelRef.current?.(true)
    const next = { ...query, page: 0, ...changes }
    setVoiceFlow({ id: ++voiceSequence.current, key: newsSearch(next), mode, gameName, prompt })
    setParams(newsSearch(next))
  }
  const goPage = page => {
    update({ page })
    document.getElementById('news-results-heading')?.focus({ preventScroll: true })
    document.getElementById('news-results-heading')?.scrollIntoView({ block: 'start' })
  }
  const data = result.data

  return <div className="game-news">
    <div className="news-eyebrow"><GSIcon name="note" size={17} /> STEAM NEWS</div>
    <PageHeading title="BBS" description="게임의 새로운 소식, 한국어 브리핑으로 빠르게 만나보세요." action={<span className="news-ai-label"><GSIcon name="spark" size={15} /> AI 브리핑</span>} />
    <VoiceNewsControls key={newsSearch(query)} query={query} result={result} flow={voiceFlow}
      cancelRef={voiceCancelRef} conversationRef={voiceConversationRef}
      onSearch={intent => {
        setVoiceSelection(intent)
        voiceUpdate({ appId: String(intent.appId), category: intent.allCategories ? '' : intent.category }, 'READ')
      }}
      onReset={() => { setVoiceSelection(null); update({ appId: '', category: '' }) }} onSelect={selection => {
      setVoiceSelection(selection)
      voiceUpdate({ appId: String(selection.appId) }, 'CATEGORY', selection.name, selection.message)
    }} />
    {voiceSelection && String(voiceSelection.appId) === query.appId && <p className="news-wave-selection" role="status">
      {voiceSelection.name} · {voiceSelection.message}
    </p>}
    <GamePicker appId={query.appId} onChange={appId => update({ appId })} />
    <div className="news-categories" role="group" aria-label="소식 분류">
      {NEWS_CATEGORIES.map(category => <button type="button" key={category.value} aria-pressed={query.category === category.value} className={query.category === category.value ? 'is-active' : ''} onClick={() => update({ category: category.value })}>{category.label}</button>)}
    </div>
    <div className="news-results-toolbar">
      <h2 id="news-results-heading" tabIndex={-1}>소식 목록 <span aria-live="polite">{data ? `${data.totalElements.toLocaleString()}건` : ''}</span></h2>
      <div><span className="news-sort-label">최신 소식순</span><label htmlFor="news-page-size" className="sr-only">페이지당 소식 수</label>
        <select id="news-page-size" value={query.size} onChange={event => update({ size: Number(event.target.value) })}>{PAGE_SIZES.map(size => <option key={size} value={size}>{size}개씩 보기</option>)}</select>
      </div>
    </div>
    <section aria-label="소식 목록" aria-busy={result.loading}>
      {result.loading || result.error ? <NewsFeedback {...result} onRetry={result.retry} /> : !data?.content.length ? <EmptyState title={query.page > 0 ? '이 페이지에는 소식이 없어요' : '아직 등록된 브리핑이 없어요'} description={query.page > 0 ? '첫 페이지로 돌아가 최신 소식을 확인해 보세요.' : '다른 게임이나 분류를 선택해 보세요. 새 브리핑이 등록되면 이곳에서 볼 수 있어요.'} action={<button type="button" className="news-button" onClick={() => { if (query.page > 0) update({ page: 0 }); else { voiceCancelRef.current?.(); setVoiceFlow(null); setParams('') } }}>{query.page > 0 ? '첫 페이지로' : '전체 소식 보기'}</button>} /> : <div className="news-list">
        {data.content.map(item => <article className="news-list-item" key={item.newsId}>
          <div className="news-item-meta"><Link className="news-game-link" to={`/bbs?${newsSearch({ ...query, appId: String(item.appId), page: 0 })}`}>{item.gameName}</Link><span className="news-category">{categoryLabel(item.category)}</span><time dateTime={item.publishedAt || undefined}>{formatNewsDate(item.publishedAt)}</time></div>
          <h3><Link to={`/bbs/${item.appId}/${item.newsId}?${newsSearch(query)}`}>{item.title}</Link></h3>
          <p className="news-summary">{item.summary}</p>
          <div className="news-item-footer"><span>{item.stale ? '최신 내용 반영 대기' : '한국어 AI 요약'}</span><Link to={`/bbs/${item.appId}/${item.newsId}?${newsSearch(query)}`} aria-label={`${item.title} 브리핑 읽기`}>브리핑 읽기 <GSIcon name="arrow" size={17} /></Link></div>
        </article>)}
      </div>}
    </section>
    {data && <NewsPagination page={query.page} totalPages={data.totalPages} onChange={goPage} />}
    <p className="news-footnote">공식 원문을 바탕으로 AI가 요약한 소식입니다. 정확한 일정과 세부 내용은 원문을 확인해 주세요.</p>
  </div>
}
