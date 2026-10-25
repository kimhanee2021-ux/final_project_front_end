import { GSIcon } from '@/shared/ui'
import { NEWS_CATEGORIES, categoryLabel, formatNewsDate } from '../model/news'

export default function BbsNewsFeed({ game, news, view, onChange, onSelect }) {
  const { activeCategory, filtered, visible, selected, currentPage, pageCount } = view
  return <section className="bbs-news-list" aria-labelledby="bbs-list-title" aria-busy={news.loading}>
    <header className="bbs-section-header"><div><span className="bbs-eyebrow">OFFICIAL FEED</span><h2 id="bbs-list-title">소식 목록</h2></div>
      <span className="bbs-status-pill">Steam 공식</span></header>
    {game && <>
      <div className="bbs-news-filters" role="group" aria-label="소식 분류">
        {NEWS_CATEGORIES.map(category => <button type="button" key={category.id}
          aria-pressed={activeCategory === category.id}
          onClick={() => onChange({ category: category.id === 'ALL' ? null : category.id, newsId: null, page: null })}>
          {category.label}</button>)}
      </div>
      <p className="bbs-classification-note">태그와 제목을 기준으로 분류한 공식 소식이에요.</p>
    </>}
    {news.loading ? <div className="bbs-news-loading" role="status"><p>Steam 공식 소식을 가져오고 있어요…</p>
      {[0, 1, 2].map(id => <div className="bbs-article-skeleton" key={id} aria-hidden="true"><i /><i /><i /></div>)}
    </div> : news.error ? <div className="bbs-news-feedback" role="alert"><GSIcon name="info" size={27} />
      <h3>소식을 불러오지 못했어요</h3><p>{news.error}</p>
      <button type="button" className="bbs-button bbs-button-primary" onClick={news.retry}>다시 시도</button>
    </div> : !game || !filtered.length ? <div className="bbs-empty-feed">
      <div className="bbs-empty-icon"><GSIcon name="note" size={27} /></div>
      <h3>{!game ? '어떤 이야기를 만나볼까요?' : news.data?.items.length ? '이 분류의 소식은 아직 없어요' : '등록된 공식 소식이 없어요'}</h3>
      <p>{!game ? '위에서 게임을 검색하고 선택해 주세요.' : news.data?.items.length ? '전체 소식이나 다른 분류를 확인해 보세요.' : '새 소식이 올라오면 이곳에서 확인할 수 있어요.'}</p>
      {game && activeCategory !== 'ALL' && <button type="button" className="bbs-text-button"
        onClick={() => onChange({ category: null, newsId: null, page: null })}>전체 소식 보기</button>}
    </div> : <>
      <div className="bbs-news-count" role="status">{categoryLabel(activeCategory)} <strong>{filtered.length}</strong>개
        <span>최신순 · 최근 최대 {news.data.limit}개 기준</span></div>
      {news.data.stale && <p className="bbs-stale-notice" role="status">Steam 연결이 지연되어 이전에 가져온 소식을 보여드려요.
        <button type="button" className="bbs-text-button" onClick={news.retry}>다시 확인</button></p>}
      <div className="bbs-articles">{visible.map(article => <button type="button" className="bbs-article-card"
        key={article.id} aria-pressed={selected?.id === article.id} onClick={() => onSelect(article.id)}>
        <span className="bbs-article-meta"><span className={`bbs-category bbs-category-${article.category.toLowerCase()}`}>{categoryLabel(article.category)}</span>
          <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time></span>
        <strong>{article.title}</strong><span className="bbs-article-excerpt">{article.content || '자세한 내용은 Steam 원문에서 확인할 수 있어요.'}</span>
        <span className="bbs-article-open">{selected?.id === article.id ? '읽는 중' : '자세히 읽기'}<GSIcon name="arrow" size={14} /></span>
      </button>)}</div>
      {pageCount > 1 && <nav className="bbs-news-pagination" aria-label="소식 페이지">
        <button type="button" disabled={currentPage <= 1} onClick={() => onChange({ page: currentPage - 1, newsId: null })}>이전</button>
        <span aria-live="polite">{currentPage} / {pageCount}</span>
        <button type="button" disabled={currentPage >= pageCount} onClick={() => onChange({ page: currentPage + 1, newsId: null })}>다음</button>
      </nav>}
    </>}
    <footer><GSIcon name="globe" size={15} /><span>공식 소식만 · 외부 매체 기사 제외</span></footer>
  </section>
}
