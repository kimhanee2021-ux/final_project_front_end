import { useEffect, useRef } from 'react'
import { useGameSense } from '../../../contexts/GameSenseContext'
import { PlatformIcons } from './GameCard'
import GSIcon from '../../../components/common/GSIcon'

export default function GameDialog() {
  const { selectedGame: game, setSelectedGame, wishlist, toggleWishlist } = useGameSense()
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (game && !dialog.open) dialog.showModal()
    else if (!game && dialog.open) dialog.close()
  }, [game])
  const close = () => setSelectedGame(null)
  return (
    <dialog
      className="gs-dialog"
      ref={ref}
      aria-labelledby="gs-game-dialog-title"
      onCancel={close}
      onClose={close}
      onClick={event => {
        if (event.target === event.currentTarget) close()
      }}
    >
      {game && (
        <div className="gs-dialog-inner">
          <div className="gs-dialog-art">
            <img src={game.banner} alt="" />
            <button
              autoFocus
              className="gs-icon-button gs-dialog-close"
              onClick={close}
              aria-label="게임 상세 닫기"
            >
              <GSIcon name="close" />
            </button>
          </div>
          <div className="gs-dialog-body">
            <span className="gs-eyebrow">YOUR NEXT ADVENTURE</span>
            <h2 id="gs-game-dialog-title">{game.name}</h2>
            <div className="gs-tags">
              {game.genres.map(genre => (
                <span key={genre}>{genre}</span>
              ))}
            </div>
            <p>{game.description}</p>
            <div className="gs-dialog-stats">
              <div>
                <span>커뮤니티 평점</span>
                <strong>
                  <GSIcon name="star" size={18} /> {game.rating} <small>/ 5.0</small>
                </strong>
              </div>
              <div>
                <span>나의 플레이 시간</span>
                <strong>{game.owned ? `${game.hours}시간` : '미보유'}</strong>
              </div>
              <div>
                <span>플랫폼</span>
                <PlatformIcons platforms={game.platforms} />
              </div>
            </div>
            <button
              className="gs-primary-button gs-wide-button"
              onClick={() => toggleWishlist(game)}
            >
              <GSIcon name={wishlist.includes(game.id) ? 'check' : 'heart'} size={18} />
              {wishlist.includes(game.id) ? '찜 목록에 저장됨 · 해제하기' : '위시리스트에 담기'}
            </button>
            <small className="gs-demo-note">
              평점·리뷰·플레이 시간은 화면 구현을 위한 더미 데이터입니다.
            </small>
          </div>
        </div>
      )}
    </dialog>
  )
}
