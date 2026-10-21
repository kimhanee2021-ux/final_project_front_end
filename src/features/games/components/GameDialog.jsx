import { useEffect, useRef } from 'react'
import { useGameSense } from '@/shared/state'
import { PlatformIcons } from './GameCard'
import { GSIcon, GameImage } from '@/shared/ui'

export default function GameDialog() {
  const { selectedGame: game, setSelectedGame, isWishlisted, toggleWishlist } = useGameSense()
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (game && !dialog.open) dialog.showModal()
    else if (!game && dialog.open) dialog.close()
  }, [game])
  const close = () => setSelectedGame(null)
  return (
    // gs-dialog 클래스는 body:has(.gs-dialog[open]) 스크롤 잠금과 ::backdrop 공용 규칙의
    // 훅으로 유지한다.
    <dialog
      className="gs-dialog w-[560px] max-w-[calc(100%-32px)] max-h-[calc(100dvh-40px)] border-0 p-0 rounded-[24px] text-gs-text bg-gs-panel shadow-[var(--gs-shadow)]"
      ref={ref}
      aria-labelledby="gs-game-dialog-title"
      onCancel={close}
      onClose={close}
      onClick={event => {
        if (event.target === event.currentTarget) close()
      }}
    >
      {game && (
        <div className="w-full">
          <div className="h-[215px] relative max-[600px]:h-[160px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-[linear-gradient(0deg,var(--gs-panel),transparent_50%)]">
            <GameImage className="w-full h-full object-cover" src={game.banner} iconSize={40} />
            <button
              autoFocus
              className="w-[37px] h-[37px] grid place-items-center rounded-full p-0 hover:bg-gs-raised absolute right-[15px] top-[15px] z-[1] text-white bg-[#101923cf]"
              onClick={close}
              aria-label="게임 상세 닫기"
            >
              <GSIcon name="close" />
            </button>
          </div>
          <div className="p-[2px_29px_26px] max-[600px]:p-[4px_20px_22px]">
            <h2 className="text-[27px] leading-[1.25] tracking-[-0.6px] m-[8px_0_16px] max-[600px]:text-[24px]" id="gs-game-dialog-title">{game.name}</h2>
            <div className="flex flex-wrap gap-[5px]">
              {game.genres.map(genre => (
                <span key={genre} className="bg-gs-raised text-gs-muted py-[3px] px-[6px] rounded-[5px] text-[12px] leading-[1.3] whitespace-nowrap">{genre}</span>
              ))}
            </div>
            <p className="text-gs-muted leading-[1.9] text-[14px] m-[20px_0]">{game.description}</p>
            <div className="grid grid-cols-3 gap-[15px] p-[20px_0] mb-[22px] border-t border-b border-gs-border max-[600px]:gap-[12px]">
              <div>
                <span className="text-[12px] text-gs-muted block mb-[9px] max-[600px]:text-[12px]">커뮤니티 평점</span>
                <strong className="text-[16px] flex items-center gap-[5px] max-[600px]:text-[14px] [&_svg]:text-[#ffd354] [&_svg]:fill-[#ffd354]">
                  <GSIcon name="star" size={18} /> {game.rating} <small className="text-[12px] font-normal text-gs-muted">/ 5.0</small>
                </strong>
              </div>
              <div>
                <span className="text-[12px] text-gs-muted block mb-[9px] max-[600px]:text-[12px]">나의 플레이 시간</span>
                <strong className="text-[16px] flex items-center gap-[5px] max-[600px]:text-[14px]">{game.owned ? `${game.hours}시간` : '미보유'}</strong>
              </div>
              <div>
                <span className="text-[12px] text-gs-muted block mb-[9px] max-[600px]:text-[12px]">플랫폼</span>
                <PlatformIcons platforms={game.platforms} />
              </div>
            </div>
            <button
              className="gs-primary-button w-full"
              onClick={() => toggleWishlist(game)}
            >
              <GSIcon name={isWishlisted(game) ? 'check' : 'heart'} size={18} />
              {isWishlisted(game) ? '찜 목록에 저장됨 · 해제하기' : '위시리스트에 담기'}
            </button>
            <small className="text-[12px] text-gs-muted block text-center mt-[15px]">
              평점·리뷰·플레이 시간은 화면 구현을 위한 더미 데이터입니다.
            </small>
          </div>
        </div>
      )}
    </dialog>
  )
}
