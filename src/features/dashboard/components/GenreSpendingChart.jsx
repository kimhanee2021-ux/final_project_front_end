import Card from '../../../components/common/Card'
import EmptyState from '../../../components/common/EmptyState'
import { money } from '../../../utils/formatters'
export default function GenreSpendingChart({ genres, total, estimated = false }) {
  const slices = genres
    .map((genre, index) => {
      const start = genres.slice(0, index).reduce((sum, item) => sum + item.percent, 0)
      const offset = start + genre.percent
      return 'var(--chart-' + ((index % 5) + 1) + ') ' + start + '% ' + offset + '%'
    })
    .join(', ')
  return (
    <Card
      title={estimated ? '장르별 보유 게임 정가 비율' : '장르별 지출 비율'}
      subtitle={estimated ? '보유 게임으로 발견하는 나의 취향' : '구매 기록으로 발견하는 나의 취향'}
      className="genre-card"
    >
      {!genres.length ? (
        <EmptyState />
      ) : (
        <>
          <div
            className="donut"
            style={{ background: 'conic-gradient(' + slices + ')' }}
            role="img"
            aria-label={genres.map(g => g.name + ' ' + Math.round(g.percent) + '%').join(', ')}
          >
            <div>
              <span>{estimated ? '보유 게임 정가' : '선택 기간 지출'}</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
          <div className="genre-legend">
            {genres.map((genre, index) => (
              <div key={genre.name}>
                <span
                  className="legend-dot"
                  style={{ background: 'var(--chart-' + ((index % 5) + 1) + ')' }}
                />
                <span>{genre.name}</span>
                <strong>{Math.round(genre.percent)}%</strong>
                <small>{money(genre.amount)}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
