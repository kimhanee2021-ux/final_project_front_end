import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { WishlistButton } from '@/features/wishlist'

export function PlatformIcons({ platforms }) {
  return (
    <div className="flex items-center gap-[10px] text-faint" aria-label={`플랫폼: ${platforms.join(', ')}`}>
      {platforms.map(platform => (
        <span key={platform} className="inline-flex items-center gap-[5px]" title={platform}>
          <GSIcon name="steam" size={16} />
          {platforms.length === 1 && <small className="text-[12px]">{platform}</small>}
        </span>
      ))}
    </div>
  )
}

// view="list"는 GameCatalog의 그리드/리스트 토글을 그대로 받는다.
// 테두리·배경 없이 커버 → 제목 → 평점·장르 순서로 보여주고, 찜 하트는 커버 위 오른쪽 위에 둔다.
export default function GameCard({ game, view = 'grid' }) {
  const { setSelectedGame } = useGameSense()
  const list = view === 'list'
  return (
    <article className={`relative flex min-w-0 ${list ? 'flex-row items-center gap-[16px] py-[14px] pr-[44px] border-b border-border' : 'flex-col gap-[12px]'}`}>
      <button
        className={`group p-0 bg-bg overflow-hidden rounded-[16px] ${list ? 'shrink-0 w-[96px]' : 'w-full'}`}
        onClick={() => setSelectedGame(game)}
        aria-label={`${game.name} 상세 보기`}
      >
        <img
          className="block w-full aspect-[0.83] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
          src={game.image}
          alt=""
          loading="lazy"
        />
      </button>
      <div className="flex flex-col gap-[6px] min-w-0 flex-1">
        <button
          className="bg-transparent text-[15px] font-[600] leading-[1.4] text-left [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden hover:underline"
          onClick={() => setSelectedGame(game)}
        >
          {game.name}
        </button>
        <p className="flex items-center gap-[6px] text-[13px] text-muted">
          <GSIcon name="star" size={14} className="fill-current" />
          <strong className="font-[600] text-text">{game.rating.toFixed(1)}</strong>
          <span>({game.reviews}) · {game.genres.join(', ')}</span>
        </p>
        <PlatformIcons platforms={game.platforms} />
      </div>
      <WishlistButton
        game={game}
        className={`absolute ${list ? 'right-0 top-1/2 -translate-y-1/2 !bg-transparent !shadow-none' : 'right-[8px] top-[8px]'}`}
      />
    </article>
  )
}
