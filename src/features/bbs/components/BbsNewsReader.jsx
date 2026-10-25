import { GSIcon } from '@/shared/ui'
import BbsBriefing from './BbsBriefing'
import { categoryLabel, formatNewsDate, safeSourceUrl } from '../model/news'

export default function BbsNewsReader({ game, article, news, missing, onReset, readerRef }) {
  const sourceUrl = safeSourceUrl(article?.sourceUrl)
  return <aside className="bbs-reader" aria-labelledby="bbs-reader-title" ref={readerRef} tabIndex={-1}>
    <header className="bbs-section-header"><div><span className="bbs-eyebrow">OFFICIAL STORY</span><h2 id="bbs-reader-title">소식 상세</h2></div><GSIcon name="book" size={22} /></header>
    {game && <div className="bbs-game-context"><div><strong>{game.name}</strong><p>공식 소식 · Steam</p></div>
      <a href={`https://store.steampowered.com/app/${game.appId}/`} target="_blank" rel="noopener noreferrer">Steam에서 보기<GSIcon name="arrow" size={14} /><span className="sr-only"> (새 탭)</span></a>
    </div>}
    {article && !news.loading && !news.error ? <article className="bbs-news-detail" aria-label="선택한 소식">
      <div className="bbs-article-meta"><span className={`bbs-category bbs-category-${article.category.toLowerCase()}`}>{categoryLabel(article.category)}</span>
        <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)} · 한국 시간</time></div>
      <h3>{article.title}</h3>
      <BbsBriefing key={`${game.appId}:${article.id}:${article.sourceHash}`} appId={game.appId} article={article} />
      <div className="bbs-original-note"><span>공식 원문</span><span>Steam에 게시된 소식이에요.</span></div>
      <div className="bbs-news-body">{article.content || '이 소식은 이미지 또는 영상 중심으로 게시되었어요. 아래 원문 링크에서 확인해 주세요.'}</div>
      {sourceUrl && <a className="bbs-source-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">Steam 공식 원문 보기<GSIcon name="arrow" size={16} /><span className="sr-only"> (새 탭)</span></a>}
    </article> : <div className="bbs-empty-reader">
      <span className="bbs-reader-symbol" aria-hidden="true"><GSIcon name="spark" size={31} /></span>
      <h3>{missing ? '선택한 소식이 목록에 없어요' : news.loading ? '새 소식을 가져오는 중이에요' : '게임의 다음 이야기를\n만나보세요.'}</h3>
      <p>{missing ? '최신 소식 목록에서 다시 선택해 주세요.' : '목록에서 소식을 선택하면 이곳에서 원문을 읽을 수 있어요.'}</p>
      {missing && <button type="button" className="bbs-text-button" onClick={onReset}>현재 소식 보기</button>}
    </div>}
  </aside>
}
