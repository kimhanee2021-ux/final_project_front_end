import { useState } from 'react'
import { AnalysisPanel, GSIcon } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { useWishlistSummary } from '../../context/WishlistSummaryContext'
import WishlistSummaryMessage from './WishlistSummaryMessage'
import WishlistSaleHistory from './WishlistSaleHistory'
import { countVerdicts, verdictKind } from '../../model/verdict'
import GameTag from './overview/GameTag'
import TagScroller from './overview/TagScroller'

// 판단 개수 → 헤드라인 조각
function headlineOf(total, counts, done) {
  if (!done) return ['담은 게임의 구매 시점을 AI가 분석하고 있어요.']
  if (counts.BUY) return [`담은 게임 ${total}개 중 지금이 구매 적기인 게임은 `, hl(`${counts.BUY}개`), '예요.']
  if (counts.WAIT) return [`담은 게임 ${total}개 중 `, hl(`${counts.WAIT}개`), '는 할인을 기다리는 게 좋아요.']
  return ['담은 게임의 구매 시점을 AI가 분석했어요.']
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
