import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import { WishlistButton } from '@/features/wishlist'
import { GameImage } from '@/shared/ui'

// 탐색 탭은 스팀 "추천" 섹션 캐시(/api/games/featured)를 보여준다 — 가격과, 백엔드가 태그를 내려주면 대표 태그 3개까지 표시한다.
// 상세 API가 아직 없어 카드를 누르면 스팀 상점 페이지를 새 탭으로 연다.
// 테두리·배경 없이 커버 → 제목 → 가격 순서로만 보여준다. view="list"는 커버가 왼쪽으로 가고 구분선으로 나뉜다.
export default function GameListCard({ game, view = 'grid' }) {
  const list = view === 'list'
  return (
    <article className={`flex min-w-0 ${list ? 'flex-row items-center gap-[16px] py-[14px] border-b border-border' : 'flex-col gap-[12px]'}`}>
      <div className={`relative ${list ? 'shrink-0 w-[160px]' : ''}`}>
        <a
          className="group block overflow-hidden rounded-[16px] bg-bg"
          href={game.storeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${game.name} 스팀 상점에서 보기`}
        >
          {game.image && (
            <GameImage
              className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
              src={game.image}
              iconSize={34}
            />
          )}
        </a>
        <WishlistButton game={game} className="absolute right-[8px] top-[8px]" />
      </div>
      <div className="flex flex-col gap-[6px] min-w-0 flex-1">
        <a
          className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden hover:underline"
          href={game.storeUrl}
          target="_blank"
          rel="noreferrer"
        >
          {game.name}
        </a>
        {game.price && (
          <p className="flex items-center gap-[8px] text-[14px]">
            {game.discountPercent > 0 && <em className="not-italic font-[700] text-primary-text">-{game.discountPercent}%</em>}
            <span className="text-muted">{game.price}</span>
          </p>
        )}
        {game.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-[6px] mt-[2px]" aria-label="태그">
            {game.tags.slice(0, MAX_CARD_TAGS).map(tag => (
              <li key={tag} className="px-[10px] py-[3px] rounded-full bg-bg text-[12px] text-muted">
                {tagLabel(tag)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
