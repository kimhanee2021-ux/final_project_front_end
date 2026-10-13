export default function GameIdentity({ game, compact = false }) {
  return (
    <div className={'game-identity ' + (compact ? 'compact' : '')}>
      <div className={'game-art art-' + game.art} aria-hidden="true">
        <span>{game.initials}</span>
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
