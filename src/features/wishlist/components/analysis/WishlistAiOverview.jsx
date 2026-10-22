// [추가] 위시리스트 맨 위 AI 판단 영역. AI 게임 추천 · AI 분석 화면과 같은 insight 바탕 + AI 배지 + 강조 헤드라인으로 통일한다.
// 헤드라인(판단 개수) → AI 전체 요약 문단 → 담은 게임 태그 → 고른 게임의 할인 기록과 판단 이유.
// 처음에는 첫 번째 게임이 골라져 있어서 영역이 비어 보이지 않는다.
import { useEffect, useRef, useState } from 'react'
import { AnalysisPanel, GSIcon } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { useWishlistSummary } from '../../context/WishlistSummaryContext'
import WishlistSummaryMessage from './WishlistSummaryMessage'
import WishlistSaleHistory from './WishlistSaleHistory'
import { VERDICTS, countVerdicts, verdictKind } from '../../model/verdict'

// 판단 개수 → 헤드라인 조각
function headlineOf(total, counts, done) {
  if (!done) return ['담은 게임의 구매 시점을 AI가 분석하고 있어요.']
  if (counts.BUY) return [`담은 게임 ${total}개 중 지금이 구매 적기인 게임은 `, hl(`${counts.BUY}개`), '예요.']
  if (counts.WAIT) return [`담은 게임 ${total}개 중 `, hl(`${counts.WAIT}개`), '는 할인을 기다리는 게 좋아요.']
  return ['담은 게임의 구매 시점을 AI가 분석했어요.']
}

// 담은 게임 태그 한 개: 판단 색 점 + 이름. 고른 태그는 반전 색
function GameTag({ item, kind, active, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`inline-flex shrink-0 items-center gap-[8px] h-[36px] max-w-[220px] px-[14px] rounded-full text-[13px] font-[600] transition-colors ${
        active ? 'bg-text text-surface' : 'bg-surface text-muted hover:text-text'
      }`}
    >
      <i className="block w-[8px] h-[8px] shrink-0 rounded-full" style={{ background: kind ? VERDICTS[kind].bg : 'var(--border)' }} aria-hidden="true" />
      <span className="truncate">{item.name}</span>
    </button>
  )
}

// 태그 한 줄 가로 스크롤. 넘치면 양쪽 끝을 흐리게 하고 ‹ › 버튼으로 넘긴다 (스크롤바는 숨긴다, 터치는 손가락으로 밀기)
function TagScroller({ children }) {
  const ref = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const scroll = direction => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.7, behavior: 'smooth' })
  // 넘친 쪽 끝만 흐리게 한다
  const mask = `linear-gradient(to right, ${edges.left ? 'transparent, #000 48px' : '#000'}, ${edges.right ? '#000 calc(100% - 48px), transparent' : '#000'})`
  const arrow = 'absolute top-1/2 -translate-y-1/2 z-[1] grid place-items-center w-[32px] h-[32px] rounded-full bg-surface text-text shadow-[var(--shadow)] hover:text-primary-text'

  return (
    <div className="relative mb-[16px]">
      {edges.left && (
        <button type="button" className={`${arrow} left-0`} aria-label="이전 게임 보기" onClick={() => scroll(-1)}>
          <GSIcon name="chevron" size={16} className="rotate-90" />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-[8px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        role="group"
        aria-label="담은 게임"
      >
        {children}
      </div>
      {edges.right && (
        <button type="button" className={`${arrow} right-0`} aria-label="다음 게임 보기" onClick={() => scroll(1)}>
          <GSIcon name="chevron" size={16} className="-rotate-90" />
        </button>
      )}
    </div>
  )
}

// games: 담은 스팀 게임 목록 (위시리스트 항목 그대로), heading: 영역 맨 위에 둘 페이지 제목
export default function WishlistAiOverview({ games, heading }) {
  const { advice } = useWishlistSummary()
  const [picked, setPicked] = useState(null)
  const counts = countVerdicts(advice)
  const done = Object.keys(advice).length >= games.length
  // 고른 게임이 위시리스트에서 빠졌으면 첫 번째 게임으로 돌아간다
  const selected = games.find(game => game.id === picked) ?? games[0]
  return (
    <section className="rounded-[24px] border border-insight-border bg-insight-bg shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px] min-w-0">
      {heading}
      <span className="ai-badge relative inline-flex items-center gap-[6px] mb-[16px] px-[11px] py-[4px] rounded-[6px] text-[12px] font-[800] tracking-[0.4px] text-[#14131c] overflow-hidden">
        <GSIcon name="spark" size={14} className="ai-badge-spark" />
        AI분석
      </span>
      <AnalysisPanel eyebrow="AI 구매 판단" headline={headlineOf(games.length, counts, done)}>
        <WishlistSummaryMessage />
      </AnalysisPanel>

      <p className="mt-[8px] mb-[10px] text-[13px] text-muted">게임을 누르면 지금까지의 할인 기록과 AI가 그렇게 판단한 이유를 볼 수 있어요.</p>
      <TagScroller>
        {games.map(game => (
          <GameTag
            key={game.id}
            item={game}
            kind={verdictKind(advice[game.id])}
            active={game.id === selected.id}
            onSelect={() => setPicked(game.id)}
          />
        ))}
      </TagScroller>
      <WishlistSaleHistory item={selected} />
    </section>
  )
}
