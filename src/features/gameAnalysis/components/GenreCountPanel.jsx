import { AnalysisPanel } from '@/shared/ui'
import GenreStatCards from './GenreStatCards'
import { genreCountHeadline, groupMinorGenres } from '../model/gameAnalysisModel'
import { number } from '@/shared/utils/formatters'

// 장르 분석(값이 두 종류) → 장르 카드 2지표: 보유 개수와 플레이 시간을 큰 숫자 두 개로
export default function GenreCountPanel({ counts, eyebrow }) {
  const chart = groupMinorGenres(counts)
  return (
    <AnalysisPanel eyebrow={eyebrow} headline={genreCountHeadline(counts)}>
      <GenreStatCards
        items={chart.map(genre => ({
          label: genre.name,
          metrics: [
            { value: `${genre.count}개`, caption: '보유 게임' },
            { value: `${number(genre.hours)}h`, caption: '플레이 시간' },
          ],
        }))}
      />
    </AnalysisPanel>
  )
}
