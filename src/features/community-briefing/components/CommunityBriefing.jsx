import { useCommunityBriefing } from '../hooks/useCommunityBriefing'
import { BRIEFING_GROUPS, topicsForGroup, topicLabel, categoryLabel, safeSourceUrl, timeLabel, sourcePeriod } from '../model/briefingModel'
import '../styles/briefing.css'

function SourceLink({ source }) {
  const url = safeSourceUrl(source.url)
  const title = source.koreanTitle || source.title
  return url ? <a href={url} target="_blank" rel="noopener noreferrer">{title} ↗</a> : <span>{title}</span>
}
function Pager({ page, total, size, last, onChange, label }) {
  if (total <= size) return null
  return <nav className="brief-pager" aria-label={label}><button disabled={page === 0} onClick={() => onChange(page - 1)}>이전</button><span>{page + 1} / {Math.ceil(total / size)}</span><button disabled={last} onClick={() => onChange(page + 1)}>다음</button></nav>
}
export default function CommunityBriefing({ enabled }) {
  const data = useCommunityBriefing(enabled)
  const { briefing, news, appId, page, group, topic, aiPage } = data
  const status = briefing?.status
  if (!enabled) return null
  return <section className="briefing" aria-label="게임별 AI 분석">
    <header className="brief-heading"><p>관심 있는 분류와 게임을 선택해보세요.</p><button className="brief-refresh" onClick={data.retry} disabled={data.loading}>새로 확인 ↻</button></header>
    <div className="brief-portals" role="group" aria-label="소식 분류">
      {BRIEFING_GROUPS.map((item, index) => <button key={item.id} className={`brief-portal brief-portal-${index} ${group === item.id ? 'is-active' : ''}`} aria-pressed={group === item.id} onClick={() => data.selectGroup(item.id)}>
        <span className="brief-orbit" aria-hidden="true"><span>{item.mark}</span><i className="orbit-satellite" /><i className="orbit-halo" /></span><strong>{item.label}</strong><small>{item.description}</small><span className="brief-enter" aria-hidden="true">살펴보기 ↗</span>
      </button>)}
    </div>
    <div className="brief-controls"><div className="brief-topics" role="group" aria-label="소주제"><button aria-pressed={!topic} onClick={() => data.selectTopic('')}>전체</button>{topicsForGroup(group).map(item => <button key={item.id} aria-pressed={topic === item.id} onClick={() => data.selectTopic(item.id)}>{item.label}</button>)}</div>
      <label className="brief-game">게임<select aria-label="소식 게임 선택" value={appId} onChange={event => data.selectGame(event.target.value)}><option value="">전체 게임</option>{(data.games || []).map(game => <option key={game.appId} value={game.appId}>{game.gameName}</option>)}</select></label>
    </div>
    {data.error && <p className="brief-message" role="alert">{data.error}</p>}
    {data.loading ? <p className="brief-message" role="status">소식을 불러오고 있어요.</p> : <>
      <div className="brief-ai-heading"><h2><span aria-hidden="true">✦</span> AI가 분석한 핵심 소식</h2><p>공식 글에서 변화와 알아둘 내용을 찾아 근거와 함께 정리했어요.</p></div>
      <div className="brief-results" aria-live="polite">
        {!briefing?.items?.length ? <div className="brief-empty"><span aria-hidden="true">✧</span><h3>이 분류에 저장된 AI 설명이 아직 없어요.</h3><p>다른 분류의 설명이나 아래 공식 글을 확인해보세요. 분석 결과가 저장되면 여기에 표시돼요.</p></div> : briefing.items.map(card => <article key={card.appId} className="brief-result">
          <header><div className="brief-card-heading"><h3>{card.gameName}</h3><span className="brief-ai-badge"><span aria-hidden="true">✦</span> AI 분석</span></div><small>공식 글 {card.sourceCount}개 분석 · 분석 시각 {timeLabel(card.analyzedAt)}</small></header>
          {card.stale ? <p>원문이 바뀌어 내용을 다시 확인하고 있어요.</p> : card.items.map((item, index) => <section className="brief-finding" key={index}><div className="brief-badges"><span>{topicLabel(item.topic)}</span><small>{categoryLabel(item.kind)}</small></div><p className="brief-source-period">{sourcePeriod(item, card.sources)}</p><h4>{item.title}</h4><p>{item.summary}</p><div className="brief-evidence-label">분석 근거</div><ul>{item.sourceIds.map(id => { const source = card.sources.find(s => s.gid === id); return source ? <li key={id}><SourceLink source={source} /><time>원문 작성 · {timeLabel(source.publishedAt)}</time></li> : null })}</ul></section>)}
        </article>)}
      </div>
      <Pager page={aiPage} total={briefing?.total || 0} size={10} last={briefing?.last} onChange={data.moveAiPage} label="AI 정리 페이지" />
      <div className="brief-sources-heading"><div><h3>공식 게시글</h3><p>공식 글의 제목·핵심 내용을 AI가 한국어로 정리했어요. 원문도 함께 확인할 수 있어요.</p></div><div className="brief-total" role="status" aria-label={appId ? '선택한 게임의 게시글 수' : '전체 게시글 수'}><strong>총 <b>{(news?.total || 0).toLocaleString()}</b><small>건</small></strong></div></div>
      {!news?.items?.length ? <p className="brief-message">아직 수집된 글이 없어요.</p> : <ul className="brief-sources">{news.items.map(source => <li key={source.id}><div className="brief-source-meta"><span>{source.gameName}</span><time>{timeLabel(source.publishedAt)}</time><span>Steam 공식</span><span>{source.koreanSummary ? 'AI 한국어 요약' : '원문 · 한국어 정리 전'}</span></div><h4><SourceLink source={source} /></h4>{source.koreanSummary && <p className="brief-korean-summary">{source.koreanSummary}</p>}<details><summary>원문 보기</summary><strong>{source.title}</strong><p>{source.content}</p><small>저장된 원문 일부를 바탕으로 정리했어요. 전체 내용과 정확한 조건은 공식 원문에서 확인하세요.</small></details></li>)}</ul>}
      <Pager page={page} total={news?.total || 0} size={20} last={!news || news.last} onChange={data.movePage} label="공식 게시글 페이지" />
      {status && <p className="brief-coverage">두 계정의 보유 게임 자료 · 공식 글 {status.storedNews.toLocaleString()}건 · AI 분석 {status.analyzedGames.toLocaleString()}/{status.catalogGames.toLocaleString()}게임 · 한국어 정리 {(status.translatedPosts || 0).toLocaleString()}/{status.storedNews.toLocaleString()}건. 발표 내용의 정리이며 실제 적용 결과를 검증한 것은 아니에요.</p>}
    </>}
  </section>
}
