import { AnalysisPanel } from '@/shared/ui'
import ValueRankList from './ValueRankList'
import { valueHeadline } from '../model/gameAnalysisModel'

export default function ValueRankPanel({ ranking, eyebrow }) {
  return (
    <AnalysisPanel eyebrow={eyebrow} headline={valueHeadline(ranking)}>
      <ValueRankList ranking={ranking} />
    </AnalysisPanel>
  )
}
