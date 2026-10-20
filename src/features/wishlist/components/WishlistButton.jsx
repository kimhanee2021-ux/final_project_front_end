import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'

// 게임 카드 위에 올리는 좋아요(하트) 버튼. 누르면 위시리스트에 담고, 다시 누르면 뺀다.
// 로그인 전에는 로그인 화면으로 보낸다(toggleWishlist가 처리). 자리는 className으로 정한다.
export default function WishlistButton({ game, className = '' }) {
  const { isWishlisted, toggleWishlist } = useGameSense()
  const saved = isWishlisted(game)
  return (
    <button
      type="button"
      className={`grid place-items-center w-[36px] h-[36px] p-0 rounded-full bg-surface/90 shadow-[var(--shadow)] ${
        saved ? 'text-primary [&_svg]:fill-current' : 'text-muted hover:text-text'
      } ${className}`}
      aria-label={`${game.name} ${saved ? '위시리스트에서 빼기' : '위시리스트에 담기'}`}
      aria-pressed={saved}
      onClick={event => {
        // 카드 전체가 링크여도 하트만 눌리도록 한다.
        event.preventDefault()
        event.stopPropagation()
        toggleWishlist(game)
      }}
    >
      <GSIcon name="heart" size={19} />
    </button>
  )
}
