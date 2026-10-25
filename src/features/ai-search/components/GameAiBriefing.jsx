import { useEffect, useState } from 'react'
import { BRIEFING_GROUPS, categoryLabel, fetchBriefing, safeSourceUrl, timeLabel, topicLabel } from '@/features/community-briefing'

// 고른 게임에 저장된 AI 게임 브리핑(공지 · 업데이트 · 이벤트를 AI가 분석한 핵심 소식).
// 미리 분석해 둔 게임만 있으므로, 없는 게임이면 아무것도 그리지 않는다 (아래 공식 소식의 한국어 요약으로 대신한다).
export default function GameAiBriefing({ appId }) {
  const [state, setState] = useState({ appId: null, groups: [] })

  useEffect(() => {
    const controller = new AbortController()
    Promise.allSettled(BRIEFING_GROUPS.map(group => fetchBriefing(0, appId, controller.signal, group.id, '')))
      .then(results => {
        if (controller.signal.aborted) return
        const groups = BRIEFING_GROUPS.map((group, index) => ({
          group,
          card: results[index].status === 'fulfilled' ? results[index].value?.items?.[0] : null,
        })).filter(({ card }) => card && !card.stale && card.items?.length)
        setState({ appId, groups })
      })
    return () => controller.abort()
  }, [appId])

  if (state.appId !== appId || !state.groups.length) return null
  const analyzedAt = state.groups[0].card.analyzedAt
  return (
    <section className="bbs-search-panel mt-[20px]" aria-labelledby="ai-briefing-title">
      <div className="flex items-end justify-between gap-[12px] mb-[16px] max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h2 id="ai-briefing-title" className="!m-0 text-[18px] font-[750] tracking-[-0.5px]">
            <span aria-hidden="true">✦</span> AI가 분석한 핵심 소식
          </h2>
          <p className="mt-[6px] text-[13px] text-muted">공식 글에서 변화와 알아둘 내용을 찾아 근거와 함께 정리했어요.</p>
        </div>
        <small className="text-[12px] text-muted">분석 시각 {timeLabel(analyzedAt)}</small>
      </div>
      <div className="grid gap-[12px]">
        {state.groups.map(({ group, card }) => card.items.map((item, index) => (
          <article key={`${group.id}-${index}`} className="rounded-[14px] bg-bg p-[16px]">
            <div className="flex flex-wrap gap-[6px] text-[12px]">
              <span className="px-[10px] py-[2px] rounded-full bg-primary/10 text-primary-text font-[650]">{group.label}</span>
              <span className="px-[10px] py-[2px] rounded-full bg-surface text-muted">{topicLabel(item.topic)} · {categoryLabel(item.kind)}</span>
            </div>
            <h3 className="!mt-[10px] !mb-0 text-[15px] font-[700] leading-[1.5]">{item.title}</h3>
            <p className="mt-[6px] text-[14px] leading-[1.7]">{item.summary}</p>
            <ul className="list-none m-0 mt-[8px] p-0 flex flex-wrap gap-x-[14px] gap-y-[4px] text-[12px] text-muted" aria-label="분석 근거">
              {item.sourceIds.map(id => {
                const source = card.sources.find(s => s.gid === id)
                const url = safeSourceUrl(source?.url)
                const title = source?.koreanTitle || source?.title
                return source ? (
                  <li key={id}>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-text">근거: {title} ↗</a> : `근거: ${title}`}</li>
                ) : null
              })}
            </ul>
          </article>
        )))}
      </div>
    </section>
  )
}
