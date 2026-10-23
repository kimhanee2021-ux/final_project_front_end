import { AnalysisPanel, ColumnChart, CountUp } from '@/shared/ui'
import { netAmount } from '@/features/spending'
import { money } from '@/shared/utils/formatters'
import { hl } from '@/shared/utils/headline'
import NumberWithBars from './NumberWithBars'

// 게임 총 소비 금액: 큰 숫자 + 가장 많이 쓴 게임 막대
export default function TotalSpentPanel({ eyebrow, icon, stats }) {
  const { summary } = stats
  return (
    <AnalysisPanel eyebrow={eyebrow} icon={icon} headline={['지금까지 게임에 ', hl(money(summary.total)), '을 썼어요.']}>
      <NumberWithBars number={<CountUp value={summary.total} format={money} />}>
        <ColumnChart items={stats.topSpent.map(game => ({ label: game.name, value: netAmount(game), text: money(netAmount(game)) }))} />
      </NumberWithBars>
    </AnalysisPanel>
  )
}
