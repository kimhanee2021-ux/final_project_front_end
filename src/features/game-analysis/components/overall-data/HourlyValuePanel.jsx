import { AnalysisPanel } from '@/shared/ui'
import { money } from '@/shared/utils/formatters'
import { hl } from '@/shared/utils/headline'
import ValueRankList from '../parts/ValueRankList'

// 게임 시간당 가성비: 전체 시간당 비용 + 가성비 좋은 게임 순위
export default function HourlyValuePanel({ eyebrow, icon, stats }) {
  const { summary } = stats
  return (
    <AnalysisPanel
      eyebrow={eyebrow}
      icon={icon}
      headline={summary.hourly == null ? '시간당 비용을 계산할 플레이 기록이 아직 없어요.' : ['플레이 1시간당 ', hl(money(summary.hourly)), '을 쓴 셈이에요.']}
    >
      <ValueRankList ranking={stats.ranking.best} />
    </AnalysisPanel>
  )
}
