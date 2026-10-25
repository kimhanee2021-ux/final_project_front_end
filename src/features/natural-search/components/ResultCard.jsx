import { GameImage } from '@/shared/ui'
import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import { WishlistButton } from '@/features/wishlist'

// 검색 결과 한 칸: 커버(순위) → 이름 → 장르. 누르면 스팀 상점 페이지를 새 탭으로 연다.
export default function ResultCard({ game }) {
  return (
    <article className="relative flex flex-col gap-[10px] min-w-0">
      <a
        href={game.storeUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative block overflow-hidden rounded-[16px] bg-bg"
        aria-label={`${game.name} 스팀 상점 보기`}
      >
        <GameImage
          className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
          src={game.image}
          iconSize={34}
        />
        <span className="absolute left-[8px] top-[8px] grid place-items-center min-w-[28px] h-[28px] px-[8px] rounded-full bg-black/65 text-white text-[12px] font-[700]">
          {game.rank}
        </span>
      </a>
      <div className="flex flex-col gap-[6px] min-w-0 pr-[44px]">
        <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {game.name}
        </strong>
        {game.tags.length > 0 && (
          <ul className="flex flex-wrap gap-[6px]" aria-label="장르">
            {game.tags.slice(0, MAX_CARD_TAGS).map(tag => (
              <li key={tag} className="px-[10px] py-[3px] rounded-full bg-bg text-[12px] text-muted">
                {tagLabel(tag)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <WishlistButton game={game} className="absolute right-0 bottom-0" />
    </article>
  )
}
