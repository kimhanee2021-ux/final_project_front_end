export default function GameIdentity({ game, compact = false }) {
  return (
    <div className={'game-identity ' + (compact ? 'compact' : '')}>
      <div className={'game-art art-' + game.art + (game.thumbnailUrl ? ' has-image' : '')} aria-hidden="true">
        {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" loading="lazy" /> : <span>{game.initials}</span>}
      </div>
      <div>
        <strong>{game.name}</strong>
        <small>
          {game.genre} <span>·</span> {game.platform}
        </small>
      </div>
    </div>
  )
}
