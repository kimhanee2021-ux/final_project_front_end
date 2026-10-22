import { AnalysisPanel, ColumnChart, CountUp } from '@/shared/ui'
import { hoursText } from '@/features/spending'
import { number } from '@/shared/utils/formatters'
import { hl } from '@/shared/utils/headline'
import NumberWithBars from './NumberWithBars'

// 총 플레이타임: 큰 숫자 + 가장 오래 한 게임 막대
export default function PlaytimePanel({ eyebrow, icon, stats }) {
  const { summary } = stats
  return (
    <AnalysisPanel eyebrow={eyebrow} icon={icon} headline={['지금까지 총 ', hl(`${number(summary.hours)}시간`), '을 플레이했어요.']}>
      <NumberWithBars number={<CountUp value={summary.hours} format={hours => `${number(hours)}시간`} />}>
        <ColumnChart items={stats.topHours.map(game => ({ label: game.name, value: game.hours || 0, text: hoursText(game.hours) }))} />
      </NumberWithBars>
    </AnalysisPanel>
  )
}
