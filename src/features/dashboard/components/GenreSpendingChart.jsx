import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import { money } from '../../../utils/formatters'
export default function GenreSpendingChart({ genres, total }) {
  const slices = genres
    .map((genre, index) => {
      const start = genres.slice(0, index).reduce((sum, item) => sum + item.percent, 0)
      const offset = start + genre.percent
      return 'var(--chart-' + ((index % 5) + 1) + ') ' + start + '% ' + offset + '%'
    })
    .join(', ')
  return (
    <Card title="장르별 지출 비율" subtitle="구매 기록으로 발견하는 나의 취향">
      {!genres.length ? (
        <EmptyState />
      ) : (
        <>
          <div
            className="w-[160px] h-[160px] rounded-full grid place-items-center mt-[22px] mx-auto mb-[18px] rotate-[-0.01deg] max-[580px]:w-[170px] max-[580px]:h-[170px]"
            style={{ background: 'conic-gradient(' + slices + ')' }}
            role="img"
            aria-label={genres.map(g => g.name + ' ' + Math.round(g.percent) + '%').join(', ')}
          >
            <div className="w-[123px] h-[123px] bg-surface rounded-full flex flex-col items-center justify-center max-[580px]:w-[130px] max-[580px]:h-[130px]">
              <span className="text-[9px] text-muted">선택 기간 지출</span>
              <strong className="text-[22px] tracking-[-0.8px] mt-[5px]">{money(total)}</strong>
            </div>
          </div>
          <div className="grid gap-[10px] max-[580px]:max-w-[300px] max-[580px]:mx-auto">
            {genres.map((genre, index) => (
              <div key={genre.name} className="flex items-center gap-[9px] text-[11px]">
                <span
                  className="w-[7px] h-[7px] rounded-full inline-block shrink-0"
                  style={{ background: 'var(--chart-' + ((index % 5) + 1) + ')' }}
                />
                <span>{genre.name}</span>
                <strong className="ml-auto text-[11px]">{Math.round(genre.percent)}%</strong>
                <small className="w-[66px] text-right text-[10px] text-muted">{money(genre.amount)}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
