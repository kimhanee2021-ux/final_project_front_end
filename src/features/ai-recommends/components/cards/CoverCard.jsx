import { GameImage } from '@/shared/ui'
import { WishlistButton } from '@/features/wishlist'
import { MEDALS } from '../../model/medals'
import RankBadge from '../parts/RankBadge'
import MatchMeter from '../parts/MatchMeter'
import Reason from '../parts/Reason'

// TOP 3 카드: 커버 위에 이름 · 잘 맞는 정도 · 이유를 겹쳐 보여준다. 테두리는 금 · 은 · 동, large는 1위용으로 글자를 키운다.
export default function CoverCard({ game, match, reason, large = false }) {
  return (
    <a
      href={game.storeUrl}
      target="_blank"
      rel="noreferrer"
      className={`group relative block h-full overflow-hidden rounded-[20px] bg-bg ring-2 transition-transform duration-200 hover:-translate-y-[2px] ${
        MEDALS[game.rank]?.ring ?? 'ring-transparent'
      } ${large ? 'row-span-2 max-[860px]:row-span-1 max-[860px]:h-[280px]' : 'max-[860px]:h-[200px]'}`}
      aria-label={`${game.name} 스팀 상점 보기`}
    >
      <GameImage
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
        src={game.image}
        iconSize={large ? 40 : 28}
      />
      <RankBadge rank={game.rank} isNew={game.isNew} medal size={large ? 'lg' : 'md'} />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col bg-[linear-gradient(to_top,#000000e0,#00000080_60%,transparent)] ${
          large ? 'gap-[8px] p-[24px] pt-[72px] pr-[72px]' : 'gap-[4px] p-[16px] pt-[48px] pr-[60px]'
        }`}
      >
        <MatchMeter match={match} className="text-[#7bf5d6]" />
        <strong className={`font-[750] leading-[1.3] text-white truncate ${large ? 'text-[28px] max-[600px]:text-[22px]' : 'text-[17px]'}`}>
          {game.name}
        </strong>
        <Reason text={reason} className="text-[#ffffffcc]" />
      </div>
      <WishlistButton game={game} className={`absolute ${large ? 'right-[20px] bottom-[20px]' : 'right-[14px] bottom-[14px]'}`} />
    </a>
  )
}
