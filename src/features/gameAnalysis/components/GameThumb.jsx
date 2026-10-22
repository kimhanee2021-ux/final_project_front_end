// 게임 썸네일(없으면 이니셜). 크기는 w/h 클래스로 받는다.
export default function GameThumb({ game, className = 'w-[44px]! h-[52px]!' }) {
  return (
    <div className={`game-art art-${game.art} ${game.thumbnailUrl ? 'has-image' : ''} ${className}`} aria-hidden="true">
      {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" loading="lazy" /> : <span>{game.initials}</span>}
    </div>
  )
}
