import { useGameSense } from '@/shared/state'
import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import WishlistButton from './WishlistButton'
import { GameImage } from '@/shared/ui'

// 위시리스트 화면의 게임 한 칸: 커버(하트로 빼기) → 이름 → 가격 → 태그.
// 스팀 게임은 상점 페이지를 새 탭으로, 데모 게임은 상세 창을 연다.
export default function WishlistCard({ item }) {
  const { setSelectedGame } = useGameSense()
  const external = Boolean(item.storeUrl)
  const open = external ? undefined : () => setSelectedGame(item)
  const tags = item.tags ?? item.genres ?? []
  const Cover = external ? 'a' : 'button'
  const coverProps = external
    ? { href: item.storeUrl, target: '_blank', rel: 'noreferrer' }
    : { type: 'button', onClick: open }
  return (
    <article className="flex flex-col gap-[12px] min-w-0">
      <div className="relative">
        <Cover {...coverProps} className="group block w-full p-0 overflow-hidden rounded-[16px] bg-bg" aria-label={`${item.name} 보기`}>
          {item.image && (
            <GameImage
              className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
              src={item.image}
              iconSize={34}
            />
          )}
        </Cover>
        <WishlistButton game={item} className="absolute right-[8px] top-[8px]" />
      </div>
      <div className="flex flex-col gap-[6px] min-w-0">
        <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {item.name}
        </strong>
        {item.price && (
          <p className="flex items-center gap-[8px] text-[14px]">
            {item.discountPercent > 0 && <em className="not-italic font-[700] text-primary-text">-{item.discountPercent}%</em>}
            <span className="text-muted">{item.price}</span>
          </p>
        )}
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-[6px]" aria-label="태그">
            {tags.slice(0, MAX_CARD_TAGS).map(tag => (
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
