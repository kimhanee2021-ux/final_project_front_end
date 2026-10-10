import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'

export function PlatformIcons({ platforms }) {
  const icons = { Steam: 'steam', PlayStation: 'playstation', Xbox: 'xbox', Switch: 'switch' }
  return (
    <div className="gs-platforms" aria-label={`플랫폼: ${platforms.join(', ')}`}>
      {platforms.map(platform => (
        <span key={platform} title={platform} className={platform === 'Switch' ? 'gs-switch' : ''}>
          <GSIcon name={icons[platform]} size={17} />
          {platforms.length === 1 && <small>{platform === 'PlayStation' ? 'PS5' : platform}</small>}
        </span>
      ))}
    </div>
  )
}

export default function GameCard({ game }) {
  const { wishlist, toggleWishlist, setSelectedGame } = useGameSense()
  const saved = wishlist.includes(game.id)
  return (
    <article className="gs-game-card">
      <button
        className="gs-cover-button"
        onClick={() => setSelectedGame(game)}
        aria-label={`${game.name} 상세 보기`}
      >
        <img className="gs-game-cover" src={game.image} alt="" loading="lazy" />
      </button>
      <div className="gs-game-info">
        <button className="gs-game-title" onClick={() => setSelectedGame(game)}>
          {game.name}
        </button>
        <div className="gs-rating">
          <GSIcon name="star" size={15} />
          <strong>{game.rating.toFixed(1)}</strong>
          <span>({game.reviews})</span>
        </div>
        <div className="gs-tags">
          {game.genres.map(genre => (
            <span key={genre}>{genre}</span>
          ))}
        </div>
        <PlatformIcons platforms={game.platforms} />
      </div>
      <button
        className={`gs-heart ${saved ? 'is-saved' : ''}`}
        aria-label={`${game.name} ${saved ? '찜 해제' : '찜하기'}`}
        aria-pressed={saved}
        onClick={() => toggleWishlist(game)}
      >
        <GSIcon name="heart" size={19} />
      </button>
    </article>
  )
}
