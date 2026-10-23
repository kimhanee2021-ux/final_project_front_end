import { AnalysisPanel, FilterChips, RatioStrip } from '@/shared/ui'
import GenreStatCards from './GenreStatCards'
import { genreCountHeadline, genreHeadline, groupMinorGenres } from '../../model/gameAnalysisModel'
import { money, number } from '@/shared/utils/formatters'

// 금액 기준: 유료 게임의 정가 합계로 장르를 나눈다. 보유·플레이 기준: 무료 게임까지 포함해 개수와 플레이 시간으로 나눈다.
const GENRE_VIEWS = [
  { key: 'amount', label: '금액 기준' },
  { key: 'count', label: '보유·플레이 기준' },
]

// 장르 분석 패널 하나에 두 가지 기준을 칩으로 바꿔 본다. 어느 기준이든 비율 띠(전체 100%) + 장르별 카드 모양은 같다.
// view는 바깥(MyGameAnalysis)이 들고 있어서, AI 분석의 "상세 분석 보기"가 알맞은 기준을 열어 둘 수 있다.
export default function GenrePanel({ overview, counts, eyebrow, icon, view, onViewChange }) {
  const byCount = view === 'count'
  const chart = byCount ? groupMinorGenres(counts) : overview.chartGenres
  return (
    <AnalysisPanel eyebrow={eyebrow} icon={icon} headline={byCount ? genreCountHeadline(counts) : genreHeadline(overview)}>
      <FilterChips label="장르 분석 기준" options={GENRE_VIEWS} activeKey={view} onSelect={onViewChange} className="mb-[20px]" />
      <RatioStrip items={chart.map(genre => ({ label: genre.name, value: byCount ? genre.count : genre.amount }))} />
      {/* 기준을 바꾸면 key가 달라져 카드가 새로 나타난다 */}
      <div key={view} className="mt-[16px]">
        <GenreStatCards
          items={chart.map(genre => ({
            label: genre.name,
            metrics: byCount
              ? [
                  { value: `${genre.count}개`, caption: '보유 게임' },
                  { value: `${number(genre.hours)}h`, caption: '플레이 시간' },
                ]
              : [
                  { value: money(genre.amount), caption: '보유 게임 정가 합계' },
                  { value: `${Math.round(genre.percent)}%`, caption: '금액 비중' },
                ],
          }))}
        />
      </div>
    </AnalysisPanel>
  )
}
