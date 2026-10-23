import { Link, useParams, useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useNewsResource } from '../hooks/useNewsResource'
import { categoryLabel, formatNewsDate, freshnessMessage, newsDetailApi, newsSearch, parseNewsQuery, safeSourceUrl } from '../model/newsQuery'
import NewsFeedback from './NewsFeedback'
import '../styles/gameNews.css'

export default function GameNewsDetail() {
  const { appId, newsId } = useParams()
  const [params] = useSearchParams()
  const query = parseNewsQuery(params.size ? params : new URLSearchParams({ appId }))
  const path = newsDetailApi(appId, newsId)
  const result = useNewsResource(path)
  const item = result.data
  const sourceUrl = safeSourceUrl(item?.sourceUrl)
  const stale = freshnessMessage(item)
  const back = `/bbs?${newsSearch(query)}`

  return <div className="game-news news-detail">
    <Link className="news-back" to={back}><GSIcon name="arrowLeft" size={18} /> 소식 목록으로</Link>
    {!path ? <NewsFeedback title="올바르지 않은 소식 주소예요" error="소식 목록에서 브리핑을 다시 선택해 주세요." /> : result.loading || result.error ? <NewsFeedback {...result} title={result.status === 404 ? '이 브리핑을 찾을 수 없어요' : undefined} error={result.status === 404 ? '소식이 없거나 아직 공개할 브리핑이 없어요. 목록에서 다른 소식을 확인해 주세요.' : result.error} onRetry={result.status === 404 ? undefined : result.retry} /> : item && <article>
      <header>
        <div className="news-item-meta"><Link className="news-game-link" to={`/bbs?${newsSearch({ appId: String(item.appId), category: '', page: 0, size: query.size })}`}>{item.gameName}</Link><span className="news-category">{categoryLabel(item.category)}</span></div>
        <h1>{item.title}</h1>
        <div className="news-detail-dates"><span>공식 소식 <time dateTime={item.publishedAt || undefined}>{formatNewsDate(item.publishedAt, true)}</time></span><span>브리핑 생성 <time dateTime={item.generatedAt}>{formatNewsDate(item.generatedAt, true)}</time></span><span>한국 시간</span></div>
      </header>
      {stale && <p className="news-stale" role="status"><GSIcon name="info" size={19} />{stale}</p>}
      <section className="news-key-summary" aria-label="핵심 요약"><h2><GSIcon name="spark" size={18} /> 핵심 요약</h2><p>{item.summary}</p></section>
      <section className="news-body" aria-label="한국어 브리핑"><h2>한국어 브리핑</h2><div className="news-body-text">{item.aiContent}</div></section>
      <div className="news-source"><div><strong>Steam 공식 원문</strong><p>AI가 놓친 내용이 있을 수 있어요. 자세한 변경 사항은 공식 소식에서 확인해 주세요.</p></div>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="news-button">공식 원문 보기 <GSIcon name="arrow" size={17} /><span className="sr-only"> (새 탭)</span></a>}
      </div>
      <Link className="news-back news-bottom-back" to={back}><GSIcon name="arrowLeft" size={18} /> 소식 목록으로</Link>
    </article>}
  </div>
}
