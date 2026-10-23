import { GameImage } from '@/shared/ui'
import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import { WishlistButton } from '@/features/wishlist'
import { TOP_COUNT } from '../../model/recommendLayout'
import RankBadge from '../parts/RankBadge'
import MatchMeter from '../parts/MatchMeter'
import Reason from '../parts/Reason'

// 나머지 추천 한 칸: 커버(순위) → 이름 → 장르 → 잘 맞는 정도 · 이유. rank는 보여줄 순위(태그 안 순위 등)이고, 1~3위면 금 · 은 · 동 배지다.
export default function RecommendCard({ game, match, reason, rank = game.rank }) {
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
        <RankBadge rank={rank} isNew={game.isNew} medal={rank <= TOP_COUNT} />
      </a>
      <div className="flex flex-col gap-[6px] min-w-0 pr-[44px]">
        <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {game.name}
        </strong>
        {game.genres.length > 0 && (
          <ul className="flex flex-wrap gap-[6px]" aria-label="장르">
            {game.genres.slice(0, MAX_CARD_TAGS).map(genre => (
              <li key={genre} className="px-[10px] py-[3px] rounded-full bg-bg text-[12px] text-muted">
                {tagLabel(genre)}
              </li>
            ))}
          </ul>
        )}
        <MatchMeter match={match} />
        <Reason text={reason} />
      </div>
      <WishlistButton game={game} className="absolute right-0 bottom-0" />
    </article>
  )
}
