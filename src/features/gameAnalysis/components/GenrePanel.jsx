import { AnalysisPanel, RatioStrip } from '@/shared/ui'
import GenreStatCards from './GenreStatCards'
import { genreHeadline } from '../model/gameAnalysisModel'
import { money } from '@/shared/utils/formatters'

// 비중형 데이터 → 비율 띠 하나(전체 100%) + 장르별 카드(금액과 비중을 큰 숫자로)
export default function GenrePanel({ overview, eyebrow }) {
  const { chartGenres } = overview
  return (
    <AnalysisPanel eyebrow={eyebrow} headline={genreHeadline(overview)}>
      <RatioStrip items={chartGenres.map(genre => ({ label: genre.name, value: genre.amount }))} />
      <div className="mt-[16px]">
        <GenreStatCards
          items={chartGenres.map(genre => ({
            label: genre.name,
            metrics: [
              { value: money(genre.amount), caption: '보유 게임 정가 합계' },
              { value: `${Math.round(genre.percent)}%`, caption: '금액 비중' },
            ],
          }))}
        />
      </div>
    </AnalysisPanel>
  )
}
