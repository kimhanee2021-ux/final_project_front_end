import GSIcon from '../../../components/discover/GSIcon'
import { formatPrice, formatReviewCount } from '../gameModel'

// 상세 API가 아직 없어 카드를 누르면 스팀 상점 페이지를 새 탭으로 연다.
export default function GameListCard({ game }) {
  const price = formatPrice(game.price)
  return (
    <article className="gs-game-card gs-steam-card">
      <a
        className="gs-cover-button"
        href={game.storeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${game.name} 스팀 상점에서 보기`}
      >
        {game.image && <img className="gs-game-cover" src={game.image} alt="" loading="lazy" />}
      </a>
      <div className="gs-game-info">
        <a className="gs-game-title" href={game.storeUrl} target="_blank" rel="noreferrer">
          {game.name}
        </a>
        <div className="gs-rating">
          <GSIcon name="star" size={15} />
          {game.positiveRate == null ? (
            <span>평가 없음</span>
          ) : (
            <>
              <strong>{Math.round(game.positiveRate)}%</strong>
              <span>({formatReviewCount(game.reviewCount)})</span>
            </>
          )}
        </div>
        {game.genres.length > 0 && (
          <div className="gs-tags">
            {game.genres.slice(0, 3).map(genre => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        )}
        {price && (
          <p className="gs-steam-price">
            {game.discountPercent > 0 && <em>-{game.discountPercent}%</em>}
            <strong>{price}</strong>
          </p>
        )}
      </div>
    </article>
  )
}
