import { AnalysisPanel, ColumnChart } from '@/shared/ui'
import { money } from '@/shared/utils/formatters'
import { hl } from '@/shared/utils/headline'

// 평균 게임 정가: 가격대별 게임 수 막대
export default function AveragePricePanel({ eyebrow, icon, stats }) {
  const { summary } = stats
  return (
    <AnalysisPanel
      eyebrow={eyebrow}
      icon={icon}
      headline={summary.average == null ? '아직 정가를 확인한 게임이 없어요.' : ['게임 한 개당 평균 ', hl(money(summary.average)), '이에요.']}
    >
      <ColumnChart items={stats.priceBands.map(band => ({ label: band.label, value: band.count, text: `${band.count}개` }))} />
    </AnalysisPanel>
  )
}
